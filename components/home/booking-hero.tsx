import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Public `/booking` hero, built from the hero of the `Curate My Stay` booking
 * screen in `reference/booking.html`.
 *
 * The photograph and copy are intentionally kept in this small presentational
 * component. The interactive search panel is supplied by the catalogue client
 * component so its existing filter state stays in one place.
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

export function BookingHero({
  children,
  imageAlt,
  imageUrl,
}: {
  children: ReactNode;
  imageAlt?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative mx-4 overflow-hidden rounded-[26px] sm:mx-6 md:mx-8 lg:mx-7 lg:min-h-[600px] xl:min-h-[620px]">
      <Image
        alt={imageAlt || heroFallbackAlt}
        className="object-cover object-[center_58%]"
        fill
        preload
        quality={85}
        sizes="(max-width: 768px) 100vw, 1440px"
        src={imageUrl || heroFallbackImage}
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(18,12,9,0.72)_0%,rgba(18,12,9,0.42)_48%,rgba(18,12,9,0.56)_100%)]" />

      <div className="relative z-10 mx-auto grid min-h-[680px] w-full max-w-[1240px] items-center gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_minmax(350px,420px)] lg:gap-14 lg:px-12 lg:py-14 xl:px-16">
        <div className="max-w-[620px] self-center">
          <h1 className="max-w-[12ch] text-balance text-[42px] font-extrabold leading-[0.98] tracking-[-0.04em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-[54px] lg:text-[64px] xl:text-[68px]">
            Stay in Goa. Properly.
          </h1>
          <p className="mt-5 max-w-[31rem] text-pretty text-[17px] leading-[1.5] text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.32)] sm:text-[19px] lg:mt-6">
            Hand-picked villas and apartments, personally managed by our team.
          </p>
        </div>
        <div className="w-full self-center">{children}</div>
      </div>
    </section>
  );
}
