import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  calculateOwnerLivePerformance,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureOwnerPayoutForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { OwnerLivePerformancePanel } from "@/src/features/payouts/owner-live-performance";
import { OwnerPayoutsTable } from "@/src/features/payouts/payouts-table";
import { getOwnerData } from "@/src/features/shared/data";
import {
  currentMonthLabel,
  getCurrentMonthKey,
  isPayoutReviewWindow,
} from "@/src/lib/utils/dates";

export default async function OwnerPayoutPage() {
  await ensureOwnerPayoutForPreviousMonth();
  const { bookings, expenses, payouts, profile, properties } = await getOwnerData();
  const reviewWindowIsOpen = isPayoutReviewWindow();
  const payoutRows = payouts
    .slice()
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((payout) => ({
      ...payout,
      owner_name: profile.name || profile.email,
      property_name: "Combined owner payout",
      previous_carry_forward: calculatePreviousCarryForward({
        payouts,
        beforeMonth: payout.month,
      }),
      adjusted_net_profit: payout.net_profit,
      query_status: "None",
      can_review: reviewWindowIsOpen && payout.status === "ready_for_review",
    }));
  const livePerformance = calculateOwnerLivePerformance({
    ownerId: profile.id,
    monthKey: getCurrentMonthKey(),
    properties,
    bookings,
    expenses,
    payouts,
  });

  return (
    <>
      <PageHeader
        title="Payout"
        subtitle="Your previous month payout appears automatically from the 1st. Review is open from the 1st to the 5th."
      />

      <OwnerLivePerformancePanel monthLabel={currentMonthLabel()} performance={livePerformance} />

      <Card>
        <CardHeader
          title="Payout history"
          subtitle="Your monthly payout statements and their current status."
        />
        <CardBody className="p-0">
          <OwnerPayoutsTable payouts={payoutRows} />
        </CardBody>
      </Card>
    </>
  );
}
