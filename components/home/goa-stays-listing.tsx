import { CataloguePropertyCard } from "@/src/features/catalogue/catalogue-property-card";
import { CatalogueEmptyNotice, CatalogueErrorNotice } from "@/src/features/catalogue/property-catalogue";
import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";
import type { GoaStayGroup } from "@/src/features/goa-stays/goa-stays-groups";

/** Distinct areas in loader order, for the caption under a group heading. */
function areaCaption(group: GoaStayGroup) {
  const areas = group.properties.map((property) => property.area?.trim()).filter((area): area is string => Boolean(area));

  return [...new Set(areas)].join(", ");
}

export function GoaStaysListing({ failed, groups }: { failed: boolean; groups: GoaStayGroup[] }) {
  return (
    <section className="scroll-mt-20 px-4 pb-16 pt-12 sm:px-6 sm:pt-14 md:px-8 lg:scroll-mt-24 lg:pb-20 lg:pt-16" id="stays">
      <div className="mx-auto max-w-[1180px]">
        {failed ? (
          <CatalogueErrorNotice />
        ) : groups.length === 0 ? (
          <CatalogueEmptyNotice />
        ) : (
          <div className="space-y-14 lg:space-y-16">
            {groups.map((group) => {
              const caption = areaCaption(group);

              return (
                <section aria-labelledby={`${group.id}-heading`} className="scroll-mt-20 lg:scroll-mt-24" id={group.id} key={group.id}>
                  <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]" id={`${group.id}-heading`}>
                    {goaStaysCopy.groups[group.id].title}
                  </h2>
                  {caption ? <p className="mt-1.5 text-[15px] leading-6 text-public-muted">{caption}</p> : null}
                  <div className="mt-6 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
                    {group.properties.map((property) => (
                      <CataloguePropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
