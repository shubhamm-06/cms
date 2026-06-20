import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PnlTable } from "@/src/features/pnl/pnl-table";
import { getAdminData } from "@/src/features/shared/data";
import { formatMoney } from "@/src/lib/utils/money";

export default async function PnlPage() {
  const { bookings, expenses, properties } = await getAdminData();
  const cmsExpenses = expenses.filter((expense) => expense.expense_for === "cms");
  const cmsExpenseTotal = cmsExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const rows = properties.map((property) => {
    const revenue = bookings
      .filter((booking) => booking.property_id === property.id)
      .reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    const propertyExpenses = expenses
      .filter((expense) => expense.property_id === property.id)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const net = revenue - propertyExpenses;

    return {
      cms_share: (net * Number(property.cms_share)) / 100,
      expenses: propertyExpenses,
      net_profit: net,
      owner_share: (net * Number(property.owner_share)) / 100,
      property_name: property.name,
      revenue,
    };
  });

  return (
    <>
      <PageHeader title="P&L" subtitle="Simple revenue, expenses, profit, and share view. Payouts apply fixed 10% TDS when owner profit is positive." />
      <Card>
        <CardHeader title="Property P&L" subtitle={`CMS expenses included separately: ${formatMoney(cmsExpenseTotal)}`} />
        <CardBody className="p-0">
          <PnlTable rows={rows} />
        </CardBody>
      </Card>
    </>
  );
}
