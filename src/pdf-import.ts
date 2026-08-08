import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export type PdfAccountKey = "CCP" | "LIVRET_A" | "LIVRET_JEUNE" | "NICKEL";

export type PdfTransaction = {
  transactionDate: string;
  label: string;
  amountCents: number;
};

export type PdfStatementAccount = {
  key: PdfAccountKey;
  name: string;
  balanceDate: string;
  closingBalanceCents: number;
  openingBalanceCents?: number;
  transactions: PdfTransaction[];
};

export type PdfStatement = {
  institution: "LA_BANQUE_POSTALE" | "NICKEL";
  periodStart: string;
  periodEnd: string;
  accounts: PdfStatementAccount[];
};

type Item = { text: string; x: number };
type Line = { top: number; items: Item[]; text: string };
type Page = { height: number; lines: Line[]; text: string };

export class PdfStatementError extends Error {}

export async function parsePdfStatement(input: Uint8Array): Promise<PdfStatement> {
  if (input.length < 4 || new TextDecoder("ascii").decode(input.subarray(0, 4)) !== "%PDF") {
    throw new PdfStatementError("Le fichier fourni n'est pas un PDF valide.");
  }

  const loadingTask = getDocument({ data: Uint8Array.from(input), useSystemFonts: true });
  try {
    const document = await loadingTask.promise;
    const pages: Page[] = [];
    for (let number = 1; number <= document.numPages; number += 1) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      const height = page.view[3];
      const lines: Array<{ top: number; items: Item[] }> = [];

      for (const raw of content.items) {
        if (!("str" in raw) || !raw.str.trim()) continue;
        const top = height - raw.transform[5];
        let line = lines.find(candidate => Math.abs(candidate.top - top) <= 1.5);
        if (!line) {
          line = { top, items: [] };
          lines.push(line);
        }
        line.items.push({ text: raw.str.trim(), x: raw.transform[4] });
      }

      const completed = lines
        .sort((left, right) => left.top - right.top)
        .map(line => {
          line.items.sort((left, right) => left.x - right.x);
          return { ...line, text: line.items.map(item => item.text).join(" ") };
        });
      pages.push({ height, lines: completed, text: completed.map(line => line.text).join("\n") });
    }

    if (!pages.some(page => page.text.trim())) {
      throw new PdfStatementError(
        "Le PDF ne contient pas de couche texte. Utilisez la saisie manuelle."
      );
    }

    const header = comparable(pages.slice(0, 2).map(page => page.text).join("\n"));
    if (header.includes("LA BANQUE POSTALE") && header.includes("COMPTE COURANT POSTAL")) {
      return parseBanquePostale(pages);
    }
    if (header.includes("NICKEL") && header.includes("PAIEMENTS ELECTRONIQUES")) {
      return parseNickel(pages);
    }
    throw new PdfStatementError(
      "Format PDF non reconnu. Seuls les relevés La Banque Postale et Nickel sont pris en charge."
    );
  } catch (error) {
    if (error instanceof PdfStatementError) throw error;
    throw new PdfStatementError("Le PDF est illisible ou n'est pas pris en charge.");
  } finally {
    await loadingTask.destroy();
  }
}

