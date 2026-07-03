"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, HelpCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

function MoneyCell({ value, strong = false }: { strong?: boolean; value: number }) {
  return (
    <span className={`block whitespace-nowrap text-right tabular-nums ${strong ? "font-bold text-[var(--foreground)]" : ""}`}>
      {formatMoney(value)}
    </span>
  );
}

export const ownerPayoutColumns: ColumnDef<PayoutTableRow>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => <span className="block whitespace-nowrap font-semibold text-[var(--foreground)]">{row.original.month}</span>,
    meta: {
      cellClassName: "w-[112px] min-w-[112px]",
      headerClassName: "w-[112px] min-w-[112px]",
    },
  },
  {
    accessorKey: "revenue_total",
    header: "Revenue",
    cell: ({ row }) => <MoneyCell value={row.original.revenue_total} />,
    meta: {
      cellClassName: "w-[128px] min-w-[128px]",
      headerClassName: "w-[128px] min-w-[128px] text-right",
    },
  },
  {
    accessorKey: "expense_total",
    header: "Property expenses",
    cell: ({ row }) => <MoneyCell value={row.original.expense_total} />,
    meta: {
      cellClassName: "w-[156px] min-w-[156px]",
      headerClassName: "w-[156px] min-w-[156px] text-right",
    },
  },
  {
    accessorKey: "net_profit",
    header: "Net profit",
    cell: ({ row }) => <MoneyCell value={row.original.net_profit} />,
    meta: {
      cellClassName: "w-[132px] min-w-[132px]",
      headerClassName: "w-[132px] min-w-[132px] text-right",
    },
  },
  {
    accessorKey: "tds_amount",
    header: "TDS",
    cell: ({ row }) => <MoneyCell value={row.original.tds_amount} />,
    meta: {
      cellClassName: "w-[112px] min-w-[112px]",
      headerClassName: "w-[112px] min-w-[112px] text-right",
    },
  },
  {
    accessorKey: "final_payout_amount",
    header: "Final payout",
    cell: ({ row }) => <MoneyCell strong value={row.original.final_payout_amount} />,
    meta: {
      cellClassName: "w-[136px] min-w-[136px]",
      headerClassName: "w-[136px] min-w-[136px] text-right",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="whitespace-nowrap" tone={payoutStatusTone(row.original.status)}>
        {ownerPayoutStatusLabel(row.original.status)}
      </Badge>
    ),
    meta: {
      cellClassName: "w-[150px] min-w-[150px]",
      headerClassName: "w-[150px] min-w-[150px]",
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    meta: {
      cellClassName: "w-[300px] min-w-[300px]",
      headerClassName: "w-[300px] min-w-[300px]",
    },
    cell: ({ row }) => {
      if (!row.original.can_review) {
        return <span className="whitespace-nowrap text-sm text-[var(--muted)]">No action needed</span>;
      }

      return (
        <div className="flex min-w-[280px] flex-wrap items-start gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="whitespace-nowrap" type="button" variant="primary">
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve {row.original.month} payout?</AlertDialogTitle>
                <AlertDialogDescription>
                  This confirms you have reviewed the statement for {row.original.month}. The existing owner payout rules and admin payment workflow remain unchanged.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form action={approveOwnerPayoutAction}>
                  <input name="id" type="hidden" value={row.original.id} />
                  <AlertDialogAction type="submit">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve statement
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <details>
            <summary className="cms-btn cursor-pointer list-none whitespace-nowrap bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]">
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
