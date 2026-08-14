import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  calculateOwnerAllTimePropertyPnl,
  calculateOwnerLivePerformance,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureOwnerPayoutForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { OwnerLivePerformancePanel } from "@/src/features/payouts/owner-live-performance";
import { OwnerPayoutNoticeToast } from "@/src/features/payouts/owner-payout-notice-toast";
import { OwnerPayoutsTable } from "@/src/features/payouts/payouts-table";
import { getOwnerData } from "@/src/features/shared/data";
import {
  currentMonthLabel,
  getCurrentMonthKey,
  isPayoutReviewWindow,
} from "@/src/lib/utils/dates";
import { formatMoney } from "@/src/lib/utils/money";

function AllTimeMetric({
  description,
  label,
  tone = "neutral",
  value,
}: {
  description: string;
  label: string;
  tone?: "green" | "muted" | "neutral";
  value: number;
}) {
  const toneClass =
    tone === "green" ? "text-[var(--green)]" : tone === "muted" ? "text-[#5f5b55]" : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
      <div className={`mt-2 text-3xl font-extrabold tracking-tight ${toneClass}`}>{formatMoney(value)}</div>
      <p className="mt-2 text-sm leading-6 text-[#5f5b55]">{description}</p>
    </div>
  );
}

export default async function OwnerPayoutPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
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
  const allTimePnl = calculateOwnerAllTimePropertyPnl({
    ownerId: profile.id,
    properties,
    bookings,
    expenses,
  });
  const monthLabel = currentMonthLabel();

  return (
    <div className="space-y-6">
      <OwnerPayoutNoticeToast notice={notice} />
      <section className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_18px_55px_rgba(22,24,29,0.06)] sm:p-6">
        <Badge className="mb-4 whitespace-nowrap" tone="brand">
          Owner payout
        </Badge>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Payout statements
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f5b55]">
              Follow this month&apos;s live operating performance separately from completed monthly statements that may need review.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Review window</div>
            <p className="mt-2 text-sm leading-6 text-[#5f5b55]">
              Previous-month statements appear automatically. Owner review is available from the 1st to the 5th when a statement is ready.
            </p>
          </div>
        </div>
      </section>

      <OwnerLivePerformancePanel monthLabel={monthLabel} performance={livePerformance} />

      <section className="rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--brand-ink)]">Read-only property P&amp;L</div>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">All-time property performance</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5b55]">
            Across all recorded bookings and property expenses. This is not a payout statement.
          </p>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-6">
          <AllTimeMetric
            description="Eligible booking revenue for your assigned properties."
            label="All-time booking revenue"
            tone="green"
            value={allTimePnl.revenue_total}
          />
          <AllTimeMetric
            description="Property expenses only; CMS expenses are excluded."
            label="All-time property expenses"
            tone="muted"
            value={allTimePnl.expense_total}
          />
          <AllTimeMetric
            description="Booking revenue minus property expenses."
            label="Net property profit"
            value={allTimePnl.net_profit}
          />
        </div>
      </section>

      <Card className="rounded-3xl border-[var(--border)] shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
        <CardHeader>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--brand-ink)]">Reviewable records</div>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">Payout history</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5b55]">
              Your monthly payout statements and current status, latest month first. Ready statements can be approved or queried only during the review window.
            </p>
          </div>
          <Badge className="whitespace-nowrap" tone="neutral">
            {payoutRows.length} {payoutRows.length === 1 ? "statement" : "statements"}
          </Badge>
        </CardHeader>
        <CardBody className="p-0">
          <OwnerPayoutsTable payouts={payoutRows} />
        </CardBody>
      </Card>
    </div>
  );
}
