"use client";

import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";

/**
 * "About this stay": the tagline, then the description clamped to five lines,
 * with "Show more" opening the full text in the shared dialog.
 *
 * The button appears only when the text is really clamped. That can only be
 * measured in the browser, so the server render guesses from the text length
 * (the guess is right for most listings) and a layout effect corrects it before
 * paint, which keeps layout shift to the rare wrong guess.
 */

const likelyClampedLength = 320;

export function PropertyAbout({
  heading,
  paragraphs,
  tagline,
}: {
  heading: string;
  /** Description blocks in reading order; each keeps its own line breaks. */
  paragraphs: string[];
  tagline: string | null;
}) {
  const body = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState(() => paragraphs.join("\n\n").length > likelyClampedLength);

  useLayoutEffect(() => {
    const element = body.current;
    if (!element) return;

    const measure = () => setClamped(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-[21px] font-bold leading-tight tracking-[-0.01em] text-public-ink sm:text-[23px]">{heading}</h2>
      {tagline ? (
        <p className="mb-3.5 text-[16.5px] font-semibold leading-[1.6] text-public-ink sm:text-[17.5px]">{tagline}</p>
      ) : null}
      {paragraphs.length > 0 ? (
        <div
          className="line-clamp-5 whitespace-pre-line text-[15.5px] leading-[1.7] text-public-body sm:text-base"
          ref={body}
        >
          {paragraphs.join("\n\n")}
        </div>
      ) : null}
      {clamped ? (
        <ShowMoreDialog
          title={heading}
          trigger={
            <button
              className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg text-[15px] font-semibold text-public-ink underline underline-offset-4 outline-none hover:text-public-coral-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
              type="button"
            >
              Show more
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          }
        >
          {tagline ? (
            <p className="mb-4 text-[17px] font-semibold leading-[1.6] text-public-ink">{tagline}</p>
          ) : null}
          <div className="grid gap-4">
            {/* Blank lines inside a field are paragraph breaks; single line breaks are kept. */}
            {paragraphs.flatMap((text) => text.split(/\n\s*\n/)).map((paragraph) => (
              <p className="whitespace-pre-line text-[15.5px] leading-[1.7] text-public-body sm:text-base" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </ShowMoreDialog>
      ) : null}
    </section>
  );
}
