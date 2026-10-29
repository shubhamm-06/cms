"use client";

import Image from "next/image";
import { useSyncExternalStore, type MouseEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { buildGuestHeaderWhatsAppMessage } from "@/src/features/catalogue/guest-whatsapp-message";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

/**
 * Public `/booking` hero, built from the hero of the `Curate My Stay` booking
 * screen in `reference/booking.html`.
 *
 * Left: heading, copy, the two CTAs and one trust line. Right (from `lg` only):
 * the self-contained WhatsApp booking animation in `public/cms-whatsapp-demo/`,
 * which draws its own phone frame and scales it to fit the iframe (500:1024).
 *
 * From `lg` the card is sized to the viewport: 100svh minus the 73px sticky header,
 * the 28px top margin on the page wrapper and a 20px bottom gap, clamped to
 * 560-900px. The phone is sized by height to the card minus 40px above and below
 * (the same clamp less 80px) and sits flush with the content container's right
 * edge.
 *
 * Below `lg` the card is photo-first: it fills the first screen under the 65px
 * header (24px top margin, 16px bottom gap), the text block sits at its bottom on
 * a transparent-to-black gradient instead of the desktop scrim, and there is no
 * phone. `BookingWhatsAppDemo` shows the phone in its own card under the hero.
 *
 * Only one embed is ever mounted: Chrome does not lazy-load a `display:none`
 * iframe, so CSS hiding alone would load both on every device. Each iframe renders
 * after hydration, at its own breakpoint, inside a box already sized by CSS so the
 * layout does not shift. The unlayered `a { color: inherit }` in `app/globals.css`
 * outranks Tailwind's `text-*`, so link colours sit on inner spans.
 */

/**
 * Hero photograph used until the catalogue has published properties. Once it
 * does, the first ordered property's cover image takes over. Swap this constant
 * for a different existing local image if the brand photography changes.
 *
 * `reference/booking.html` uses `IMG_0600.jpg` here, but every `public/homepage/
 * IMG_*.jpg` file in this repository is a 600x450 web thumbnail. Stretched over
 * a 1440-1920px hero that is a 2.4-3.2x upscale, which is what made the hero
 * look pixelated. `varca-2.jpg` is a 5712x4284 original of the same subject, so
 * it stays sharp at 1920px and on high-DPI screens. Replace it only with
 * another original at a similar resolution, never with a resized copy.
 */
const heroFallbackImage = "/homepage/varca-2.jpg";
const heroFallbackAlt = "A pool at a CurateMyStay-managed property in Goa";

/** Id of the property listing section that "Check out properties" scrolls to. */
export const bookingStaysSectionId = "stays";

const ctaButton =
  "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 outline-none transition lg:w-auto active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b1715]";

const desktopQuery = "(min-width: 64rem)"; // Tailwind `lg`

function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** `true` from `lg`, `false` below it, `null` during server render and hydration. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => null,
  );
}

function WhatsAppDemoFrame() {
  return (
    <iframe
      aria-hidden="true"
      className="pointer-events-none block h-full w-full border-0 bg-transparent"
      loading="lazy"
      src="/cms-whatsapp-demo/index.html"
      tabIndex={-1}
      title="How booking on WhatsApp works"
    />
  );
}

function scrollToStays(event: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(bookingStaysSectionId);
  if (!target) return;

  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  window.history.replaceState(null, "", `#${bookingStaysSectionId}`);
}

export function BookingHero({
  imageAlt,
  imageUrl,
}: {
  imageAlt?: string | null;
  imageUrl?: string | null;
}) {
  const whatsappUrl = getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage());
  const isDesktop = useIsDesktop();

  return (
    <section
      className="relative mx-4 flex min-h-[calc(100svh-105px)] flex-col overflow-hidden rounded-[26px] sm:mx-6 md:mx-8 lg:mx-7 lg:h-[calc(100svh-121px)] lg:max-h-[900px] lg:min-h-[560px]"
      data-hides-floating-whatsapp
    >
      <Image
        alt={imageAlt || heroFallbackAlt}
        className="object-cover object-[45%_center] lg:object-[center_58%]"
        fill
        preload
        quality={85}
        sizes="(max-width: 768px) 100vw, 1440px"
        src={imageUrl || heroFallbackImage}
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent from-35% to-black/70 lg:hidden" />
      <div className="absolute inset-0 hidden bg-[linear-gradient(110deg,rgba(18,12,9,0.72)_0%,rgba(18,12,9,0.42)_48%,rgba(18,12,9,0.56)_100%)] lg:block" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-end px-5 pb-6 pt-16 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:justify-normal lg:gap-14 lg:px-12 lg:py-10 xl:px-16">
        <div className="max-w-[620px] lg:self-center">
          <h1 className="max-w-[12ch] text-balance text-[44px] font-extrabold leading-[0.98] tracking-[-0.04em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] lg:text-[64px] xl:text-[68px]">
            <span className="block lg:inline">Stay in Goa.</span> Properly.
          </h1>
          <p className="mt-3 max-w-[31rem] text-pretty text-[17px] leading-[1.5] text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.32)] sm:text-[19px] lg:mt-6">
            Hand-picked villas and apartments, personally managed by our team.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 lg:mt-8 lg:flex-row lg:flex-wrap lg:gap-3">
            <a
              className={`${ctaButton} bg-public-coral shadow-[0_8px_20px_rgba(255,90,95,0.25)] hover:bg-public-coral-hover`}
              href={`#${bookingStaysSectionId}`}
              onClick={scrollToStays}
            >
              <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-bold text-white">
                Check out properties
                <ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
            </a>
            {whatsappUrl ? (
              <a
                className={`${ctaButton} bg-white hover:bg-[#f7f7f7]`}
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("booking_hero")}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-public-ink">
                  <FaWhatsapp aria-hidden="true" className="h-5 w-5 text-[#25D366]" />
                  Chat on WhatsApp
                </span>
              </a>
            ) : null}
          </div>

          <p className="mt-4 flex items-center justify-center gap-2.5 text-[16px] font-medium text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.32)] sm:text-[17px] lg:mt-6 lg:justify-start">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <Check aria-hidden="true" className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </span>
            Better rate than Airbnb
          </p>
        </div>

        <div className="hidden lg:flex lg:justify-end lg:self-center">
          <div className="aspect-[500/1024] h-[clamp(480px,calc(100svh-201px),820px)] shrink-0">
            {isDesktop ? <WhatsAppDemoFrame /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Below `lg` only: the WhatsApp booking animation in its own warm card straight
 * after the hero, with the hero's horizontal margins. The embed starts when it
 * scrolls into view. Marked `data-hides-floating-whatsapp` so the floating button
 * never covers the phone on small screens.
 */
export function BookingWhatsAppDemo() {
  const isDesktop = useIsDesktop();

  return (
    <section
      className="mx-4 mt-4 rounded-[26px] bg-public-cream px-5 pb-7 pt-9 text-center sm:mx-6 md:mx-8 lg:hidden"
      data-hides-floating-whatsapp
    >
      <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-public-ink">
        Book in one WhatsApp chat
      </h2>
      <p className="mt-2 text-[15px] leading-6 text-public-muted">
        Send your dates, get a direct price, pay by UPI. Done.
      </p>
      <div className="mx-auto mt-[22px] aspect-[500/1024] w-[min(78vw,300px)] md:w-[320px]">
        {isDesktop === false ? <WhatsAppDemoFrame /> : null}
      </div>
    </section>
  );
}
