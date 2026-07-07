"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const expenseNoticeMessages = {
  expense_created: "Expense created.",
  expense_updated: "Expense updated.",
  expense_deleted: "Expense deleted.",
  expense_delete_failed: "Expense could not be deleted.",
  expense_delete_not_found: "Expense was not found.",
} as const;

type ExpenseNotice = keyof typeof expenseNoticeMessages;
type ExpenseFailureNotice = Extract<ExpenseNotice, "expense_delete_failed" | "expense_delete_not_found">;

function isExpenseNotice(value: string | undefined): value is ExpenseNotice {
  return Boolean(value && value in expenseNoticeMessages);
}

function isExpenseFailureNotice(value: ExpenseNotice): value is ExpenseFailureNotice {
  return value === "expense_delete_failed" || value === "expense_delete_not_found";
}

export function ExpenseNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isExpenseNotice(notice)) {
      return;
    }

    if (isExpenseFailureNotice(notice)) {
      toast.error(expenseNoticeMessages[notice]);
    } else {
      toast.success(expenseNoticeMessages[notice]);
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
