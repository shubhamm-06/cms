import { SettingsForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAdminData } from "@/src/features/shared/data";

export default async function SettingsPage() {
  const { settings } = await getAdminData();

  return (
    <>
      <PageHeader title="Settings" subtitle="One option per line. Saved as JSON arrays in the settings table." />
      <Card>
        <CardHeader title="Dropdown options" />
        <CardBody>
          <SettingsForm settings={settings} />
        </CardBody>
      </Card>
    </>
  );
}