function parseBanquePostale(pages: Page[]): PdfStatement {
  const allText = pages.map(page => page.text).join("\n");
  const openingDates = [...allText.matchAll(/Ancien solde au (\d{2}\/\d{2}\/\d{4})/g)].map(match => isoDate(match[1]));
  const closingDates = [...allText.matchAll(/Nouveau solde au (\d{2}\/\d{2}\/\d{4})/g)].map(match => isoDate(match[1]));
  if (!openingDates.length || !closingDates.length) {
    throw new PdfStatementError("Période introuvable dans le relevé La Banque Postale.");
  }
  const periodStart = openingDates.sort()[0];
  const periodEnd = closingDates.sort().at(-1)!;
  const accounts = new Map<PdfAccountKey, PdfStatementAccount>();

  const situationPage = pages.find(page => comparable(page.text).includes("SITUATION DE VOS COMPTES"));
  if (!situationPage) throw new PdfStatementError("Situation des comptes introuvable dans le relevé.");
  for (const line of situationPage.lines) {
    const key = accountKey(line.text);
    if (!key || key === "NICKEL") continue;
    const closingBalanceCents = lineAmount(line);
    if (closingBalanceCents === undefined) continue;
    accounts.set(key, {
      key,
      name: accountName(line.text, key),
      balanceDate: periodEnd,
      closingBalanceCents,
      transactions: []
    });
  }
  if (!["CCP", "LIVRET_A", "LIVRET_JEUNE"].every(key => accounts.has(key as PdfAccountKey))) {
    throw new PdfStatementError("Les trois comptes attendus sont absents du relevé La Banque Postale.");
  }

  for (const page of pages) {
    const columns = operationColumns(page.lines);
    if (!columns) continue;
    const titles = page.lines
      .map(line => ({ line, key: accountKey(line.text) }))
      .filter((entry): entry is { line: Line; key: Exclude<PdfAccountKey, "NICKEL"> } =>
        entry.key !== undefined && entry.key !== "NICKEL"
      )
      .filter(entry => entry.line.top > columns.headerTop - 80);

    for (let index = 0; index < titles.length; index += 1) {
      const { line: title, key } = titles[index];
      const end = titles[index + 1]?.line.top ?? page.height;
      const lines = page.lines.filter(line => line.top >= title.top && line.top < end);
      const account = accounts.get(key)!;
      const opening = balanceLine(lines, "ANCIEN SOLDE AU");
      const closing = balanceLine(lines, "NOUVEAU SOLDE AU");
      if (opening) account.openingBalanceCents = opening.amountCents;
      if (closing) {
        if (closing.amountCents !== account.closingBalanceCents) {
          throw new PdfStatementError(`Le solde final du compte ${account.name} est incohérent.`);
        }
        account.balanceDate = closing.date;
      }
      account.transactions.push(...lbpTransactions(lines, columns.debit, columns.credit, periodStart, periodEnd));
    }
  }

  for (const account of accounts.values()) {
    if (account.openingBalanceCents !== undefined) verifyArithmetic(account);
  }
  return { institution: "LA_BANQUE_POSTALE", periodStart, periodEnd, accounts: [...accounts.values()] };
}

function parseNickel(pages: Page[]): PdfStatement {
  const text = pages.map(page => page.text).join("\n");
  const period = text.match(/Du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4})/i);
  if (!period) throw new PdfStatementError("Période introuvable dans le relevé Nickel.");
  const periodStart = isoDate(period[1]);
  const periodEnd = isoDate(period[2]);
  const debit = namedAmount(pages, "DEBIT SUR LE MOIS");
  const credit = namedAmount(pages, "CREDIT SUR LE MOIS");
  const closingBalanceCents = namedAmount(pages, "SOLDE DISPONIBLE LE");
  if (debit === undefined || credit === undefined || closingBalanceCents === undefined) {
    throw new PdfStatementError("Totaux mensuels introuvables dans le relevé Nickel.");
  }

  const transactions = pages.flatMap(page => nickelTransactions(page.lines));
  const account: PdfStatementAccount = {
    key: "NICKEL",
    name: "Compte Nickel",
    balanceDate: periodEnd,
    openingBalanceCents: closingBalanceCents - credit + debit,
    closingBalanceCents,
    transactions
  };
  if (sum(transactions.filter(transaction => transaction.amountCents > 0)) !== credit ||
      -sum(transactions.filter(transaction => transaction.amountCents < 0)) !== debit) {
    throw new PdfStatementError("Les totaux des opérations Nickel ne correspondent pas au relevé.");
  }
  verifyArithmetic(account);
  return { institution: "NICKEL", periodStart, periodEnd, accounts: [account] };
}

function lbpTransactions(lines: Line[], debit: number, credit: number, periodStart: string, periodEnd: string) {
  const anchors = lines.filter(line =>
    /^\d{2}\/\d{2}\b/.test(line.items[0]?.text ?? "") && amountItem(line, debit) !== undefined
  );
  return anchors.map((anchor, index): PdfTransaction => {
    const amount = amountItem(anchor, debit)!;
    const nextTop = anchors[index + 1]?.top ?? anchor.top + 35;
    const label = lines
      .filter(line => line.top >= anchor.top && line.top < nextTop)
      .flatMap(line => line.items.filter(item => item.x >= 80 && item.x < debit - 10).map(item => item.text))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return {
      transactionDate: shortIsoDate(anchor.items[0].text, periodStart, periodEnd),
      label,
      amountCents: amount.x < (debit + credit) / 2 ? -amount.amountCents : amount.amountCents
    };
  });
}

