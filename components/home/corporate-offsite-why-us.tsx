import { MessageCircle, Plane, Star, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { whyUs, type WhyUsPointIcon } from "@/src/features/corporate-offsite/stay-options-copy";
import { publicType } from "@/src/lib/public-type";

const icons: Record<WhyUsPointIcon, LucideIcon> = {
  chat: MessageCircle,
  food: UtensilsCrossed,
  plane: Plane,
};

/** Section 3 of `/corporate-offsite-villas-goa`: a dark band of three figures and three short points. */
export function CorporateOffsiteWhyUs() {
  return (
    <section aria-labelledby="why-teams-heading" className="bg-public-ink py-16 text-white lg:py-24">
      {/* Same width and side padding as section 2. */}
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <div className="text-center">
          <p className={`${publicType.eyebrow} text-public-amber`}>{whyUs.eyebrow}</p>
          {/* `publicType.h2` with a 30px phone size, which this section asks for in place of 28px. */}
          <h2 className="mx-auto mt-3 max-w-[720px] text-balance text-[30px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]" id="why-teams-heading">
            {whyUs.heading}
          </h2>
        </div>

        <ul className="mt-12 grid divide-y divide-white/15 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {whyUs.stats.map((stat) => (
            <li className="min-w-0 py-6 first:pt-0 last:pb-0 sm:px-4 sm:py-0" key={stat.label}>
              <p className="flex items-center justify-center gap-2 text-[40px] font-extrabold leading-none tracking-[-0.02em] md:text-[56px]">
                {stat.value}
                {stat.star ? <Star aria-hidden="true" className="h-4 w-4 shrink-0 fill-public-amber text-public-amber" /> : null}
              </p>
              <p className="mt-2 text-[15px] leading-6 text-white/70">{stat.label}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid gap-8 border-t border-white/15 pt-12 lg:grid-cols-3 lg:gap-10">
          {whyUs.points.map((point) => {
            const Icon = icons[point.icon];

            return (
              <li className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left" key={point.title}>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20">
                  <Icon aria-hidden="true" className="h-6 w-6 text-public-amber" strokeWidth={1.5} />
                </span>
                <h3 className={`mt-4 text-balance ${publicType.cardTitle}`}>{point.title}</h3>
                <p className="mt-2 text-base leading-7 text-white/70">{point.line}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
