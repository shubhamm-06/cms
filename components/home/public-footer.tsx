"use client";

import Image from "next/image";
import Link from "next/link";
import { trackDataLayerEvent, trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

type PublicFooterProps = { analyticsLocation?: string; homeAnchorPrefix?: string };
type FooterLink = { href: string; label: string; onClick?: () => void };

function FooterLinks({ items, title }: { items: FooterLink[]; title: string }) {
  return (
    <div>
      <h3 className="text-[13px] font-medium uppercase tracking-widest text-[#a79e92]">{title}</h3>
      <ul className="mt-3 text-sm">
        {items.map((item) => <li key={item.label}><a className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9e3d9]" href={item.href} onClick={item.onClick}>{item.label}</a></li>)}
      </ul>
    </div>
  );
}

export function PublicFooter({ analyticsLocation, homeAnchorPrefix = "" }: PublicFooterProps = {}) {
  const whatsappUrl = getPublicWhatsAppUrl();
  const siteLinks: FooterLink[] = [
    { href: "/booking", label: "Explore stays" },
    { href: "/about", label: "About" },
    { href: `${homeAnchorPrefix}#contact`, label: "Contact" },
  ];
  const resourceLinks: FooterLink[] = [
    { href: "/property-management-goa", label: "Property management" },
    { href: "/case-studies", label: "Case studies" },
    { href: `${homeAnchorPrefix}#extras`, label: "Sample P&L statement" },
    { href: `${homeAnchorPrefix}#calculator`, label: "ROI calculator", onClick: () => trackDataLayerEvent("forecast_form_open", { cta_location: analyticsLocation || "footer", form_name: "owner_forecast" }) },
  ];

  return (
    <footer className="bg-[#2a211c] text-[#e9e3d9] [font-family:var(--font-homepage)]">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-16 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[4fr_2fr_3fr_3fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link aria-label="Curate My Stay home" className="inline-flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e9e3d9]" href="/">
              <Image alt="" className="size-10 object-contain" height={40} src="/logo.png" width={40} />
              <span className="text-base font-semibold">Curate My Stay</span>
            </Link>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed">Hand-picked villas and apartments in Goa, personally managed by our team.</p>
          </div>
          <FooterLinks items={siteLinks} title="Stays" />
          <FooterLinks items={resourceLinks} title="For owners" />
          <div className="col-span-2 lg:col-span-1" id="footer-contact">
            <h3 className="text-[13px] font-medium uppercase tracking-widest text-[#a79e92]">Contact</h3>
            <p className="mt-5 text-sm">Goa, India</p>
            <a className="inline-flex min-h-11 max-w-full items-center break-all rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9e3d9]" href="mailto:curatemystay@gmail.com">curatemystay@gmail.com</a>
            {whatsappUrl ? <a className="flex min-h-11 w-fit items-center rounded-sm text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9e3d9]" href={whatsappUrl} onClick={() => trackWhatsAppClick(analyticsLocation || "footer")} rel="noreferrer" target="_blank">WhatsApp us</a> : null}
          </div>
        </div>
        {/* The existing legal labels have no configured routes, so keep them as text. */}
        <p className="mt-16 border-t border-[#473b33] pt-6 text-[13px] leading-relaxed text-[#a79e92] lg:mt-32">&copy; Curate My Stay &middot; Privacy &middot; Terms &middot; Cookies</p>
      </div>
    </footer>
  );
}
