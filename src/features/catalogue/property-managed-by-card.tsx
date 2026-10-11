"use client";

import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa6";
import { buildStayEnquiryMessage } from "@/src/features/catalogue/property-enquiry-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/**
 * "Managed by" card for `/property/[slug]`. Every listing is managed by the same
 * company, so the copy is company-level and never property-specific. The
 * WhatsApp number comes from the shared public contact setting.
 */
export function PropertyManagedByCard({ propertyName, propertyUrl }: { propertyName: string; propertyUrl: string }) {
  const whatsappUrl = getPublicWhatsAppUrl(buildStayEnquiryMessage({ propertyName, propertyUrl }));

  return (
    <section aria-labelledby="managed-by-heading">
      <h2
        className="mb-4 text-[21px] font-bold leading-tight tracking-[-0.01em] text-public-ink sm:text-[23px]"
        id="managed-by-heading"
      >
        Managed by Curate My Stay
      </h2>
      <div className="flex flex-col gap-5 rounded-[20px] border border-public-hairline p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-public-hairline bg-white">
            <Image alt="" className="object-contain p-1.5" fill sizes="56px" src="/logo.png" />
          </span>
          <div className="min-w-0">
            <p className="text-[16.5px] font-bold text-public-ink">Curate My Stay</p>
            <p className="mt-0.5 text-[14.5px] leading-6 text-public-body">
              A local team in Goa looks after this home. We answer your enquiry and are on hand to help during your stay.
            </p>
          </div>
        </div>
        {whatsappUrl ? (
          // The colour sits on the inner span: globals.css sets `a { color: inherit }` unlayered.
          <a
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-whatsapp px-4 py-2.5 outline-none transition-colors hover:bg-whatsapp-hover focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
            href={whatsappUrl}
            onClick={() => trackWhatsAppClick("property_page_managed_by")}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-white">
              <FaWhatsapp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              Message us on WhatsApp
            </span>
          </a>
        ) : null}
      </div>
    </section>
  );
}
