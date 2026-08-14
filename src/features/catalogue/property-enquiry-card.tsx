"use client";

import { ChevronDown, Phone } from "lucide-react";
import { useId, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicPhoneUrl, getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

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
  propertyName: string;
  propertyUrl: string;
};

/** `YYYY-MM-DD` in the visitor's own timezone, which is what `<input type="date">` expects. */
function toDateInputValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function addOneDay(dateInputValue: string) {
  const date = new Date(`${dateInputValue}T00:00:00`);
  date.setDate(date.getDate() + 1);

  return toDateInputValue(date);
}

function parseDateInputValue(dateInputValue: string) {
  const date = new Date(`${dateInputValue}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * "2026-08-18" becomes "18 Aug", matching the reference field. The long form is
 * reserved for the WhatsApp message, because the full month name overflows the
 * half-width field on a 320px screen.
 */
function formatFieldDate(dateInputValue: string) {
  const date = parseDateInputValue(dateInputValue);

  return date?.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) || null;
}

/** "2026-08-18" becomes "18 August 2026"; anything unparseable becomes null. */
function formatEnquiryDate(dateInputValue: string) {
  const date = parseDateInputValue(dateInputValue);

  return (
    date?.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) || null
  );
}

function buildWhatsAppMessage({
  checkIn,
  checkOut,
  guestCount,
  propertyName,
  propertyUrl,
}: {
  checkIn: string | null;
  checkOut: string | null;
  guestCount: number;
  propertyName: string;
  propertyUrl: string;
}) {
  const opening = `Hi CurateMyStay! I'm interested in staying at ${propertyName}.`;

  // Without both dates there is nothing useful to quote, so the message stays
  // short rather than carrying an empty or half-filled date block.
  if (!checkIn || !checkOut) {
    return `${opening}\n\nCould you please share availability and rates?\n\nProperty: ${propertyUrl}\n\nThanks!`;
  }

  return [
    opening,
    "",
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guestCount}`,
    "",
    "Could you please confirm availability for these dates and share the final rate?",
    "",
    `Property: ${propertyUrl}`,
    "",
    "Thanks!",
  ].join("\n");
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
  label,
  min,
  onChange,
  value,
}: {
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
    <label className="relative block cursor-pointer px-3.5 py-2.5 has-[input:focus-visible]:rounded-[11px] has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-inset has-[input:focus-visible]:ring-[#ff5a5f]">
      <span className="block text-[10.5px] font-bold uppercase leading-[13px] tracking-[0.06em] text-[#222222]">
        {label}
      </span>
      <span
        className={`mt-0.5 block truncate text-[14.5px] leading-[21px] ${value ? "text-[#222222]" : "text-[#b0b0b0]"}`}
      >
        {(value && formatFieldDate(value)) || "Add date"}
      </span>
      <input
        aria-label={label}
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

export function PropertyEnquiryCard({
  acceptBookingRequests,
  bookingEnquiryNote,
  checkInLabel,
  checkOutLabel,
  maxGuests,
  priceLabel,
  priceNote,
  propertyName,
  propertyUrl,
}: PropertyEnquiryCardProps) {
  // Capacity only shapes the guest dropdown and the enquiry message, so an
  // unconfigured `max_guests` falls back to a plain range rather than blocking.
  const guestLimit = maxGuests && maxGuests > 0 ? maxGuests : 10;

  const [selectedCheckIn, setSelectedCheckIn] = useState("");
  const [selectedCheckOut, setSelectedCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(Math.min(2, guestLimit));
  const [showDateWarning, setShowDateWarning] = useState(false);

  const today = toDateInputValue(new Date());
  const warningId = useId();
  const hasBothDates = Boolean(selectedCheckIn && selectedCheckOut);

  const whatsappUrl = getPublicWhatsAppUrl(
    buildWhatsAppMessage({
      checkIn: selectedCheckIn ? formatEnquiryDate(selectedCheckIn) : null,
      checkOut: selectedCheckOut ? formatEnquiryDate(selectedCheckOut) : null,
      guestCount,
      propertyName,
      propertyUrl,
    }),
  );
  const phoneHref = getPublicPhoneUrl();

  function handleCheckInChange(value: string) {
    setSelectedCheckIn(value);
    setShowDateWarning(false);
    // A check-out on or before the new check-in is no longer a valid stay.
    if (selectedCheckOut && selectedCheckOut <= value) setSelectedCheckOut("");
  }

  function handleWhatsAppClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasBothDates) {
      event.preventDefault();
      setShowDateWarning(true);
      return;
    }

    trackWhatsAppClick("property_page_enquiry_card");
  }

  const stayTimeRows = [
    checkInLabel ? { label: "Check-in", value: checkInLabel } : null,
    checkOutLabel ? { label: "Check-out", value: checkOutLabel } : null,
  ].filter((row) => row !== null);

  return (
    <div className="rounded-[20px] border border-[#dddddd] bg-white p-5 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:p-6">
      {priceLabel ? (
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2 [overflow-wrap:anywhere]">
            <span className="text-[26px] font-extrabold leading-tight tracking-[-0.01em] text-[#222222]">
              {priceLabel}
            </span>
            <span className="text-[15px] text-[#717171]">per night</span>
          </div>
          {priceNote ? (
            <p className="mt-1.5 text-[13px] leading-5 text-[#717171]">{priceNote}</p>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="text-[19px] font-bold leading-snug tracking-[-0.01em] text-[#222222]">
            Ask us about this stay
          </div>
          {priceNote ? (
            <p className="mt-1.5 text-[13px] leading-5 text-[#717171]">{priceNote}</p>
          ) : null}
        </div>
      )}

      {acceptBookingRequests && whatsappUrl ? (
        <>
          <div className="mt-4 rounded-xl border border-[#dddddd]">
            <div className="grid grid-cols-2">
              <div className="min-w-0 border-r border-[#dddddd]">
                <DateField
                  label="Check-in"
                  min={today}
                  onChange={handleCheckInChange}
                  value={selectedCheckIn}
                />
              </div>
              <div className="min-w-0">
                <DateField
                  label="Check-out"
                  min={selectedCheckIn ? addOneDay(selectedCheckIn) : addOneDay(today)}
                  onChange={(value) => {
                    setSelectedCheckOut(value);
                    setShowDateWarning(false);
                  }}
                  value={selectedCheckOut}
                />
              </div>
            </div>
            <label className="relative block cursor-pointer border-t border-[#dddddd] px-3.5 py-2.5 has-[select:focus-visible]:rounded-b-[11px] has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-inset has-[select:focus-visible]:ring-[#ff5a5f]">
              <span className="block text-[10.5px] font-bold uppercase leading-[13px] tracking-[0.06em] text-[#222222]">
                Guests
              </span>
              <select
                className="mt-0.5 block w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-[14.5px] leading-[21px] text-[#222222] outline-none"
                onChange={(event) => setGuestCount(Number(event.target.value))}
                value={guestCount}
              >
                {Array.from({ length: guestLimit }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {`${count} ${count === 1 ? "guest" : "guests"}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute bottom-3 right-3.5 h-4 w-4 text-[#717171]"
              />
            </label>
          </div>

          {showDateWarning ? (
            <p className="mt-2 text-[13px] leading-5 text-[#c13515]" id={warningId} role="alert">
              Please select your preferred dates first.
            </p>
          ) : null}

          {bookingEnquiryNote ? (
            <p className="mt-4 whitespace-pre-line text-[13.5px] leading-6 text-[#484848]">
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
              aria-describedby={showDateWarning ? warningId : undefined}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#25D366] px-6 py-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none transition duration-150 hover:bg-[#20bd5a] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 active:scale-[0.99]"
              href={whatsappUrl}
              onClick={handleWhatsAppClick}
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
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#dddddd] bg-white px-6 py-3 text-center outline-none transition duration-150 hover:bg-[#f7f7f7] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2 active:scale-[0.99]"
                href={phoneHref}
              >
                <span className="inline-flex items-center gap-2 text-[17px] font-semibold leading-6 text-[#222222]">
                  <Phone aria-hidden="true" className="h-[19px] w-[19px] shrink-0" />
                  Call us
                </span>
              </a>
            ) : null}
          </div>

          <p className="mb-1 mt-3 text-center text-[13px] leading-5 text-[#717171]">
            Nothing is booked or charged here. Our team will confirm availability with you.
          </p>
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-[#fbf7f1] px-4 py-3.5 text-[13.5px] leading-6 text-[#484848]">
          Enquiries for this stay are currently paused.
        </p>
      )}

      {stayTimeRows.length > 0 ? (
        <div className="mt-4 flex flex-col gap-[9px] border-t border-[#ebebeb] pt-3.5">
          {stayTimeRows.map((row) => (
            <div className="flex items-baseline justify-between gap-3" key={row.label}>
              <span className="text-[13px] text-[#717171]">{row.label}</span>
              <span className="text-right text-[13px] font-semibold text-[#222222]">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
