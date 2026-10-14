import { propertySchema } from "@/src/lib/validators/properties";
import { normalizePropertySlug } from "@/src/lib/utils/property-slug";
import type { Database } from "@/types/database.types";

export const PROPERTY_IMPORT_FILE_NAME = "curatemystay-properties-demo.csv";
export const PROPERTY_IMPORT_MAX_BYTES = 5 * 1024 * 1024;
export const PROPERTY_IMPORT_MAX_ROWS = 1000;
export const PROPERTY_IMPORT_LIST_SEPARATOR = "|";
export const PROPERTY_IMPORT_NO_IMAGES_WARNING = "Published without images. Add a gallery after import.";

// Required headers: a CSV must contain all of these.
export const PROPERTY_IMPORT_HEADERS = [
  "property_name",
  "owner_email",
  "address",
  "city",
  "bedrooms",
  "owner_share_percentage",
  "status",
] as const;

// Optional website listing headers, grouped as in the admin form. Each name is also the properties column name.
export const PROPERTY_IMPORT_LISTING_GROUPS = [
  { title: "Publishing", headers: ["show_on_website", "accept_booking_requests"] },
  {
    title: "Identity",
    headers: [
      "slug",
      "public_name",
      "public_property_type",
      "promotional_badge",
      "display_order",
      "is_featured",
      "show_in_similar_properties",
    ],
  },
  {
    title: "Location",
    headers: ["region", "area", "short_location_line", "public_location_text", "google_maps_url", "distance_from_beach"],
  },
  { title: "Copy", headers: ["tagline", "short_description", "full_description"] },
  { title: "Capacity", headers: ["beds", "bathrooms", "max_guests", "pool_type"] },
  { title: "Lists", headers: ["property_highlights", "amenities", "house_rules"] },
  { title: "Price display", headers: ["show_price", "starting_price", "price_note"] },
  { title: "Stay and enquiry", headers: ["minimum_nights", "check_in_time", "check_out_time", "booking_enquiry_note"] },
  { title: "SEO", headers: ["seo_title", "seo_description"] },
] as const;

export const PROPERTY_IMPORT_LISTING_HEADERS = PROPERTY_IMPORT_LISTING_GROUPS.flatMap((group) => group.headers);
export const PROPERTY_IMPORT_ALL_HEADERS = [...PROPERTY_IMPORT_HEADERS, ...PROPERTY_IMPORT_LISTING_HEADERS] as const;

type ImportHeader = (typeof PROPERTY_IMPORT_ALL_HEADERS)[number];
type ListingHeader = (typeof PROPERTY_IMPORT_LISTING_HEADERS)[number];

const BOOLEAN_HEADERS = [
  "show_on_website",
  "accept_booking_requests",
  "is_featured",
  "show_in_similar_properties",
  "show_price",
] as const satisfies readonly ListingHeader[];
const INTEGER_HEADERS = ["beds", "max_guests", "minimum_nights", "display_order"] as const satisfies readonly ListingHeader[];
const TIME_HEADERS = ["check_in_time", "check_out_time"] as const satisfies readonly ListingHeader[];
const LIST_HEADERS = ["property_highlights", "amenities", "house_rules"] as const satisfies readonly ListingHeader[];
const TEXT_HEADERS = [
  "public_name",
  "public_property_type",
  "promotional_badge",
  "region",
  "area",
  "short_location_line",
  "public_location_text",
  "google_maps_url",
  "distance_from_beach",
  "tagline",
  "short_description",
  "full_description",
  "pool_type",
  "price_note",
  "booking_enquiry_note",
  "seo_title",
  "seo_description",
] as const satisfies readonly ListingHeader[];

const SLUG_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_INTEGER = 2147483647;
const MAX_BATHROOMS = 999.9; // numeric(4,1)
const MAX_STARTING_PRICE = 9999999999.99; // numeric(12,2)

function csvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

type DemoRow = Partial<Record<ImportHeader, string>>;

