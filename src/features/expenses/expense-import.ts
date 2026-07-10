import { expenseSchema } from "@/src/lib/validators/expenses";
import type { Database } from "@/types/database.types";

export const EXPENSE_IMPORT_FILE_NAME = "curatemystay-expenses-demo.csv";
export const EXPENSE_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const EXPENSE_IMPORT_MAX_ROWS = 1000;
export const EXPENSE_IMPORT_HEADERS = [
  "expense_date",
  "expense_for",
  "property_name",
  "category",
  "amount",
  "vendor",
  "note",
] as const;

export const EXPENSE_IMPORT_DEMO_CSV = `${EXPENSE_IMPORT_HEADERS.join(",")}
2026-08-02,property,Villa Sol,Maintenance,3500,Goa Cool Services,"Air conditioner servicing, filter cleaning"
2026-08-05,cms,,Marketing,5000,Meta,"Meta advertising spend"
`;

export type ExpenseImportInsert = Database["public"]["Tables"]["expenses"]["Insert"];

export type ExpenseImportProperty = {
  id?: string;
  name: string;
};

export type ExpenseImportExistingExpense = {
  amount: number;
  category: string;
  date: string;
  expenseFor: "property" | "cms";
  note: string | null;
  propertyId?: string | null;
  propertyName: string;
};

export type ExpenseImportSettings = {
  expenseCategories: string[];
};

export type ExpenseImportResult = "ready" | "duplicate" | "invalid";

export type ExpenseImportPreviewRow = {
  amount: number | null;
  category: string;
  expenseDate: string;
  expenseFor: string;
  note: string;
  propertyName: string;
  reason: string;
  result: ExpenseImportResult;
  rowNumber: number;
  vendor: string;
};

export type ExpenseImportSummary = {
  duplicateRows: number;
  invalidRows: number;
  readyRows: number;
  totalRows: number;
};

export type ExpenseImportValidation = {
  error?: string;
  inserts: ExpenseImportInsert[];
  rows: ExpenseImportPreviewRow[];
  summary: ExpenseImportSummary;
};

type CsvRecord = {
  amount: string;
  category: string;
  expenseDate: string;
  expenseFor: string;
  note: string;
  propertyName: string;
  rowNumber: number;
  vendor: string;
};

type PreparedExpense = {
  fingerprint: string;
  insert?: ExpenseImportInsert;
  preview: Omit<ExpenseImportPreviewRow, "reason" | "result">;
};

function emptySummary(): ExpenseImportSummary {
  return {
    duplicateRows: 0,
    invalidRows: 0,
    readyRows: 0,
    totalRows: 0,
  };
}

function textByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export function isExpenseCsvFileName(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".csv");
}

export function isOverExpenseImportSizeLimit(value: string) {
  return textByteLength(value) > EXPENSE_IMPORT_MAX_BYTES;
}

export function normalizeExpenseText(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isBlankRow(row: string[]) {
  return row.every((cell) => cell.trim() === "");
}

function parseCsvRows(csv: string): { error?: string; rows: string[][] } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  const input = csv.replace(/^\uFEFF/, "");

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        currentCell += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        currentCell += char;
      }
      continue;
    }

    if (char === "\"") {
      if (currentCell.length === 0) inQuotes = true;
      else currentCell += char;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\r" || char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      if (char === "\r" && next === "\n") index += 1;
      continue;
    }

    currentCell += char;
  }

  if (inQuotes) return { error: "CSV has an unfinished quoted value.", rows: [] };

  currentRow.push(currentCell);
  rows.push(currentRow);

  while (rows.length > 0 && isBlankRow(rows[rows.length - 1])) rows.pop();

  return { rows };
}

