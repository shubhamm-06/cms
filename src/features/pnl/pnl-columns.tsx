"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatMoney } from "@/src/lib/utils/money";

export type PnlTableRow = {
  cms_share: number;
  expenses: number;
  net_profit: number;
  owner_share: number;
  property_name: string;
  revenue: number;
};

function MoneyCell({ value, strong = false }: { strong?: boolean; value: number }) {
  const isNegative = value < 0;

  return (
    <span
      className={`block whitespace-nowrap text-right tabular-nums ${
        strong ? "font-bold text-[var(--foreground)]" : isNegative ? "font-semibold text-red-700" : "text-[var(--foreground)]"
      }`}
    >
      {formatMoney(value)}
    </span>
  );
}

export const pnlColumns: ColumnDef<PnlTableRow>[] = [
  {
    accessorKey: "property_name",
    header: "Property",
    cell: ({ row }) => (
      <div className="min-w-[220px] py-1">
        <div className="font-semibold leading-5 text-[var(--foreground)]">{row.original.property_name}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">Property P&L</div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => <MoneyCell value={row.original.revenue} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
  {
    accessorKey: "expenses",
    header: "Expenses",
    cell: ({ row }) => <MoneyCell value={row.original.expenses} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
  {
    accessorKey: "net_profit",
    header: "Net profit",
    cell: ({ row }) => <MoneyCell strong value={row.original.net_profit} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
  {
    accessorKey: "owner_share",
    header: "Owner share",
    cell: ({ row }) => <MoneyCell value={row.original.owner_share} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
  {
    accessorKey: "cms_share",
    header: "CMS share",
    cell: ({ row }) => <MoneyCell value={row.original.cms_share} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
];
