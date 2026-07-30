"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ChartLine,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CircleUser,
  FileText,
  House,
  Info,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { openCalendlyPopup } from "@/components/home/calendly-popup";
import { trackDataLayerEvent } from "@/src/lib/analytics";

type PublicHeaderProps = {
  analyticsLocation?: string;
};

type PublicNavigationLink = {
  activePath?: string;
  desktopGroup: "more" | "primary";
  emphasized?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
};

const publicNavigationLinks: PublicNavigationLink[] = [
  { activePath: "/", desktopGroup: "primary", href: "/", label: "Home", icon: House },
  {
    activePath: "/property-management-goa",
    desktopGroup: "primary",
    href: "/property-management-goa",
    label: "Property Management",
    icon: Building2,
  },
  { activePath: "/about", desktopGroup: "more", href: "/about", label: "About", icon: Info },
  {
    activePath: "/case-studies",
    desktopGroup: "more",
    href: "/case-studies",
    label: "Case Studies",
    icon: ChartLine,
  },
  { activePath: "/faq", desktopGroup: "more", href: "/faq", label: "FAQs", icon: CircleHelp },
  {
    activePath: "/property-management-proposal",
    desktopGroup: "more",
    href: "/property-management-proposal#forecast",
    label: "Get Pitch Deck",
    emphasized: true,
    icon: FileText,
  },
];

function HeaderLogo() {
  return (
    <span className="inline-flex min-w-0 items-center gap-3 sm:gap-3.5">
      <Image
        alt="Curate My Stay"
        className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
        height={56}
        src="/logo.png"
        width={56}
      />
      <span className="min-w-0 whitespace-nowrap text-[15px] font-extrabold leading-none tracking-[-0.02em] text-[#222222] sm:text-[17px]">
        Curate My Stay
      </span>
    </span>
  );
}

function trackCalendarClick(ctaLocation: string) {
  trackDataLayerEvent("calendar_click", {
    cta_location: ctaLocation,
    destination_type: "calendly",
  });
  openCalendlyPopup();
}

