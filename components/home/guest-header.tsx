"use client";

import Link from "next/link";
import { useState } from "react";
import { HeaderLogo } from "@/components/home/public-header";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

type GuestHeaderProps = {
  page: "home" | "booking" | "property";
  propertyName?: string | null;
};

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1f1d]";
const navLink = `inline-flex min-h-11 items-center rounded-full px-3 text-sm ${focusRing}`;

export function GuestHeader({ page, propertyName }: GuestHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onProperty = page === "property";
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage(propertyName));
  const links = [
    { href: "/booking", label: onProperty ? "All stays" : "Explore stays" },
    { href: "/about", label: "About" },
    { href: "/property-management-goa", label: "For owners" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white text-[#1f1f1d] [font-family:var(--font-homepage)]">
      <div className="mx-auto flex h-18 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8 lg:h-20 lg:px-16">
        <Link aria-label="Curate My Stay home" className={`inline-flex min-h-11 items-center rounded-xl ${focusRing}`} href={page === "home" ? "/" : "/booking"}>
          <HeaderLogo />
        </Link>
        <nav aria-label="Guest navigation" className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <Link className={navLink} href={link.href} key={link.href}>
              <span className={link.label === "For owners" ? "text-[#5c5c57]" : ""}>{link.label}</span>
            </Link>
          ))}
          {whatsappUrl ? (
            <a className={`${navLink} ml-2 border border-[#e3e0d8] px-5 font-medium`} href={whatsappUrl} onClick={() => trackWhatsAppClick("guest_header")} rel="noopener noreferrer" target="_blank">
              WhatsApp us
            </a>
          ) : null}
        </nav>
        <div className="lg:hidden">
          <ShowMoreDialog
            onOpenChange={setMenuOpen}
            open={menuOpen}
            title="Menu"
            trigger={
              <button aria-label="Open menu" className={`inline-flex size-11 items-center justify-center rounded-full ${focusRing}`} type="button">
                <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14M5 16h14" strokeLinecap="round" /></svg>
              </button>
            }
          >
            <nav aria-label="Guest menu" className="grid gap-2">
              {links.map((link) => (
                <Link className="flex min-h-11 items-center rounded-lg px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2" href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
              ))}
              {whatsappUrl ? (
                <a className="flex min-h-11 items-center rounded-lg px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2" href={whatsappUrl} onClick={() => { trackWhatsAppClick("guest_header"); setMenuOpen(false); }} rel="noopener noreferrer" target="_blank">WhatsApp us</a>
              ) : null}
            </nav>
          </ShowMoreDialog>
        </div>
      </div>
    </header>
  );
}
