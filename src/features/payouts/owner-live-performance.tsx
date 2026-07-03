import { formatMoney } from "@/src/lib/utils/money";
import type { OwnerLivePerformance } from "@/src/features/payouts/payout-calculations";

export function OwnerLivePerformancePanel({
  monthLabel,
  performance,
}: {
  monthLabel: string;
  performance: OwnerLivePerformance;
}) {
  const metrics = [
    ["Revenue so far", performance.revenue_total, "Booking revenue counted inside this month.", ""],
    ["Property expenses", performance.expense_total, "Current-month property expenses only.", "text-[var(--brand-ink)]"],
    ["Net profit", performance.net_profit, "Revenue minus property expenses.", ""],
    ["Estimated payout", performance.estimated_payout, "Informational estimate, not a finalized payout.", "text-[var(--green)]"],
  ] as const;

  return (
    <section className="mb-6 rounded-3xl border border-[var(--border)] bg-white shadow-[0_18px_55px_rgba(22,24,29,0.05)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[var(--brand-ink)]">Informational live view</div>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">
            Current-month performance - {monthLabel}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5b55]">
            Owner-scoped live figures from current-month bookings and property expenses. The payout table below remains the reviewable statement record.
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--cream)] px-3 py-1 text-xs font-bold text-[#5f5b55]">
          Not finalized
        </span>
      </div>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {metrics.map(([label, value, description, tone]) => (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4" key={label}>
            <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#6f6a62]">{label}</div>
            <div className={`mt-2 text-3xl font-extrabold tracking-tight ${tone}`}>{formatMoney(value)}</div>
            <p className="mt-2 text-sm leading-6 text-[#5f5b55]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
