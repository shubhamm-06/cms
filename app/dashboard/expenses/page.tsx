import Link from "next/link";
import { ExpenseForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ExpenseNoticeToast } from "@/src/features/expenses/expense-notice-toast";
import { AdminExpensesTable } from "@/src/features/expenses/expenses-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[]; notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const editParam = params.edit;
  const noticeParam = params.notice;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
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
      <ExpenseNoticeToast notice={notice} />
      <PageHeader
        title="Expenses"
        subtitle="Record CMS costs and property costs clearly. Owners only see their assigned property expenses."
      />

      <Card className="mb-6 overflow-hidden border-[var(--border)]">
        <CardHeader
          action={
            expenseToEdit ? (
              <Link className="cms-btn bg-white text-[var(--foreground)] hover:bg-[var(--surface-2)]" href="/dashboard/expenses">
                New expense
              </Link>
            ) : null
          }
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[var(--foreground)]">
                {expenseToEdit ? "Edit expense" : "Add expense"}
              </h2>
              {expenseToEdit ? <Badge tone="brand">Editing</Badge> : <Badge tone="neutral">Admin only</Badge>}
            </div>
            <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
              {expenseToEdit
                ? `Update ${expenseToEdit.category}. CMS expenses stay internal, while property expenses appear in owner reporting.`
                : "Start with CMS for internal company costs, or switch to Property when the cost belongs to a specific owner property."}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <ExpenseForm categories={expenseCategories} expense={expenseToEdit} properties={properties} />
        </CardBody>
      </Card>

      <Card className="overflow-hidden border-[var(--border)]">
        <CardHeader>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Expense list</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Review expense context, edit rows, or delete a test record after confirmation.
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <AdminExpensesTable expenses={expenseRows} />
        </CardBody>
      </Card>
    </>
  );
}
