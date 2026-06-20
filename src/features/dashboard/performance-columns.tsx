"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatMoney } from "@/src/lib/utils/money";

export type PropertyPerformanceRow = {
  accent: string;
  bedrooms: number | null;
  city: string | null;
  expense: number;
  id: string;
  initials: string;
  name: string;
  occupancy: number;
  owner_name: string;
  profit: number;
  revenue: number;
};

function shortMoney(value: number | null | undefined) {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `Rs ${(amount / 1000).toFixed(1)}k`;
  return formatMoney(amount);
}

export const propertyPerformanceColumns: ColumnDef<PropertyPerformanceRow>[] = [
  {
    accessorKey: "name",
    header: "Property",
    cell: ({ row }) => {
      const property = row.original;

      return (
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-[30px] w-[30px] place-items-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: property.accent }}
          >
            {property.initials}
          </div>
          <div>
            <div className="text-[13px] font-bold">{property.name}</div>
            <div className="text-xs text-[var(--muted)]">
              {property.bedrooms ? `${property.bedrooms} BHK - ` : ""}
              {property.city || "Property"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "owner_name",
    header: "Owner",
    cell: ({ row }) => <span className="text-[13px]">{row.original.owner_name}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <div className="text-right font-semibold">{shortMoney(row.original.revenue)}</div>,
  },
  {
    accessorKey: "expense",
    header: "Expense",
    cell: ({ row }) => <div className="text-right">{shortMoney(row.original.expense)}</div>,
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => (
      <div className={`text-right font-bold ${row.original.profit >= 0 ? "text-[var(--green)]" : "text-[var(--brand)]"}`}>
        {shortMoney(row.original.profit)}
      </div>
    ),
  },
  {
    accessorKey: "occupancy",
    header: "Occupancy",
    cell: ({ row }) => {
      const property = row.original;

      return (
        <div className="flex min-w-[120px] items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full" style={{ background: property.accent, width: `${property.occupancy}%` }} />
          </div>
          <span className="w-8 text-xs font-bold">{property.occupancy}%</span>
        </div>
      );
    },
  },
];
