"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroCarouselSlide = {
  alt: string;
  src: string;
};

type HeroCarouselProps = {
  ariaLabel: string;
  className: string;
  imageClassName?: string;
  overlay?: boolean;
  sizes: string;
  slides: HeroCarouselSlide[];
};

export function HeroCarousel({
  ariaLabel,
  className,
  imageClassName = "",
  overlay = false,
  sizes,
  slides,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, slides.length]);

  return (
    <div
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      className={className}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onMouseOver={() => setPaused(true)}
      role="region"
    >
      {slides.map((slide, slideIndex) => (
        <div
          aria-label={`${slideIndex + 1} of ${slides.length}`}
          aria-roledescription="slide"
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${slideIndex === index ? "opacity-100" : "opacity-0"}`}
          key={slide.src}
          role="group"
        >
          <Image
            alt={slide.alt}
            className={`object-cover ${imageClassName}`}
            fill
            loading={slideIndex === 0 ? undefined : "lazy"}
            priority={slideIndex === 0}
            sizes={sizes}
            src={slide.src}
          />
        </div>
      ))}
      {overlay ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" /> : null}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, slideIndex) => (
          <button
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={slideIndex === index ? "true" : undefined}
            className={`h-2 rounded-full border-0 bg-white p-0 transition-all duration-300 ${slideIndex === index ? "w-5 opacity-100" : "w-2 opacity-50"}`}
            key={slide.src}
            onClick={() => setIndex(slideIndex)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
