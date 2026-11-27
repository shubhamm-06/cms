import { CorporateOffsiteFaqAccordion } from "@/components/home/corporate-offsite-faq-accordion";
import { stayOptionsFaqCopy, faqs } from "@/src/features/corporate-offsite/stay-options-copy";
import { buildFaqJsonLd, serializeJsonLd } from "@/src/lib/public-structured-data";

export function CorporateOffsiteFaqs() {
  return (
    <section aria-labelledby="corporate-offsite-faq-heading" className="bg-white py-16 text-public-ink lg:py-24">
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faqs)) }} type="application/ld+json" />
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
        <div>
          <div className="lg:sticky lg:top-24">
            <h2 className="text-balance text-[30px] font-extrabold leading-[1.12] lg:text-[44px] lg:leading-[1.08]" id="corporate-offsite-faq-heading">
              {stayOptionsFaqCopy.heading}
            </h2>
            <p className="mt-3 text-[17px] leading-[1.6] text-public-muted">{stayOptionsFaqCopy.subline}</p>
          </div>
        </div>
        <div>
          <CorporateOffsiteFaqAccordion />
        </div>
      </div>
    </section>
  );
}
