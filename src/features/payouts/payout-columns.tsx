"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveOwnerPayoutAction,
  raisePayoutQueryAction,
} from "@/src/features/payouts/payout-actions";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { Database } from "@/types/database.types";

export type PayoutTableRow = Database["public"]["Tables"]["owner_payouts"]["Row"] & {
  owner_name: string;
  property_name: string;
  previous_carry_forward: number;
  adjusted_net_profit: number;
  query_status: string;
  can_review?: boolean;
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

export const ownerPayoutColumns: ColumnDef<PayoutTableRow>[] = [
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
    header: "Property expenses",
    cell: ({ row }) => formatMoney(row.original.expense_total),
  },
  {
    accessorKey: "net_profit",
    header: "Net profit",
    cell: ({ row }) => formatMoney(row.original.net_profit),
  },
  {
    accessorKey: "tds_amount",
    header: "TDS",
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
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      if (!row.original.can_review) {
        return <span className="text-sm text-[var(--muted)]">-</span>;
      }

      return (
        <div className="flex min-w-[260px] flex-wrap items-start gap-2">
          <form action={approveOwnerPayoutAction}>
            <input name="id" type="hidden" value={row.original.id} />
            <Button type="submit" variant="primary">
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          </form>

          <details>
            <summary className="cms-btn cursor-pointer list-none bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]">
              <HelpCircle className="h-4 w-4" />
              Raise query
            </summary>
            <form
              action={raisePayoutQueryAction}
              className="mt-2 grid w-[280px] gap-2 rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm"
            >
              <input name="id" type="hidden" value={row.original.id} />
              <Textarea
                aria-label="Payout query"
                name="message"
                placeholder="Describe what needs review."
                required
              />
              <Button type="submit" variant="secondary">
                Submit query
              </Button>
            </form>
          </details>
        </div>
      );
    },
  },
];
