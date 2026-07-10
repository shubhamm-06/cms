import { propertySchema } from "@/src/lib/validators/properties";
import type { Database } from "@/types/database.types";

export const PROPERTY_IMPORT_FILE_NAME = "curatemystay-properties-demo.csv";
export const PROPERTY_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const PROPERTY_IMPORT_MAX_ROWS = 1000;
export const PROPERTY_IMPORT_HEADERS = [
  "property_name",
  "owner_email",
  "address",
  "city",
  "bedrooms",
  "owner_share_percentage",
  "status",
] as const;

export const PROPERTY_IMPORT_DEMO_CSV = `${PROPERTY_IMPORT_HEADERS.join(",")}
Villa Sol,owner@example.com,"Assagao, North Goa",Goa,3,80,active
Palm Studio,owner2@example.com,"Siolim riverside, near market",Goa,1,75,active
`;

type PropertyStatus = Database["public"]["Tables"]["properties"]["Row"]["status"];
export type PropertyImportInsert = Database["public"]["Tables"]["properties"]["Insert"];

export type PropertyImportOwner = {
  email: string;
  id?: string;
  role: "admin" | "owner";
  status: "pending" | "active" | "inactive";
};

export type PropertyImportResult = "ready" | "duplicate" | "invalid";

export type PropertyImportPreviewRow = {
  address: string;
  bedrooms: string;
  city: string;
  ownerEmail: string;
  ownerShare: string;
  propertyName: string;
  reason: string;
  result: PropertyImportResult;
  rowNumber: number;
  status: string;
};

export type PropertyImportSummary = {
  duplicateRows: number;
  invalidRows: number;
  readyRows: number;
  totalRows: number;
};

export type PropertyImportValidation = {
  error?: string;
  inserts: PropertyImportInsert[];
  rows: PropertyImportPreviewRow[];
  summary: PropertyImportSummary;
};

type CsvRecord = {
  address: string;
  bedrooms: string;
  city: string;
  ownerEmail: string;
  ownerShare: string;
  propertyName: string;
  rowNumber: number;
  status: string;
};

function emptySummary(): PropertyImportSummary {
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

export function isCsvFileName(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".csv");
}

export function isOverImportSizeLimit(value: string) {
  return textByteLength(value) > PROPERTY_IMPORT_MAX_BYTES;
}

export function normalizePropertyName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

function recordFromRow(row: string[], rowNumber: number, indexes: Record<(typeof PROPERTY_IMPORT_HEADERS)[number], number>): CsvRecord {
  const cell = (key: (typeof PROPERTY_IMPORT_HEADERS)[number]) => (row[indexes[key]] || "").trim();

  return {
    address: cell("address"),
    bedrooms: cell("bedrooms"),
    city: cell("city"),
    ownerEmail: cell("owner_email").toLowerCase(),
    ownerShare: cell("owner_share_percentage"),
    propertyName: cell("property_name"),
    rowNumber,
    status: cell("status").toLowerCase(),
  };
}

