import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { OwnerQueriesTable } from "@/src/features/queries/queries-table";
import { createOwnerQueryAction } from "@/src/features/shared/actions";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerQueriesPage() {
  const { profile, properties, queries } = await getOwnerData();
  const propertyNames = new Map(properties.map((property) => [property.id, property.name]));
  const queryRows = queries.map((query) => ({
    ...query,
    owner_name: profile.name || profile.email,
    property_name: query.property_id ? propertyNames.get(query.property_id) || "Unknown" : "None",
  }));

  return (
    <>
      <PageHeader title="Queries" subtitle="Submit a simple query for admin review." />
      <Card className="mb-5">
        <CardHeader title="New query" />
        <CardBody>
          <form action={createOwnerQueryAction} className="space-y-3">
            <input name="property_id" type="hidden" value={properties[0]?.id || ""} />
            <Field label="Message">
              <Textarea name="message" required />
            </Field>
            <Button type="submit" variant="primary">Submit query</Button>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="My queries" />
        <CardBody className="p-0">
          <OwnerQueriesTable queries={queryRows} />
        </CardBody>
      </Card>
    </>
  );
}
