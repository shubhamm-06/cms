import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerExpensesTable } from "@/src/features/expenses/expenses-table";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerExpensesPage() {
  const { expenses, properties } = await getOwnerData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const expenseRows = expenses.map((expense) => ({
    ...expense,
    property_name: expense.property_id ? propertyNames.get(expense.property_id) || "Unknown" : "Unknown",
  }));

  return (
    <>
      <PageHeader title="Expenses" subtitle="Read-only property expenses. CMS expenses are not shown." />
      <Card>
        <CardHeader title="My expenses" />
        <CardBody className="p-0">
          <OwnerExpensesTable expenses={expenseRows} />
        </CardBody>
      </Card>
    </>
  );
}