const DEMO_ROWS: DemoRow[] = [
  // Operational fields only: imports as a hidden property with no listing data.
  {
    property_name: "Palm Studio",
    owner_email: "owner2@example.com",
    address: "Siolim riverside, near market",
    city: "Goa",
    bedrooms: "1",
    owner_share_percentage: "75",
    status: "active",
  },
  // Fully populated published listing. Images cannot come from CSV; add a gallery after import.
  {
    property_name: "Villa Sol",
    owner_email: "owner@example.com",
    address: "Assagao, North Goa",
    city: "Goa",
    bedrooms: "3",
    owner_share_percentage: "80",
    status: "active",
    show_on_website: "yes",
    accept_booking_requests: "yes",
    slug: "villa-sol-assagao",
    public_name: "Villa Sol Assagao",
    public_property_type: "Villa",
    promotional_badge: "Guest favourite",
    display_order: "1",
    is_featured: "yes",
    show_in_similar_properties: "yes",
    region: "North Goa",
    area: "Assagao",
    short_location_line: "Assagao, North Goa",
    public_location_text: "A quiet lane in Assagao, a short drive from Anjuna, Vagator and the village cafes.",
    google_maps_url: "https://maps.google.com/?q=Assagao,Goa",
    distance_from_beach: "15 minutes to Vagator Beach",
    tagline: "A private pool villa in the heart of Assagao",
    short_description: "Three-bedroom pool villa with a leafy garden, minutes from Assagao's cafes.",
    full_description:
      "Villa Sol is a three-bedroom Goan villa with a private pool, an open-plan living area and a shaded garden. Housekeeping and a caretaker are on site every day.",
    beds: "4",
    bathrooms: "3.5",
    max_guests: "8",
    pool_type: "Private pool",
    property_highlights: "Private pool|Garden lounge|Daily housekeeping",
    amenities: "Wi-Fi|Air conditioning|Parking|Fully equipped kitchen",
    house_rules: "No parties|Quiet hours after 10 PM|No smoking indoors",
    show_price: "yes",
    starting_price: "14500",
    price_note: "Per night for up to 6 guests, taxes extra",
    minimum_nights: "2",
    check_in_time: "14:00",
    check_out_time: "11:00",
    booking_enquiry_note: "Share your dates and guest count and we will confirm availability on WhatsApp.",
    seo_title: "Villa Sol Assagao | Private pool villa in North Goa",
    seo_description: "Book a three-bedroom private pool villa in Assagao, North Goa, managed by CurateMyStay.",
  },
  // Hidden row with partial listing data: saved as a draft and not published.
  {
    property_name: "Riverside Cottage",
    owner_email: "owner@example.com",
    address: "Siolim, North Goa",
    city: "Goa",
    bedrooms: "2",
    owner_share_percentage: "70",
    status: "active",
    show_on_website: "no",
    public_name: "Riverside Cottage Siolim",
    region: "North Goa",
    area: "Siolim",
    tagline: "A calm cottage by the Chapora river",
    amenities: "Wi-Fi|Parking",
    starting_price: "7200",
    minimum_nights: "2",
    check_in_time: "13:00",
  },
];

export const PROPERTY_IMPORT_DEMO_CSV = `${[
  PROPERTY_IMPORT_ALL_HEADERS.join(","),
  ...DEMO_ROWS.map((row) => PROPERTY_IMPORT_ALL_HEADERS.map((header) => csvCell(row[header] ?? "")).join(",")),
].join("\n")}\n`;

type PropertyStatus = Database["public"]["Tables"]["properties"]["Row"]["status"];
export type PropertyImportInsert = Database["public"]["Tables"]["properties"]["Insert"];

export type PropertyImportOwner = {
  email: string;
  id?: string;
  role: "admin" | "owner";
  status: "pending" | "active" | "inactive";
};

export type PropertyImportResult = "ready" | "duplicate" | "invalid";
export type PropertyImportWebsiteState = "published" | "hidden" | "hidden-draft";

