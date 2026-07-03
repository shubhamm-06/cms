"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const expenseNoticeMessages = {
  expense_created: "Expense created.",
  expense_updated: "Expense updated.",
  expense_deleted: "Expense deleted.",
} as const;

type ExpenseNotice = keyof typeof expenseNoticeMessages;

function isExpenseNotice(value: string | undefined): value is ExpenseNotice {
  return Boolean(value && value in expenseNoticeMessages);
}

export function ExpenseNoticeToast({ notice }: { notice?: string }) {
  useEffect(() => {
    if (!isExpenseNotice(notice)) {
      return;
    }

    toast.success(expenseNoticeMessages[notice]);

    const url = new URL(window.location.href);
    url.searchParams.delete("notice");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [notice]);

  return null;
}
