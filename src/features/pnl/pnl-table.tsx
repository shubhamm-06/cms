"use client";

import { DataTable } from "@/components/ui/data-table";
import { pnlColumns, type PnlTableRow } from "@/src/features/pnl/pnl-columns";

export function PnlTable({ rows }: { rows: PnlTableRow[] }) {
  return (
    <DataTable
      columns={pnlColumns}
      data={rows}
      embedded
      emptyMessage="No property P&L records are available yet. Add properties, bookings, and property expenses to populate this report."
      searchPlaceholder="Search properties..."
    />
  );
}
