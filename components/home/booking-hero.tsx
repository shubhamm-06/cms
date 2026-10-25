import Image from "next/image";
import type { ReactNode } from "react";

const heroFallbackImage = "/homepage/varca-2.jpg";
const heroFallbackAlt = "A pool at a CurateMyStay-managed property in Goa";

/** The catalogue supplies its existing search controls and published cover photo. */
export function BookingHero({ children, imageAlt, imageUrl }: {
  children: ReactNode;
  imageAlt?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative mx-auto h-[520px] w-[calc(100%-2rem)] max-w-[1408px] overflow-hidden rounded-3xl lg:h-[640px] lg:w-[calc(100%-4rem)]">
      <Image alt={imageAlt || heroFallbackAlt} className="object-cover object-[center_58%]" fill preload quality={85} sizes="(min-width: 1472px) 1408px, (min-width: 1024px) calc(100vw - 64px), calc(100vw - 32px)" src={imageUrl || heroFallbackImage} />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative flex h-full flex-col justify-center px-6 py-8 lg:px-14 lg:py-12">
        <h1 className="text-[46px] font-bold leading-[1.02] tracking-tight text-white lg:text-[68px]">
          Stay in Goa.<br />Properly.
        </h1>
        <p className="mt-5 max-w-[400px] text-base leading-relaxed text-white lg:text-[17px]">
          Hand-picked villas and apartments, personally managed by our team.
        </p>
        <div className="mt-7 w-full max-w-[760px]">{children}</div>
      </div>
    </section>
  );
}
