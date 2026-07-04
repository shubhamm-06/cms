import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerExpensesTable } from "@/src/features/expenses/expenses-table";
import { getOwnerData } from "@/src/features/shared/data";
import { formatMoney } from "@/src/lib/utils/money";

export default async function OwnerExpensesPage() {
  const { expenses, properties } = await getOwnerData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const expenseRows = expenses.map((expense) => ({
    ...expense,
    property_name: expense.property_id ? propertyNames.get(expense.property_id) || "Unknown" : "Unknown",
  }));
  const totalExpenses = expenseRows.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const expenseCountLabel = `${expenseRows.length} ${expenseRows.length === 1 ? "expense" : "expenses"}`;
  const propertyScopeLabel =
    properties.length === 1
      ? `Property expenses for ${properties[0]?.name ?? "your assigned property"}`
      : `${properties.length} assigned ${properties.length === 1 ? "property" : "properties"}`;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--cream)] shadow-[0_18px_40px_rgba(34,34,34,0.06)]">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <Badge tone="teal" className="mb-4">Property expenses only</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Expenses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5b55] sm:text-base">
              Review property-related expenses recorded for your assigned property data. CMS/company expenses are excluded from this owner view.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-[0_10px_24px_rgba(34,34,34,0.04)]">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Recorded property expenses</p>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{formatMoney(totalExpenses)}</p>
            <p className="mt-1 text-xs leading-5 text-[#6a655f]">{propertyScopeLabel}</p>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden">
        <CardHeader
          action={<Badge tone="neutral" className="whitespace-nowrap">{expenseCountLabel}</Badge>}
          subtitle="This read-only list includes property expenses for your assigned property or properties. CMS expenses are never shown here."
          title="Property expense history"
        />
        <CardBody className="p-0">
          <OwnerExpensesTable expenses={expenseRows} />
        </CardBody>
      </Card>
    </div>
  );
}
