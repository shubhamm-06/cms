"use client";

import Link from "next/link";
import { ArrowLeft, Menu, Phone } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { HeaderLogo } from "@/components/home/public-header";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicPhoneDisplay, getPublicPhoneUrl, getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/**
 * Guest-facing header for `/booking` and `/property/[slug]`. Each page renders it
 * directly, so the owner-focused `PublicHeader` is never mounted there. The property
 * page passes the property name for the WhatsApp text; it must not read the stay
 * enquiry form, which keeps its own dates and guests.
 *
 * From `lg` it is one row: logo, Explore Stays, number, a secondary WhatsApp Us button and the
 * primary "List your property with us" button (`Become a host` below `lg`). Below `lg` the number
 * becomes a call icon and Explore Stays plus WhatsApp Us move into a Radix dialog sheet
 * (focus trap, Escape, scroll lock and focus return come with it). The unlayered
 * `a { color: inherit }` in `app/globals.css` outranks Tailwind's `text-*`, so link
 * colours sit on the header or on an inner span.
 */

type GuestHeaderProps = {
  page: "booking" | "property";
  propertyName?: string | null;
};

const phoneHref = getPublicPhoneUrl();
const displayPhoneNumber = getPublicPhoneDisplay();

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2";
const navLink = `inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[14.5px] tracking-[-0.01em] transition-colors hover:bg-public-hover ${focusRing}`;

export function GuestHeader({ page, propertyName }: GuestHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onProperty = page === "property";
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage(propertyName));
  // `/booking` is the page the Explore Stays link points to, so only there is it the current page.
  const stays = (
    <>
      {onProperty ? <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      {onProperty ? "All Stays" : "Explore Stays"}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-public-hairline bg-white text-public-ink">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-2 px-4 sm:px-6 md:px-8 lg:h-[72px]">
        <Link aria-label="Curate My Stay, all stays" className={`rounded-xl ${focusRing}`} href="/booking">
          <HeaderLogo nameClassName="max-[419px]:hidden" />
        </Link>

        <nav aria-label="Guest navigation" className="ml-8 hidden items-center gap-1 lg:flex">
          <Link
            aria-current={onProperty ? undefined : "page"}
            className={`${navLink} ${onProperty ? "font-medium" : "font-semibold"}`}
            href="/booking"
          >
            {stays}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          {phoneHref && displayPhoneNumber ? (
            <a
              aria-label={`Call ${displayPhoneNumber}`}
              className={`inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors hover:bg-public-hover lg:px-3 ${focusRing}`}
              href={phoneHref}
            >
              <Phone aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden whitespace-nowrap lg:inline">{displayPhoneNumber}</span>
            </a>
          ) : null}

          {whatsappUrl ? (
            <a
              className={`hidden h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-public-control px-4 text-sm font-medium transition-colors hover:bg-public-hover lg:inline-flex ${focusRing}`}
              href={whatsappUrl}
              onClick={() => trackWhatsAppClick("guest_header")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FaWhatsapp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              WhatsApp Us
            </a>
          ) : null}

          {/* The one primary button. The white label sits on the inner span so the unlayered link colour cannot override it. */}
          <Link
            className={`inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-public-coral px-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:bg-public-coral-hover active:scale-[0.98] sm:px-4 ${focusRing}`}
            href="/property-management-goa"
          >
            <span className="whitespace-nowrap text-sm font-semibold text-white">
              <span className="lg:hidden">Become a host</span>
              <span className="hidden lg:inline">List your property with us</span>
            </span>
          </Link>

          <div className="lg:hidden">
            <ShowMoreDialog
              onOpenChange={setMenuOpen}
              open={menuOpen}
              title="Menu"
              trigger={
                <button
                  aria-label="Open menu"
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-public-control transition-colors hover:bg-public-hover ${focusRing}`}
                  type="button"
                >
                  <Menu aria-hidden="true" className="h-5 w-5" />
                </button>
              }
            >
              <nav aria-label="Guest menu" className="grid gap-1">
                <Link
                  aria-current={onProperty ? undefined : "page"}
                  className={`flex min-h-12 items-center gap-2 rounded-xl px-3 text-[16px] hover:bg-public-hover ${onProperty ? "font-medium" : "font-semibold"} ${focusRing}`}
                  href="/booking"
                  onClick={() => setMenuOpen(false)}
                >
                  {stays}
                </Link>
                {whatsappUrl ? (
                  <a
                    className={`flex min-h-12 items-center gap-2 rounded-xl px-3 text-[16px] font-medium hover:bg-public-hover ${focusRing}`}
                    href={whatsappUrl}
                    onClick={() => {
                      trackWhatsAppClick("guest_header");
                      setMenuOpen(false);
                    }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <FaWhatsapp aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                    WhatsApp Us
                  </a>
                ) : null}
              </nav>
            </ShowMoreDialog>
          </div>
        </div>
      </div>
    </header>
  );
}
