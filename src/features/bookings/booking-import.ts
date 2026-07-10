import {
  calculateNightlyRate,
  calculateNights,
  calculateTotalAmount,
  getBookingStatus,
} from "@/src/features/bookings/booking-calculations";
import { bookingSchema } from "@/src/lib/validators/bookings";
import type { Database } from "@/types/database.types";

export const BOOKING_IMPORT_FILE_NAME = "curatemystay-bookings-demo.csv";
export const BOOKING_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const BOOKING_IMPORT_MAX_ROWS = 1000;
export const BOOKING_IMPORT_HEADERS = [
  "property_name",
  "guest_name",
  "guest_phone",
  "check_in",
  "check_out",
  "guests",
  "nightly_rate",
  "total_amount",
  "booking_source",
  "concierge",
  "notes",
] as const;

export const BOOKING_IMPORT_DEMO_CSV = `${BOOKING_IMPORT_HEADERS.join(",")}
Villa Sol,John Doe,+919999999999,2026-08-10,2026-08-14,2,12000,48000,Airbnb,No,"Airport pickup, late check-in requested"
Palm Retreat,Jane Smith,+918888888888,2026-08-18,2026-08-21,3,15000,45000,Booking.com,Yes,"Anniversary stay"
`;

export type BookingImportInsert = Database["public"]["Tables"]["bookings"]["Insert"];

export type BookingImportProperty = {
  id?: string;
  name: string;
};

export type BookingImportExistingBooking = {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestPhone: string | null;
  propertyId?: string;
  propertyName: string;
};

export type BookingImportSettings = {
  bookingSources: string[];
  conciergeOptions: string[];
};

export type BookingImportResult = "ready" | "duplicate" | "invalid";

export type BookingImportPreviewRow = {
  bookingSource: string;
  calculatedNights: number | null;
  checkIn: string;
  checkOut: string;
  concierge: string;
  guestName: string;
  guestPhone: string;
  nightlyRate: number | null;
  propertyName: string;
  reason: string;
  result: BookingImportResult;
  rowNumber: number;
  totalAmount: number | null;
};

export type BookingImportSummary = {
  duplicateRows: number;
  invalidRows: number;
  readyRows: number;
  totalRows: number;
};

export type BookingImportValidation = {
  error?: string;
  inserts: BookingImportInsert[];
  rows: BookingImportPreviewRow[];
  summary: BookingImportSummary;
};

type CsvRecord = {
  bookingSource: string;
  checkIn: string;
  checkOut: string;
  concierge: string;
  guestName: string;
  guestPhone: string;
  guests: string;
  nightlyRate: string;
  notes: string;
  propertyName: string;
  rowNumber: number;
  totalAmount: string;
};

type PreparedBooking = {
  fingerprint: string;
  insert?: BookingImportInsert;
  preview: Omit<BookingImportPreviewRow, "reason" | "result">;
};

