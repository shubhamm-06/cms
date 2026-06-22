"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/forms/confirm-button";
import { Badge } from "@/components/ui/badge";
import { deleteExpenseAction } from "@/src/features/shared/actions";
import { formatDate } from "@/src/lib/utils/dates";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { Database } from "@/types/database.types";

export type ExpenseTableRow = Database["public"]["Tables"]["expenses"]["Row"] & {
  property_name: string;
};

export const adminExpenseColumns: ColumnDef<ExpenseTableRow>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <span className="font-semibold">{row.original.category}</span>,
  },
  {
    id: "expense_for",
    header: "For",
    accessorFn: (row) => `${row.expense_for} ${row.property_name}`,
    cell: ({ row }) => (
      <Badge tone={row.original.expense_for === "cms" ? "brand" : "teal"}>
        {humanize(row.original.expense_for)}: {row.original.property_name}
      </Badge>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ row }) => row.original.vendor || "None",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.amount),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <Link
          aria-label={`Edit ${row.original.category} expense`}
          className="cms-btn bg-white hover:bg-[var(--surface-2)]"
          href={`/dashboard/expenses?edit=${row.original.id}`}
          title="Edit expense"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <form action={deleteExpenseAction}>
          <input name="id" type="hidden" value={row.original.id} />
          <ConfirmDeleteButton />
        </form>
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