export type PropertyImportPreviewRow = {
  address: string;
  bedrooms: string;
  city: string;
  details: Array<{ label: string; value: string }>;
  ownerEmail: string;
  ownerShare: string;
  propertyName: string;
  reason: string;
  result: PropertyImportResult;
  rowNumber: number;
  slug: string;
  status: string;
  warnings: string[];
  website: PropertyImportWebsiteState;
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
  cells: Record<ImportHeader, string>;
  rowNumber: number;
};

type SlugRegistry = {
  existing: Set<string>;
  seen: Set<string>;
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
  const input = csv.replace(/^﻿/, "");

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

function emptyCells() {
  return Object.fromEntries(PROPERTY_IMPORT_ALL_HEADERS.map((header) => [header, ""])) as Record<ImportHeader, string>;
}

function recordFromRow(row: string[], rowNumber: number, indexes: Record<ImportHeader, number>): CsvRecord {
  const cells = emptyCells();
  PROPERTY_IMPORT_ALL_HEADERS.forEach((header) => {
    cells[header] = indexes[header] >= 0 ? (row[indexes[header]] || "").trim() : "";
  });
  cells.owner_email = cells.owner_email.toLowerCase();
  cells.status = cells.status.toLowerCase();

  return { cells, rowNumber };
}

function parseBooleanCell(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) return true;
  if (["false", "no", "0"].includes(normalized)) return false;
  return undefined;
}

function splitListCell(value: string) {
  const seen = new Set<string>();
  const items: string[] = [];

  value.split(PROPERTY_IMPORT_LIST_SEPARATOR).forEach((part) => {
    const item = part.trim();
    const key = item.toLowerCase();
    if (!item || seen.has(key)) return;
    seen.add(key);
    items.push(item);
  });

  return items;
}

// Converts the optional listing cells into propertySchema input. Blank cells are omitted so the validator
// applies its own defaults (the same ones the admin form uses). Returns format errors for provided values only.
function parseListingCells(cells: Record<ImportHeader, string>) {
  const errors: string[] = [];
  const input: Record<string, unknown> = {};

  BOOLEAN_HEADERS.forEach((header) => {
    if (!cells[header]) return;
    const value = parseBooleanCell(cells[header]);
    if (value === undefined) errors.push(`${header} must be true/false, yes/no, or 1/0.`);
    else input[header] = value;
  });

  INTEGER_HEADERS.forEach((header) => {
    const value = cells[header];
    if (!value) return;
    if (!/^-?\d+$/.test(value)) errors.push(`${header} must be a whole number.`);
    else if (Number(value) > MAX_INTEGER) errors.push(`${header} is too large.`);
    else input[header] = Number(value);
  });

  if (cells.bathrooms) {
    if (!/^-?\d+(\.\d)?$/.test(cells.bathrooms)) errors.push("bathrooms must be a number with at most one decimal place.");
    else if (Number(cells.bathrooms) > MAX_BATHROOMS) errors.push("bathrooms is too large.");
    else input.bathrooms = Number(cells.bathrooms);
  }

  if (cells.starting_price) {
    if (!/^-?\d+(\.\d{1,2})?$/.test(cells.starting_price)) {
      errors.push("starting_price must be a number with at most two decimal places.");
    } else if (Number(cells.starting_price) > MAX_STARTING_PRICE) errors.push("starting_price is too large.");
    else input.starting_price = Number(cells.starting_price);
  }

  TIME_HEADERS.forEach((header) => {
    if (!cells[header]) return;
    if (!TIME_FORMAT.test(cells[header])) errors.push(`${header} must be a 24-hour time like 14:00.`);
    else input[header] = cells[header];
  });

  LIST_HEADERS.forEach((header) => {
    const items = splitListCell(cells[header]);
    if (items.length > 0) input[header] = items;
  });

  TEXT_HEADERS.forEach((header) => {
    if (cells[header]) input[header] = cells[header];
  });

  // The schema normalizes slugs, so check the raw value here to keep "lowercase URL-safe" a strict rule.
  if (cells.slug) {
    if (!SLUG_FORMAT.test(cells.slug)) errors.push("slug must use lowercase letters, numbers, and hyphens only.");
    else input.slug = cells.slug;
  }

  return { errors, input };
}

