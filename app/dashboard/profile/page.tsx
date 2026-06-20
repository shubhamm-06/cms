import { ProfileForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/src/features/auth/auth-guards";

export default async function AdminProfilePage() {
  const profile = await requireRole("admin");

  return (
    <>
      <PageHeader title="Profile" subtitle="Edit your personal details. Role and account status are managed separately." />
      <Card>
        <CardHeader title="My profile" />
        <CardBody>
          <ProfileForm profile={{ ...profile, created_at: "", updated_at: "" }} />
        </CardBody>
      </Card>
    </>
  );
}
