import { CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateBreakupsForOwnerMonth,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import {
  approveOwnerPayoutAction,
  ensureOwnerPayoutForPreviousMonth,
  raisePayoutQueryAction,
} from "@/src/features/payouts/payout-actions";
import { OwnerPayoutsTable } from "@/src/features/payouts/payouts-table";
import { getOwnerData } from "@/src/features/shared/data";
import { getPreviousMonthKey, isPayoutReviewWindow } from "@/src/lib/utils/dates";
import { formatMoney } from "@/src/lib/utils/money";

export default async function OwnerPayoutPage() {
  await ensureOwnerPayoutForPreviousMonth();
  const { bookings, expenses, payouts, profile, properties } = await getOwnerData();
  const monthKey = getPreviousMonthKey();
  const payout = payouts.find((item) => item.month === monthKey) || payouts[0];
  const previousCarryForward = payout
    ? calculatePreviousCarryForward({
        payouts,
        beforeMonth: payout.month,
      })
    : 0;
  const breakups = payout
    ? calculateBreakupsForOwnerMonth({
        ownerId: profile.id,
        monthKey: payout.month,
        properties,
        bookings,
        expenses,
      })
    : [];
  const rows = payout
    ? [
        {
          ...payout,
          owner_name: profile.name || profile.email,
          property_name: "Combined owner payout",
          previous_carry_forward: previousCarryForward,
          adjusted_net_profit: payout.net_profit,
          query_status: "None",
        },
      ]
    : [];
  const canReview = payout?.status === "ready_for_review" && isPayoutReviewWindow();
  const showPreviousCarryForward = previousCarryForward < 0;
  const showPropertyBreakup = properties.length > 1 && breakups.length > 1;

  return (
    <>
      <PageHeader
        title="Payout"
        subtitle="Your previous month payout appears automatically from the 1st. Review is open from the 1st to the 5th."
      />

      {!payout ? (
        <Card>
          <CardBody>
            <p className="text-sm text-[var(--muted)]">No payout is available yet.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card className="mb-5">
            <CardHeader title={`Payout month: ${payout.month}`} />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Total Revenue", payout.revenue_total],
                  ["Total Property Expenses", payout.expense_total],
                  ...(showPreviousCarryForward ? ([["Previous Carry Forward", previousCarryForward]] as const) : []),
                  ["Adjusted Net Profit", payout.net_profit],
                  ["Owner Share Amount", payout.owner_share_amount],
                  ["CMS Share Amount", payout.cms_share_amount],
                  ["TDS 10%", payout.tds_amount],
                  ["Final Payout Amount", payout.final_payout_amount],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
                    <div className="mt-2 text-xl font-bold">{formatMoney(Number(value))}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {canReview ? (
            <Card className="mb-5">
              <CardHeader title="Review action" subtitle="Approve this payout or raise one simple query before the review window ends." />
              <CardBody className="grid gap-4 lg:grid-cols-2">
                <form action={approveOwnerPayoutAction} className="rounded-lg border border-[var(--border)] p-4">
                  <input name="id" type="hidden" value={payout.id} />
                  <Field label="Optional approval note">
                    <Textarea name="owner_note" placeholder="Optional note for admin." />
                  </Field>
                  <Button className="mt-3" type="submit" variant="primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Payout
                  </Button>
                </form>
                <form action={raisePayoutQueryAction} className="rounded-lg border border-[var(--border)] p-4">
                  <input name="id" type="hidden" value={payout.id} />
                  <Field label="Query">
                    <Textarea name="message" placeholder="Describe what looks incorrect or needs review." required />
                  </Field>
                  <Button className="mt-3" type="submit" variant="secondary">
                    <HelpCircle className="h-4 w-4" />
                    Raise Query
                  </Button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {showPropertyBreakup ? (
            <Card className="mb-5">
              <CardHeader title="Property-wise breakup" />
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Revenue</th>
                        <th>Expenses</th>
                        <th>Net</th>
                        <th>Owner share %</th>
                        <th>CMS share %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakups.map((item) => (
                        <tr key={item.property_id}>
                          <td className="font-semibold">{item.property_name}</td>
                          <td>{formatMoney(item.revenue)}</td>
                          <td>{formatMoney(item.expenses)}</td>
                          <td>{formatMoney(item.net)}</td>
                          <td>{item.owner_share_percent}%</td>
                          <td>{item.cms_share_percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Payout record" />
            <CardBody className="p-0">
              <OwnerPayoutsTable payouts={rows} />
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}
