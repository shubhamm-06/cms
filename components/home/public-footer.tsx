"use client";

import Image from "next/image";
import { Globe, Mail, MapPin, MessageCircle, Star } from "lucide-react";
import { trackDataLayerEvent, trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

type PublicFooterProps = {
  analyticsLocation?: string;
  homeAnchorPrefix?: string;
};

type FooterLink = {
  href: string;
  label: string;
  onClick?: () => void;
};

function trackForecastFormOpen(ctaLocation: string) {
  trackDataLayerEvent("forecast_form_open", {
    cta_location: ctaLocation,
    form_name: "owner_forecast",
  });
}

function FooterLinks({ items, title }: { items: FooterLink[]; title: string }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">{title}</div>
      <div className="mt-4 grid gap-3 text-sm">
        {items.map((item) => (
          <a className="hover:text-white" href={item.href} key={item.label} onClick={item.onClick}>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function PublicFooter({
  analyticsLocation,
  homeAnchorPrefix = "",
}: PublicFooterProps = {}) {
  const whatsappUrl = getPublicWhatsAppUrl() || "#";
  const siteLinks: FooterLink[] = [
    { href: `${homeAnchorPrefix}#top`, label: "For Owners" },
    { href: `${homeAnchorPrefix}#top`, label: "For Guests / Book a Stay" },
    { href: "/about", label: "About" },
    { href: "/case-studies", label: "Case Studies" },
    { href: `${homeAnchorPrefix}#top`, label: "Blog (soon)" },
  ];
  const resourceLinks: FooterLink[] = [
    { href: `${homeAnchorPrefix}#extras`, label: "Sample P&L Statement" },
    { href: `${homeAnchorPrefix}#extras`, label: "Standard L&L Agreement" },
    { href: `${homeAnchorPrefix}#tiers`, label: "Tier System One-Pager" },
    {
      href: `${homeAnchorPrefix}#calculator`,
      label: "ROI Calculator",
      onClick: () => trackForecastFormOpen(analyticsLocation || "footer"),
    },
  ];

  return (
    <footer className="bg-[#241e19] text-white/70">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="inline-flex min-w-0 items-center gap-3 sm:gap-3.5">
              <Image alt="Curate My Stay" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" height={56} src="/logo.png" width={56} />
              <span className="min-w-0 whitespace-nowrap text-lg font-extrabold leading-none tracking-[-0.02em] text-white sm:text-[22px]">Curate My Stay</span>
            </span>
            <p className="mt-4 text-sm italic text-[#e9aa4b]">&quot;Wealth managers for property.&quot;</p>
            <div className="mt-5 grid gap-3 text-sm">
              <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-white/50" /> Goa, India</span>
              <a className="inline-flex min-w-0 items-center gap-2 break-all" href="mailto:curatemystay@gmail.com"><Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-white/50" /> curatemystay@gmail.com</a>
              <a className="inline-flex items-center gap-2" href={whatsappUrl} onClick={() => trackWhatsAppClick(analyticsLocation || "footer")} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" className="h-4 w-4 text-white/50" /> WhatsApp us</a>
            </div>
          </div>
          <FooterLinks items={siteLinks} title="Site" />
          <FooterLinks items={resourceLinks} title="Resources" />
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-white/45 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span>Copyright Curate My Stay 2026 - Privacy - Terms - Cookies</span>
          <div className="flex gap-4">
            <Globe aria-hidden="true" className="h-5 w-5" />
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            <Star aria-hidden="true" className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
