"use client";

import { DataTable } from "@/components/ui/data-table";
import {
  propertyPerformanceColumns,
  type PropertyPerformanceRow,
} from "@/src/features/dashboard/performance-columns";

export function PropertyPerformanceTable({ rows }: { rows: PropertyPerformanceRow[] }) {
  return (
    <DataTable
      columns={propertyPerformanceColumns}
      data={rows}
      embedded
      emptyMessage="No property performance rows found."
      pageSize={Math.max(rows.length, 1)}
      showPagination={false}
      showSearch={false}
    />
  );
}
