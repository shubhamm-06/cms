"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export type FaqAccordionItem = {
  answer: string;
  question: string;
};

export function FaqAccordion({
  className = "",
  faqs,
  idPrefix = "faq",
}: {
  className?: string;
  faqs: ReadonlyArray<FaqAccordionItem>;
  idPrefix?: string;
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className={`mx-auto grid max-w-[860px] gap-4 ${className}`}>
      {faqs.map((faq, index) => {
        const isOpen = openFaqIndex === index;
        const answerId = `${idPrefix}-answer-${index}`;

        return (
          <article
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors motion-reduce:transition-none ${isOpen ? "border-[#ff9295]" : "border-[#ebebeb]"}`}
            key={faq.question}
          >
            <button
              aria-controls={answerId}
              aria-expanded={isOpen}
              className="flex min-h-14 w-full min-w-0 items-center gap-3 px-4 py-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 motion-reduce:transition-none sm:gap-4 sm:px-5 sm:py-5"
              onClick={() => setOpenFaqIndex((current) => (current === index ? -1 : index))}
              type="button"
            >
              <span className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-6 text-[#222222] sm:text-base">
                {faq.question}
              </span>
              <span
                aria-hidden="true"
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition duration-300 motion-reduce:transition-none ${isOpen ? "rotate-180 bg-[#ff5a5f] text-white" : "bg-[#f7f7f7] text-[#484848]"}`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            <div
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              id={answerId}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm leading-6 text-[#484848] sm:px-5 sm:pb-5">
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
