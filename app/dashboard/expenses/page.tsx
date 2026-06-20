import { ExpenseForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminExpensesTable } from "@/src/features/expenses/expenses-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function ExpensesPage() {
  const { expenses, properties } = await getAdminData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const expenseRows = expenses.map((expense) => ({
    ...expense,
    property_name: expense.property_id ? propertyNames.get(expense.property_id) || "Unknown" : "CMS",
  }));

  return (
    <>
      <PageHeader title="Expenses" subtitle="Property and CMS expenses live in the same module. Owners never see CMS expenses." />
      <Card className="mb-5">
        <CardHeader title="Add expense" />
        <CardBody>
          <ExpenseForm properties={properties} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Expense list" />
        <CardBody className="p-0">
          <AdminExpensesTable expenses={expenseRows} />
        </CardBody>
      </Card>
    </>
  );
}
