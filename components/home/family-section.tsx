import Image from "next/image";
import Link from "next/link";
import { portfolioProof } from "@/components/home/case-studies-data";

// Existing managed-portfolio count, including homes outside the public catalogue.
const managedPropertyCount = 5;
const portfolioRating = portfolioProof[0].value.split(" / ")[0];

export function FamilySection({ id }: { id?: string } = {}) {
  return (
    <section aria-labelledby="family-title" className="bg-[#f5f1ea] text-[#1f1f1d] [font-family:var(--font-homepage)]" id={id}>
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-16 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div className="relative h-[300px] overflow-hidden rounded-2xl lg:h-[500px]">
            <Image alt="The Curate My Stay family team" className="object-cover" fill sizes="(min-width: 1280px) 447px, (min-width: 1024px) 40vw, calc(100vw - 40px)" src="/homepage/founder.jpg" />
          </div>
          <div>
            <h2 id="family-title" className="text-3xl font-bold leading-tight tracking-tight lg:text-[40px]">A family-run approach to property management</h2>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-[#3b3b37] lg:text-[17px]">
              Curate My Stay is a Goa-based property management firm run by a family with two complementary backgrounds: facility management and investment-side thinking. We currently manage {managedPropertyCount} properties and we are scaling deliberately.
            </p>
            <p className="mt-5 max-w-[560px] text-base leading-relaxed text-[#3b3b37] lg:text-[17px]">
              Communication stays direct, operations stay hands-on, and every property is managed with long-term value in mind. It is how we built a {portfolioRating} rating. It is how we plan to scale.
            </p>
            <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-[#d9d3c7] pt-6">
              <div><dt className="text-2xl font-semibold lg:text-[28px]">2025</dt><dd className="mt-1 text-sm text-[#5c5c57]">Founded</dd></div>
              <div><dt className="text-2xl font-semibold lg:text-[28px]">Goa</dt><dd className="mt-1 text-sm text-[#5c5c57]"><span className="hidden lg:inline">Where we are based</span><span className="lg:hidden">Based in</span></dd></div>
              <div><dt className="text-2xl font-semibold lg:text-[28px]">{managedPropertyCount}</dt><dd className="mt-1 text-sm text-[#5c5c57]">Properties managed</dd></div>
            </dl>
          </div>
        </div>
        <div className="mt-12 grid gap-5 border-t border-[#d9d3c7] pt-8 lg:mt-16 lg:grid-cols-[5fr_7fr] lg:gap-20 lg:pt-10">
          <h3 className="text-xl font-semibold lg:text-[22px]">Own a property in Goa?</h3>
          <div>
            <p className="max-w-[560px] text-base leading-relaxed text-[#3b3b37]">We manage it the way a wealth manager approaches a portfolio. Every property is an asset with an ROI, an operational P&amp;L and a strategy attached to it.</p>
            <Link className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href="/property-management-goa">Learn about property management</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
