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
import { deletePropertyAction } from "@/src/features/shared/actions";
import type { Database } from "@/types/database.types";

export type PropertyTableRow = Database["public"]["Tables"]["properties"]["Row"] & {
  owner_name: string;
};

function DeletePropertyDialogActions() {
  const { pending } = useFormStatus();

  return (
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
      <Button disabled={pending} type="submit" variant="danger">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Deleting…" : "Delete property"}
      </Button>
    </AlertDialogFooter>
  );
}

function DeletePropertyDialog({ property }: { property: PropertyTableRow }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label={`Delete ${property.name}`}
        className="cms-btn min-h-9 border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {property.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Deleting this property permanently removes linked bookings, property expenses, payout statements, and
            related owner queries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={deletePropertyAction}>
          <input name="id" type="hidden" value={property.id} />
          <DeletePropertyDialogActions />
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const propertyColumns: ColumnDef<PropertyTableRow>[] = [
  {
    accessorKey: "name",
    header: "Property",
    cell: ({ row }) => (
      <div className="min-w-[220px]">
        <div className="font-semibold text-[var(--foreground)]">{row.original.name}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">{row.original.city || "No city"}</div>
      </div>
    ),
  },
  {
    accessorKey: "owner_name",
    header: "Owner",
  },
  {
    accessorKey: "owner_share",
    header: "Share",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-semibold text-[var(--foreground)]">
        {row.original.owner_share}/{row.original.cms_share}
      </span>
    ),
  },
  {
    accessorKey: "bedrooms",
    header: "Bedrooms",
    cell: ({ row }) => row.original.bedrooms ?? "None",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="whitespace-nowrap capitalize" tone={row.original.status === "active" ? "green" : "neutral"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex min-w-[188px] flex-wrap items-center gap-2">
        <Link
          aria-label={`Edit ${row.original.name}`}
          className="cms-btn min-h-9 bg-white px-3 py-1.5 text-xs hover:bg-[var(--surface-2)]"
          href={`/dashboard/properties?edit=${row.original.id}`}
          title="Edit property"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <DeletePropertyDialog property={row.original} />
      </div>
    ),
  },
];
