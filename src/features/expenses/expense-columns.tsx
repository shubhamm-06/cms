"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function DeleteExpenseDialogActions() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
      <Button className="border-red-200 bg-red-600 text-white hover:bg-red-700" disabled={pending} type="submit">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Deleting…" : "Delete expense"}
      </Button>
    </AlertDialogFooter>
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
        <form action={deleteExpenseAction}>
          <input name="id" type="hidden" value={expense.id} />
          <DeleteExpenseDialogActions />
        </form>
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
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium text-[var(--foreground)]">
        {formatDate(row.original.date)}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[140px]",
      headerClassName: "min-w-[140px]",
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="min-w-[220px] py-1">
        <div className="font-semibold leading-5 text-[var(--foreground)]">{row.original.category}</div>
        <div className="mt-1 text-xs font-medium leading-4 text-[#6a655f]">Property expense</div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
  },
  {
    accessorKey: "property_name",
    header: "Property",
    cell: ({ row }) => (
      <Badge className="whitespace-nowrap" tone="teal">
        {row.original.property_name}
      </Badge>
    ),
    meta: {
      cellClassName: "min-w-[180px]",
      headerClassName: "min-w-[180px]",
    },
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => (
      <span className="block min-w-[150px] font-medium text-[var(--foreground)]">
        {row.original.vendor || "None"}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[170px]",
      headerClassName: "min-w-[170px]",
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="block max-w-[320px] whitespace-normal leading-5 text-[#5f5b55]">
        {row.original.note || "No note added"}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[260px]",
      headerClassName: "min-w-[260px]",
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="block whitespace-nowrap text-right font-bold tabular-nums text-[var(--foreground)]">
        {formatMoney(row.original.amount)}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[140px] text-right",
      headerClassName: "min-w-[140px] text-right",
    },
  },
];
