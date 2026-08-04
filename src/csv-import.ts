export type CsvTransaction = {
  transactionDate: string;
  transactionAt: string | null;
  label: string;
  amountCents: number;
};

type ParsedCsv = {
  transactions: CsvTransaction[];
  ignored: number;
};

export class CsvFormatError extends Error {}

export const bankCsvFormats = {
  LA_BANQUE_POSTALE: {
    encoding: "iso-8859-1",
    separator: ";",
    institutionName: "La Banque Postale",
    multiAccount: false,
    parse: parseLaBanquePostale
  },
  REVOLUT: {
    encoding: "utf-8",
    separator: ",",
    institutionName: "Revolut",
    multiAccount: true,
    parse: parseRevolut
  }
} as const;

export function parseBankCsv(bank: string, bytes: Buffer): ParsedCsv {
  const format = bankCsvFormats[bank as keyof typeof bankCsvFormats];
  if (!format) {
    throw new CsvFormatError(`Banque « ${bank} » non prise en charge. Formats acceptés : ${Object.keys(bankCsvFormats).join(", ")}.`);
  }
  if (!bytes.length) throw new CsvFormatError(`Format CSV ${bank} non reconnu : le fichier est vide.`);
  return format.parse(bytes);
}

function parseLaBanquePostale(bytes: Buffer): ParsedCsv {
  const text = new TextDecoder("iso-8859-1").decode(bytes);
  const rows = parseCsv(text, ";", "La Banque Postale");
  const expectedPreamble = ["Numéro Compte", "Type", "Compte tenu en", "Date", "Solde (EUROS)"];
  if (expectedPreamble.some((key, index) => rows[index]?.[0]?.trim() !== key)) {
    throw new CsvFormatError("Format CSV La Banque Postale non reconnu : préambule de compte ou encodage ISO-8859-1 non compris.");
  }
  if (!isBlankRow(rows[5]) || !sameRow(rows[6], ["Date", "Libellé", "Montant(EUROS)"])) {
    throw new CsvFormatError("Format CSV La Banque Postale non reconnu : séparateur « ; » ou en-tête Date;Libellé;Montant(EUROS) non compris.");
  }

  parseFrenchDate(rows[3][1]?.trim(), "date de solde du préambule");
  parseAmount(rows[4][1]?.trim(), ",", "solde du préambule");
  return {
    transactions: dataRows(rows, 7).map(({ row, line }) => {
      requireWidth(row, 3, "La Banque Postale", line);
      return {
        transactionDate: parseFrenchDate(row[0].trim(), `date ligne ${line}`),
        transactionAt: null,
        label: requiredValue(row[1], `libellé ligne ${line}`),
        amountCents: parseAmount(row[2].trim(), ",", `montant ligne ${line}`)
      };
    }),
    ignored: 0
  };
}

function parseRevolut(bytes: Buffer): ParsedCsv {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/^\uFEFF/, "");
  } catch {
    throw new CsvFormatError("Format CSV Revolut non reconnu : encodage UTF-8 non compris.");
  }

  const rows = parseCsv(text, ",", "Revolut");
  const header = ["Type", "Produit", "Date de début", "Date de fin", "Description", "Montant", "Frais", "Devise", "État", "Solde"];
  if (!sameRow(rows[0], header)) {
    throw new CsvFormatError(`Format CSV Revolut non reconnu : séparateur « , » ou en-têtes non compris (${header.join(", ")}).`);
  }

  const transactions: CsvTransaction[] = [];
  let ignored = 0;
  for (const { row, line } of dataRows(rows, 1)) {
    requireWidth(row, header.length, "Revolut", line);
    if (!new Set(["TERMINÉ", "RENVOYÉ"]).has(row[8])) {
      throw new CsvFormatError(`Format CSV Revolut non reconnu : état « ${row[8]} » ligne ${line} non compris.`);
    }
    if (row[7] !== "EUR") {
      throw new CsvFormatError(`Format CSV Revolut non reconnu : devise « ${row[7]} » ligne ${line} non comprise.`);
    }
    if (parseAmount(row[6], ".", `frais ligne ${line}`) !== 0) {
      throw new CsvFormatError(`Format CSV Revolut non reconnu : frais non nuls ligne ${line} non pris en charge.`);
    }
    parseOptionalRevolutTimestamp(row[3], `date de fin ligne ${line}`);
    if (row[8] === "RENVOYÉ") {
      ignored++;
      continue;
    }
    parseAmount(row[9], ".", `solde ligne ${line}`);
    const transactionAt = parseRevolutTimestamp(row[2], `date de début ligne ${line}`);
    transactions.push({
      transactionDate: transactionAt.slice(0, 10),
      transactionAt,
      label: requiredValue(row[4], `description ligne ${line}`),
      amountCents: parseAmount(row[5], ".", `montant ligne ${line}`)
    });
  }
  return { transactions, ignored };
}