function nickelTransactions(lines: Line[]) {
  const anchors = lines.map(line => {
    const date = line.items.find(item => /^\d{2}\/\d{2}\/\d{4}$/.test(item.text));
    const amount = [...line.items].reverse().find(item => item.x >= 480 && parseAmount(item.text) !== undefined);
    if (!/^\d+$/.test(line.items[0]?.text ?? "") || !date || !amount) return undefined;
    return { line, date: date.text, amountCents: parseAmount(amount.text)!, labels: line.items.filter(item => item.x >= 250 && item.x < 480).map(item => item.text) };
  }).filter((anchor): anchor is NonNullable<typeof anchor> => anchor !== undefined);

  for (const line of lines) {
    if (anchors.some(anchor => anchor.line === line)) continue;
    const labels = line.items.filter(item => item.x >= 250 && item.x < 480).map(item => item.text);
    if (!labels.length || !anchors.length || line.top < anchors[0].line.top - 8) continue;
    const nearest = anchors
      .map((anchor, index) => ({ index, distance: Math.abs(anchor.line.top - line.top) }))
      .sort((left, right) => left.distance - right.distance)[0];
    if (nearest.distance <= 15) anchors[nearest.index].labels.push(...labels);
  }

  return anchors.map(anchor => ({
    transactionDate: isoDate(anchor.date),
    label: anchor.labels.join(" ").replace(/\s+/g, " ").trim() || "Opération Nickel",
    amountCents: anchor.amountCents
  }));
}

function operationColumns(lines: Line[]) {
  for (const line of lines) {
    const debit = line.items.find(item => comparable(item.text).startsWith("DEBIT"));
    const credit = line.items.find(item => comparable(item.text).startsWith("CREDIT"));
    if (debit && credit) return { debit: debit.x, credit: credit.x, headerTop: line.top };
  }
  return undefined;
}

function accountKey(text: string): PdfAccountKey | undefined {
  const value = comparable(text);
  if (value.startsWith("COMPTE COURANT POSTAL") || value.startsWith("VOS OPERATIONS COMPTE COURANT POSTAL")) return "CCP";
  if (value.startsWith("LIVRET JEUNE SWING")) return "LIVRET_JEUNE";
  if (value.startsWith("LIVRET A")) return "LIVRET_A";
  return undefined;
}

function accountName(text: string, key: PdfAccountKey) {
  const fallback = { CCP: "Compte Courant Postal", LIVRET_A: "Livret A", LIVRET_JEUNE: "Livret Jeune Swing", NICKEL: "Compte Nickel" }[key];
  return text.split(/[+-]\s*[\d ]+,\d{2}/, 1)[0].replace(/\s+/g, " ").trim() || fallback;
}

function balanceLine(lines: Line[], label: string) {
  const line = lines.find(candidate => comparable(candidate.text).includes(label));
  const date = line?.text.match(/(\d{2}\/\d{2}\/\d{4})/);
  const amountCents = line && lineAmount(line);
  return line && date && amountCents !== undefined ? { date: isoDate(date[1]), amountCents } : undefined;
}

function namedAmount(pages: Page[], label: string) {
  const line = pages.flatMap(page => page.lines).find(candidate => comparable(candidate.text).includes(label));
  return line && lineAmount(line);
}

function amountItem(line: Line, minimumX: number) {
  const item = line.items.find(candidate => candidate.x >= minimumX - 10 && parseAmount(candidate.text) !== undefined);
  const amountCents = item && parseAmount(item.text);
  return item && amountCents !== undefined ? { x: item.x, amountCents: Math.abs(amountCents) } : undefined;
}

function lineAmount(line: Line) {
  for (const item of [...line.items].reverse()) {
    const amount = parseAmount(item.text);
    if (amount !== undefined) return amount;
  }
  return undefined;
}

function parseAmount(text: string) {
  const match = text.match(/(^|\s)([+-]?\s*[\d ]+,\d{2})(?:\s|¤|€|$)/);
  if (!match) return undefined;
  const normalized = match[2].replaceAll(" ", "").replace(",", ".");
  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) ? cents : undefined;
}

function verifyArithmetic(account: PdfStatementAccount) {
  if (account.openingBalanceCents! + sum(account.transactions) !== account.closingBalanceCents) {
    throw new PdfStatementError(`Le contrôle de solde échoue pour le compte ${account.name}.`);
  }
}

function sum(transactions: PdfTransaction[]) {
  return transactions.reduce((total, transaction) => total + transaction.amountCents, 0);
}

function comparable(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

function isoDate(value: string) {
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function shortIsoDate(value: string, start: string, end: string) {
  const [day, month] = value.split("/");
  for (const year of new Set([start.slice(0, 4), end.slice(0, 4)])) {
    const candidate = `${year}-${month}-${day}`;
    if (candidate >= start && candidate <= end) return candidate;
  }
  throw new PdfStatementError(`Date ${value} hors de la période du relevé.`);
}
