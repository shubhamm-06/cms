import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminPayoutNoticeToast } from "@/src/features/payouts/admin-payout-notice-toast";
import { AdminPayoutsTable } from "@/src/features/payouts/admin-payouts-table";
import {
  calculateBreakupsForOwnerMonth,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureAdminPayoutsForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { getAdminData } from "@/src/features/shared/data";
import { getPreviousMonthKey } from "@/src/lib/utils/dates";
import { humanize } from "@/src/lib/utils/format";
import { formatMoney } from "@/src/lib/utils/money";

function payoutStatusTone(status: string) {
  if (status === "paid" || status === "approved" || status === "resolved") return "green";
  if (status === "query_raised" || status === "ready_for_review") return "amber";
  return "neutral";
}

function payoutStatusLabel(status: string) {
  if (status === "ready_for_review") return "Ready for Review";
  if (status === "query_raised") return "Query Raised";
  return humanize(status);
}

function MetricCard({ label, value, helper }: { helper: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#6a655f]">{helper}</p>
    </div>
  );
}

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const noticeParam = params.notice;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  await ensureAdminPayoutsForPreviousMonth();
  const { bookings, expenses, payouts, profiles, properties, queries } = await getAdminData();
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));
  const queryByPayout = new Map(queries.filter((query) => query.payout_id).map((query) => [query.payout_id, query]));
  const payoutRows = payouts.map((payout) => ({
    ...payout,
    owner_name: ownerNames.get(payout.owner_id) || "Unknown",
    property_name: "Combined owner payout",
    previous_carry_forward: calculatePreviousCarryForward({
      payouts: payouts.filter((item) => item.owner_id === payout.owner_id),
      beforeMonth: payout.month,
    }),
    adjusted_net_profit: payout.net_profit,
    query_status: queryByPayout.get(payout.id)?.status || "None",
  }));
  const payoutMonth = getPreviousMonthKey();
  const readyForPayment = payoutRows.filter((payout) => payout.status === "approved" || payout.status === "resolved");
  const queryRaisedCount = payoutRows.filter((payout) => payout.status === "query_raised").length;
  const totalFinalPayout = payoutRows.reduce((sum, payout) => sum + Number(payout.final_payout_amount || 0), 0);

  return (
    <div className="space-y-6">
      <AdminPayoutNoticeToast notice={notice} />

      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Admin payout operations</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Payouts
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Review previous completed-month owner statements, resolve linked queries, and mark approved or resolved payouts as paid. TDS remains fixed at 10%.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Payable statement month</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{payoutMonth}</p>
            <p className="mt-1 text-xs leading-5 text-[#6a655f]">Created or refreshed on page load for active owners only under existing rules.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          helper="Across all payout rows currently listed."
          label="Final payout total"
          value={formatMoney(totalFinalPayout)}
        />
        <MetricCard
          helper="Approved or resolved statements eligible for existing mark-paid action."
          label="Ready for payment"
          value={String(readyForPayment.length)}
        />
        <MetricCard
          helper="Query-raised payouts remain blocked until admin resolution."
          label="Needs query resolution"
          value={String(queryRaisedCount)}
        />
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader
          title="Owner payout statements"
          subtitle="Combined owner-month rows. Search, sort, pagination, previous-month processing, and payout rules are unchanged."
        />
        <CardBody className="p-0">
          <AdminPayoutsTable payouts={payoutRows} />
        </CardBody>
      </Card>

      <div className="grid gap-5">
        {payoutRows.map((payout) => {
          const breakups = calculateBreakupsForOwnerMonth({
            ownerId: payout.owner_id,
            monthKey: payout.month,
            properties,
            bookings,
            expenses,
          });
          const query = queryByPayout.get(payout.id);

          return (
            <div key={payout.id} className="scroll-mt-24" id={`payout-${payout.id}`}>
              <Card className="overflow-hidden border-[var(--border)]">
                <CardHeader>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--foreground)]">
                          {payout.owner_name} - {payout.month}
                        </h2>
                        <Badge className="whitespace-nowrap" tone={payoutStatusTone(payout.status)}>
                          {payoutStatusLabel(payout.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                        Property-wise breakup used to build this combined owner-month payout statement.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[520px]">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Revenue</p>
                        <p className="mt-1 font-bold tabular-nums text-[var(--foreground)]">{formatMoney(payout.revenue_total)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Expenses</p>
                        <p className="mt-1 font-bold tabular-nums text-[var(--foreground)]">{formatMoney(payout.expense_total)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">TDS</p>
                        <p className="mt-1 font-bold tabular-nums text-[var(--foreground)]">{formatMoney(payout.tds_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Final payout</p>
                        <p className="mt-1 font-extrabold tabular-nums text-[var(--foreground)]">{formatMoney(payout.final_payout_amount)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                      <thead className="bg-[var(--surface-2)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                        <tr>
                          <th className="border-b border-[var(--border)] px-4 py-3 font-semibold">Property</th>
                          <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">Revenue</th>
                          <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">Expenses</th>
                          <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">Net</th>
                          <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">Owner share %</th>
                          <th className="border-b border-[var(--border)] px-4 py-3 text-right font-semibold">CMS share %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] bg-white">
                        {breakups.map((item) => (
                          <tr key={item.property_id}>
                            <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{item.property_name}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(item.revenue)}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatMoney(item.expenses)}</td>
                            <td className={`px-4 py-3 text-right font-semibold tabular-nums ${item.net < 0 ? "text-red-700" : "text-[var(--foreground)]"}`}>
                              {formatMoney(item.net)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">{item.owner_share_percent}%</td>
                            <td className="px-4 py-3 text-right tabular-nums">{item.cms_share_percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {query ? (
                    <div className="border-t border-[var(--border)] bg-[var(--cream)]/60 p-5 text-sm text-[#4a4a48]">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-bold text-[var(--foreground)]">Linked owner query</div>
                        <Badge className="whitespace-nowrap" tone={payout.status === "query_raised" ? "amber" : "teal"}>
                          {payout.status === "query_raised" ? "Resolve before payment" : humanize(query.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 max-w-4xl leading-6">{query.message}</p>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
