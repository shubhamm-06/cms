import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getOwnerData } from "@/src/features/shared/data";

export default async function OwnerPropertyPage() {
  const { properties } = await getOwnerData();
  const property = properties[0];

  return (
    <>
      <PageHeader title="My property" subtitle="View your proerpty details here incase of any update required reach out to us." />
      <Card>
        <CardHeader title={property?.name || "No assigned property"} />
        <CardBody className="grid gap-4 md:grid-cols-2">
          {property ? (
            Object.entries({
              City: property.city,
              Address: property.address,
              Bedrooms: property.bedrooms,
              "Owner share": `${property.owner_share}%`,
              "CMS share": `${property.cms_share}%`,
              Status: property.status,
            }).map(([label, value]) => (
              <div key={label}>
                <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</div>
                <div className="mt-1 font-semibold">{value || "—"}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No property has been assigned to your account.</p>
          )}
        </CardBody>
      </Card>
    </>
  );
}
