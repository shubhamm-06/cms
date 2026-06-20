import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminQueriesTable } from "@/src/features/queries/queries-table";
import { getAdminData } from "@/src/features/shared/data";

export default async function QueriesPage() {
  const { profiles, properties, queries } = await getAdminData();
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const queryRows = queries.map((query) => ({
    ...query,
    owner_name: ownerNames.get(query.owner_id) || "Owner",
    property_name: query.property_id ? propertyNames.get(query.property_id) || "Unknown" : "None",
  }));

  return (
    <>
      <PageHeader title="Queries" subtitle="Simple owner query inbox. Admin can mark a query resolved." />
      <Card>
        <CardHeader title="Owner queries" />
        <CardBody className="p-0">
          <AdminQueriesTable queries={queryRows} />
        </CardBody>
      </Card>
    </>
  );
}
