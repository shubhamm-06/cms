import Link from "next/link";
import { PropertyForm, PropertyFormSaveButton } from "@/components/forms/admin-forms";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyImportDialog } from "@/src/features/properties/property-import-dialog";
import { PropertyImageManager } from "@/src/features/properties/property-image-manager";
import { PropertyNoticeToast } from "@/src/features/properties/property-notice-toast";
import { PropertiesTable } from "@/src/features/properties/properties-table";
import { getAdminData, getPropertyImagesForAdmin } from "@/src/features/shared/data";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string | string[]; notice?: string | string[] }>;
}) {
  const params = await searchParams;
  const editParam = params.edit;
  const noticeParam = params.notice;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  const notice = Array.isArray(noticeParam) ? noticeParam[0] : noticeParam;
  const { profiles, properties } = await getAdminData();
  const propertyToEdit = editId ? properties.find((property) => property.id === editId) : undefined;
  const propertyImages = propertyToEdit ? await getPropertyImagesForAdmin(propertyToEdit.id) : [];
  const propertyFormId = `property-form-${propertyToEdit?.id || "new"}`;
  const owners = profiles.filter((profile) => profile.role === "owner");
  const ownerNames = new Map(profiles.map((profile) => [profile.id, profile.name || profile.email]));
  const importProfiles = profiles.map((profile) => ({
    email: profile.email,
    role: profile.role,
    status: profile.status,
  }));
  const propertyRows = properties.map((property) => ({
    ...property,
    owner_name: property.owner_id ? ownerNames.get(property.owner_id) || "Unassigned" : "Unassigned",
  }));

  return (
    <>
      <PropertyNoticeToast notice={notice} />
      <PageHeader
        title="Properties"
        subtitle="Create and maintain owner-assigned properties. Share percentages stay explicit and must total 100."
      />
      <Card className="mb-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <CardHeader
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {propertyToEdit ? (
                <Link className="cms-btn bg-white hover:bg-[var(--surface-2)]" href="/dashboard/properties">
                  New property
                </Link>
              ) : null}
              <PropertyImportDialog
                existingPropertyNames={properties.map((property) => property.name)}
                profiles={importProfiles}
              />
            </div>
          }
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">{propertyToEdit ? "Edit property" : "Add property"}</h2>
              {propertyToEdit ? <Badge tone="brand">Editing</Badge> : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {propertyToEdit
                ? `Updating ${propertyToEdit.name}. Saving returns you to add mode.`
                : "Add one property at a time with its owner assignment and operating split."}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <PropertyForm formId={propertyFormId} key={propertyToEdit?.id || "new-property"} owners={owners} property={propertyToEdit} />
          <PropertyImageManager key={propertyToEdit?.id || "new-property-images"} images={propertyImages} propertyId={propertyToEdit?.id} />
          <div className="mt-6 flex flex-col gap-2 sm:items-end">
            <PropertyFormSaveButton formId={propertyFormId} isEditing={Boolean(propertyToEdit)} />
            <p className="text-xs text-[var(--muted)]">
              {propertyToEdit ? "Updates the selected property row." : "Creates one new property row."}
            </p>
          </div>
        </CardBody>
      </Card>
      <Card className="overflow-hidden shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <div>
            <h2 className="text-base font-bold tracking-tight">Property list</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {properties.length} {properties.length === 1 ? "property" : "properties"} in the admin workspace.
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <PropertiesTable properties={propertyRows} />
        </CardBody>
      </Card>
    </>
  );
}
