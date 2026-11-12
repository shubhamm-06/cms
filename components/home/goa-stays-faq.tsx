import { ChevronDown } from "lucide-react";
import { goaStaysCopy } from "@/src/features/goa-stays/goa-stays-copy";

const { faq } = goaStaysCopy;
const midpoint = Math.ceil(faq.items.length / 2);
const columns = [faq.items.slice(0, midpoint), faq.items.slice(midpoint)];

export function GoaStaysFaq() {
  return (
    <section className="scroll-mt-20 bg-public-cream lg:scroll-mt-24" id="faq">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-public-coral">{faq.eyebrow}</p>
          <h2 className="mt-4 text-balance text-[28px] font-extrabold leading-[1.12] text-public-ink sm:text-4xl md:text-[44px] md:leading-[1.08]">{faq.heading}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-public-muted sm:text-[18px] sm:leading-[1.6]">{faq.lead}</p>
        </div>
        <div className="mt-12 grid items-start gap-4 lg:grid-cols-2">
          {columns.map((column, columnIndex) => (
            <div className="grid gap-4" key={columnIndex}>
              {column.map((item) => (
                <details className="group overflow-hidden rounded-2xl border border-public-hairline bg-white shadow-sm transition-colors open:border-public-coral/60 motion-reduce:transition-none" key={item.question}>
                  <summary className="flex min-h-14 items-center gap-3 px-4 py-4 text-left marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 sm:gap-4 sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-6 text-public-ink sm:text-base">{item.question}</span>
                    <span
                      aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-public-hover text-public-body transition duration-300 group-open:rotate-180 group-open:bg-public-coral group-open:text-white motion-reduce:transition-none"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-6 text-public-body sm:px-5 sm:pb-5">{item.answer}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
