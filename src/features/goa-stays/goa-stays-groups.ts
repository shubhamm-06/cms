import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import type { GoaStayGroupId } from "@/src/features/goa-stays/goa-stays-copy";

export type GoaStayGroup = { id: GoaStayGroupId; properties: CatalogueProperty[] };

/** Groups matched on `public_property_type` (trimmed, case-insensitive), in page order. */
const typedGroups: { id: GoaStayGroupId; type: string }[] = [
  { id: "villas", type: "villa" },
  { id: "apartments", type: "apartment" },
  { id: "studios", type: "studio" },
];

function typeOf(property: CatalogueProperty) {
  return property.public_property_type?.trim().toLowerCase() ?? "";
}

/**
 * Splits the catalogue into Villa, Apartment and Studio groups, with every other or
 * missing type in a final "More stays" group. Keeps the loader's order inside each
 * group and drops empty groups.
 */
export function groupGoaStays(properties: CatalogueProperty[]): GoaStayGroup[] {
  const knownTypes = new Set(typedGroups.map((group) => group.type));
  const groups: GoaStayGroup[] = [
    ...typedGroups.map(({ id, type }) => ({ id, properties: properties.filter((property) => typeOf(property) === type) })),
    { id: "more-stays", properties: properties.filter((property) => !knownTypes.has(typeOf(property))) },
  ];

  return groups.filter((group) => group.properties.length > 0);
}