function emptySummary(): BookingImportSummary {
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

export function isBookingCsvFileName(fileName: string) {
  return fileName.trim().toLowerCase().endsWith(".csv");
}

export function isOverBookingImportSizeLimit(value: string) {
  return textByteLength(value) > BOOKING_IMPORT_MAX_BYTES;
}

export function normalizeBookingText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeBookingPhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
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

function recordFromRow(row: string[], rowNumber: number, indexes: Record<(typeof BOOKING_IMPORT_HEADERS)[number], number>): CsvRecord {
  const cell = (key: (typeof BOOKING_IMPORT_HEADERS)[number]) => (row[indexes[key]] || "").trim();

  return {
    bookingSource: cell("booking_source"),
    checkIn: cell("check_in"),
    checkOut: cell("check_out"),
    concierge: cell("concierge"),
    guestName: cell("guest_name"),
    guestPhone: cell("guest_phone"),
    guests: cell("guests"),
    nightlyRate: cell("nightly_rate"),
    notes: cell("notes"),
    propertyName: cell("property_name"),
    rowNumber,
    totalAmount: cell("total_amount"),
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

function parseGuests(value: string) {
  if (!value.trim()) return 1;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function optionFromSettings(value: string, options: string[]) {
  if (!value.trim()) return "";
  const normalized = normalizeBookingText(value);
  return options.find((option) => normalizeBookingText(option) === normalized) || null;
}

function conciergeFromSettings(value: string, options: string[]) {
  if (!value.trim()) return { display: "", values: [] as string[] };
  const requested = value.split(",").map((item) => item.trim()).filter(Boolean);
  const values: string[] = [];

  for (const item of requested) {
    const match = optionFromSettings(item, options);
    if (match === null) return null;
    if (match) values.push(match);
  }

  return { display: values.join(", "), values };
}

function propertyLookup(properties: BookingImportProperty[]) {
  const byName = new Map<string, BookingImportProperty[]>();
  properties.forEach((property) => {
    const key = normalizeBookingText(property.name);
    byName.set(key, [...(byName.get(key) || []), property]);
  });
  return byName;
}

function existingBookingFingerprint(booking: BookingImportExistingBooking) {
  const propertyKey = booking.propertyId || normalizeBookingText(booking.propertyName);
  return [
    propertyKey,
    normalizeBookingText(booking.guestName),
    normalizeBookingPhone(booking.guestPhone),
    booking.checkIn,
    booking.checkOut,
  ].join("|");
}

function validateRecord(
  record: CsvRecord,
  propertiesByName: Map<string, BookingImportProperty[]>,
  settings: BookingImportSettings,
): { prepared?: PreparedBooking; reason: string; result: BookingImportResult } {
  const propertyMatches = propertiesByName.get(normalizeBookingText(record.propertyName)) || [];

  if (!record.propertyName) return { reason: "Property name is required.", result: "invalid" };
  if (propertyMatches.length === 0) return { reason: "Property name must match an existing property.", result: "invalid" };
  if (propertyMatches.length > 1) return { reason: "Property name matches multiple properties. Rename one property before importing.", result: "invalid" };
  if (!record.guestName) return { reason: "Guest name is required.", result: "invalid" };
  if (!isValidDateString(record.checkIn)) return { reason: "Check-in must use YYYY-MM-DD.", result: "invalid" };
  if (!isValidDateString(record.checkOut)) return { reason: "Check-out must use YYYY-MM-DD.", result: "invalid" };

  const nights = calculateNights(record.checkIn, record.checkOut);
  if (nights === null || nights <= 0) return { reason: "Check-out must be after check-in.", result: "invalid" };

  const guests = parseGuests(record.guests);
  if (guests === null) return { reason: "Guests must be a nonnegative whole number.", result: "invalid" };

  const hasNightlyRate = Boolean(record.nightlyRate.trim());
  const hasTotalAmount = Boolean(record.totalAmount.trim());
  const nightlyRateInput = parsePositiveNumber(record.nightlyRate);
  const totalAmountInput = parsePositiveNumber(record.totalAmount);

  if (!hasNightlyRate && !hasTotalAmount) {
    return { reason: "Nightly rate or total amount is required.", result: "invalid" };
  }
  if (hasNightlyRate && nightlyRateInput === null) return { reason: "Nightly rate must be a positive number.", result: "invalid" };
  if (hasTotalAmount && totalAmountInput === null) return { reason: "Total amount must be a positive number.", result: "invalid" };

  const nightlyRate =
    nightlyRateInput ?? (totalAmountInput !== null ? calculateNightlyRate(totalAmountInput, nights) : null);
  const totalAmount =
    totalAmountInput ?? (nightlyRateInput !== null ? calculateTotalAmount(nights, nightlyRateInput) : null);

  if (nightlyRate === null || totalAmount === null) {
    return { reason: "Nightly rate or total amount is required.", result: "invalid" };
  }

  if (hasNightlyRate && hasTotalAmount && Math.abs(calculateTotalAmount(nights, nightlyRate) - totalAmount) > 0.01) {
    return { reason: "Nightly rate and total amount do not match the calculated nights.", result: "invalid" };
  }

  const source = optionFromSettings(record.bookingSource, settings.bookingSources);
  if (source === null) return { reason: "Booking source must match a configured setting.", result: "invalid" };

  const concierge = conciergeFromSettings(record.concierge, settings.conciergeOptions);
  if (concierge === null) return { reason: "Concierge must match configured setting values.", result: "invalid" };

  const property = propertyMatches[0];
  const propertyId = property.id || "00000000-0000-4000-8000-000000000000";
  const status = getBookingStatus(record.checkIn, record.checkOut);
  const insert: BookingImportInsert = {
    check_in: record.checkIn,
    check_out: record.checkOut,
    concierge: concierge.values.length ? concierge.values : null,
    guest_name: record.guestName,
    guest_phone: record.guestPhone || null,
    guests,
    nightly_rate: nightlyRate,
    notes: record.notes || null,
    nights,
    property_id: property.id || "",
    source: source || null,
    status,
    total_amount: totalAmount,
  };

  const parsed = bookingSchema.safeParse({
    check_in: insert.check_in,
    check_out: insert.check_out,
    concierge: concierge.display,
    guest_name: insert.guest_name,
    guest_phone: insert.guest_phone || "",
    guests: insert.guests,
    nightly_rate: insert.nightly_rate,
    notes: insert.notes || "",
    property_id: propertyId,
    source: insert.source || "",
    total_amount: insert.total_amount,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message || "Booking fields are invalid.";
    return { reason: issue, result: "invalid" };
  }

  return {
    prepared: {
      fingerprint: [
        property.id || normalizeBookingText(property.name),
        normalizeBookingText(record.guestName),
        normalizeBookingPhone(record.guestPhone),
        record.checkIn,
        record.checkOut,
      ].join("|"),
      insert,
      preview: {
        bookingSource: source || "",
        calculatedNights: nights,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        concierge: concierge.display,
        guestName: record.guestName,
        guestPhone: record.guestPhone,
        nightlyRate,
        propertyName: property.name,
        rowNumber: record.rowNumber,
        totalAmount,
      },
    },
    reason: "Ready to import.",
    result: "ready",
  };
}

export function validateBookingImportCsv({
  bookings,
  csv,
  properties,
  settings,
}: {
  bookings: BookingImportExistingBooking[];
  csv: string;
  properties: BookingImportProperty[];
  settings: BookingImportSettings;
}): BookingImportValidation {
  if (!csv.trim()) {
    return { error: "Choose a CSV file before importing.", inserts: [], rows: [], summary: emptySummary() };
  }

  if (isOverBookingImportSizeLimit(csv)) {
    return { error: "CSV file cannot exceed 5 MB.", inserts: [], rows: [], summary: emptySummary() };
  }

  const parsedCsv = parseCsvRows(csv);
  if (parsedCsv.error) return { error: parsedCsv.error, inserts: [], rows: [], summary: emptySummary() };
  if (parsedCsv.rows.length === 0) {
    return { error: "CSV file is empty.", inserts: [], rows: [], summary: emptySummary() };
  }

  const [headerRow, ...dataRows] = parsedCsv.rows;
  const normalizedHeaders = headerRow.map((header) => header.trim().toLowerCase());
  const missingHeaders = BOOKING_IMPORT_HEADERS.filter((header) => !normalizedHeaders.includes(header));

  if (missingHeaders.length > 0) {
    return {
      error: `Missing required header${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const nonEmptyRows = dataRows.filter((row) => !isBlankRow(row));
  if (nonEmptyRows.length > BOOKING_IMPORT_MAX_ROWS) {
    return {
      error: `CSV cannot include more than ${BOOKING_IMPORT_MAX_ROWS.toLocaleString("en-IN")} non-empty data rows.`,
      inserts: [],
      rows: [],
      summary: emptySummary(),
    };
  }

  const indexes = BOOKING_IMPORT_HEADERS.reduce(
    (acc, header) => ({ ...acc, [header]: normalizedHeaders.indexOf(header) }),
    {} as Record<(typeof BOOKING_IMPORT_HEADERS)[number], number>,
  );
  const propertiesByName = propertyLookup(properties);
  const existingFingerprints = new Set(bookings.map(existingBookingFingerprint));
  const seenFingerprints = new Set<string>();
  const rows: BookingImportPreviewRow[] = [];
  const inserts: BookingImportInsert[] = [];

  dataRows.forEach((row, index) => {
    if (isBlankRow(row)) {
      rows.push({
        bookingSource: "",
        calculatedNights: null,
        checkIn: "",
        checkOut: "",
        concierge: "",
        guestName: "",
        guestPhone: "",
        nightlyRate: null,
        propertyName: "",
        reason: "Blank row.",
        result: "invalid",
        rowNumber: index + 2,
        totalAmount: null,
      });
      return;
    }

    const record = recordFromRow(row, index + 2, indexes);
    if (row.length > headerRow.length) {
      rows.push({
        bookingSource: record.bookingSource,
        calculatedNights: null,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        concierge: record.concierge,
        guestName: record.guestName,
        guestPhone: record.guestPhone,
        nightlyRate: parsePositiveNumber(record.nightlyRate),
        propertyName: record.propertyName,
        reason: "Row has more columns than the header row. Wrap values that contain commas in quotes.",
        result: "invalid",
        rowNumber: record.rowNumber,
        totalAmount: parsePositiveNumber(record.totalAmount),
      });
      return;
    }

    const validation = validateRecord(record, propertiesByName, settings);

    if (!validation.prepared) {
      rows.push({
        bookingSource: record.bookingSource,
        calculatedNights: null,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        concierge: record.concierge,
        guestName: record.guestName,
        guestPhone: record.guestPhone,
        nightlyRate: parsePositiveNumber(record.nightlyRate),
        propertyName: record.propertyName,
        reason: validation.reason,
        result: validation.result,
        rowNumber: record.rowNumber,
        totalAmount: parsePositiveNumber(record.totalAmount),
      });
      return;
    }

    if (existingFingerprints.has(validation.prepared.fingerprint)) {
      rows.push({
        ...validation.prepared.preview,
        reason: "A matching booking already exists.",
        result: "duplicate",
      });
      seenFingerprints.add(validation.prepared.fingerprint);
      return;
    }

    if (seenFingerprints.has(validation.prepared.fingerprint)) {
      rows.push({
        ...validation.prepared.preview,
        reason: "This booking is repeated in the CSV.",
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
    if (validation.prepared.insert?.property_id) inserts.push(validation.prepared.insert);
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
