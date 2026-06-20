"use client";

import { CheckCircle2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveQueryAction } from "@/src/features/shared/actions";
import { formatDate } from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

export type QueryTableRow = Database["public"]["Tables"]["owner_queries"]["Row"] & {
  owner_name: string;
  property_name: string;
};

export const adminQueryColumns: ColumnDef<QueryTableRow>[] = [
  {
    accessorKey: "owner_name",
    header: "Owner",
  },
  {
    accessorKey: "property_name",
    header: "Property",
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => <span className="block max-w-xl whitespace-normal">{row.original.message}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge tone={row.original.resolved ? "green" : "amber"}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.resolved ? null : (
        <form action={resolveQueryAction}>
          <input name="id" type="hidden" value={row.original.id} />
          <Button type="submit" variant="primary">
            <CheckCircle2 className="h-4 w-4" />
            Resolve
          </Button>
        </form>
      ),
  },
];

export const ownerQueryColumns: ColumnDef<QueryTableRow>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => <span className="block max-w-xl whitespace-normal">{row.original.message}</span>,
  },
  {
    accessorKey: "property_name",
    header: "Property",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge tone={row.original.resolved ? "green" : "amber"}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];
