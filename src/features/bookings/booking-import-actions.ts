"use server";

import { invalidateBusinessData } from "@/src/features/shared/cache-invalidation";
import { requireRole } from "@/src/features/auth/auth-guards";
import {
  BOOKING_IMPORT_MAX_BYTES,
  isBookingCsvFileName,
  isOverBookingImportSizeLimit,
  validateBookingImportCsv,
  type BookingImportPreviewRow,
  type BookingImportSummary,
} from "@/src/features/bookings/booking-import";
import { createClient } from "@/src/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type BookingImportActionState = {
  message?: string;
  ok: boolean;
  result?: {
    inserted: number;
    rows: BookingImportPreviewRow[];
    skippedDuplicates: number;
    skippedInvalid: number;
    totalProcessed: number;
  };
};

const initialSummary: BookingImportSummary = {
  duplicateRows: 0,
  invalidRows: 0,
  readyRows: 0,
  totalRows: 0,
};

function failure(message: string, rows: BookingImportPreviewRow[] = [], summary: BookingImportSummary = initialSummary): BookingImportActionState {
  return {
    message,
    ok: false,
    result: {
      inserted: 0,
      rows,
      skippedDuplicates: summary.duplicateRows,
      skippedInvalid: summary.invalidRows,
      totalProcessed: summary.totalRows,
    },
  };
}

function settingArray(value: Json | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
}

export async function importBookingsCsvAction(
  _state: BookingImportActionState,
  formData: FormData,
): Promise<BookingImportActionState> {
  await requireRole("admin");

  const csv = String(formData.get("csv") || "");
  const fileName = String(formData.get("fileName") || "");

  if (!isBookingCsvFileName(fileName)) return failure("Upload a .csv file.");
  if (isOverBookingImportSizeLimit(csv)) {
    return failure(`CSV file cannot exceed ${Math.round(BOOKING_IMPORT_MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const supabase = await createClient();
  const [propertiesResult, bookingsResult, settingsResult] = await Promise.all([
    supabase.from("properties").select("id,name"),
    supabase.from("bookings").select("property_id,guest_name,guest_phone,check_in,check_out"),
    supabase.from("settings").select("key,value").in("key", ["booking_sources", "concierge_options"]),
  ]);

  if (propertiesResult.error || bookingsResult.error || settingsResult.error) {
    return failure("Could not prepare the booking import. Try again.");
  }

  const propertyNames = new Map((propertiesResult.data || []).map((property) => [property.id, property.name]));
  const settingsByKey = new Map((settingsResult.data || []).map((setting) => [setting.key, setting.value]));
  const validation = validateBookingImportCsv({
    bookings: (bookingsResult.data || []).map((booking) => ({
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guestName: booking.guest_name,
      guestPhone: booking.guest_phone,
      propertyId: booking.property_id,
      propertyName: propertyNames.get(booking.property_id) || "",
    })),
    csv,
    properties: propertiesResult.data || [],
    settings: {
      bookingSources: settingArray(settingsByKey.get("booking_sources")),
      conciergeOptions: settingArray(settingsByKey.get("concierge_options")),
    },
  });

  if (validation.error) return failure(validation.error);

  if (validation.summary.invalidRows > 0) {
    return failure(
      "Fix the highlighted errors in your CSV and upload it again before importing.",
      validation.rows,
      validation.summary,
    );
  }

  if (validation.inserts.length === 0) {
    return {
      message: "No rows were ready to import.",
      ok: true,
      result: {
        inserted: 0,
        rows: validation.rows,
        skippedDuplicates: validation.summary.duplicateRows,
        skippedInvalid: validation.summary.invalidRows,
        totalProcessed: validation.summary.totalRows,
      },
    };
  }

  const inserted = await supabase.from("bookings").insert(validation.inserts).select("id");
  if (inserted.error) {
    console.error("Booking CSV import failed", {
      code: inserted.error.code,
      rowsAttempted: validation.inserts.length,
    });
    return failure("Import failed. No bookings were created.", validation.rows, validation.summary);
  }

  invalidateBusinessData("bookings");

  return {
    message: `${inserted.data?.length || 0} ${inserted.data?.length === 1 ? "booking" : "bookings"} imported.`,
    ok: true,
    result: {
      inserted: inserted.data?.length || 0,
      rows: validation.rows,
      skippedDuplicates: validation.summary.duplicateRows,
      skippedInvalid: validation.summary.invalidRows,
      totalProcessed: validation.summary.totalRows,
    },
  };
}
