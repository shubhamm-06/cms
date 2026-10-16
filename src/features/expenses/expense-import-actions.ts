"use server";

import { invalidateBusinessData } from "@/src/features/shared/cache-invalidation";
import { requireRole } from "@/src/features/auth/auth-guards";
import {
  EXPENSE_IMPORT_MAX_BYTES,
  isExpenseCsvFileName,
  isOverExpenseImportSizeLimit,
  validateExpenseImportCsv,
  type ExpenseImportPreviewRow,
  type ExpenseImportSummary,
} from "@/src/features/expenses/expense-import";
import { createClient } from "@/src/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type ExpenseImportActionState = {
  message?: string;
  ok: boolean;
  result?: {
    inserted: number;
    rows: ExpenseImportPreviewRow[];
    skippedDuplicates: number;
    skippedInvalid: number;
    totalProcessed: number;
  };
};

const initialSummary: ExpenseImportSummary = {
  duplicateRows: 0,
  invalidRows: 0,
  readyRows: 0,
  totalRows: 0,
};

function failure(message: string, rows: ExpenseImportPreviewRow[] = [], summary: ExpenseImportSummary = initialSummary): ExpenseImportActionState {
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

export async function importExpensesCsvAction(
  _state: ExpenseImportActionState,
  formData: FormData,
): Promise<ExpenseImportActionState> {
  await requireRole("admin");

  const csv = String(formData.get("csv") || "");
  const fileName = String(formData.get("fileName") || "");

  if (!isExpenseCsvFileName(fileName)) return failure("Upload a .csv file.");
  if (isOverExpenseImportSizeLimit(csv)) {
    return failure(`CSV file cannot exceed ${Math.round(EXPENSE_IMPORT_MAX_BYTES / 1024 / 1024)} MB.`);
  }

  const supabase = await createClient();
  const [propertiesResult, expensesResult, settingsResult] = await Promise.all([
    supabase.from("properties").select("id,name"),
    supabase.from("expenses").select("date,expense_for,property_id,category,amount,note"),
    supabase.from("settings").select("key,value").eq("key", "expense_categories"),
  ]);

  if (propertiesResult.error || expensesResult.error || settingsResult.error) {
    return failure("Could not prepare the expense import. Try again.");
  }

  const propertyNames = new Map((propertiesResult.data || []).map((property) => [property.id, property.name]));
  const settingsByKey = new Map((settingsResult.data || []).map((setting) => [setting.key, setting.value]));
  const validation = validateExpenseImportCsv({
    csv,
    expenses: (expensesResult.data || []).map((expense) => ({
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      expenseFor: expense.expense_for,
      note: expense.note,
      propertyId: expense.property_id,
      propertyName: expense.property_id ? propertyNames.get(expense.property_id) || "" : "CMS",
    })),
    properties: propertiesResult.data || [],
    settings: {
      expenseCategories: settingArray(settingsByKey.get("expense_categories")),
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

  const inserted = await supabase.from("expenses").insert(validation.inserts).select("id");
  if (inserted.error) {
    console.error("Expense CSV import failed", {
      code: inserted.error.code,
      rowsAttempted: validation.inserts.length,
    });
    return failure("Import failed. No expenses were created.", validation.rows, validation.summary);
  }

  invalidateBusinessData("expenses");

  return {
    message: `${inserted.data?.length || 0} ${inserted.data?.length === 1 ? "expense" : "expenses"} imported.`,
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
