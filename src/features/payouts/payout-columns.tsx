"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { Database } from "@/types/database.types";

export type PayoutTableRow = Database["public"]["Tables"]["owner_payouts"]["Row"] & {
  owner_name: string;
  property_name: string;
  previous_carry_forward: number;
  adjusted_net_profit: number;
  query_status: string;
};

function payoutStatusTone(status: PayoutTableRow["status"]) {
  if (status === "paid" || status === "approved" || status === "resolved") return "green";
  if (status === "query_raised" || status === "ready_for_review") return "amber";
  return "neutral";
}

function ownerPayoutStatusLabel(status: PayoutTableRow["status"]) {
  if (status === "paid" || status === "approved") return "Approved";
  if (status === "ready_for_review") return "Ready for Review";
  if (status === "query_raised") return "Query Raised";
  if (status === "resolved") return "Resolved";
  return humanize(status);
}

const ownerPayoutCarryForwardColumn: ColumnDef<PayoutTableRow> = {
  accessorKey: "previous_carry_forward",
  header: "Carry forward",
  cell: ({ row }) => formatMoney(row.original.previous_carry_forward),
};

const ownerPayoutColumnsBase: ColumnDef<PayoutTableRow>[] = [
  {
    accessorKey: "month",
    header: "Month",
  },
  {
    accessorKey: "revenue_total",
    header: "Revenue",
    cell: ({ row }) => formatMoney(row.original.revenue_total),
  },
  {
    accessorKey: "expense_total",
    header: "Expenses",
    cell: ({ row }) => formatMoney(row.original.expense_total),
  },
  {
    accessorKey: "adjusted_net_profit",
    header: "Adjusted net",
    cell: ({ row }) => formatMoney(row.original.adjusted_net_profit),
  },
  {
    accessorKey: "owner_share_amount",
    header: "Owner share",
    cell: ({ row }) => formatMoney(row.original.owner_share_amount),
  },
  {
    accessorKey: "cms_share_amount",
    header: "CMS share",
    cell: ({ row }) => formatMoney(row.original.cms_share_amount),
  },
  {
    accessorKey: "tds_amount",
    header: "TDS 10%",
    cell: ({ row }) => formatMoney(row.original.tds_amount),
  },
  {
    accessorKey: "final_payout_amount",
    header: "Final payout",
    cell: ({ row }) => formatMoney(row.original.final_payout_amount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge tone={payoutStatusTone(row.original.status)}>{ownerPayoutStatusLabel(row.original.status)}</Badge>,
  },
];

export function getOwnerPayoutColumns({ showCarryForward }: { showCarryForward: boolean }) {
  if (!showCarryForward) return ownerPayoutColumnsBase;

  return [
    ...ownerPayoutColumnsBase.slice(0, 3),
    ownerPayoutCarryForwardColumn,
    ...ownerPayoutColumnsBase.slice(3),
  ];
}
