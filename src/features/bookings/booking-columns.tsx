"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/forms/confirm-button";
import { Badge } from "@/components/ui/badge";
import { deleteBookingAction } from "@/src/features/shared/actions";
import { getBookingStatus } from "@/src/features/bookings/booking-calculations";
import { formatDate } from "@/src/lib/utils/dates";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { Database } from "@/types/database.types";

export type BookingTableRow = Database["public"]["Tables"]["bookings"]["Row"] & {
  property_name: string;
};

function displayStatus(row: BookingTableRow) {
  return getBookingStatus(row.check_in, row.check_out, row.status === "cancelled" || row.status === "blocked" ? row.status : null);
}

export const adminBookingColumns: ColumnDef<BookingTableRow>[] = [
  {
    accessorKey: "guest_name",
    header: "Guest",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.guest_name}</div>
        <div className="text-xs text-[var(--muted)]">{row.original.guest_phone || "No phone"}</div>
      </div>
    ),
  },
  {
    accessorKey: "property_name",
    header: "Property",
  },
  {
    id: "dates",
    header: "Dates",
    accessorFn: (row) => `${row.check_in} ${row.check_out}`,
    cell: ({ row }) => `${formatDate(row.original.check_in)} to ${formatDate(row.original.check_out)}`,
  },
  {
    id: "status",
    accessorFn: displayStatus,
    header: "Status",
    cell: ({ row }) => <Badge>{humanize(displayStatus(row.original))}</Badge>,
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.total_amount),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <Link className="cms-btn bg-white hover:bg-[var(--surface-2)]" href={`/dashboard/bookings?edit=${row.original.id}`}>
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <form action={deleteBookingAction}>
          <input name="id" type="hidden" value={row.original.id} />
          <ConfirmDeleteButton />
        </form>
      </div>
    ),
  },
];

export const ownerBookingColumns: ColumnDef<BookingTableRow>[] = [
  {
    accessorKey: "guest_name",
    header: "Guest",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.guest_name}</div>
        <div className="text-xs text-[var(--muted)]">{row.original.property_name}</div>
      </div>
    ),
  },
  {
    accessorKey: "guest_phone",
    header: "Phone",
    cell: ({ row }) => row.original.guest_phone || "None",
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => row.original.source || "None",
  },
  {
    id: "dates",
    header: "Dates",
    accessorFn: (row) => `${row.check_in} ${row.check_out}`,
    cell: ({ row }) => `${formatDate(row.original.check_in)} to ${formatDate(row.original.check_out)}`,
  },
  {
    accessorKey: "guests",
    header: "Guests",
    cell: ({ row }) => row.original.guests ?? "None",
  },
  {
    id: "status",
    accessorFn: displayStatus,
    header: "Status",
    cell: ({ row }) => <Badge>{humanize(displayStatus(row.original))}</Badge>,
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => formatMoney(row.original.total_amount),
  },
];
