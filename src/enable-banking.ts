import { readFileSync } from "node:fs";
import { sign } from "node:crypto";
import { signedAmountCents, type TransactionForDeduplication } from "./deduplication.js";

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
};

export type EnableBankingApi = {
  request<T>(method: "GET" | "POST", path: string, options?: RequestOptions): Promise<T>;
};

export class EnableBankingError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export class EnableBankingClient implements EnableBankingApi {
  constructor(
    private readonly baseUrl: string,
    private readonly applicationId: string,
    private readonly privateKey: string,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async request<T>(method: "GET" | "POST", path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      url.searchParams.set(name, value);
    }

    const response = await this.fetcher(url, {
      method,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${this.jwt()}`,
        ...(options.body === undefined ? {} : { "content-type": "application/json" }),
        ...options.headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const code = stringValue(data.error) ?? stringValue(data.code) ?? `HTTP_${response.status}`;
      throw new EnableBankingError(response.status, code, stringValue(data.message) ?? code);
    }
    return data as T;
  }

  private jwt() {
    const now = Math.floor(Date.now() / 1000);
    const header = base64Url({ alg: "RS256", kid: this.applicationId, typ: "JWT" });
    const payload = base64Url({ iss: "enablebanking.com", aud: "api.enablebanking.com", iat: now, exp: now + 3600 });
    const unsigned = `${header}.${payload}`;
    return `${unsigned}.${sign("RSA-SHA256", Buffer.from(unsigned), this.privateKey).toString("base64url")}`;
  }
}

export function enableBankingFromEnvironment() {
  const applicationId = process.env.ENABLE_BANKING_APP_ID;
  const keyPath = process.env.ENABLE_BANKING_KEY_PATH;
  if (!applicationId || !keyPath) {
    throw new Error("ENABLE_BANKING_APP_ID and ENABLE_BANKING_KEY_PATH are required");
  }
  return new EnableBankingClient(
    process.env.ENABLE_BANKING_URL ?? "https://api.enablebanking.com",
    applicationId,
    readFileSync(keyPath, "utf8")
  );
}

export type ParsedBankTransaction = TransactionForDeduplication & {
  externalReference: string | null;
};

export function parseBankTransaction(value: unknown): ParsedBankTransaction {
  const transaction = objectValue(value, "transaction");
  const amount = objectValue(transaction.transaction_amount, "transaction_amount");
  const indicator = transaction.credit_debit_indicator;
  if (indicator !== "CRDT" && indicator !== "DBIT") {
    throw new Error("credit_debit_indicator must be CRDT or DBIT");
  }

  const rawAmount = requiredString(amount.amount, "transaction_amount.amount");
  const remittance = transaction.remittance_information;
  if (remittance != null && (!Array.isArray(remittance) || remittance.some(item => typeof item !== "string"))) {
    throw new Error("remittance_information must be an array of strings");
  }

  return {
    transactionDate: isoDate(transaction.booking_date, "booking_date"),
    amountCents: signedAmountCents(decimalCents(rawAmount, true), indicator),
    label: (remittance as string[] | null | undefined)?.join(" ").trim() ?? "",
    externalReference: stringValue(transaction.entry_reference) ?? null
  };
}

export function parseBalance(value: unknown) {
  const data = objectValue(value, "balances response");
  if (!Array.isArray(data.balances) || data.balances.length === 0) {
    throw new Error("balances must contain at least one balance");
  }
  const priority = ["ITAV", "CLAV", "CLBD", "ITBD"];
  const balances = data.balances.map(balance => objectValue(balance, "balance"));
  const rank = (balance: Record<string, unknown>) => {
    const index = priority.indexOf(String(balance.balance_type));
    return index === -1 ? priority.length : index;
  };
  if (balances.length > 1 && balances.every(balance => rank(balance) === priority.length)) {
    throw new Error(`balances contain no supported balance_type: ${balances.map(balance => String(balance.balance_type)).join(", ")}`);
  }
  const selected = balances.sort((left, right) => rank(left) - rank(right))[0];
  const amount = objectValue(selected.balance_amount, "balance_amount");
  return {
    balanceCents: decimalCents(requiredString(amount.amount, "balance_amount.amount"), true),
    currency: requiredString(amount.currency, "balance_amount.currency")
  };
}

export function decimalCents(value: string, signed = false) {
  const pattern = signed ? /^(-?)(\d+)(?:\.(\d{1,2})0*)?$/ : /^(\d+)(?:\.(\d{1,2})0*)?$/;
  const match = value.match(pattern);
  if (!match) throw new Error("amount must be a decimal with at most two fraction digits");
  const negative = signed && match[1] === "-";
  const whole = BigInt(match[signed ? 2 : 1]);
  const fraction = (match[signed ? 3 : 2] ?? "").padEnd(2, "0");
  const cents = whole * 100n + BigInt(fraction || "0");
  const result = Number(negative ? -cents : cents);
  if (!Number.isSafeInteger(result)) throw new Error("amount is outside the supported range");
  return result;
}

function base64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function objectValue(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value.trim();
}

function isoDate(value: unknown, field: string) {
  const date = requiredString(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error(`${field} must be an ISO date`);
  }
  return date;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}
