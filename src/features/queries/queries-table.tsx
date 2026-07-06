"use client";

import { DataTable } from "@/components/ui/data-table";
import { adminQueryColumns, ownerQueryColumns, type QueryTableRow } from "@/src/features/queries/query-columns";

export function AdminQueriesTable({ queries }: { queries: QueryTableRow[] }) {
  return (
    <DataTable
      columns={adminQueryColumns}
      data={queries}
      embedded
      emptyMessage="No owner queries are waiting here yet. New owner questions and statement queries will appear in this inbox."
      showSearch={false}
    />
  );
}

export function OwnerQueriesTable({ queries }: { queries: QueryTableRow[] }) {
  return (
    <DataTable
      columns={ownerQueryColumns}
      data={queries}
      embedded
      emptyMessage="No queries yet. Send your first question and it will appear here for tracking."
      searchPlaceholder="Search queries..."
    />
  );
}
