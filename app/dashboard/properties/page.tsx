import { PropertyForm } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PropertiesTable } from "@/src/features/properties/properties-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function PropertiesPage() {
  const { profiles, properties } = await getAdminData();
  const owners = profiles.filter((profile) => profile.role === "owner");
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));
  const propertyRows = properties.map((property) => ({
    ...property,
    owner_name: property.owner_id ? ownerNames.get(property.owner_id) || "Unassigned" : "Unassigned",
  }));

  return (
    <>
      <PageHeader title="Properties" subtitle="Assign one owner per property and keep share percentages explicit." />
      <Card className="mb-5">
        <CardHeader title="Add property" />
        <CardBody>
          <PropertyForm owners={owners} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Property list" />
        <CardBody className="p-0">
          <PropertiesTable properties={propertyRows} />
        </CardBody>
      </Card>
    </>
  );
}
