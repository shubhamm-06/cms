"use client";

import { DataTable } from "@/components/ui/data-table";
import { adminPayoutColumns } from "@/src/features/payouts/admin-payout-columns";
import type { PayoutTableRow } from "@/src/features/payouts/payout-columns";

export function AdminPayoutsTable({ payouts }: { payouts: PayoutTableRow[] }) {
  return (
    <DataTable
      columns={adminPayoutColumns}
      data={payouts}
      embedded
      emptyMessage="No payout statements are available yet. Previous-month statements are created when payout processing runs on page load for active owners."
      searchPlaceholder="Search payouts..."
    />
  );
}
