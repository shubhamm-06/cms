"use client";

import { DataTable } from "@/components/ui/data-table";
import {
  getOwnerPayoutColumns,
  type PayoutTableRow,
} from "@/src/features/payouts/payout-columns";

export function OwnerPayoutsTable({ payouts }: { payouts: PayoutTableRow[] }) {
  const showCarryForward = payouts.some((payout) => payout.previous_carry_forward < 0);

  return (
    <DataTable
      columns={getOwnerPayoutColumns({ showCarryForward })}
      data={payouts}
      embedded
      emptyMessage="No payouts found."
      showSearch={false}
    />
  );
}
