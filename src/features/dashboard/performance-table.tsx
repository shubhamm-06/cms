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
      emptyMessage="No properties are available yet. Add active properties to see performance here."
      pageSize={Math.max(rows.length, 1)}
      showPagination={false}
      showSearch={false}
    />
  );
}
