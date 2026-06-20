"use client";

import { DataTable } from "@/components/ui/data-table";
import { propertyColumns, type PropertyTableRow } from "@/src/features/properties/property-columns";

export function PropertiesTable({ properties }: { properties: PropertyTableRow[] }) {
  return (
    <DataTable
      columns={propertyColumns}
      data={properties}
      embedded
      emptyMessage="No properties found."
      searchPlaceholder="Search properties..."
    />
  );
}
