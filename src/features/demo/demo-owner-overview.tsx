import {
  CalendarDays,
  Check,
  Flag,
  IndianRupee,
  MessageSquare,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { demoOwnerDashboard, demoOwnerProfile } from "@/src/features/demo/demo-owner-data";
import { formatDate } from "@/src/lib/utils/dates";
import { formatMoney } from "@/src/lib/utils/money";

function ShortMoney({ value }: { value: number }) {
  const amount = Math.abs(value);
  const suffix = amount >= 100000 ? " L" : amount >= 1000 ? "k" : "";
  const divisor = amount >= 100000 ? 100000 : amount >= 1000 ? 1000 : 1;
  return <>{`${formatMoney(value / divisor)}${suffix}`}</>;
}

function PerformanceCard({
  description,
  icon,
  label,
  tone = "neutral",
  value,
}: {
  description: string;
  icon: React.ReactNode;
  label: string;
  tone?: "green" | "brand" | "neutral";
  value: number;
}) {
  const valueTone = tone === "green" ? "text-[var(--green)]" : tone === "brand" ? "text-[var(--brand-ink)]" : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)] w-fit">{icon}</div>
      <div className="mt-5 text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
      <div className={`mt-2 text-4xl font-extrabold tracking-tight ${valueTone}`}>{formatMoney(value)}</div>
      <p className="mt-3 text-sm leading-6 text-[#5f5b55]">{description}</p>
    </div>
  );
}

export function DemoOwnerOverview() {
  const { latestStatement, livePerformance, monthLabel, property, bookings, expenses, query } = demoOwnerDashboard;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.06)]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          <div>
            <Badge className="mb-4 whitespace-nowrap" tone="brand">Demo data</Badge>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">Welcome, {demoOwnerProfile.name}.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f5b55]">
              A read-only preview of current-month performance for your property, with transparent bookings, property expenses, and payout visibility.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <span className="cms-btn cms-btn-primary cursor-default"><Check className="h-4 w-4" />View payout history</span>
              <span className="cms-btn bg-white text-[var(--foreground)] cursor-default"><Flag className="h-4 w-4" />Raise a query</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-3 text-[var(--brand-ink)]"><CalendarDays className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">Current-month view</div>
                <div className="text-sm text-[#5f5b55]">{monthLabel}</div>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">Estimated payout so far</div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--green)]">{formatMoney(livePerformance.estimatedPayout)}</div>
              <p className="mt-3 text-sm leading-6 text-[#5f5b55]">Live estimate only. Payable statements are based on completed months.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Current-month live performance</h2>
          <p className="mt-1 text-sm leading-6 text-[#5f5b55]">{livePerformance.occupiedNights} occupied nights at {livePerformance.occupancy}% occupancy. CMS expenses are excluded.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <PerformanceCard description="Booking revenue counted for nights falling in this calendar month." icon={<TrendingUp className="h-5 w-5" />} label="Revenue" tone="green" value={livePerformance.revenue} />
          <PerformanceCard description="Only property expenses linked to your assigned property." icon={<ReceiptText className="h-5 w-5" />} label="Property expenses" tone="brand" value={livePerformance.propertyExpenses} />
          <PerformanceCard description="Revenue minus property expenses before any monthly payout split." icon={<TrendingDown className="h-5 w-5" />} label="Net profit" value={livePerformance.netProfit} />
          <PerformanceCard description="Estimated owner payout after share and TDS rules." icon={<WalletCards className="h-5 w-5" />} label="Estimated payout" tone="green" value={livePerformance.estimatedPayout} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Latest statement</h2>
            <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Previous completed month. Current-month figures above are live estimates.</p>
          </div>
          <Badge className="whitespace-nowrap" tone="green">{latestStatement.status}</Badge>
        </div>
        <div className="mt-5 rounded-2xl border border-[var(--border)]">
          {[
            ["Statement month", latestStatement.month],
            ["Rental revenue", formatMoney(latestStatement.revenue)],
            ["Property expenses", formatMoney(latestStatement.propertyExpenses)],
            ["Adjusted profit", formatMoney(latestStatement.adjustedProfit)],
            [`Owner share (${latestStatement.ownerSharePercent}%)`, formatMoney(latestStatement.ownerShare)],
            [`CMS management (${latestStatement.cmsSharePercent}%)`, formatMoney(latestStatement.cmsShare)],
            ["TDS 10%", `- ${formatMoney(latestStatement.tds)}`],
          ].map(([label, value]) => (
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-3 text-sm last:border-b-0" key={label}>
              <span className="text-[#5f5b55]">{label}</span><span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 rounded-b-2xl bg-[var(--surface-2)] px-4 py-4">
            <span className="text-sm font-bold text-[var(--foreground)]">Net payable to you</span><span className="text-xl font-extrabold text-[var(--green)]">{formatMoney(latestStatement.netPayable)}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Recent bookings</h2>
          <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Latest stays visible to this demo owner account.</p>
          <div className="mt-5 space-y-3">
            {bookings.map((booking) => (
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4" key={booking.id}>
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]"><CalendarDays className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-[var(--foreground)]">{booking.guestName}</div><div className="mt-1 text-sm text-[#5f5b55]">{formatDate(booking.checkIn)} to {formatDate(booking.checkOut)} | {booking.nights} nights | {booking.source}</div></div>
                <div className="text-right text-sm font-bold text-[var(--foreground)]"><ShortMoney value={booking.amount} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Property expenses</h2>
          <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Recent property costs. CMS expenses are not shown here.</p>
          <div className="mt-5 space-y-3">
            {expenses.map((expense) => (
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4" key={expense.id}>
                <div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]"><IndianRupee className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-[var(--foreground)]">{expense.vendor}</div><div className="mt-1 truncate text-sm text-[#5f5b55]">{expense.note}</div></div>
                <div className="text-right text-sm font-bold text-[var(--foreground)]"><ShortMoney value={expense.amount} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#EDDFB1] bg-[var(--amber-soft)] p-4 text-sm text-[#6B4F00] sm:flex-row sm:items-start">
        <Flag className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><div className="font-bold">Your query is being reviewed</div><div className="mt-1 leading-6">&quot;{query.message}&quot; - raised {formatDate(query.raisedAt)}</div></div><Badge className="w-fit whitespace-nowrap" tone="amber">{query.status}</Badge>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Queries and clarifications</h2><p className="mt-1 text-sm leading-6 text-[#5f5b55]">Ask the operations team to review a statement or property item.</p></div></div>
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center"><div className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--brand-ink)]"><MessageSquare className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-bold text-[var(--foreground)]">{query.message}</div><div className="mt-1 text-sm text-[#5f5b55]">Raised {formatDate(query.raisedAt)}</div></div><Badge className="w-fit whitespace-nowrap" tone="amber">{query.status}</Badge></div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_14px_34px_rgba(22,24,29,0.04)]">
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">Property summary</h2>
        <p className="mt-1 text-sm leading-6 text-[#5f5b55]">Reference details for the property assigned to this demo account.</p>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E5484D] bg-white p-4 shadow-sm">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">CS</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[var(--foreground)]">{property.name}</span><span className="mt-1 block truncate text-sm text-[#5f5b55]">{property.bedrooms} BHK Villa | {property.city}</span></span>
          <Badge className="whitespace-nowrap capitalize" tone="green">{property.status}</Badge>
        </div>
      </section>
    </div>
  );
}