function recordFromRow(row: string[], rowNumber: number, indexes: Record<(typeof EXPENSE_IMPORT_HEADERS)[number], number>): CsvRecord {
  const cell = (key: (typeof EXPENSE_IMPORT_HEADERS)[number]) => (row[indexes[key]] || "").trim();

  return {
    amount: cell("amount"),
    category: cell("category"),
    expenseDate: cell("expense_date"),
    expenseFor: cell("expense_for"),
    note: cell("note"),
    propertyName: cell("property_name"),
    rowNumber,
    vendor: cell("vendor"),
  };
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parsePositiveNumber(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function optionFromSettings(value: string, options: string[]) {
  if (!value.trim()) return "";
  const normalized = normalizeExpenseText(value);
  return options.find((option) => normalizeExpenseText(option) === normalized) || null;
}

function propertyLookup(properties: ExpenseImportProperty[]) {
  const byName = new Map<string, ExpenseImportProperty[]>();
  properties.forEach((property) => {
    const key = normalizeExpenseText(property.name);
    byName.set(key, [...(byName.get(key) || []), property]);
  });
  return byName;
}

function expenseFingerprint({
  amount,
  category,
  date,
  expenseFor,
  note,
  propertyId,
  propertyName,
}: {
  amount: number;
  category: string;
  date: string;
  expenseFor: "property" | "cms";
  note: string | null;
  propertyId?: string | null;
  propertyName: string;
}) {
  const context = expenseFor === "cms" ? "cms" : propertyId || normalizeExpenseText(propertyName);

  return [
    date,
    expenseFor,
    context,
    normalizeExpenseText(category),
    amount.toFixed(2),
    normalizeExpenseText(note),
  ].join("|");
}

function validateRecord(
  record: CsvRecord,
  propertiesByName: Map<string, ExpenseImportProperty[]>,
  settings: ExpenseImportSettings,
): { prepared?: PreparedExpense; reason: string; result: ExpenseImportResult } {
  if (!isValidDateString(record.expenseDate)) return { reason: "Expense date must use YYYY-MM-DD.", result: "invalid" };

  const expenseFor = normalizeExpenseText(record.expenseFor);
  if (expenseFor !== "cms" && expenseFor !== "property") {
    return { reason: "Expense for must be cms or property.", result: "invalid" };
  }

  const category = optionFromSettings(record.category, settings.expenseCategories);
  if (!record.category) return { reason: "Category is required.", result: "invalid" };
  if (category === null) return { reason: "Category must match a configured expense category.", result: "invalid" };

  const amount = parsePositiveNumber(record.amount);
  if (amount === null) return { reason: "Amount must be a positive number.", result: "invalid" };

  let property: ExpenseImportProperty | undefined;
  if (expenseFor === "property") {
    const propertyMatches = propertiesByName.get(normalizeExpenseText(record.propertyName)) || [];
    if (!record.propertyName) return { reason: "Property name is required for property expenses.", result: "invalid" };
    if (propertyMatches.length === 0) return { reason: "Property name must match an existing property.", result: "invalid" };
    if (propertyMatches.length > 1) {
      return { reason: "Property name matches multiple properties. Rename one property before importing.", result: "invalid" };
    }
    property = propertyMatches[0];
  } else if (record.propertyName) {
    return { reason: "CMS expenses must leave property_name blank.", result: "invalid" };
  }

  const propertyId = property?.id || "00000000-0000-4000-8000-000000000000";
  const insert: ExpenseImportInsert = {
    amount,
    category: category || record.category,
    date: record.expenseDate,
    expense_for: expenseFor,
    note: record.note || null,
    property_id: property?.id || null,
    vendor: record.vendor || null,
  };

  const parsed = expenseSchema.safeParse({
    amount: insert.amount,
    category: insert.category,
    date: insert.date,
    expense_for: insert.expense_for,
    note: insert.note || "",
    property_id: expenseFor === "property" ? propertyId : "",
    vendor: insert.vendor || "",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Expense fields are invalid.";
    return { reason: issue, result: "invalid" };
  }

  return {
    prepared: {
      fingerprint: expenseFingerprint({
        amount,
        category: insert.category,
        date: insert.date,
        expenseFor: insert.expense_for,
        note: insert.note || "",
        propertyId: property?.id,
        propertyName: property?.name || "CMS",
      }),
      insert,
      preview: {
        amount,
        category: insert.category,
        expenseDate: insert.date,
        expenseFor: insert.expense_for,
        note: record.note,
        propertyName: property?.name || "CMS",
        rowNumber: record.rowNumber,
        vendor: record.vendor,
      },
    },
    reason: "Ready to import.",
    result: "ready",
  };
}

export function validateExpenseImportCsv({
  csv,
  expenses,
  properties,
  settings,
}: {
  csv: string;
  expenses: ExpenseImportExistingExpense[];
  properties: ExpenseImportProperty[];
  settings: ExpenseImportSettings;
}): ExpenseImportValidation {
  if (!csv.trim()) {
    return { error: "Choose a CSV file before importing.", inserts: [], rows: [], summary: emptySummary() };
  }

  if (isOverExpenseImportSizeLimit(csv)) {
    return { error: "CSV file cannot exceed 5 MB.", inserts: [], rows: [], summary: emptySummary() };
  }

  const parsedCsv = parseCsvRows(csv);
  if (parsedCsv.error) return { error: parsedCsv.error, inserts: [], rows: [], summary: emptySummary() };
  if (parsedCsv.rows.length === 0) {
    return { error: "CSV file is empty.", inserts: [], rows: [], summary: emptySummary() };
  }

  const [headerRow, ...dataRows] = parsedCsv.rows;
  const normalizedHeaders = headerRow.map((header) => header.trim().toLowerCase());
  const missingHeaders = EXPENSE_IMPORT_HEADERS.filter((header) => !normalizedHeaders.includes(header));

  if (missingHeaders.length > 0) {
    return {
      error: `Missing required header${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const nonEmptyRows = dataRows.filter((row) => !isBlankRow(row));
  if (nonEmptyRows.length > EXPENSE_IMPORT_MAX_ROWS) {
    return {
      error: `CSV cannot include more than ${EXPENSE_IMPORT_MAX_ROWS.toLocaleString("en-IN")} non-empty data rows.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const indexes = EXPENSE_IMPORT_HEADERS.reduce(
    (acc, header) => ({ ...acc, [header]: normalizedHeaders.indexOf(header) }),
    {} as Record<(typeof EXPENSE_IMPORT_HEADERS)[number], number>,
  );
  const propertiesByName = propertyLookup(properties);
  const existingFingerprints = new Set(
    expenses.map((expense) =>
      expenseFingerprint({
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,
        expenseFor: expense.expenseFor,
        note: expense.note || "",
        propertyId: expense.propertyId,
        propertyName: expense.propertyName,
      }),
    ),
  );
  const seenFingerprints = new Set<string>();
  const rows: ExpenseImportPreviewRow[] = [];
  const inserts: ExpenseImportInsert[] = [];

  dataRows.forEach((row, index) => {
    if (isBlankRow(row)) {
      rows.push({
        amount: null,
        category: "",
        expenseDate: "",
        expenseFor: "",
        note: "",
        propertyName: "",
        reason: "Blank row.",
        result: "invalid",
        rowNumber: index + 2,
        vendor: "",
      });
      return;
    }

    const record = recordFromRow(row, index + 2, indexes);
    if (row.length > headerRow.length) {
      rows.push({
        amount: parsePositiveNumber(record.amount),
        category: record.category,
        expenseDate: record.expenseDate,
        expenseFor: record.expenseFor,
        note: record.note,
        propertyName: record.propertyName,
        reason: "Row has more columns than the header row. Wrap values that contain commas in quotes.",
        result: "invalid",
        rowNumber: record.rowNumber,
        vendor: record.vendor,
      });
      return;
    }

    const validation = validateRecord(record, propertiesByName, settings);

    if (!validation.prepared) {
      rows.push({
        amount: parsePositiveNumber(record.amount),
        category: record.category,
        expenseDate: record.expenseDate,
        expenseFor: record.expenseFor,
        note: record.note,
        propertyName: record.propertyName,
        reason: validation.reason,
        result: validation.result,
        rowNumber: record.rowNumber,
        vendor: record.vendor,
      });
      return;
    }

    if (existingFingerprints.has(validation.prepared.fingerprint)) {
      rows.push({
        ...validation.prepared.preview,
        reason: "A matching expense already exists.",
        result: "duplicate",
      });
      seenFingerprints.add(validation.prepared.fingerprint);
      return;
    }

    if (seenFingerprints.has(validation.prepared.fingerprint)) {
      rows.push({
        ...validation.prepared.preview,
        reason: "This expense is repeated in the CSV.",
        result: "duplicate",
      });
      return;
    }

    seenFingerprints.add(validation.prepared.fingerprint);
    rows.push({
      ...validation.prepared.preview,
      reason: validation.reason,
      result: validation.result,
    });
    if (validation.prepared.insert) inserts.push(validation.prepared.insert);
  });

  const summary = rows.reduce(
    (acc, row) => ({
      duplicateRows: acc.duplicateRows + (row.result === "duplicate" ? 1 : 0),
      invalidRows: acc.invalidRows + (row.result === "invalid" ? 1 : 0),
      readyRows: acc.readyRows + (row.result === "ready" ? 1 : 0),
      totalRows: acc.totalRows + 1,
    }),
    emptySummary(),
  );

  return { inserts, rows, summary };
}
