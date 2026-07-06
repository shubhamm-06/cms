"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
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

function QueryContextBadge({ linked }: { linked: boolean }) {
  return (
    <Badge className="whitespace-nowrap" tone={linked ? "teal" : "neutral"}>
      {linked ? "Statement query" : "General query"}
    </Badge>
  );
}

function ResolveButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="whitespace-nowrap" pending={pending} type="submit" variant="primary">
      {pending ? null : <CheckCircle2 className="h-4 w-4" />}
      {pending ? "Resolving..." : "Resolve"}
    </Button>
  );
}

function DeleteQueryButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="whitespace-nowrap" pending={pending} type="submit" variant="destructive">
      {pending ? null : <Trash2 className="h-4 w-4" />}
      {pending ? "Deleting..." : "Delete query"}
    </Button>
  );
}

function DeleteQueryDialog({ query }: { query: QueryTableRow }) {
  const preview = query.message.length > 140 ? `${query.message.slice(0, 140)}...` : query.message;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="whitespace-nowrap" type="button" variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this query?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p>
                This will delete the query from{" "}
                <span className="font-semibold text-[var(--foreground)]">{query.owner_name}</span>
                {query.property_name && query.property_name !== "None" ? (
                  <>
                    {" "}for <span className="font-semibold text-[var(--foreground)]">{query.property_name}</span>
                  </>
                ) : null}
                .
              </p>
              <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)]">
                {preview}
              </p>
              {query.payout_id ? (
                <p className="font-medium text-[var(--brand-ink)]">
                  This is linked to a payout statement. Deleting it uses the existing restoration rule for the linked payout state.
                </p>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteOwnerQueryAction}>
            <input name="id" type="hidden" value={query.id} />
            <DeleteQueryButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const adminQueryColumns: ColumnDef<QueryTableRow>[] = [
  {
    accessorKey: "owner_name",
    header: "Owner",
    cell: ({ row }) => (
      <div className="min-w-[180px] py-1">
        <div className="font-semibold leading-5 text-[var(--foreground)]">{row.original.owner_name}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {row.original.property_name && row.original.property_name !== "None" ? row.original.property_name : "No property linked"}
        </div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[210px]",
      headerClassName: "min-w-[210px]",
    },
  },
  {
    accessorKey: "property_name",
    header: "Context",
    cell: ({ row }) => (
      <div className="min-w-[150px] space-y-2 py-1">
        <QueryContextBadge linked={Boolean(row.original.payout_id)} />
        <div className="text-xs leading-4 text-[var(--muted)]">
          {row.original.payout_id ? "Linked payout statement" : "General owner support"}
        </div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[170px]",
      headerClassName: "min-w-[170px]",
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="min-w-[320px] max-w-xl py-1">
        <div className="whitespace-normal text-sm font-medium leading-6 text-[var(--foreground)]">
          {row.original.message}
        </div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[360px]",
      headerClassName: "min-w-[360px]",
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
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
    cell: ({ row }) => (
      <div className="flex min-w-[220px] flex-wrap items-center gap-2">
        {!row.original.resolved ? (
          <form action={resolveQueryAction}>
            <input name="id" type="hidden" value={row.original.id} />
            <ResolveButton />
          </form>
        ) : (
          <span className="whitespace-nowrap text-xs font-semibold text-[var(--muted)]">Already resolved</span>
        )}
        <DeleteQueryDialog query={row.original} />
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
