import Image from "next/image";
import { MapPin, Rocket, Target, type LucideIcon } from "lucide-react";

/**
 * The "Who we are" family section. Extracted from the homepage so `/` and
 * `/booking` render the same approved copy and image from one place.
 * The homepage passes `id="about"` to keep its existing anchor.
 */

const credentials: { body: string; icon: LucideIcon; title: string }[] = [
  { icon: Rocket, title: "Founded 2025", body: "In active growth mode" },
  { icon: MapPin, title: "Based in Goa", body: "Operational team on the ground" },
  {
    icon: Target,
    title: "Cross-domain expertise",
    body: "20+ yrs facility management (Dubai) · Investment advisory & Fortune 500 background",
  },
];

export function FamilySection({ id }: { id?: string } = {}) {
  return (
    <section className="bg-white text-[#222222]" id={id}>
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-[104px]">
        <div className="grid items-start gap-10 sm:gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[24px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)] lg:mx-0">
            <Image
              alt="The Curate My Stay family"
              className="block h-auto w-full"
              height={1067}
              sizes="(min-width: 1024px) 420px, calc(100vw - 2rem)"
              src="/homepage/founder.jpg"
              width={800}
            />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff5a5f]">
              Who we are
            </div>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-[40px]">
              A Family-Run Approach to Property Management
            </h2>
            <p className="mt-5 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">
              Curate My Stay is a Goa-based property management firm run by a family with two
              complementary backgrounds: facility management and investment-side thinking. We
              currently manage 5 properties and we are scaling deliberately.
            </p>
            <p className="mt-4 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">
              We approach property management the way a wealth manager approaches a portfolio: every
              property is an asset with an ROI, an operational P&amp;L, and a strategy attached to
              it. That framing is what consistently delivers strong returns for our owners without
              compromising the property itself.
            </p>
            <p className="mt-4 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">
              Communication stays direct, operations stay hands-on, and every property is managed
              with long-term value in mind.
            </p>
            <p className="mt-4 text-base font-semibold leading-7 text-[#222222] sm:text-[16.5px] sm:leading-8">
              It is how we built a 4.98 rating. It is how we plan to scale.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {credentials.map((credential) => {
                const Icon = credential.icon;

                return (
                  <div
                    className="rounded-2xl border border-[#ebebeb] bg-[#fbf7f1] p-5"
                    key={credential.title}
                  >
                    <Icon className="h-6 w-6 text-[#ff5a5f]" />
                    <div className="mt-3 text-sm font-extrabold">{credential.title}</div>
                    <div className="mt-1 text-xs leading-5 text-[#717171]">{credential.body}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
