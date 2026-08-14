import Image from "next/image";

/**
 * Public `/booking` hero, built from the hero of the `Curate My Stay` booking
 * screen in `reference/booking.html`.
 *
 * Layout: the copy is positioned at a percentage of the hero's own height, so
 * it keeps landing in the upper third at every hero height instead of drifting
 * down as the section grows. Percentage `top` on an absolutely positioned child
 * resolves against the containing block's height, which percentage padding does
 * not, so this is the one property that scales with the photograph.
 *
 * Sharpness: the photograph fills the viewport width, so `sizes="100vw"` lets
 * the browser request a source at least as wide as the screen. That only helps
 * when the file behind it is actually that large - see `heroFallbackImage`.
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
  imageAlt,
  imageUrl,
}: {
  imageAlt?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative h-[480px] w-full overflow-hidden sm:h-[560px] lg:h-[680px] xl:h-[720px]">
      <Image
        alt={imageAlt || heroFallbackAlt}
        className="object-cover"
        fill
        preload
        quality={85}
        sizes="100vw"
        src={imageUrl || heroFallbackImage}
      />
      {/*
        Directional scrim from the reference: darkest behind the left-aligned
        copy, close to clear across the open right-hand side so the pool colour
        and the planting keep their detail.
      */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,12,8,0.66)_0%,rgba(20,12,8,0.28)_45%,rgba(20,12,8,0.40)_100%)]" />

      <div className="absolute inset-x-0 top-[30%] lg:top-[32%]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 md:px-8">
          <div className="max-w-[720px]">
            <h1 className="text-[34px] font-extrabold leading-[1.04] tracking-[-0.025em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-[46px] lg:text-[60px] xl:text-[64px]">
              Stay in Goa. Properly.
            </h1>
            <p className="mt-4 max-w-[700px] text-[16.5px] leading-[1.5] text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.32)] sm:mt-5 sm:text-[19px] lg:text-[22px]">
              A small, hand-picked portfolio of villas, apartments and holiday homes, fully managed
              by CurateMyStay.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
