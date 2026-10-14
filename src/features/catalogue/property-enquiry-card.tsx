"use client";

import { ChevronDown, Phone } from "lucide-react";
import { useId } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { usePropertyEnquiry } from "@/src/features/catalogue/property-enquiry-context";
import { addOneDay, parseDateInputValue, toDateInputValue } from "@/src/features/catalogue/property-enquiry-message";
import { getPublicPhoneUrl } from "@/src/lib/public-whatsapp";

/**
 * Stay card for `/property/[slug]`, laid out from the `BookingWidget` of the
 * `Curate My Stay — Property Detail Page` screen in `reference/booking.html`.
 *
 * The reference's reserve/pay flow is replaced by CurateMyStay's real workflow:
 * the visitor picks dates and a guest count, and those selections only build a
 * WhatsApp message. Nothing is booked, reserved, charged, checked for
 * availability or written anywhere. The selections never leave the browser
 * until the visitor opens WhatsApp themselves.
 *
 * Props are display-ready strings prepared by the server page, so no private
 * operational field ever reaches this client component.
 */

type PropertyEnquiryCardProps = {
  acceptBookingRequests: boolean;
  bookingEnquiryNote: string | null;
  checkInLabel: string | null;
  checkOutLabel: string | null;
  maxGuests: number | null;
  priceLabel: string | null;
  priceNote: string | null;
};

/**
 * "2026-08-18" becomes "18 Aug", matching the compact reference field.
 * The WhatsApp message also includes the year.
 */
function formatFieldDate(dateInputValue: string) {
  const date = parseDateInputValue(dateInputValue);

  return date?.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) || null;
}

/**
 * One segment of the bordered date/guest control: small caps label above its
 * value, with a transparent native date input stretched across the whole cell.
 *
 * The input covers the cell so every click lands on it directly, but that alone
 * does not open the calendar: Chromium opens it only from the small picker
 * indicator in the input's shadow DOM, and clicking the rest of a date input
 * just focuses a segment to type into. The indicator is hidden here so there is
 * no invisible hot spot, and any click on the cell calls `showPicker()` instead.
 * Browsers without `showPicker` keep their own tap-to-open behaviour and the
 * input stays typeable by keyboard either way.
 */
function DateField({
  errorId,
  field,
  invalid,
  label,
  min,
  onChange,
  value,
}: {
  errorId?: string;
  field: "check-in" | "check-out";
  invalid: boolean;
  label: string;
  min: string;
  onChange: (value: string) => void;
  value: string;
}) {
  function openPicker(input: HTMLInputElement) {
    if (typeof input.showPicker !== "function") return;

    try {
      input.showPicker();
    } catch {
      // Thrown when the picker is already open or the click did not count as a
      // user gesture. Neither needs handling: the input still works natively.
    }
  }

  return (
    <label className="relative block cursor-pointer px-3.5 py-2.5 has-[input:focus-visible]:rounded-[11px] has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-inset has-[input:focus-visible]:ring-public-coral">
      <span className="block text-[10.5px] font-bold uppercase leading-[13px] tracking-[0.06em] text-public-ink">
        {label}
      </span>
      <span
        className={`mt-0.5 block truncate text-[14.5px] leading-[21px] ${value ? "text-public-ink" : "text-public-faint"}`}
      >
        {(value && formatFieldDate(value)) || "Add date"}
      </span>
      <input
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={invalid || undefined}
        aria-label={label}
        data-stay-date={field}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:hidden"
        min={min}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => openPicker(event.currentTarget)}
        type="date"
        value={value}
      />
    </label>
  );
}

/**
 * Guest picker shared by the stay card and the mobile date section; both read and write
 * the same enquiry context. Capacity only shapes the list and the message, so an
 * unconfigured `max_guests` falls back to a plain range rather than blocking.
 */
