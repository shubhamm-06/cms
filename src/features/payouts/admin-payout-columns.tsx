"use client";

import { CreditCard } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markPayoutPaidAction } from "@/src/features/payouts/payout-actions";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { PayoutTableRow } from "@/src/features/payouts/payout-columns";

function payoutStatusTone(status: PayoutTableRow["status"]) {
  if (status === "paid" || status === "approved" || status === "resolved") return "green";
  if (status === "query_raised" || status === "ready_for_review") return "amber";
  return "neutral";
}

export const adminPayoutColumns: ColumnDef<PayoutTableRow>[] = [
  {
    accessorKey: "month",
    header: "Month",
  },
  {
    accessorKey: "owner_name",
    header: "Owner",
  },
  {
    accessorKey: "revenue_total",
    header: "Total revenue",
    cell: ({ row }) => formatMoney(row.original.revenue_total),
  },
  {
    accessorKey: "expense_total",
    header: "Property expenses",
    cell: ({ row }) => formatMoney(row.original.expense_total),
  },
  {
    accessorKey: "previous_carry_forward",
    header: "Carry forward",
    cell: ({ row }) => formatMoney(row.original.previous_carry_forward),
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
    cell: ({ row }) => <Badge tone={payoutStatusTone(row.original.status)}>{humanize(row.original.status)}</Badge>,
  },
  {
    accessorKey: "query_status",
    header: "Query",
    cell: ({ row }) => row.original.query_status,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        <a className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]" href={`#payout-${row.original.id}`}>
          View breakup
        </a>
        {row.original.status === "approved" || row.original.status === "resolved" ? (
          <form action={markPayoutPaidAction}>
            <input name="id" type="hidden" value={row.original.id} />
            <Button type="submit" variant="primary">
              <CreditCard className="h-4 w-4" />
              Mark paid
            </Button>
          </form>
        ) : null}
      </div>
    ),
  },
];