function parseCsv(text: string, separator: string, bank: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  let quoteClosed = false;

  const pushRow = () => {
    row.push(value);
    rows.push(row);
    row = [];
    value = "";
    quoteClosed = false;
  };

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index++;
      } else if (character === '"') {
        quoted = false;
        quoteClosed = true;
      } else {
        value += character;
      }
    } else if (character === '"' && value === "" && !quoteClosed) {
      quoted = true;
    } else if (character === '"') {
      throw new CsvFormatError(`Format CSV ${bank} non reconnu : guillemet inattendu.`);
    } else if (character === separator) {
      row.push(value);
      value = "";
      quoteClosed = false;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index++;
      pushRow();
    } else if (quoteClosed) {
      throw new CsvFormatError(`Format CSV ${bank} non reconnu : caractère après guillemet fermant.`);
    } else {
      value += character;
    }
  }
  if (quoted) throw new CsvFormatError(`Format CSV ${bank} non reconnu : guillemet non fermé.`);
  if (value !== "" || row.length) pushRow();
  return rows;
}

function dataRows(rows: string[][], start: number) {
  return rows.slice(start).map((row, index) => ({ row, line: start + index + 1 })).filter(({ row }) => !isBlankRow(row));
}

function isBlankRow(row: string[] | undefined) {
  return !!row && row.length === 1 && row[0] === "";
}

function sameRow(row: string[] | undefined, expected: string[]) {
  return !!row && row.length === expected.length && row.every((value, index) => value === expected[index]);
}

function requireWidth(row: string[], width: number, bank: string, line: number) {
  if (row.length !== width) {
    throw new CsvFormatError(`Format CSV ${bank} non reconnu : ${row.length} colonnes ligne ${line}, ${width} attendues.`);
  }
}

function requiredValue(value: string | undefined, field: string) {
  if (!value?.trim()) throw new CsvFormatError(`Format CSV non reconnu : ${field} vide.`);
  return value.trim();
}

function parseFrenchDate(value: string | undefined, field: string) {
  const match = value?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new CsvFormatError(`Format CSV La Banque Postale non reconnu : ${field} n'est pas au format JJ/MM/AAAA.`);
  const [, day, month, year] = match;
  assertCalendarDate(Number(year), Number(month), Number(day), field);
  return `${year}-${month}-${day}`;
}

function parseRevolutTimestamp(value: string, field: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) throw new CsvFormatError(`Format CSV Revolut non reconnu : ${field} n'est pas au format AAAA-MM-JJ HH:MM:SS.`);
  const [, year, month, day, hour, minute, second] = match;
  assertCalendarDate(Number(year), Number(month), Number(day), field);
  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    throw new CsvFormatError(`Format CSV Revolut non reconnu : ${field} est invalide.`);
  }
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function parseOptionalRevolutTimestamp(value: string, field: string) {
  if (value) parseRevolutTimestamp(value, field);
}

function assertCalendarDate(year: number, month: number, day: number, field: string) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new CsvFormatError(`Format CSV non reconnu : ${field} est invalide.`);
  }
}

function parseAmount(value: string | undefined, decimal: "," | ".", field: string) {
  const expression = decimal === "," ? /^(-?)(\d+),(\d{2})$/ : /^(-?)(\d+)\.(\d{2})$/;
  const match = value?.match(expression);
  if (!match) throw new CsvFormatError(`Format CSV non reconnu : ${field} n'utilise pas le séparateur décimal « ${decimal} » attendu.`);
  const cents = Number(match[2]) * 100 + Number(match[3]);
  if (!Number.isSafeInteger(cents)) throw new CsvFormatError(`Format CSV non reconnu : ${field} dépasse la précision acceptée.`);
  return match[1] ? -cents : cents;
}
