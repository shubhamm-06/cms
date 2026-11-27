import { BadgeCheck, FileText, MessageCircle, Wallet, type LucideIcon } from "lucide-react";
import { CorporateOffsiteQuoteButton } from "@/components/home/corporate-offsite-quote-button";
import { howToBook, type BookingStepIcon } from "@/src/features/corporate-offsite/stay-options-copy";
import { getPublicPhoneDisplay } from "@/src/lib/public-whatsapp";

const icons: Record<BookingStepIcon, LucideIcon> = {
  confirm: BadgeCheck,
  invoice: FileText,
  message: MessageCircle,
  pay: Wallet,
};

/**
 * Dotted line and chevron in the gap after a card, level with the centre of its icon tile and 8px
 * clear of both cards. Offsets are measured from inside the card's 1px border, so `44px` and `52px`
 * are the tile's centre (padding plus half the 48px tile) and `100% + 9px` is 8px past the card.
 * Below `lg` it points down through the 32px gap; from `lg` it points right through the 40px gap.
 * Dots are 3px, 8px apart.
 */
function StepConnector() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-[44px] top-[calc(100%+9px)] flex h-4 w-2 -translate-x-1/2 flex-col items-center lg:left-[calc(100%+9px)] lg:top-[52px] lg:h-2 lg:w-6 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-row"
      data-step-connector
    >
      <span className="w-[3px] flex-1 bg-[radial-gradient(circle_at_50%_1.5px,var(--color-public-coral)_1.5px,transparent_1.6px)] bg-[length:3px_8px] bg-repeat-y opacity-60 lg:h-[3px] lg:w-auto lg:bg-[radial-gradient(circle_at_1.5px_50%,var(--color-public-coral)_1.5px,transparent_1.6px)] lg:bg-[length:8px_3px] lg:bg-repeat-x" />
      <svg className="h-[5px] w-2 shrink-0 fill-none stroke-public-coral lg:hidden" viewBox="0 0 8 5">
        <path d="M0.5 0.5 4 4.5 7.5 0.5" />
      </svg>
      <svg className="hidden h-2 w-[5px] shrink-0 fill-none stroke-public-coral lg:block" viewBox="0 0 5 8">
        <path d="M0.5 0.5 4.5 4 0.5 7.5" />
      </svg>
    </span>
  );
}

/**
 * Section 4 of `/corporate-offsite-villas-goa`: four booking step cards, in order, and the quote
 * button. Below `lg` the cards are one column of horizontal cards; from `lg` they are one row.
 * A dotted connector after every card but the last shows the sequence.
 */
export function CorporateOffsiteHowToBook() {
  const phone = getPublicPhoneDisplay();

  return (
    <section aria-labelledby="how-to-book-heading" className="bg-background py-16 text-public-ink lg:py-24">
      {/* Same width and side padding as section 2. */}
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <div className="text-center">
          <h2 className="text-balance text-[30px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]" id="how-to-book-heading">
            {howToBook.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-[760px] text-balance text-[19px] leading-7 text-public-muted">{howToBook.subline}</p>
        </div>

        {/* `auto-rows-fr` keeps every card the same height, including across rows. */}
        <ol className="mt-12 grid auto-rows-fr gap-8 lg:grid-cols-4 lg:gap-10">
          {howToBook.steps.map((step, index) => {
            const Icon = icons[step.icon];

            return (
              <li className="relative flex min-w-0 items-start gap-4 rounded-2xl border border-black/8 bg-white p-5 lg:flex-col lg:gap-0 lg:p-7" key={step.title}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-public-coral/10">
                  <Icon aria-hidden="true" className="h-6 w-6 text-public-coral" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 lg:mt-5">
                  <h3 className="text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-base leading-6 text-public-muted">{step.line}</p>
                </div>
                {index < howToBook.steps.length - 1 ? <StepConnector /> : null}
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-col items-center">
          <CorporateOffsiteQuoteButton optionId="how-to-book" />
          {phone ? <p className="mt-3 text-sm leading-6 text-public-muted">{`${howToBook.phoneLabel} ${phone}`}</p> : null}
        </div>
      </div>
    </section>
  );
}
