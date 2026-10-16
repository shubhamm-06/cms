"use server";

import { invalidateBusinessData } from "@/src/features/shared/cache-invalidation";
import { requireRole } from "@/src/features/auth/auth-guards";
import {
  isCsvFileName,
  isOverImportSizeLimit,
  PROPERTY_IMPORT_MAX_BYTES,
  validatePropertyImportCsv,
  type PropertyImportPreviewRow,
  type PropertyImportSummary,
} from "@/src/features/properties/property-import";
import { createClient } from "@/src/lib/supabase/server";

export type PropertyImportActionState = {
  message?: string;
  ok: boolean;
  result?: {
    inserted: number;
    rows: PropertyImportPreviewRow[];
    skippedDuplicates: number;
    skippedInvalid: number;
    totalProcessed: number;
  };
};

const initialSummary: PropertyImportSummary = {
  duplicateRows: 0,
  invalidRows: 0,
  readyRows: 0,
  totalRows: 0,
};

function existingSlugs(properties: Array<{ slug: string | null }> | null) {
  return (properties || []).flatMap((property) => (property.slug ? [property.slug] : []));
}

function isSlugConflict(error: { code?: string; details?: string; message?: string }) {
  return error.code === "23505" && `${error.message || ""} ${error.details || ""}`.toLowerCase().includes("slug");
}

function failure(message: string, rows: PropertyImportPreviewRow[] = [], summary: PropertyImportSummary = initialSummary): PropertyImportActionState {
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

export async function importPropertiesCsvAction(
  _state: PropertyImportActionState,
  formData: FormData,
): Promise<PropertyImportActionState> {
  await requireRole("admin");

  const csv = String(formData.get("csv") || "");
  const fileName = String(formData.get("fileName") || "");

  if (!isCsvFileName(fileName)) return failure("Upload a .csv file.");
  if (isOverImportSizeLimit(csv)) {
    return failure(`CSV file cannot exceed ${Math.round(PROPERTY_IMPORT_MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const supabase = await createClient();
  const [profilesResult, propertiesResult] = await Promise.all([
    supabase.from("profiles").select("id,email,role,status"),
    supabase.from("properties").select("name,slug"),
  ]);

  if (profilesResult.error || propertiesResult.error) return failure("Could not prepare the import. Try again.");

  const validation = validatePropertyImportCsv({
    csv,
    existingPropertyNames: (propertiesResult.data || []).map((property) => property.name),
    existingPropertySlugs: existingSlugs(propertiesResult.data),
    owners: profilesResult.data || [],
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

  const inserted = await supabase.from("properties").insert(validation.inserts).select("id");
  if (inserted.error) {
    console.error("Property CSV import failed", {
      code: inserted.error.code,
      rowsAttempted: validation.inserts.length,
    });

    if (isSlugConflict(inserted.error)) {
      // A slug was taken after validation (for example by a concurrent save). The batch insert is atomic, so
      // nothing was created. Re-validate against fresh data so the offending row shows its own message.
      const latest = await supabase.from("properties").select("name,slug");
      if (!latest.error) {
        const revalidated = validatePropertyImportCsv({
          csv,
          existingPropertyNames: (latest.data || []).map((property) => property.name),
          existingPropertySlugs: existingSlugs(latest.data),
          owners: profilesResult.data || [],
        });
        if (!revalidated.error && revalidated.summary.invalidRows > 0) {
          return failure(
            "A slug was taken while importing. No properties were created. Fix the highlighted rows and upload the CSV again.",
            revalidated.rows,
            revalidated.summary,
          );
        }
      }
      return failure(
        "A slug in this CSV is already used by another property. No properties were created. Check the slug values and try again.",
        validation.rows,
        validation.summary,
      );
    }

    return failure("Import failed. No properties were created.", validation.rows, validation.summary);
  }

  invalidateBusinessData("properties");

  return {
    message: `${inserted.data?.length || 0} ${inserted.data?.length === 1 ? "property" : "properties"} imported.`,
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
