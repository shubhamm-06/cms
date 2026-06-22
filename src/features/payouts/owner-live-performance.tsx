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
    ["Current month revenue", performance.revenue_total, ""],
    ["Current month property expenses", performance.expense_total, ""],
    ["Current month net profit", performance.net_profit, ""],
    ["Estimated payout", performance.estimated_payout, "text-[var(--green)]"],
  ] as const;

  return (
    <section className="mb-5 rounded-[14px] border border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h2 className="text-[13.5px] font-bold">Current month performance - {monthLabel}</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Live owner-scoped figures from current-month bookings and property expenses.</p>
      </div>
      <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value, tone]) => (
          <div key={label}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
            <div className={`mt-1 text-[26px] font-extrabold tracking-tight ${tone}`}>{formatMoney(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