function hasDraftListingData(cells: Record<ImportHeader, string>) {
  return PROPERTY_IMPORT_LISTING_HEADERS.some((header) => header !== "show_on_website" && cells[header] !== "");
}

function websiteState(cells: Record<ImportHeader, string>): PropertyImportWebsiteState {
  if (parseBooleanCell(cells.show_on_website) === true) return "published";
  return hasDraftListingData(cells) ? "hidden-draft" : "hidden";
}

function previewRow(
  record: CsvRecord,
  result: PropertyImportResult,
  reason: string,
  extra: { slug?: string; warnings?: string[] } = {},
): PropertyImportPreviewRow {
  const { cells } = record;
  const details = [
    { label: "Address", value: cells.address },
    { label: "City", value: cells.city },
    { label: "Bedrooms", value: cells.bedrooms },
    { label: "Owner share", value: cells.owner_share_percentage ? `${cells.owner_share_percentage}%` : "" },
    ...PROPERTY_IMPORT_LISTING_HEADERS.map((header) => ({ label: header, value: cells[header] })),
  ].filter((detail) => detail.value !== "");

  return {
    address: cells.address,
    bedrooms: cells.bedrooms,
    city: cells.city,
    details,
    ownerEmail: cells.owner_email,
    ownerShare: cells.owner_share_percentage,
    propertyName: cells.property_name,
    reason,
    result,
    rowNumber: record.rowNumber,
    slug: extra.slug ?? cells.slug,
    status: cells.status,
    warnings: extra.warnings ?? [],
    website: websiteState(cells),
  };
}

function validateRecord(
  record: CsvRecord,
  owner: PropertyImportOwner | undefined,
  slugs: SlugRegistry,
): { insert?: PropertyImportInsert; reason: string; result: PropertyImportResult; slug?: string; warnings?: string[] } {
  const { cells } = record;
  const ownerShare = Number(cells.owner_share_percentage);
  const bedrooms = cells.bedrooms ? Number(cells.bedrooms) : null;
  const status = cells.status as PropertyStatus;

  if (!cells.property_name) return { reason: "Property name is required.", result: "invalid" };
  if (!cells.owner_email) return { reason: "Owner email is required.", result: "invalid" };
  if (!owner || owner.role !== "owner" || owner.status !== "active") {
    return { reason: "Owner email must match an existing active owner.", result: "invalid" };
  }
  if (!cells.owner_share_percentage) return { reason: "Owner share percentage is required.", result: "invalid" };
  if (!Number.isFinite(ownerShare)) return { reason: "Owner share percentage must be a number.", result: "invalid" };
  if (cells.bedrooms && (bedrooms === null || !Number.isInteger(bedrooms) || bedrooms < 0)) {
    return { reason: "Bedrooms must be a nonnegative whole number.", result: "invalid" };
  }
  if (cells.status !== "active" && cells.status !== "inactive") {
    return { reason: "Status must be active or inactive.", result: "invalid" };
  }

  const listing = parseListingCells(cells);
  if (listing.errors.length > 0) return { reason: listing.errors.join(" "), result: "invalid" };

  // Slug is generated from the public name only for rows that will be published.
  const publishing = listing.input.show_on_website === true;
  if (publishing && !listing.input.slug && typeof listing.input.public_name === "string") {
    const generated = normalizePropertySlug(listing.input.public_name);
    if (generated) listing.input.slug = generated;
  }

  const slug = typeof listing.input.slug === "string" ? listing.input.slug : undefined;
  const issues: string[] = [];

  const parsed = propertySchema.safeParse({
    ...listing.input,
    address: cells.address,
    bedrooms: bedrooms ?? undefined,
    city: cells.city,
    cms_share: 100 - ownerShare,
    name: cells.property_name,
    owner_id: owner.id || "00000000-0000-4000-8000-000000000000",
    owner_share: ownerShare,
    status,
  });

  if (!parsed.success) parsed.error.issues.forEach((issue) => issues.push(issue.message));

  if (slug) {
    if (slugs.existing.has(slug)) issues.push(`Slug "${slug}" is already used by another property.`);
    else if (slugs.seen.has(slug)) issues.push(`Slug "${slug}" is repeated in this CSV.`);
    slugs.seen.add(slug);
  }

  if (!parsed.success || issues.length > 0) {
    return { reason: Array.from(new Set(issues)).join(" "), result: "invalid", slug };
  }

  const insert: PropertyImportInsert = {
    address: cells.address || null,
    bedrooms,
    city: cells.city || null,
    cms_share: 100 - ownerShare,
    name: cells.property_name,
    owner_id: owner.id || "",
    owner_share: ownerShare,
    status,
  };

  // Listing values come from the parsed schema output so defaults match the admin form. Nulls are left to
  // the database defaults, and image_url is never written.
  const insertValues = insert as Record<string, unknown>;
  PROPERTY_IMPORT_LISTING_HEADERS.forEach((header) => {
    const value = parsed.data[header];
    if (value !== null && value !== undefined) insertValues[header] = value;
  });

  return {
    insert,
    reason: "Ready to import.",
    result: "ready",
    slug,
    warnings: parsed.data.show_on_website ? [PROPERTY_IMPORT_NO_IMAGES_WARNING] : [],
  };
}