export function PublicHeader({ analyticsLocation }: PublicHeaderProps = {}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const currentPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const bookingCtaLocation = analyticsLocation || "header";
  const primaryNavigationLinks = publicNavigationLinks.filter(
    (link) => link.desktopGroup === "primary",
  );
  const moreNavigationLinks = publicNavigationLinks.filter(
    (link) => link.desktopGroup === "more",
  );
  const moreIsActive = moreNavigationLinks.some((link) =>
    isActivePath(link.activePath),
  );

  function isActivePath(activePath?: string) {
    return Boolean(activePath && currentPath === activePath);
  }

  function handleMobileBookingClick() {
    setMenuOpen(false);
    window.requestAnimationFrame(() => trackCalendarClick(bookingCtaLocation));
  }

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setMoreOpen(false);
      moreTriggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnDesktop = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    closeOnDesktop();

    return () => window.removeEventListener("resize", closeOnDesktop);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid min-h-[68px] max-w-[1180px] grid-cols-[auto_auto] items-center justify-between gap-3 px-4 py-2.5 sm:min-h-[74px] sm:px-6 sm:py-3 md:px-8 xl:grid-cols-[auto_1fr_auto] xl:gap-6">
        <Link aria-label="Curate My Stay home" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2" href="/">
          <HeaderLogo />
        </Link>
        <nav aria-label="Primary public navigation" className="hidden items-center justify-center gap-1 xl:flex">
          {primaryNavigationLinks.map((link) => {
            const isActive = isActivePath(link.activePath);
            const LinkIcon = link.icon;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[14px] leading-5 tracking-[-0.01em] outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-[#fbf1ec] text-[#2f2a27]"
                    : link.emphasized
                      ? "font-semibold text-[#9e4347] hover:bg-[#fff4f0] hover:text-[#8c3c40]"
                      : "font-medium text-[#403d39] hover:bg-[#f7f3f0] hover:text-[#222222]"
                }`}
                href={link.href}
                key={link.href}
              >
                <LinkIcon aria-hidden="true" className="h-[17px] w-[17px] shrink-0 stroke-[2]" />
                {link.label}
              </Link>
            );
          })}
          <div className="relative" ref={moreMenuRef}>
            <button
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] leading-5 tracking-[-0.01em] outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 ${
                moreIsActive || moreOpen
                  ? "bg-[#fbf1ec] text-[#2f2a27]"
                  : "font-medium text-[#403d39] hover:bg-[#f7f3f0] hover:text-[#222222]"
              }`}
              onClick={() => setMoreOpen((current) => !current)}
              ref={moreTriggerRef}
              type="button"
            >
              More
              <ChevronDown
                aria-hidden="true"
                className={`h-[17px] w-[17px] shrink-0 stroke-[2] transition-transform ${moreOpen ? "rotate-180" : ""}`}
              />
            </button>
            {moreOpen ? (
              <div
                aria-label="More public navigation"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-56 overflow-hidden rounded-2xl border border-[#eadfd8] bg-white p-2 shadow-[0_16px_32px_rgba(0,0,0,0.14)]"
                role="menu"
              >
                {moreNavigationLinks.map((link) => {
                  const isActive = isActivePath(link.activePath);
                  const LinkIcon = link.icon;

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] leading-5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-inset ${
                        isActive
                          ? "bg-[#fbf1ec] font-semibold text-[#2f2a27]"
                          : link.emphasized
                            ? "font-semibold text-[#9e4347] hover:bg-[#fff4f0] hover:text-[#8c3c40]"
                            : "font-medium text-[#403d39] hover:bg-[#f7f3f0] hover:text-[#222222]"
                      }`}
                      href={link.href}
                      key={link.href}
                      onClick={() => setMoreOpen(false)}
                      role="menuitem"
                    >
                      <LinkIcon aria-hidden="true" className="h-[17px] w-[17px] shrink-0 stroke-[2]" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>
        <div className="hidden items-center justify-end gap-2 xl:flex">
          <Link
            className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-transparent px-3.5 py-2.5 text-center text-sm font-medium leading-[1.2] tracking-[-0.01em] whitespace-normal text-[#222222] transition-all duration-150 hover:bg-[#f7f7f7] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 sm:px-4"
            href="/login"
          >
            <CircleUser aria-hidden="true" className="h-[17px] w-[17px] shrink-0 stroke-[2]" /> Owner Portal
          </Link>
          <button
            className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[#ff5a5f] px-3.5 py-2.5 text-center text-sm font-semibold leading-[1.2] tracking-[-0.01em] whitespace-normal text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-150 hover:bg-[#e54b50] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4"
            onClick={() => trackCalendarClick(bookingCtaLocation)}
            type="button"
          >
            <CalendarDays aria-hidden="true" className="h-[17px] w-[17px] shrink-0 stroke-[2]" /> Book a Call
          </button>
        </div>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 xl:hidden ${menuOpen ? "border-[#ff9295] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#222222] hover:border-[#ffb1b3] hover:bg-[#fff8f8]"}`}
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen ? (
        <nav aria-label="Mobile public navigation" className="max-h-[calc(100vh-68px)] overflow-y-auto border-t border-[#ebebeb] bg-white/95 px-3 pb-4 pt-3 shadow-[0_16px_32px_rgba(0,0,0,0.12)] sm:px-6 xl:hidden" id="mobile-navigation">
          <div className="mx-auto max-w-[1180px]">
            <div className="ml-auto max-w-md overflow-hidden rounded-2xl border border-[#ebebeb] bg-[#fbf7f1] p-2 shadow-sm">
              <div className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9a7770]">Navigation</div>
              <div className="grid gap-1">
                {publicNavigationLinks.map((link) => {
                  const isActive = isActivePath(link.activePath);
                  const LinkIcon = link.icon;

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] leading-6 tracking-[-0.01em] outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-white text-[#2f2a27] shadow-sm"
                          : link.emphasized
                            ? "font-semibold text-[#9e4347] hover:bg-white hover:text-[#8c3c40]"
                            : "font-medium text-[#332c28] hover:bg-white hover:text-[#d63e43]"
                      }`}
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      <LinkIcon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 stroke-[2]" />
                      <span className="min-w-0 flex-1">{link.label}</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#b0a29d] transition group-hover:translate-x-0.5 group-hover:text-[#d63e43]" />
                    </Link>
                  );
                })}
              </div>
              <div className="my-2 h-px bg-[#eadfd8]" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dddddd] bg-white px-3 text-[15px] font-medium leading-6 tracking-[-0.01em] text-[#332c28] outline-none transition hover:border-[#ffb1b3] hover:bg-[#fff8f8] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                >
                  <CircleUser aria-hidden="true" className="h-[18px] w-[18px] shrink-0 stroke-[2]" /> Owner Portal
                </Link>
                <button
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a5f] px-3 text-[15px] font-semibold leading-6 tracking-[-0.01em] text-white shadow-sm outline-none transition hover:bg-[#e54b50] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
                  onClick={handleMobileBookingClick}
                  type="button"
                >
                  <CalendarDays aria-hidden="true" className="h-[18px] w-[18px] shrink-0 stroke-[2]" /> Book a Call
                </button>
              </div>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
