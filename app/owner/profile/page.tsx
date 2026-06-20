import { ProfileForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { requireRole } from "@/src/features/auth/auth-guards";

export default async function OwnerProfilePage() {
  const profile = await requireRole("owner");

  return (
    <>
      <PageHeader title="Profile" subtitle="Edit your name, phone, and avatar URL only." />
      <Card>
        <CardHeader title="My profile" />
        <CardBody>
          <ProfileForm profile={{ ...profile, created_at: "", updated_at: "" }} />
        </CardBody>
      </Card>
    </>
  );
}
