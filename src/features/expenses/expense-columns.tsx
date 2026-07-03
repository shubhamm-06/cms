"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteExpenseAction } from "@/src/features/shared/actions";
import { formatDate } from "@/src/lib/utils/dates";
import { formatMoney } from "@/src/lib/utils/money";
import type { Database } from "@/types/database.types";

export type ExpenseTableRow = Database["public"]["Tables"]["expenses"]["Row"] & {
  property_name: string;
};

function ExpenseContextBadge({ expense }: { expense: ExpenseTableRow }) {
  const isCms = expense.expense_for === "cms";

  return (
    <Badge className="whitespace-nowrap" tone={isCms ? "brand" : "teal"}>
      {isCms ? "CMS" : `Property: ${expense.property_name}`}
    </Badge>
  );
}

function DeleteExpenseDialog({ expense }: { expense: ExpenseTableRow }) {
  const context = expense.expense_for === "cms" ? "CMS expense" : expense.property_name;

  return (
    <AlertDialog>
      <AlertDialogTrigger className="cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
        <Trash2 className="h-4 w-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <span className="font-semibold text-[var(--foreground)]">{expense.category}</span>
            {" "}for <span className="font-semibold text-[var(--foreground)]">{formatMoney(expense.amount)}</span>
            {" "}from <span className="font-semibold text-[var(--foreground)]">{context}</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteExpenseAction}>
            <input name="id" type="hidden" value={expense.id} />
            <AlertDialogAction className="border-red-200 bg-red-600 text-white hover:bg-red-700" type="submit">
              Delete expense
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const adminExpenseColumns: ColumnDef<ExpenseTableRow>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="min-w-40 py-1">
        <div className="font-semibold">{row.original.category}</div>
        <div className="text-xs text-[var(--muted)]">{row.original.note || "No note"}</div>
      </div>
    ),
  },
  {
    id: "expense_for",
    header: "For",
    accessorFn: (row) => `${row.expense_for} ${row.property_name}`,
    cell: ({ row }) => <ExpenseContextBadge expense={row.original} />,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => <span className="min-w-28">{row.original.vendor || "None"}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original.amount)}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex min-w-44 flex-wrap items-center gap-2 py-1">
        <Link
          aria-label={`Edit ${row.original.category} expense`}
          className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          href={`/dashboard/expenses?edit=${row.original.id}`}
          title="Edit expense"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteExpenseDialog expense={row.original} />
      </div>
    ),
  },
];

export const ownerExpenseColumns: ColumnDef<ExpenseTableRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <span className="font-semibold">{row.original.category}</span>,
  },
  {
    accessorKey: "property_name",
    header: "Property",
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => row.original.vendor || "None",
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => row.original.note || "None",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.amount),
  },
];
