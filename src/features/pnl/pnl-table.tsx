"use client";

import { DataTable } from "@/components/ui/data-table";
import { pnlColumns, type PnlTableRow } from "@/src/features/pnl/pnl-columns";

export function PnlTable({ rows }: { rows: PnlTableRow[] }) {
  return (
    <DataTable
      columns={pnlColumns}
      data={rows}
      embedded
      emptyMessage="No P&L rows found."
      searchPlaceholder="Search properties..."
    />
  );
}
