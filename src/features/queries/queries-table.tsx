"use client";

import { DataTable } from "@/components/ui/data-table";
import { adminQueryColumns, ownerQueryColumns, type QueryTableRow } from "@/src/features/queries/query-columns";

export function AdminQueriesTable({ queries }: { queries: QueryTableRow[] }) {
  return (
    <DataTable
      columns={adminQueryColumns}
      data={queries}
      embedded
      emptyMessage="No queries found."
      searchPlaceholder="Search queries..."
    />
  );
}

export function OwnerQueriesTable({ queries }: { queries: QueryTableRow[] }) {
  return (
    <DataTable
      columns={ownerQueryColumns}
      data={queries}
      embedded
      emptyMessage="No queries found."
      searchPlaceholder="Search queries..."
    />
  );
}
