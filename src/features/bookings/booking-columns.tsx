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

type BookingStatusTone = "neutral" | "green" | "teal" | "destructive";

function bookingStatusTone(status: string): BookingStatusTone {
  if (status === "in_house") return "green";
  if (status === "upcoming") return "teal";
  if (status === "cancelled" || status === "blocked") return "destructive";
  return "neutral";
}

function BookingStatusBadge({ status }: { status: string }) {
  return (
    <Badge className="whitespace-nowrap" tone={bookingStatusTone(status)}>
      {humanize(status)}
    </Badge>
  );
}

function nightsLabel(nights: number | null) {
  if (!nights) return "Stay duration not set";
  return `${nights} ${nights === 1 ? "night" : "nights"}`;
}

function DeleteBookingDialogActions() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending} type="button">
        Cancel
      </AlertDialogCancel>
      <Button className="border-red-200 bg-red-600 text-white hover:bg-red-700" disabled={pending} type="submit">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Deleting..." : "Delete booking"}
      </Button>
    </AlertDialogFooter>
  );
}

function DeleteBookingDialog({ booking }: { booking: BookingTableRow }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="cms-btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100" type="button">
        <Trash2 className="h-4 w-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the booking for <span className="font-semibold text-[var(--foreground)]">{booking.guest_name}</span>
            {" "}at <span className="font-semibold text-[var(--foreground)]">{booking.property_name}</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={deleteBookingAction}>
          <input name="id" type="hidden" value={booking.id} />
          <DeleteBookingDialogActions />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const adminBookingColumns: ColumnDef<BookingTableRow>[] = [
  {
    accessorKey: "guest_name",
    header: "Guest",
    cell: ({ row }) => (
      <div className="min-w-40 py-1">
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
    cell: ({ row }) => (
      <div className="min-w-40 text-sm">
        <span>{formatDate(row.original.check_in)}</span>
        <span className="mx-2 text-[var(--muted)]">to</span>
        <span>{formatDate(row.original.check_out)}</span>
      </div>
    ),
  },
  {
    id: "status",
    accessorFn: displayStatus,
    header: "Status",
    cell: ({ row }) => <BookingStatusBadge status={displayStatus(row.original)} />,
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
      <div className="flex min-w-44 flex-wrap items-center gap-2 py-1">
        <Link
          aria-label={`Edit booking for ${row.original.guest_name}`}
          className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]"
          href={`/dashboard/bookings?edit=${row.original.id}`}
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeleteBookingDialog booking={row.original} />
      </div>
    ),
  },
];

export const ownerBookingColumns: ColumnDef<BookingTableRow>[] = [
  {
    accessorKey: "guest_name",
    header: "Guest",
    cell: ({ row }) => (
      <div className="min-w-[220px] py-1">
        <div className="font-semibold leading-5 text-[var(--foreground)]">{row.original.guest_name}</div>
        <div className="mt-1 text-xs font-medium leading-4 text-[#6a655f]">{row.original.property_name}</div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
  },
  {
    accessorKey: "guest_phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-medium text-[var(--foreground)]">
        {row.original.guest_phone || "None"}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[140px]",
      headerClassName: "min-w-[140px]",
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge className="whitespace-nowrap" tone="neutral">
        {row.original.source || "None"}
      </Badge>
    ),
    meta: {
      cellClassName: "min-w-[130px]",
      headerClassName: "min-w-[130px]",
    },
  },
  {
    id: "dates",
    header: "Dates",
    accessorFn: (row) => `${row.check_in} ${row.check_out}`,
    cell: ({ row }) => (
      <div className="min-w-[220px] py-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-[var(--foreground)]">
          <span className="whitespace-nowrap">{formatDate(row.original.check_in)}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">to</span>
          <span className="whitespace-nowrap">{formatDate(row.original.check_out)}</span>
        </div>
        <div className="mt-1 text-xs font-medium text-[#6a655f]">{nightsLabel(row.original.nights)}</div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
  },
  {
    accessorKey: "guests",
    header: "Guests",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm font-semibold text-[var(--foreground)]">
        {row.original.guests ? `${row.original.guests} ${row.original.guests === 1 ? "guest" : "guests"}` : "None"}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[110px]",
      headerClassName: "min-w-[110px]",
    },
  },
  {
    id: "status",
    accessorFn: displayStatus,
    header: "Status",
    cell: ({ row }) => <BookingStatusBadge status={displayStatus(row.original)} />,
    meta: {
      cellClassName: "min-w-[140px]",
      headerClassName: "min-w-[140px]",
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => (
      <span className="block whitespace-nowrap text-right font-bold tabular-nums text-[var(--foreground)]">
        {formatMoney(row.original.total_amount)}
      </span>
    ),
    meta: {
      cellClassName: "min-w-[130px] text-right",
      headerClassName: "min-w-[130px] text-right",
    },
  },
];