export function StayGuestSelect({ className = "", maxGuests }: { className?: string; maxGuests: number | null }) {
  const { guestCount, setGuestCount } = usePropertyEnquiry();
  const guestLimit = maxGuests && maxGuests > 0 ? maxGuests : 10;

  return (
    <label className={`relative block cursor-pointer px-3.5 py-2.5 has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-inset has-[select:focus-visible]:ring-public-coral ${className}`}>
      <span className="block text-[10.5px] font-bold uppercase leading-[13px] tracking-[0.06em] text-public-ink">
        Guests
      </span>
      <select
        className="mt-0.5 block w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[14.5px] leading-[21px] text-public-ink outline-none"
        onChange={(event) => setGuestCount(Number(event.target.value))}
        value={guestCount}
      >
        {Array.from({ length: guestLimit }, (_, index) => index + 1).map((count) => (
          <option key={count} value={count}>
            {`${count} ${count === 1 ? "guest" : "guests"}`}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3.5 h-4 w-4 text-public-muted" />
    </label>
  );
}

export function PropertyEnquiryCard({
  acceptBookingRequests,
  bookingEnquiryNote,
  checkInLabel,
  checkOutLabel,
  maxGuests,
  priceLabel,
  priceNote,
}: PropertyEnquiryCardProps) {
  const { checkIn: selectedCheckIn, checkOut: selectedCheckOut, error, setCheckIn, setCheckOut, whatsappUrl, handleWhatsAppClick } = usePropertyEnquiry();

  const today = toDateInputValue(new Date());
  const warningId = useId();
  const phoneHref = getPublicPhoneUrl();

  const stayTimeRows = [
    checkInLabel ? { label: "Check-in", value: checkInLabel } : null,
    checkOutLabel ? { label: "Check-out", value: checkOutLabel } : null,
  ].filter((row) => row !== null);

  return (
    <div className="scroll-mt-24 scroll-mb-[calc(100px+env(safe-area-inset-bottom))] rounded-[20px] border border-public-control bg-white p-5 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:p-6" data-stay-enquiry-card>
      {priceLabel ? (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 [overflow-wrap:anywhere]">
            <span className="text-[26px] font-extrabold leading-tight tracking-[-0.01em] text-public-ink">
              {priceLabel}
            </span>
            <span className="text-[15px] text-public-muted">per night</span>
          </div>
          {priceNote ? (
            <p className="mt-1.5 text-[13px] leading-5 text-public-muted">{priceNote}</p>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="text-[19px] font-bold leading-snug tracking-[-0.01em] text-public-ink">
            Ask us about this stay
          </div>
          {priceNote ? (
            <p className="mt-1.5 text-[13px] leading-5 text-public-muted">{priceNote}</p>
          ) : null}
        </div>
      )}

      {acceptBookingRequests && whatsappUrl ? (
        <>
          <div className="mt-4 rounded-xl border border-public-control">
            <div className="grid grid-cols-2">
              <div className="min-w-0 border-r border-public-control">
                <DateField
                  errorId={warningId}
                  field="check-in"
                  invalid={error?.field === "check-in"}
                  label="Check-in"
                  min={today}
                  onChange={setCheckIn}
                  value={selectedCheckIn}
                />
              </div>
              <div className="min-w-0">
                <DateField
                  errorId={warningId}
                  field="check-out"
                  invalid={error?.field === "check-out"}
                  label="Check-out"
                  min={selectedCheckIn ? addOneDay(selectedCheckIn) : addOneDay(today)}
                  onChange={setCheckOut}
                  value={selectedCheckOut}
                />
              </div>
            </div>
            <StayGuestSelect className="border-t border-public-control has-[select:focus-visible]:rounded-b-[11px]" maxGuests={maxGuests} />
          </div>

          <p aria-live="polite" className={error ? "mt-2 text-[13px] leading-5 text-public-error" : "sr-only"} id={warningId}>
            {error?.message || ""}
          </p>

          {bookingEnquiryNote ? (
            <p className="mt-4 whitespace-pre-line text-[13.5px] leading-6 text-public-body">
              {bookingEnquiryNote}
            </p>
          ) : null}

          <div className="mt-3.5 flex flex-col gap-2.5">
            {/*
              `app/globals.css` sets an unlayered `a { color: inherit }`, which
              outranks Tailwind's layered `text-*` utilities, so both CTAs carry
              their colour on an inner span. The icons follow via `currentColor`.
            */}
            <a
              aria-describedby={error ? warningId : undefined}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-whatsapp px-6 py-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none transition duration-150 hover:bg-whatsapp-hover focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 active:scale-[0.99]"
              href={whatsappUrl}
              onClick={(event) => handleWhatsAppClick(event, "property_page_enquiry_card")}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="inline-flex items-center gap-2 text-[17px] font-semibold leading-6 text-white">
                <FaWhatsapp aria-hidden="true" className="h-[19px] w-[19px] shrink-0" />
                Ask about this stay
              </span>
            </a>
            {phoneHref ? (
              <a
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-public-control bg-white px-6 py-3 text-center outline-none transition duration-150 hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 active:scale-[0.99]"
                href={phoneHref}
              >
                <span className="inline-flex items-center gap-2 text-[17px] font-semibold leading-6 text-public-ink">
                  <Phone aria-hidden="true" className="h-[19px] w-[19px] shrink-0" />
                  Call us
                </span>
              </a>
            ) : null}
          </div>

          <p className="mb-1 mt-3 text-center text-[13px] leading-5 text-public-muted">
            Nothing is booked or charged here. Our team will confirm availability with you.
          </p>
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-public-cream px-4 py-3.5 text-[13.5px] leading-6 text-public-body">
          Enquiries for this stay are currently paused.
        </p>
      )}

      {stayTimeRows.length > 0 ? (
        <div className="mt-4 flex flex-col gap-[9px] border-t border-public-hairline pt-3.5">
          {stayTimeRows.map((row) => (
            <div className="flex items-baseline justify-between gap-3" key={row.label}>
              <span className="text-[13px] text-public-muted">{row.label}</span>
              <span className="text-right text-[13px] font-semibold text-public-ink">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
