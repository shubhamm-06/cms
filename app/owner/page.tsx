import Link from "next/link";
import { Check, ChevronRight, Flag, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateBreakupsForOwnerMonth,
  calculateOwnerCombinedPayout,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureOwnerPayoutForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { getOwnerData } from "@/src/features/shared/data";
import { formatDate, getPreviousMonthKey } from "@/src/lib/utils/dates";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";

function shortMoney(value: number | null | undefined) {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
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

  const revenue = propertyBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
  const expenseTotal = propertyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const ownerSharePercent = latestPayout ? payoutSummary.owner_share_percent : Number(selectedProperty?.owner_share ?? 70);
  const cmsSharePercent = latestPayout ? payoutSummary.cms_share_percent : Number(selectedProperty?.cms_share ?? 30);
  const ownerShare = latestPayout?.owner_share_amount ?? 0;
  const cmsShare = latestPayout?.cms_share_amount ?? 0;
  const tds = latestPayout?.tds_amount ?? 0;
  const netPayable = latestPayout?.final_payout_amount ?? 0;
  const nightsBooked = propertyBookings.reduce((sum, booking) => sum + Number(booking.nights || 0), 0);
  const occupancy = Math.min(100, Math.round((nightsBooked / 31) * 100));
  const showPreviousCarryForward = previousCarryForward < 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">
            Hello, {profile.name || profile.email}.
          </h1>
          <p className="mt-1 max-w-2xl text-[13.5px] text-[var(--muted)]">
            Live performance for {properties.length === 1 ? "your property" : `your ${properties.length} properties`}. Updated from bookings, expenses, and payout records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Link className="inline-flex items-center gap-2" href="/owner/queries">
              <Flag className="h-4 w-4" />
              Raise a query
            </Link>
          </Button>
          <Button variant="primary">
            <Link className="inline-flex items-center gap-2" href="/owner/payout">
              <Check className="h-4 w-4" />
              View payout
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2.5">
        {properties.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)]">
            No property has been assigned yet.
          </div>
        ) : (
          properties.map((property, index) => {
            const active = property.id === selectedPropertyId;
            const accent = propertyAccent[index % propertyAccent.length];
            const initials = property.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <Link
                className={`flex min-w-[220px] items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left ${
                  active ? "bg-white shadow-sm" : "bg-[var(--surface-2)]"
                }`}
                href="/owner/property"
                key={property.id}
                style={{ borderColor: active ? accent : "var(--border)" }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white"
                  style={{ background: accent }}
                >
                  {initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold">{property.name}</span>
                  <span className="block truncate text-xs text-[var(--muted)]">
                    {property.bedrooms ? `${property.bedrooms} BHK · ` : ""}
                    {property.city || "Property details"}
                  </span>
                </span>
                {active ? <Check className="h-4 w-4" style={{ color: accent }} /> : null}
              </Link>
            );
          })
        )}
      </div>

      <section className="mb-3 rounded-[14px] border border-[var(--border)] bg-white">
        <div className="grid gap-4 px-6 py-5 md:grid-cols-5">
          {[
            ["Occupancy", `${occupancy}%`, `${nightsBooked} room-nights`, "text-[var(--brand)]"],
            ["Revenue", formatMoney(revenue), `${propertyBookings.length} bookings`, ""],
            ["Expenses", formatMoney(expenseTotal), "Property expenses", ""],
            ["Net to you", formatMoney(netPayable), latestPayout ? "after fixed 10% TDS" : "Awaiting payout", "text-[var(--green)]"],
            ["TDS deducted", formatMoney(tds), "Fixed 10% when profit is positive", ""],
          ].map(([label, value, sub, tone]) => (
            <div key={label}>
              <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
              <div className={`mt-1 text-[26px] font-extrabold tracking-tight ${tone}`}>{value}</div>
              <div className="text-xs text-[var(--muted)]">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {openQuery ? (
        <div className="mb-3 flex items-start gap-3 rounded-[10px] border border-[#EDDFB1] bg-[var(--amber-soft)] px-3.5 py-3 text-[13px] text-[#6B4F00]">
          <Flag className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <div className="font-bold">Your query is being reviewed</div>
            <div className="mt-0.5">&quot;{openQuery.message}&quot; · raised {formatDate(openQuery.created_at)}</div>
          </div>
          <Badge tone="amber">Open</Badge>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-3.5">
        <section className="col-span-12 rounded-[14px] border border-[var(--border)] bg-white lg:col-span-7">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-bold">Statement — {latestPayout?.month || payoutMonth}</h2>
            </div>
            <Badge tone={payoutStatusTone(latestPayout?.status, latestPayout?.paid_at)}>
              {payoutStatusLabel(latestPayout?.status, latestPayout?.paid_at)}
            </Badge>
          </div>
          <div className="px-5 pb-5">
            <table className="w-full border-collapse text-[13.5px]">
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 font-semibold">Rental revenue</td>
                  <td className="py-3 text-right font-semibold text-[var(--green)]">+ {formatMoney(latestPayout?.revenue_total)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 font-semibold">Property expenses</td>
                  <td className="py-3 text-right text-[var(--brand)]">- {formatMoney(latestPayout?.expense_total)}</td>
                </tr>
                {showPreviousCarryForward ? (
                  <tr className="border-b border-[var(--border)]">
                    <td className="py-3 font-semibold">Previous carry forward</td>
                    <td className="py-3 text-right">{formatMoney(previousCarryForward)}</td>
                  </tr>
                ) : null}
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 font-semibold">Adjusted profit</td>
                  <td className="py-3 text-right font-semibold">{formatMoney(latestPayout?.net_profit)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pl-3">Owner share ({ownerSharePercent}%)</td>
                  <td className="py-3 text-right">{formatMoney(ownerShare)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-3 pl-3">CMS management ({cmsSharePercent}%)</td>
                  <td className="py-3 text-right">{formatMoney(cmsShare)}</td>
                </tr>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <td className="py-3 pl-3">TDS 10%</td>
                  <td className="py-3 text-right">- {formatMoney(tds)}</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="border-t-2 border-[var(--foreground)] pt-3 text-[15px] font-extrabold">
                    Net payable to you
                  </td>
                  <td className="border-t-2 border-[var(--foreground)] pt-3 text-right text-lg font-extrabold text-[var(--green)]">
                    {formatMoney(netPayable)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Status</td>
                  <td className="py-3 text-right font-semibold">
                    {payoutStatusLabel(latestPayout?.status, latestPayout?.paid_at)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="col-span-12 flex flex-col gap-3.5 lg:col-span-5">
          <section className="rounded-[14px] border border-[var(--border)] bg-white">
            <div className="px-5 py-4 text-[13.5px] font-bold">Bookings this month</div>
            <div className="px-5 pb-1">
              {propertyBookings.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted)]">No bookings yet</div>
              ) : (
                propertyBookings.slice(0, 5).map((booking) => (
                  <div className="flex items-center gap-3 border-t border-[var(--border)] py-3" key={booking.id}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{booking.guest_name}</div>
                      <div className="text-xs text-[var(--muted)]">
                        {formatDate(booking.check_in)} to {formatDate(booking.check_out)} · {booking.nights || 0}n
                      </div>
                    </div>
                    <Badge tone="teal">{booking.source || "Direct"}</Badge>
                    <div className="min-w-16 text-right text-[13px] font-bold">{shortMoney(booking.total_amount)}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[14px] border border-[var(--border)] bg-white">
            <div className="px-5 py-4 text-[13.5px] font-bold">Recent expenses</div>
            <div className="px-5 pb-1">
              {propertyExpenses.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted)]">No expenses logged</div>
              ) : (
                propertyExpenses.slice(0, 4).map((expense) => (
                  <div className="flex items-center gap-3 border-t border-[var(--border)] py-3" key={expense.id}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{expense.vendor || expense.category}</div>
                      <div className="truncate text-xs text-[var(--muted)]">{expense.note || expense.category}</div>
                    </div>
                    <div className="text-[13px] font-bold">{shortMoney(expense.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="col-span-12 rounded-[14px] border border-[var(--border)] bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[13.5px] font-bold">Queries & disputes</h2>
            <Link className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-ink)]" href="/owner/queries">
              <MessageSquare className="h-3.5 w-3.5" />
              Manage
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="cms-table">
              <thead>
                <tr>
                  <th>Raised</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {queries.length === 0 ? (
                  <tr>
                    <td className="p-9 text-center text-[var(--muted)]" colSpan={4}>
                      No queries raised — everything looks aligned.
                    </td>
                  </tr>
                ) : (
                  queries.map((query) => (
                    <tr key={query.id}>
                      <td>{formatDate(query.created_at)}</td>
                      <td className="font-semibold">{query.message}</td>
                      <td>
                        <Badge tone={query.resolved ? "green" : "amber"}>{query.status}</Badge>
                      </td>
                      <td>{query.resolved ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

