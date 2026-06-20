"use client";

import { DataTable } from "@/components/ui/data-table";
import {
  adminExpenseColumns,
  ownerExpenseColumns,
  type ExpenseTableRow,
} from "@/src/features/expenses/expense-columns";

export function AdminExpensesTable({ expenses }: { expenses: ExpenseTableRow[] }) {
  return (
    <DataTable
      columns={adminExpenseColumns}
      data={expenses}
      embedded
      emptyMessage="No expenses found."
      searchPlaceholder="Search expenses..."
    />
  );
}

export function OwnerExpensesTable({ expenses }: { expenses: ExpenseTableRow[] }) {
  return (
    <DataTable
      columns={ownerExpenseColumns}
      data={expenses}
      embedded
      emptyMessage="No expenses found."
      searchPlaceholder="Search expenses..."
    />
  );
}
