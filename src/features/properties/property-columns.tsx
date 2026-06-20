"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ConfirmDeleteButton } from "@/components/forms/confirm-button";
import { Badge } from "@/components/ui/badge";
import { deletePropertyAction } from "@/src/features/shared/actions";
import type { Database } from "@/types/database.types";

export type PropertyTableRow = Database["public"]["Tables"]["properties"]["Row"] & {
  owner_name: string;
};

export const propertyColumns: ColumnDef<PropertyTableRow>[] = [
  {
    accessorKey: "name",
    header: "Property",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.name}</div>
        <div className="text-xs text-[var(--muted)]">{row.original.city || "No city"}</div>
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
    cell: ({ row }) => `${row.original.owner_share}/${row.original.cms_share}`,
  },
  {
    accessorKey: "bedrooms",
    header: "Bedrooms",
    cell: ({ row }) => row.original.bedrooms ?? "None",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge tone={row.original.status === "active" ? "green" : "neutral"}>{row.original.status}</Badge>,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <form action={deletePropertyAction}>
        <input name="id" type="hidden" value={row.original.id} />
        <ConfirmDeleteButton />
      </form>
    ),
  },
];
