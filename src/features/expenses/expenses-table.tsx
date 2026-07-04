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
      showSearch={false}
    />
  );
}

export function OwnerExpensesTable({ expenses }: { expenses: ExpenseTableRow[] }) {
  return (
    <DataTable
      columns={ownerExpenseColumns}
      data={expenses}
      embedded
      emptyMessage="No property expenses are available yet. Once property-related expenses are recorded, they will appear here for review."
      searchPlaceholder="Search property expenses..."
    />
  );
}