function validateRecord(
  record: CsvRecord,
  owner: PropertyImportOwner | undefined,
): { insert?: PropertyImportInsert; reason: string; result: PropertyImportResult } {
  const ownerShare = Number(record.ownerShare);
  const bedrooms = record.bedrooms ? Number(record.bedrooms) : null;
  const status = record.status as PropertyStatus;

  if (!record.propertyName) return { reason: "Property name is required.", result: "invalid" };
  if (!record.ownerEmail) return { reason: "Owner email is required.", result: "invalid" };
  if (!owner || owner.role !== "owner" || owner.status !== "active") {
    return { reason: "Owner email must match an existing active owner.", result: "invalid" };
  }
  if (!record.ownerShare) return { reason: "Owner share percentage is required.", result: "invalid" };
  if (!Number.isFinite(ownerShare)) return { reason: "Owner share percentage must be a number.", result: "invalid" };
  if (record.bedrooms && (bedrooms === null || !Number.isInteger(bedrooms) || bedrooms < 0)) {
    return { reason: "Bedrooms must be a nonnegative whole number.", result: "invalid" };
  }
  if (record.status !== "active" && record.status !== "inactive") {
    return { reason: "Status must be active or inactive.", result: "invalid" };
  }

  const insert: PropertyImportInsert = {
    address: record.address || null,
    bedrooms,
    city: record.city || null,
    cms_share: 100 - ownerShare,
    name: record.propertyName,
    owner_id: owner.id || "",
    owner_share: ownerShare,
    status,
  };

  const parsed = propertySchema.safeParse({
    address: insert.address || "",
    bedrooms: insert.bedrooms ?? undefined,
    city: insert.city || "",
    cms_share: insert.cms_share,
    name: insert.name,
    owner_id: owner.id || "00000000-0000-4000-8000-000000000000",
    owner_share: insert.owner_share,
    status: insert.status,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Property fields are invalid.";
    return { reason: issue, result: "invalid" };
  }

  return { insert, reason: "Ready to import.", result: "ready" };
}

export function validatePropertyImportCsv({
  csv,
  existingPropertyNames,
  owners,
}: {
  csv: string;
  existingPropertyNames: string[];
  owners: PropertyImportOwner[];
}): PropertyImportValidation {
  if (!csv.trim()) {
    return { error: "Choose a CSV file before importing.", inserts: [], rows: [], summary: emptySummary() };
  }

  if (isOverImportSizeLimit(csv)) {
    return { error: "CSV file cannot exceed 5 MB.", inserts: [], rows: [], summary: emptySummary() };
  }

  const parsedCsv = parseCsvRows(csv);
  if (parsedCsv.error) return { error: parsedCsv.error, inserts: [], rows: [], summary: emptySummary() };
  if (parsedCsv.rows.length === 0) {
    return { error: "CSV file is empty.", inserts: [], rows: [], summary: emptySummary() };
  }

  const [headerRow, ...dataRows] = parsedCsv.rows;
  const normalizedHeaders = headerRow.map((header) => header.trim().toLowerCase());
  const missingHeaders = PROPERTY_IMPORT_HEADERS.filter((header) => !normalizedHeaders.includes(header));

  if (missingHeaders.length > 0) {
    return {
      error: `Missing required header${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const nonEmptyRows = dataRows.filter((row) => !isBlankRow(row));
  if (nonEmptyRows.length > PROPERTY_IMPORT_MAX_ROWS) {
    return {
      error: `CSV cannot include more than ${PROPERTY_IMPORT_MAX_ROWS.toLocaleString("en-IN")} non-empty data rows.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const indexes = PROPERTY_IMPORT_HEADERS.reduce(
    (acc, header) => ({ ...acc, [header]: normalizedHeaders.indexOf(header) }),
    {} as Record<(typeof PROPERTY_IMPORT_HEADERS)[number], number>,
  );
  const ownersByEmail = new Map(owners.map((owner) => [owner.email.trim().toLowerCase(), owner]));
  const existingNames = new Set(existingPropertyNames.map(normalizePropertyName));
  const seenNames = new Set<string>();
  const rows: PropertyImportPreviewRow[] = [];
  const inserts: PropertyImportInsert[] = [];

  dataRows.forEach((row, index) => {
    if (isBlankRow(row)) {
      rows.push({
        address: "",
        bedrooms: "",
        city: "",
        ownerEmail: "",
        ownerShare: "",
        propertyName: "",
        reason: "Blank row.",
        result: "invalid",
        rowNumber: index + 2,
        status: "",
      });
      return;
    }

    const record = recordFromRow(row, index + 2, indexes);
    if (row.length > headerRow.length) {
      rows.push({
        address: record.address,
        bedrooms: record.bedrooms,
        city: record.city,
        ownerEmail: record.ownerEmail,
        ownerShare: record.ownerShare,
        propertyName: record.propertyName,
        reason: "Row has more columns than the header row. Wrap values that contain commas in quotes.",
        result: "invalid",
        rowNumber: record.rowNumber,
        status: record.status,
      });
      return;
    }

    const normalizedName = normalizePropertyName(record.propertyName);

    if (normalizedName && existingNames.has(normalizedName)) {
      rows.push({
        address: record.address,
        bedrooms: record.bedrooms,
        city: record.city,
        ownerEmail: record.ownerEmail,
        ownerShare: record.ownerShare,
        propertyName: record.propertyName,
        reason: "A property with this name already exists.",
        result: "duplicate",
        rowNumber: record.rowNumber,
        status: record.status,
      });
      seenNames.add(normalizedName);
      return;
    }

    if (normalizedName && seenNames.has(normalizedName)) {
      rows.push({
        address: record.address,
        bedrooms: record.bedrooms,
        city: record.city,
        ownerEmail: record.ownerEmail,
        ownerShare: record.ownerShare,
        propertyName: record.propertyName,
        reason: "This property name is repeated in the CSV.",
        result: "duplicate",
        rowNumber: record.rowNumber,
        status: record.status,
      });
      return;
    }

    if (normalizedName) seenNames.add(normalizedName);

    const validation = validateRecord(record, ownersByEmail.get(record.ownerEmail));
    rows.push({
      address: record.address,
      bedrooms: record.bedrooms,
      city: record.city,
      ownerEmail: record.ownerEmail,
      ownerShare: record.ownerShare,
      propertyName: record.propertyName,
      reason: validation.reason,
      result: validation.result,
      rowNumber: record.rowNumber,
      status: record.status,
    });
    if (validation.result === "ready" && validation.insert?.owner_id) inserts.push(validation.insert);
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
