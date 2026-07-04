"use client";

import { CheckCircle2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/forms/confirm-button";
import { deleteOwnerQueryAction, resolveQueryAction } from "@/src/features/shared/actions";
import { formatDate } from "@/src/lib/utils/dates";
import type { Database } from "@/types/database.types";

export type QueryTableRow = Database["public"]["Tables"]["owner_queries"]["Row"] & {
  owner_name: string;
  property_name: string;
};

function QueryStatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <Badge className="whitespace-nowrap" tone={resolved ? "green" : "amber"}>
      {resolved ? "Resolved" : "Open"}
    </Badge>
  );
}

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
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        {!row.original.resolved ? (
          <form action={resolveQueryAction}>
            <input name="id" type="hidden" value={row.original.id} />
            <Button type="submit" variant="primary">
              <CheckCircle2 className="h-4 w-4" />
              Resolve
            </Button>
          </form>
        ) : null}
        <form action={deleteOwnerQueryAction}>
          <input name="id" type="hidden" value={row.original.id} />
          <ConfirmDeleteButton />
        </form>
      </div>
    ),
  },
];

export const ownerQueryColumns: ColumnDef<QueryTableRow>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="min-w-[300px] max-w-xl py-1">
        <div className="whitespace-normal text-sm font-medium leading-6 text-[var(--foreground)]">{row.original.message}</div>
        {row.original.payout_id ? (
          <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
            Statement query
          </div>
        ) : null}
      </div>
    ),
    meta: {
      cellClassName: "min-w-[320px]",
      headerClassName: "min-w-[320px]",
    },
  },
  {
    accessorKey: "property_name",
    header: "Property",
    cell: ({ row }) => (
      <span className="block min-w-[160px] font-medium text-[var(--foreground)]">{row.original.property_name}</span>
    ),
    meta: {
      cellClassName: "min-w-[180px]",
      headerClassName: "min-w-[180px]",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <QueryStatusBadge resolved={row.original.resolved} />,
    meta: {
      cellClassName: "min-w-[120px]",
      headerClassName: "min-w-[120px]",
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium text-[var(--foreground)]">{formatDate(row.original.created_at)}</span>
    ),
    meta: {
      cellClassName: "min-w-[140px]",
      headerClassName: "min-w-[140px]",
    },
  },
];
