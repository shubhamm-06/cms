"use client";

import { CreditCard } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormStatus } from "react-dom";
import {
  AlertDialog,
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
import { markPayoutPaidAction } from "@/src/features/payouts/payout-actions";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";
import type { PayoutTableRow } from "@/src/features/payouts/payout-columns";

function payoutStatusTone(status: PayoutTableRow["status"]) {
  if (status === "paid" || status === "approved" || status === "resolved") return "green";
  if (status === "query_raised" || status === "ready_for_review") return "amber";
  return "neutral";
}

function payoutStatusLabel(status: PayoutTableRow["status"]) {
  if (status === "ready_for_review") return "Ready for Review";
  if (status === "query_raised") return "Query Raised";
  return humanize(status);
}

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

function MarkPaidSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button pending={pending} type="submit" variant="primary">
      {pending ? null : <CreditCard className="h-4 w-4" />}
      {pending ? "Marking paid..." : "Confirm payment"}
    </Button>
  );
}

function MarkPaidDialog({ payout }: { payout: PayoutTableRow }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="whitespace-nowrap" type="button" variant="primary">
          <CreditCard className="h-4 w-4" />
          Mark paid
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark payout paid?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm payment for <span className="font-semibold text-[var(--foreground)]">{payout.owner_name}</span>
            {" "}statement <span className="font-semibold text-[var(--foreground)]">{payout.month}</span>
            {" "}with final payout <span className="font-semibold text-[var(--foreground)]">{formatMoney(payout.final_payout_amount)}</span>.
            This uses the existing admin-only mark-paid action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={markPayoutPaidAction}>
            <input name="id" type="hidden" value={payout.id} />
            <MarkPaidSubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function QueryCell({ payout }: { payout: PayoutTableRow }) {
  if (!payout.query_status || payout.query_status === "None") {
    return <span className="whitespace-nowrap text-sm text-[var(--muted)]">No query</span>;
  }

  const needsResolution = payout.status === "query_raised";

  return (
    <div className="min-w-[150px] space-y-1">
      <Badge className="whitespace-nowrap" tone={needsResolution ? "amber" : "teal"}>
        {needsResolution ? "Resolve first" : humanize(payout.query_status)}
      </Badge>
      {needsResolution ? <div className="text-xs leading-4 text-[var(--muted)]">Blocked from payment</div> : null}
    </div>
  );
}

export const adminPayoutColumns: ColumnDef<PayoutTableRow>[] = [
  {
    accessorKey: "month",
    header: "Month",
    cell: ({ row }) => (
      <div className="min-w-[116px] py-1">
        <div className="font-bold text-[var(--foreground)]">{row.original.month}</div>
        <div className="mt-1 text-xs text-[var(--muted)]">Statement</div>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[132px]",
      headerClassName: "min-w-[132px]",
    },
  },
  {
    accessorKey: "owner_name",
    header: "Owner",
    cell: ({ row }) => (
      <div className="min-w-[180px] py-1">
        <div className="font-semibold leading-5 text-[var(--foreground)]">{row.original.owner_name}</div>
        <a className="mt-1 inline-flex text-xs font-semibold text-[var(--brand-ink)] hover:underline" href={`#payout-${row.original.id}`}>
          View property breakup
        </a>
      </div>
    ),
    meta: {
      cellClassName: "min-w-[200px]",
      headerClassName: "min-w-[200px]",
    },
  },
  {
    accessorKey: "revenue_total",
    header: "Total revenue",
    cell: ({ row }) => <MoneyCell value={row.original.revenue_total} />,
    meta: {
      cellClassName: "min-w-[140px] text-right",
      headerClassName: "min-w-[140px] text-right",
    },
  },
  {
    accessorKey: "expense_total",
    header: "Property expenses",
    cell: ({ row }) => <MoneyCell value={row.original.expense_total} />,
    meta: {
      cellClassName: "min-w-[160px] text-right",
      headerClassName: "min-w-[160px] text-right",
    },
  },
  {
    accessorKey: "previous_carry_forward",
    header: "Carry forward",
    cell: ({ row }) => <MoneyCell value={row.original.previous_carry_forward} />,
    meta: {
      cellClassName: "min-w-[150px] text-right",
      headerClassName: "min-w-[150px] text-right",
    },
  },
  {
    accessorKey: "adjusted_net_profit",
    header: "Adjusted net",
    cell: ({ row }) => <MoneyCell value={row.original.adjusted_net_profit} />,
    meta: {
      cellClassName: "min-w-[145px] text-right",
      headerClassName: "min-w-[145px] text-right",
    },
  },
  {
    accessorKey: "owner_share_amount",
    header: "Owner share",
    cell: ({ row }) => <MoneyCell value={row.original.owner_share_amount} />,
    meta: {
      cellClassName: "min-w-[140px] text-right",
      headerClassName: "min-w-[140px] text-right",
    },
  },
  {
    accessorKey: "cms_share_amount",
    header: "CMS share",
    cell: ({ row }) => <MoneyCell value={row.original.cms_share_amount} />,
    meta: {
      cellClassName: "min-w-[130px] text-right",
      headerClassName: "min-w-[130px] text-right",
    },
  },
  {
    accessorKey: "tds_amount",
    header: "TDS 10%",
    cell: ({ row }) => <MoneyCell value={row.original.tds_amount} />,
    meta: {
      cellClassName: "min-w-[120px] text-right",
      headerClassName: "min-w-[120px] text-right",
    },
  },
  {
    accessorKey: "final_payout_amount",
    header: "Final payout",
    cell: ({ row }) => <MoneyCell strong value={row.original.final_payout_amount} />,
    meta: {
      cellClassName: "min-w-[145px] text-right",
      headerClassName: "min-w-[145px] text-right",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="whitespace-nowrap" tone={payoutStatusTone(row.original.status)}>
        {payoutStatusLabel(row.original.status)}
      </Badge>
    ),
    meta: {
      cellClassName: "min-w-[155px]",
      headerClassName: "min-w-[155px]",
    },
  },
  {
    accessorKey: "query_status",
    header: "Query",
    cell: ({ row }) => <QueryCell payout={row.original} />,
    meta: {
      cellClassName: "min-w-[170px]",
      headerClassName: "min-w-[170px]",
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    meta: {
      cellClassName: "min-w-[240px]",
      headerClassName: "min-w-[240px]",
    },
    cell: ({ row }) => (
      <div className="flex min-w-[220px] flex-wrap items-center gap-2">
        <a className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]" href={`#payout-${row.original.id}`}>
          View breakup
        </a>
        {row.original.status === "approved" || row.original.status === "resolved" ? (
          <MarkPaidDialog payout={row.original} />
        ) : row.original.status === "query_raised" ? (
          <span className="whitespace-nowrap text-xs font-semibold text-[var(--muted)]">Resolve query first</span>
        ) : row.original.status === "paid" ? (
          <span className="whitespace-nowrap text-xs font-semibold text-[var(--muted)]">Paid</span>
        ) : null}
      </div>
    ),
  },
];
