import { BookingHostProfile } from "@/components/home/booking-host-profile";
import { portfolioProof, propertyCaseStudies } from "@/components/home/case-studies-data";

/** Real guest reviews reused from the data that already backs /case-studies. */
const guestReviews = propertyCaseStudies.flatMap((study) =>
  study.reviews.map((review) => ({ ...review, stay: study.propertyLabel })),
);

export function BookingGuestReviews() {
  return (
    <section aria-labelledby="guest-reviews-title" className="bg-[#f5f1ea] [font-family:var(--font-homepage)]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-5 py-14 sm:px-8 lg:px-16 lg:py-24">
        <h2 id="guest-reviews-title" className="text-center text-3xl font-bold leading-tight tracking-tight text-[#1f1f1d] lg:text-[38px]">
          What guests are saying
        </h2>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e7e5df] bg-white lg:grid-cols-4">
          {portfolioProof.map((stat, index) => (
            <div
              className="flex min-w-0 flex-col items-center justify-center gap-2 border-[#e7e5df] px-3 py-5 text-center odd:border-r [&:nth-child(-n+2)]:border-b lg:py-7 lg:[&:not(:last-child)]:border-r lg:[&:nth-child(-n+2)]:border-b-0"
              key={stat.label}
            >
              {stat.value === "Superhost" ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdece8] px-3 py-1 text-[13px] font-semibold text-[#8f2c1c]">
                    <svg aria-hidden="true" className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {stat.value}
                  </span>
                  <p className="text-[13px] leading-5 text-[#5c5c57] lg:text-sm">
                    <span className="hidden lg:inline">Superhost for </span><span className="lg:hidden">For </span>{stat.label.replace(" running", "")}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-semibold leading-none text-[#1f1f1d] lg:text-[28px]">
                    {index === 0 ? (
                      <>
                        <svg aria-hidden="true" className="size-4 fill-current text-public-coral-ink" viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1Z" /></svg>
                        {stat.value.split(" / ")[0]}
                        <span className="self-end text-sm font-normal leading-5 text-[#5c5c57]">/ {stat.value.split(" / ")[1]}</span>
                      </>
                    ) : stat.value}
                  </div>
                  <p className="text-[13px] leading-5 text-[#5c5c57] lg:text-sm">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <BookingHostProfile />

        <div>
          <h3 id="recent-reviews-title" className="text-xl font-semibold text-[#1f1f1d] lg:text-[22px]">Recent reviews</h3>
          <div
            aria-labelledby="recent-reviews-title"
            className="-mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1f1d] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
            role="region"
            tabIndex={0}
          >
            {guestReviews.map((review, reviewIndex) => (
              <article
                className={`flex w-[300px] max-w-[calc(100vw-3rem)] shrink-0 snap-start flex-col rounded-2xl border border-[#e7e5df] bg-white p-5 lg:w-auto lg:max-w-none lg:p-7 ${[0, 3, 4].includes(reviewIndex) ? "" : "lg:hidden"}`}
                key={`${review.name}-${review.date}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div aria-hidden="true" className="flex gap-0.5 text-public-coral-ink">
                    {Array.from({ length: 5 }, (_, index) => (
                      <svg aria-hidden="true" className="size-3.5 fill-current" viewBox="0 0 24 24" key={index}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1Z" /></svg>
                    ))}
                  </div>
                  <span className="text-[13px] leading-5 text-[#5c5c57]">{review.date}</span>
                </div>
                <p className="mt-4 flex-grow text-base font-normal leading-relaxed text-[#3b3b37]">{review.excerpt}</p>
                <footer className="mt-5 flex items-center gap-3 border-t border-[#e7e5df] pt-4">
                  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fde8d8] text-[15px] font-semibold text-[#8a3b12]">
                    {review.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#2b2b28]">{review.name}</p>
                    <p className="text-[13px] leading-5 text-[#5c5c57]">{review.stay}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
          <p className="mt-2 text-center text-[13px] text-[#5c5c57] lg:hidden">Swipe to read more</p>
        </div>
      </div>
    </section>
  );
}
