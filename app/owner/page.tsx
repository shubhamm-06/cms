import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Flag,
  IndianRupee,
  MessageSquare,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  calculateBreakupsForOwnerMonth,
  calculateOwnerCombinedPayout,
  calculateOwnerLivePerformance,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureOwnerPayoutForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { getOwnerData } from "@/src/features/shared/data";
import { currentMonthLabel, formatDate, getCurrentMonthKey, getPreviousMonthKey } from "@/src/lib/utils/dates";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";

function shortMoney(value: number | null | undefined) {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${formatMoney(amount / 10000000)} Cr`;
  if (abs >= 100000) return `${formatMoney(amount / 100000)} L`;
  if (abs >= 1000) return `${formatMoney(amount / 1000)}k`;
  return formatMoney(amount);
}

const propertyAccent = ["#E5484D", "#F4A258", "#3D8CA8", "#2F8F4E"];

function payoutStatusLabel(status: string | null | undefined, paidAt?: string | null) {
  if (status === "paid" || paidAt || status === "approved") return "Approved";
  if (status === "ready_for_review") return "Ready for Review";
  if (status === "query_raised") return "Query Raised";
  if (status === "resolved") return "Resolved";
  return status ? humanize(status) : "Awaiting payout";
}

function payoutStatusTone(
  status: string | null | undefined,
  paidAt?: string | null,
): "neutral" | "green" | "amber" {
  if (status === "paid" || paidAt || status === "approved" || status === "resolved") return "green";
  if (status === "ready_for_review" || status === "query_raised") return "amber";
  return "neutral";
}

function propertyInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PerformanceCard({
  description,
  icon,
  label,
  tone = "neutral",
  value,
}: {
  description: string;
  icon: ReactNode;
  label: string;
  tone?: "green" | "brand" | "neutral";
  value: number;
}) {
  const valueTone =
    tone === "green" ? "text-[var(--green)]" : tone === "brand" ? "text-[var(--brand-ink)]" : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
          {icon}
        </div>
      </div>
      <div className="mt-5 text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
      <div className={`mt-2 text-4xl font-extrabold tracking-tight ${valueTone}`}>{formatMoney(value)}</div>
      <p className="mt-3 text-sm leading-6 text-[#5f5b55]">{description}</p>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm leading-6 text-[var(--muted)]">
      {children}
    </div>
  );
}

export default async function OwnerOverviewPage() {
  await ensureOwnerPayoutForPreviousMonth();
  const { bookings, expenses, payouts, profile, properties, queries } = await getOwnerData();
  const payoutMonth = getPreviousMonthKey();
  const selectedProperty = properties[0];
  const selectedPropertyId = selectedProperty?.id;
  const propertyBookings = selectedPropertyId
    ? bookings.filter((booking) => booking.property_id === selectedPropertyId)
    : bookings;
  const propertyExpenses = selectedPropertyId
    ? expenses.filter((expense) => expense.property_id === selectedPropertyId)
    : expenses;
  const latestPayout = payouts.find((payout) => payout.month === payoutMonth) || payouts[0];
  const openQuery = queries.find((query) => !query.resolved);
  const previousCarryForward = latestPayout
    ? calculatePreviousCarryForward({
        payouts,
        beforeMonth: latestPayout.month,
      })
    : 0;
  const payoutBreakups = latestPayout
    ? calculateBreakupsForOwnerMonth({
        ownerId: profile.id,
        monthKey: latestPayout.month,
        properties,
        bookings,
        expenses,
      })
    : [];
  const payoutSummary = calculateOwnerCombinedPayout({
    propertyBreakups: payoutBreakups,
    previousCarryForward,
  });
  const livePerformance = calculateOwnerLivePerformance({
    ownerId: profile.id,
    monthKey: getCurrentMonthKey(),
    properties,
    bookings,
    expenses,
    payouts,
  });

  const ownerSharePercent = latestPayout ? payoutSummary.owner_share_percent : Number(selectedProperty?.owner_share ?? 70);
  const cmsSharePercent = latestPayout ? payoutSummary.cms_share_percent : Number(selectedProperty?.cms_share ?? 30);
  const ownerShare = latestPayout?.owner_share_amount ?? 0;
  const cmsShare = latestPayout?.cms_share_amount ?? 0;
  const tds = latestPayout?.tds_amount ?? 0;
  const netPayable = latestPayout?.final_payout_amount ?? 0;
  const showPreviousCarryForward = previousCarryForward < 0;
  const monthLabel = currentMonthLabel();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.06)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div>
            <Badge className="mb-4 whitespace-nowrap" tone="brand">
              Owner dashboard
            </Badge>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Welcome, {profile.name || profile.email}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f5b55]">
              Current-month performance for {properties.length === 1 ? "your property" : `your ${properties.length || "assigned"} properties`}, updated from owner-scoped bookings and property expenses.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className="cms-btn cms-btn-primary" href="/owner/payout">
                <Check className="h-4 w-4" />
                View payout history
              </Link>
              <Link className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]" href="/owner/queries">
                <Flag className="h-4 w-4" />
                Raise a query
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-3 text-[var(--brand-ink)]">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Current-month view</div>
                <div className="text-sm text-[#5f5b55]">{monthLabel}</div>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Estimated payout so far</div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--green)]">
                {formatMoney(livePerformance.estimated_payout)}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#5f5b55]">
                Live estimate only. Payable statements are based on completed months.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Current-month live performance</h2>
          <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
            Revenue is prorated by nights in {monthLabel}. CMS expenses are excluded.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <PerformanceCard
            description="Booking revenue counted for nights falling in this calendar month."
            icon={<TrendingUp className="h-5 w-5" />}
            label="Revenue"
            tone="green"
            value={livePerformance.revenue_total}
          />
          <PerformanceCard
            description="Only property expenses linked to your assigned property or properties."
            icon={<ReceiptText className="h-5 w-5" />}
            label="Property expenses"
            tone="brand"
            value={livePerformance.expense_total}
          />
          <PerformanceCard
            description="Revenue minus property expenses before any monthly payout split."
            icon={<TrendingDown className="h-5 w-5" />}
            label="Net profit"
            value={livePerformance.net_profit}
          />
          <PerformanceCard
            description="Estimated owner payout after share, carry-forward, and TDS rules."
            icon={<WalletCards className="h-5 w-5" />}
            label="Estimated payout"
            tone="green"
            value={livePerformance.estimated_payout}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Latest statement</h2>
              <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
                Previous completed month. Current-month figures above are live estimates.
              </p>
            </div>
            <Badge className="whitespace-nowrap" tone={payoutStatusTone(latestPayout?.status, latestPayout?.paid_at)}>
              {payoutStatusLabel(latestPayout?.status, latestPayout?.paid_at)}
            </Badge>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)]">
            {[
              ["Statement month", latestPayout?.month || payoutMonth],
              ["Rental revenue", formatMoney(latestPayout?.revenue_total)],
              ["Property expenses", formatMoney(latestPayout?.expense_total)],
              ...(showPreviousCarryForward ? [["Previous carry forward", formatMoney(previousCarryForward)]] : []),
              ["Adjusted profit", formatMoney(latestPayout?.net_profit)],
              [`Owner share (${ownerSharePercent}%)`, formatMoney(ownerShare)],
              [`CMS management (${cmsSharePercent}%)`, formatMoney(cmsShare)],
              ["TDS 10%", `- ${formatMoney(tds)}`],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0" key={label}>
                <span className="text-[#5f5b55]">{label}</span>
                <span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 rounded-b-2xl bg-[var(--surface-2)] px-4 py-4">
              <span className="text-sm font-bold text-[var(--foreground)]">Net payable to you</span>
              <span className="text-xl font-extrabold text-[var(--green)]">{formatMoney(netPayable)}</span>
            </div>
          </div>
        </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Recent bookings</h2>
              <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Latest stays visible to your owner account.</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-ink)]" href="/owner/bookings">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {propertyBookings.length === 0 ? (
              <EmptyState>No bookings are visible for your assigned property yet.</EmptyState>
            ) : (
              propertyBookings.slice(0, 5).map((booking) => (
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4" key={booking.id}>
                  <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-[var(--foreground)]">{booking.guest_name}</div>
                    <div className="mt-1 text-sm text-[#5f5b55]">
                      {formatDate(booking.check_in)} to {formatDate(booking.check_out)} | {booking.nights || 0} nights
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-[var(--foreground)]">{shortMoney(booking.total_amount)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Property expenses</h2>
              <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Recent property costs. CMS expenses are not shown here.</p>
            </div>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-ink)]" href="/owner/expenses">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {propertyExpenses.length === 0 ? (
              <EmptyState>No property expenses have been logged for your account yet.</EmptyState>
            ) : (
              propertyExpenses.slice(0, 5).map((expense) => (
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4" key={expense.id}>
                  <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-[var(--foreground)]">{expense.vendor || expense.category}</div>
                    <div className="mt-1 truncate text-sm text-[#5f5b55]">{expense.note || expense.category}</div>
                  </div>
                  <div className="text-right text-sm font-bold text-[var(--foreground)]">{shortMoney(expense.amount)}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {openQuery ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-[#EDDFB1] bg-[var(--amber-soft)] p-4 text-sm text-[#6B4F00] sm:flex-row sm:items-start">
          <Flag className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold">Your query is being reviewed</div>
            <div className="mt-1 leading-6">&quot;{openQuery.message}&quot; - raised {formatDate(openQuery.created_at)}</div>
          </div>
          <Badge className="w-fit whitespace-nowrap" tone="amber">Open</Badge>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Queries and clarifications</h2>
            <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
              Ask the operations team to review a statement or property item.
            </p>
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-ink)]" href="/owner/queries">
            Manage
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 space-y-3">
          {queries.length === 0 ? (
            <EmptyState>No queries raised. Everything looks aligned.</EmptyState>
          ) : (
            queries.slice(0, 4).map((query) => (
              <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center" key={query.id}>
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[var(--foreground)]">{query.message}</div>
                  <div className="mt-1 text-sm text-[#5f5b55]">Raised {formatDate(query.created_at)}</div>
                </div>
                <Badge className="w-fit whitespace-nowrap" tone={query.resolved ? "green" : "amber"}>
                  {query.resolved ? "Resolved" : query.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Property summary</h2>
            <p className="mt-1 text-sm leading-6 text-[#5f5b55]">
              Reference details for the properties currently assigned to you.
            </p>
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-bold text-[var(--brand-ink)]" href="/owner/property">
            Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {properties.length === 0 ? (
            <EmptyState>No property has been assigned to your owner account yet.</EmptyState>
          ) : (
            properties.map((property, index) => {
              const active = property.id === selectedPropertyId;
              const accent = propertyAccent[index % propertyAccent.length];

              return (
                <Link
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:bg-[var(--surface-2)] ${
                    active ? "bg-white shadow-sm" : "bg-[var(--surface-2)]/60"
                  }`}
                  href="/owner/property"
                  key={property.id}
                  style={{ borderColor: active ? accent : "var(--border)" }}
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
                    style={{ background: accent }}
                  >
                    {propertyInitials(property.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[var(--foreground)]">{property.name}</span>
                    <span className="mt-1 block truncate text-sm text-[#5f5b55]">
                      {property.bedrooms ? `${property.bedrooms} BHK | ` : ""}
                      {property.city || "Property details"}
                    </span>
                  </span>
                  <Badge className="whitespace-nowrap capitalize" tone={property.status === "active" ? "green" : "neutral"}>
                    {property.status}
                  </Badge>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
