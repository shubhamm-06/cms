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

export const pnlColumns: ColumnDef<PnlTableRow>[] = [
  {
    accessorKey: "property_name",
    header: "Property",
    cell: ({ row }) => <span className="font-semibold">{row.original.property_name}</span>,
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => formatMoney(row.original.revenue),
  },
  {
    accessorKey: "expenses",
    header: "Expenses",
    cell: ({ row }) => formatMoney(row.original.expenses),
  },
  {
    accessorKey: "net_profit",
    header: "Net profit",
    cell: ({ row }) => formatMoney(row.original.net_profit),
  },
  {
    accessorKey: "owner_share",
    header: "Owner share",
    cell: ({ row }) => formatMoney(row.original.owner_share),
  },
  {
    accessorKey: "cms_share",
    header: "CMS share",
    cell: ({ row }) => formatMoney(row.original.cms_share),
  },
];