export function validatePropertyImportCsv({
  csv,
  existingPropertyNames,
  existingPropertySlugs = [],
  owners,
}: {
  csv: string;
  existingPropertyNames: string[];
  existingPropertySlugs?: string[];
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

  const indexes = PROPERTY_IMPORT_ALL_HEADERS.reduce(
    (acc, header) => ({ ...acc, [header]: normalizedHeaders.indexOf(header) }),
    {} as Record<ImportHeader, number>,
  );
  const ownersByEmail = new Map(owners.map((owner) => [owner.email.trim().toLowerCase(), owner]));
  const existingNames = new Set(existingPropertyNames.map(normalizePropertyName));
  const slugs: SlugRegistry = {
    existing: new Set(existingPropertySlugs.map((slug) => slug.trim().toLowerCase())),
    seen: new Set<string>(),
  };
  const seenNames = new Set<string>();
  const rows: PropertyImportPreviewRow[] = [];
  const inserts: PropertyImportInsert[] = [];

  dataRows.forEach((row, index) => {
    if (isBlankRow(row)) {
      rows.push(previewRow({ cells: emptyCells(), rowNumber: index + 2 }, "invalid", "Blank row."));
      return;
    }

    const record = recordFromRow(row, index + 2, indexes);
    if (row.length > headerRow.length) {
      rows.push(
        previewRow(
          record,
          "invalid",
          "Row has more columns than the header row. Wrap values that contain commas in quotes.",
        ),
      );
      return;
    }

    const normalizedName = normalizePropertyName(record.cells.property_name);

    if (normalizedName && existingNames.has(normalizedName)) {
      rows.push(previewRow(record, "duplicate", "A property with this name already exists."));
      seenNames.add(normalizedName);
      return;
    }

    if (normalizedName && seenNames.has(normalizedName)) {
      rows.push(previewRow(record, "duplicate", "This property name is repeated in the CSV."));
      return;
    }

    if (normalizedName) seenNames.add(normalizedName);

    const validation = validateRecord(record, ownersByEmail.get(record.cells.owner_email), slugs);
    rows.push(previewRow(record, validation.result, validation.reason, { slug: validation.slug, warnings: validation.warnings }));
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
