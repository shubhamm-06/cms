"use client";

import { useState } from "react";
import { faqs } from "@/src/features/corporate-offsite/stay-options-copy";

export function CorporateOffsiteFaqAccordion() {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set([0]));

  function toggleItem(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="border-t border-black/10">
      {faqs.map((faq, index) => {
        const isOpen = openItems.has(index);
        const answerId = `corporate-offsite-faq-answer-${index + 1}`;

        return (
          <article className="border-b border-black/10" key={faq.question}>
            <h3>
              <button
                aria-controls={answerId}
                aria-expanded={isOpen}
                className="group flex w-full items-center gap-4 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-4"
                onClick={() => toggleItem(index)}
                type="button"
              >
                <span className="min-w-0 flex-1 break-words text-[18px] font-extrabold leading-6 text-public-ink transition-colors group-hover:text-public-muted sm:text-xl motion-reduce:transition-none">
                  {faq.question}
                </span>
                <svg aria-hidden="true" className="h-5 w-5 shrink-0 overflow-visible text-public-coral" fill="none" viewBox="0 0 20 20">
                  <path d="M4 10h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                  <path
                    className={`origin-center transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-90 opacity-0" : ""}`}
                    d="M10 4v12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </h3>
            <div
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:duration-0 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              id={answerId}
            >
              <div className="overflow-hidden">
                <p className="max-w-[640px] pb-6 pr-10 text-base leading-[26px] text-public-muted">
                  {faq.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
