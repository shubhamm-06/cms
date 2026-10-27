import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { portfolioProof, propertyCaseStudies } from "@/components/home/case-studies-data";

/**
 * Real guest reviews only, reused from the existing case-study data that already
 * backs /case-studies. No review text, name, date or rating is written here.
 */
const guestReviews = propertyCaseStudies.flatMap((study) =>
  study.reviews.map((review) => ({ ...review, stay: study.propertyLabel })),
);

export function BookingGuestReviews() {
  return (
    <section className="border-y border-[#ebebeb] bg-[#f7f7f7]">
      <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-[84px]">
        <h2 className="text-center text-[28px] font-extrabold tracking-[-0.02em] text-[#222222] sm:text-[32px] md:text-4xl">
          What guests are saying
        </h2>

        <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-10 lg:grid-cols-4">
          {portfolioProof.map((stat) => (
            <div className="min-w-0 text-center" key={stat.label}>
              <div className="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#222222] sm:text-[40px]">
                {stat.value}
              </div>
              <div className="mt-2 text-[13.5px] leading-5 text-[#717171] sm:text-[14.5px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-[22px] sm:mt-12 sm:columns-2 lg:columns-3">
          {guestReviews.map((review) => (
            <article
              className="mb-[22px] break-inside-avoid rounded-2xl border border-[#ebebeb] bg-white p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              key={`${review.name}-${review.date}`}
            >
              <span aria-hidden="true" className="block text-[34px] font-extrabold leading-none text-[#ff5a5f]">
                &ldquo;
              </span>
              <p className="mt-1.5 text-[15.5px] italic leading-[1.6] text-[#222222]">
                {review.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e98363] via-[#e1914f] to-[#e9aa4b] text-[15px] font-bold text-white"
                >
                  {review.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <div className="text-[14.5px] font-bold text-[#222222]">{review.name}</div>
                  <div className="text-[13px] leading-5 text-[#717171]">
                    {review.stay} · {review.date}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dddddd] bg-white px-5 py-3 text-[15px] font-semibold text-[#222222] outline-none transition hover:border-[#b0b0b0] hover:bg-[#fbf7f1] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
            href="/case-studies"
          >
            Read all reviews
            <ArrowRight aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
