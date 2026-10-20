"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { StayGuestSelect } from "@/src/features/catalogue/property-enquiry-card";
import { usePropertyEnquiry } from "@/src/features/catalogue/property-enquiry-context";
import { countNights, parseDateInputValue, toDateInputValue } from "@/src/features/catalogue/property-enquiry-message";
import { cn } from "@/src/lib/utils/cn";

/**
 * Inline date section for `/property/[slug]` below `md`, in place of the stay card. It reads
 * and writes the same enquiry context as the sticky bar and the stay card, so a date picked
 * here shows in the bar at once and the bar's validation lands here (`data-stay-enquiry-card`).
 *
 * A small single-month calendar with plain `Date` maths: the project has no date library,
 * and the stay card's native date inputs cannot show an inline month. Past days are
 * disabled; the first tap picks check-in, the second check-out, and a tap on or before
 * check-in starts again from that day.
 */

export const STAY_DATES_SECTION_ID = "select-dates";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

/** "Today" is read on the client after hydration, so a server in another time zone cannot mismatch. */
function useToday() {
  return useSyncExternalStore(
    () => () => undefined,
    () => toDateInputValue(new Date()),
    () => "",
  );
}

function monthStart(base: string, offset: number) {
  const date = parseDateInputValue(base) ?? new Date();
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

/** Leading blanks (Sunday-first) then every day of the month, as `YYYY-MM-DD`. */
function monthCells(first: Date) {
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: days }, (_, index) => toDateInputValue(new Date(first.getFullYear(), first.getMonth(), index + 1))),
  ];
}

function longDate(value: string) {
  return parseDateInputValue(value)?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) ?? value;
}

export function PropertyMobileDatePicker({
  acceptBookingRequests,
  maxGuests,
}: {
  acceptBookingRequests: boolean;
  maxGuests: number | null;
}) {
  const { checkIn, checkOut, error, setCheckIn, setCheckOut } = usePropertyEnquiry();
  const today = useToday();
  const [monthOffset, setMonthOffset] = useState(0);
  const nights = countNights(checkIn, checkOut);
  const first = monthStart(today, monthOffset);
  const monthLabel = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const heading = !checkIn ? "Select check-in date" : !checkOut ? "Select check-out date" : nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Select your dates";
  const subline = checkIn && checkOut ? `${longDate(checkIn)} to ${longDate(checkOut)}` : checkIn ? `Check-in ${longDate(checkIn)}` : "Add your travel dates to ask about availability";

  function pick(day: string) {
    if (!checkIn || checkOut || day <= checkIn) {
      setCheckIn(day);
      setCheckOut("");
      return;
    }
    setCheckOut(day);
  }

  return (
    <section
      aria-labelledby="stay-dates-heading"
      className="scroll-mt-20"
      data-stay-enquiry-card
      id={STAY_DATES_SECTION_ID}
    >
      <h2 className="text-[21px] font-bold leading-tight tracking-[-0.01em] text-public-ink" id="stay-dates-heading">
        {heading}
      </h2>
      <p className="mt-1 text-[14.5px] text-public-muted">{subline}</p>
      {/* Kept near the top so the sticky bar never covers it after the bar scrolls here. */}
      <p aria-live="polite" className={error ? "mt-2 text-[13.5px] font-semibold leading-5 text-public-error" : "sr-only"} role="status">
        {error?.message || ""}
      </p>

      {acceptBookingRequests ? (
        <>
          <div className="mt-5" data-stay-focus tabIndex={-1}>
            <div className="mb-3 flex items-center justify-between">
              <button
                aria-label="Previous month"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral disabled:cursor-default disabled:opacity-30"
                disabled={monthOffset === 0}
                onClick={() => setMonthOffset((offset) => Math.max(0, offset - 1))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <p aria-live="polite" className="text-[15.5px] font-semibold text-public-ink">
                {today ? monthLabel : ""}
              </p>
              <button
                aria-label="Next month"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral disabled:cursor-default disabled:opacity-30"
                disabled={monthOffset >= 17}
                onClick={() => setMonthOffset((offset) => Math.min(17, offset + 1))}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div aria-hidden="true" className="grid grid-cols-7 text-center text-[12px] font-semibold text-public-muted">
              {weekdays.map((day, index) => (
                <span className="py-1.5" key={`${day}-${index}`}>
                  {day}
                </span>
              ))}
            </div>
            {/* A fixed six-row height keeps the page from jumping between months. */}
            <div className="grid min-h-[264px] grid-cols-7 content-start gap-y-1" role="group" aria-label={today ? `Dates in ${monthLabel}` : "Dates"}>
              {today
                ? monthCells(first).map((day, index) => {
                    if (!day) return <span key={`blank-${index}`} />;
                    const past = day < today;
                    const isStart = day === checkIn;
                    const isEnd = day === checkOut;
                    const inRange = Boolean(checkIn && checkOut && day > checkIn && day < checkOut);
                    const label = parseDateInputValue(day)?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

                    return (
                      <div className={cn("flex h-11 items-center justify-center", inRange && "bg-public-coral-soft", isStart && checkOut && "rounded-l-full bg-public-coral-soft", isEnd && "rounded-r-full bg-public-coral-soft")} key={day}>
                        <button
                          aria-label={`${label}${isStart ? ", check-in" : isEnd ? ", check-out" : ""}${past ? ", unavailable" : ""}`}
                          aria-pressed={isStart || isEnd}
                          className={cn(
                            "inline-flex h-11 w-11 items-center justify-center rounded-full text-[14.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-public-coral",
                            past ? "cursor-default text-public-faint line-through" : "text-public-ink hover:border hover:border-public-ink",
                            (isStart || isEnd) && "bg-public-coral font-semibold text-white hover:border-0",
                          )}
                          disabled={past}
                          onClick={() => pick(day)}
                          type="button"
                        >
                          {parseDateInputValue(day)?.getDate()}
                        </button>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              className="min-h-11 rounded-lg px-2 text-[14.5px] font-semibold text-public-ink underline underline-offset-4 outline-none hover:text-public-coral-hover focus-visible:ring-2 focus-visible:ring-public-coral disabled:cursor-default disabled:text-public-faint disabled:no-underline"
              disabled={!checkIn && !checkOut}
              onClick={() => {
                setCheckIn("");
                setCheckOut("");
              }}
              type="button"
            >
              Clear dates
            </button>
          </div>

          <StayGuestSelect className="mt-3 rounded-xl border border-public-control has-[select:focus-visible]:rounded-xl" maxGuests={maxGuests} />

          <p className="mt-3 text-[13px] leading-5 text-public-muted">
            Nothing is booked or charged here. Our team will confirm availability with you.
          </p>
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-public-cream px-4 py-3.5 text-[13.5px] leading-6 text-public-body">
          Enquiries for this stay are currently paused.
        </p>
      )}
    </section>
  );
}
