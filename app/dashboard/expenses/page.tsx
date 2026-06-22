import { ExpenseForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminExpensesTable } from "@/src/features/expenses/expenses-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  const editParam = (await searchParams).edit;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const { expenses, properties, settings } = await getAdminData();
  const expenseToEdit = editId ? expenses.find((expense) => expense.id === editId) : undefined;
  const categoryValue = settings.find((setting) => setting.key === "expense_categories")?.value;
  const expenseCategories = Array.isArray(categoryValue)
    ? categoryValue.filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    : [];
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const expenseRows = expenses.map((expense) => ({
    ...expense,
    property_name: expense.property_id ? propertyNames.get(expense.property_id) || "Unknown" : "CMS",
  }));

  return (
    <>
      <PageHeader title="Expenses" subtitle="Property and CMS expenses live in the same module. Owners never see CMS expenses." />
      <Card className="mb-5">
        <CardHeader
          action={
            expenseToEdit ? (
              <Link className="cms-btn bg-white hover:bg-[var(--surface-2)]" href="/dashboard/expenses">
                New expense
              </Link>
            ) : null
          }
          subtitle={expenseToEdit ? `Editing ${expenseToEdit.category}` : undefined}
          title={expenseToEdit ? "Edit expense" : "Add expense"}
        />
        <CardBody>
          <ExpenseForm categories={expenseCategories} expense={expenseToEdit} properties={properties} />
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
import Link from "next/link";
