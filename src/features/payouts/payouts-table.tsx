"use client";

import { DataTable } from "@/components/ui/data-table";
import { ownerPayoutColumns, type PayoutTableRow } from "@/src/features/payouts/payout-columns";

export function OwnerPayoutsTable({ payouts }: { payouts: PayoutTableRow[] }) {
  return (
    <DataTable
      columns={ownerPayoutColumns}
      data={payouts}
      embedded
      emptyMessage="No payout statements are available yet. Your first statement will appear after the first completed calendar month."
      showSearch={false}
    />
  );
}
