import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAdminData } from "@/src/features/shared/data";
import { UsersTable } from "@/src/features/users/users-table";

export default async function UsersPage() {
  const { profiles } = await getAdminData();

  return (
    <>
      <PageHeader title="Users" subtitle="Approve users, change roles/statuses, and protect the primary admin account." />
      <Card>
        <CardHeader title="All users" subtitle="Public signups remain pending until an admin activates them." />
        <CardBody className="p-0">
          <UsersTable profiles={profiles} />
        </CardBody>
      </Card>
    </>
  );
}
