import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PnlTable } from "@/src/features/pnl/pnl-table";
import { getAdminData } from "@/src/features/shared/data";
import { formatMoney } from "@/src/lib/utils/money";

function FinancialMetric({
  emphasis = "neutral",
  helper,
  label,
  value,
}: {
  emphasis?: "neutral" | "positive" | "negative";
  helper: string;
  label: string;
  value: number;
}) {
  const valueColor =
    emphasis === "positive" ? "text-green-800" : emphasis === "negative" ? "text-red-700" : "text-[var(--foreground)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tabular-nums ${valueColor}`}>{formatMoney(value)}</p>
      <p className="mt-1 text-xs leading-5 text-[#6a655f]">{helper}</p>
    </div>
  );
}

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
  const revenueTotal = rows.reduce((sum, row) => sum + row.revenue, 0);
  const propertyExpenseTotal = rows.reduce((sum, row) => sum + row.expenses, 0);
  const netProfitTotal = rows.reduce((sum, row) => sum + row.net_profit, 0);
  const ownerShareTotal = rows.reduce((sum, row) => sum + row.owner_share, 0);
  const cmsShareTotal = rows.reduce((sum, row) => sum + row.cms_share, 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <Badge tone="brand" className="mb-4">Admin financial overview</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              P&L
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Review property-level revenue, property expenses, net profit, and owner/CMS share amounts from recorded operational data. Payouts apply fixed 10% TDS separately when owner profit is positive.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">CMS expenses</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{formatMoney(cmsExpenseTotal)}</p>
            <p className="mt-1 text-xs leading-5 text-[#6a655f]">Tracked separately from property-level rows in the table below.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FinancialMetric helper="Total booking revenue shown in this report." label="Revenue" value={revenueTotal} />
        <FinancialMetric helper="Property-linked expenses only." label="Property expenses" value={propertyExpenseTotal} />
        <FinancialMetric
          emphasis={netProfitTotal < 0 ? "negative" : "positive"}
          helper="Revenue minus property expenses."
          label="Net profit"
          value={netProfitTotal}
        />
        <FinancialMetric helper="Owner share from existing property split." label="Owner share" value={ownerShareTotal} />
        <FinancialMetric helper="CMS share from existing property split." label="CMS share" value={cmsShareTotal} />
      </section>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader
          title="Property P&L records"
          subtitle="Search, sorting, pagination, row calculations, and source data remain unchanged."
        />
        <CardBody className="p-0">
          <PnlTable rows={rows} />
        </CardBody>
      </Card>
    </div>
  );
}
