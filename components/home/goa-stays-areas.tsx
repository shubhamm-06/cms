import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";
import Image from "next/image";

export type GoaStayArea = { count: number; coverUrl: string | null; name: string; region: string | null };

const { areas: copy } = goaStaysCopy;

export function GoaStaysAreas({ areas }: { areas: GoaStayArea[] }) {
  if (areas.length === 0) return null;

  return (
    <section className="scroll-mt-20 px-4 pb-16 pt-12 sm:px-6 sm:pt-14 md:px-8 lg:scroll-mt-24 lg:pb-20 lg:pt-16" id="areas">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[26px] font-extrabold tracking-[-0.02em] text-public-ink sm:text-[30px]">{copy.heading}</h2>
        <p className="mt-1.5 text-[15px] leading-6 text-public-body">{copy.intro}</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {areas.map((area) => {
            const entry = copy.entries[area.name.toLowerCase()];
            const imageSrc = copy.areaPhotoKeys.includes(area.name.toLowerCase())
              ? `/areas/${area.name.toLowerCase()}.jpg`
              : area.coverUrl;

            return (
              <article className="min-w-0 overflow-hidden rounded-2xl border border-public-hairline bg-white shadow-sm" key={area.name}>
                {imageSrc ? (
                  <div className="relative aspect-[16/10] w-full">
                    <Image alt="" className="object-cover" fill loading="lazy" sizes="(min-width: 768px) 50vw, 100vw" src={imageSrc} />
                  </div>
                ) : null}
                <div className="p-5 md:p-6">
                  <h3 className="text-[17px] font-bold tracking-[-0.01em] text-public-ink">{entry?.title ?? area.name}</h3>
                  <p className="mt-0.5 text-[13px] leading-5 text-public-muted">
                    {area.region ? `${area.region} · ` : ""}{area.count} {area.count === 1 ? copy.stayCount.one : copy.stayCount.other}
                  </p>
                  {entry ? (
                    <>
                      <p className="mt-4 text-[15px] font-semibold leading-6 text-public-ink">{entry.tagline}</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-public-body">{entry.paragraph}</p>
                      <dl className="mt-4 divide-y divide-public-hairline">
                        {entry.facts.map((fact) => (
                          <div className="grid gap-y-2 py-3 first:pt-0 last:pb-0" key={fact.label}>
                            <dt className="text-[14px] font-semibold leading-5 text-public-ink">{fact.label}</dt>
                            <dd className="text-[14px] leading-relaxed text-public-body">{fact.text}</dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
