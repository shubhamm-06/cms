import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminPayoutsTable } from "@/src/features/payouts/admin-payouts-table";
import {
  calculateBreakupsForOwnerMonth,
  calculatePreviousCarryForward,
} from "@/src/features/payouts/payout-calculations";
import { ensureAdminPayoutsForPreviousMonth } from "@/src/features/payouts/payout-actions";
import { getAdminData } from "@/src/features/shared/data";
import { formatMoney } from "@/src/lib/utils/money";

export default async function PayoutsPage() {
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

  return (
    <>
      <PageHeader
        title="Payouts"
        subtitle="Previous month payouts are created automatically on page load. TDS is fixed at 10%; admin can mark approved or resolved payouts as paid."
      />
      <Card className="mb-5">
        <CardHeader
          title="Owner payout list"
          subtitle="Combined per owner and month. There is no send-for-approval step."
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
              <Card>
                <CardHeader
                  title={`${payout.owner_name} - ${payout.month}`}
                  subtitle={`Status: ${payout.status}${query ? ` | Query: ${query.status}` : ""}`}
                />
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
                  {query ? (
                    <div className="border-t border-[var(--border)] p-5 text-sm text-[#4a4a48]">
                      <div className="font-bold text-[var(--foreground)]">Owner query</div>
                      <p className="mt-1">{query.message}</p>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
}
