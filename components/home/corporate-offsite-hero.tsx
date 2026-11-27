"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CalendarDays, Check, Star, Users, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { trackBookingEnquiry, trackWhatsAppClick } from "@/src/lib/analytics";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";

type StaySuggestion = {
  intro: string;
  label: string;
  stays: { href: string; label: string; note?: string }[];
};

function suggestStay(people: number): StaySuggestion {
  if (people <= 4) {
    return {
      intro: "A 2 BHK apartment in Panjim fits your team.",
      label: "One 2 BHK apartment in Panjim",
      stays: [{ href: "#panjim", label: "Two apartments in Panjim" }],
    };
  }

  if (people <= 8) {
    return {
      intro: "Any of these fit your team:",
      label: "Panjim apartments, a South Goa villa or the Bogmalo building",
      stays: [
        { href: "#panjim", label: "Two apartments in Panjim", note: "sleeps up to 8" },
        { href: "#villas", label: "One 3 BHK villa in Varca or Majorda", note: "sleeps 8" },
        { href: "#bogmalo", label: "The full Bogmalo building", note: "sleeps up to 12" },
      ],
    };
  }

  if (people <= 12) {
    return {
      intro: "The full Bogmalo building fits your team.",
      label: "The full Bogmalo building",
      stays: [{ href: "#bogmalo", label: "The full building in Bogmalo", note: "sleeps up to 12" }],
    };
  }

  return {
    intro: "Your team is larger than our biggest stay. Message us and we will tell you what is possible.",
    label: "No single stay fits",
    stays: [],
  };
}

const PHOTO_SRC = "/images/corporate/team-offsite-hero.webp";

// The unlayered `a { color: inherit }` outranks Tailwind text colours, so the dark label sits on an inner span.
export const whatsappButton =
  "inline-flex h-14 w-full shrink-0 items-center justify-center rounded-full bg-whatsapp px-7 shadow-[0_14px_32px_rgba(37,211,102,0.24)] transition hover:brightness-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-public-ink motion-reduce:transform-none motion-reduce:transition-none";

const eyebrow =
  "inline-flex min-h-8 items-center gap-2 rounded-full border border-white/30 bg-public-ink/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md min-[375px]:text-[13px] sm:px-3.5 lg:min-h-9 lg:px-4 lg:text-sm xl:text-[15px]";

// Text sits straight on the photo from lg, so it carries its own shadow instead of a darker gradient.
const onPhotoShadow = "[text-shadow:0_1px_3px_rgba(0,0,0,0.75),0_0_18px_rgba(0,0,0,0.6)]";

// From lg the field icon sits in a round badge beside the label and input.
const finderBadge = "hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-public-hover text-public-ink lg:row-span-2 lg:grid";

const finderField =
  "flex min-h-14 min-w-0 cursor-text flex-col justify-center gap-0.5 rounded-2xl px-4 py-1.5 transition-colors focus-within:bg-public-hover focus-within:ring-2 focus-within:ring-inset focus-within:ring-public-coral motion-reduce:transition-none md:rounded-full lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:content-center lg:items-center lg:gap-x-2.5 lg:px-3";

const finderLabel = "flex items-center gap-2 whitespace-nowrap text-xs font-bold text-public-ink";

const finderInput =
  "w-full min-w-0 border-0 bg-transparent p-0 text-base font-medium text-public-ink outline-none placeholder:font-normal placeholder:text-public-muted";

// Shared with the other sections of this page, so the button, its message and its label stay the same.
export const heroQuoteMessage = "Hi, we are planning a team offsite in Goa. Could you help us find the right stay?";

export function WhatsAppButtonLabel({ colour = "text-white" }: { colour?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-base font-bold ${colour}`}>
      <FaWhatsapp aria-hidden="true" className="h-5 w-5 shrink-0" />
      Get a quote on WhatsApp
    </span>
  );
}

export function CorporateOffsiteHero() {
  const directWhatsappUrl = getPublicWhatsAppUrl(heroQuoteMessage);
  const [teamSize, setTeamSize] = useState("");
  const [dates, setDates] = useState("");
  const [suggestion, setSuggestion] = useState<StaySuggestion | null>(null);
  const [error, setError] = useState("");
  const [submittedPeople, setSubmittedPeople] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const people = Number(teamSize);
    if (!teamSize.trim() || !Number.isInteger(people) || people < 1 || people > 50) {
      setSuggestion(null);
      setResultUrl(null);
      setSubmittedPeople(null);
      setResultOpen(false);
      setError("Enter a whole number from 1 to 50.");
      return;
    }

    const result = suggestStay(people);
    const dateText = dates.trim();
    const message = `Hi, we are a team of ${people} looking for an offsite stay in Goa.${dateText ? ` Dates: ${dateText}.` : ""} Suggested stay: ${result.label}.`;
    setSuggestion(result);
    setSubmittedPeople(people);
    setResultUrl(getPublicWhatsAppUrl(message));
    setError("");
    // The dialog is portalled inside the page wrapper so it keeps the Figtree font.
    setPortalHost(event.currentTarget.closest<HTMLElement>(".cms-homepage"));
    setResultOpen(true);
  }

  function trackQuoteClick() {
    trackWhatsAppClick("corporate_offsite_finder_result");
    trackBookingEnquiry("finder_result", "corporate_offsite");
  }

  function handleStayLink(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    anchorRef.current = href;
    setResultOpen(false);
  }

  // Runs once the dialog has gone and the page scroll lock is released.
  function handleDialogClosed(event: Event) {
    event.preventDefault();
    const anchor = anchorRef.current;
    anchorRef.current = null;
    if (anchor) window.location.assign(anchor);
    else submitRef.current?.focus();
  }

  function quoteLink(className: string) {
    if (!directWhatsappUrl) return null;
    return (
      <a
        className={`${whatsappButton} ${className}`}
        href={directWhatsappUrl}
        onClick={() => {
          trackWhatsAppClick("corporate_offsite_hero_direct");
          trackBookingEnquiry("hero_whatsapp", "corporate_offsite");
        }}
        rel="noopener noreferrer"
        target="_blank"
      >
        <WhatsAppButtonLabel />
      </a>
    );
  }

  return (
    <section aria-labelledby="corporate-offsite-heading" className="relative isolate overflow-hidden bg-public-ink text-white lg:h-[calc(100svh-var(--header-height))] lg:min-h-[600px] lg:[--header-height:73px]" data-hides-floating-whatsapp>
      {/*
        Below lg: a banner. From lg: the full-bleed background. The headline stack sits over the group; the
        43.5% vertical position keeps the seated faces clear of the booking bar.
      */}
      <Image
        alt="A team of twelve colleagues posing together on a lawn surrounded by greenery"
        className="block aspect-[4/3] h-auto w-full object-cover object-[50%_62%] [mask-image:linear-gradient(to_bottom,black_90%,transparent)] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full lg:object-[50%_43.5%] lg:[mask-image:none]"
        height={1333}
        preload
        sizes="100vw"
        src={PHOTO_SRC}
        width={2000}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-public-ink/15 lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[30%] bg-gradient-to-b from-public-ink/45 to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[28%] bg-gradient-to-t from-public-ink/65 to-transparent lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-[70vw] h-[320px] w-[320px] rounded-full bg-public-coral/25 blur-[100px] sm:top-[55vw] lg:-top-64 lg:right-[6%] lg:h-[420px] lg:w-[420px] lg:blur-[120px]" />

      <div className="relative flex flex-col items-center px-4 pb-6 pt-5 text-center sm:px-6 lg:h-full lg:justify-end">
        {/* Headline stack: centred on the hero from lg. */}
        <div className="flex w-full flex-col items-center lg:absolute lg:inset-x-0 lg:top-1/2 lg:-translate-y-1/2 lg:px-6">
          {/* Soft scrim behind the stack only; it fades out 18svh above and below. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[calc(100%+36svh)] w-[1500px] -translate-x-1/2 -translate-y-1/2 bg-radial-[closest-side] from-public-ink/65 from-55% to-transparent lg:block" />

          <ul aria-label="Stay highlights" className="mb-4 flex flex-wrap items-center justify-center gap-2.5 lg:mb-5 lg:flex-nowrap">
            <li className={eyebrow}>
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-public-coral" />
              Private stays for teams up to 12
            </li>
            <li className={eyebrow}>
              <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-public-coral text-public-coral" />
              4.9+ rating, 230+ five-star reviews on Airbnb
            </li>
          </ul>

          <h1 id="corporate-offsite-heading" className={`text-balance text-[32px] font-extrabold leading-[1.02] tracking-tight text-white min-[375px]:text-[40px] min-[375px]:leading-[1.02] sm:text-5xl sm:leading-[1.02] lg:whitespace-nowrap lg:text-[length:clamp(52px,4.7vw,80px)] lg:leading-[1.05] ${onPhotoShadow}`}>
            Corporate Offsite Villas in <span className="text-public-coral">Goa</span>
          </h1>
          <p className={`mt-2 text-balance text-base text-white/90 sm:text-lg lg:mt-3 lg:text-xl lg:font-medium lg:leading-8 xl:text-[22px] ${onPhotoShadow}`}>
            Your own building. Space to work. Nobody else in it.
          </p>
          <div className="hidden lg:mt-7 lg:block">{quoteLink("lg:w-auto lg:px-9 lg:[&_span]:text-lg")}</div>
        </div>

        {/* Booking bar: grass and clothing zone. */}
        <div className="mt-6 flex w-full max-w-[640px] flex-col items-center lg:mt-0 lg:max-w-[700px]">
          {/* The validation message sits in space that is already there, so showing it moves nothing. */}
          <div className="relative w-full pb-6 lg:max-w-[700px] lg:pb-0">
            <form className="flex w-full flex-col gap-1 rounded-3xl bg-white p-2 text-left text-public-ink shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:rounded-full lg:h-16 lg:p-1.5 lg:[&_button]:h-13 lg:[&_label]:min-h-13 lg:[&_label]:py-1 lg:[@media(max-height:760px)]:h-14 lg:[@media(max-height:760px)]:[&_button]:h-11 lg:[@media(max-height:760px)]:[&_label]:min-h-11 lg:[@media(max-height:760px)]:[&_label]:py-0" noValidate onSubmit={handleSubmit}>
              <label className={`${finderField} md:w-48 md:shrink-0 lg:w-60`} htmlFor="offsite-team-size">
                <span aria-hidden="true" className={finderBadge}>
                  <Users className="h-4 w-4" />
                </span>
                <span className={finderLabel}>
                  <Users aria-hidden="true" className="h-4 w-4 shrink-0 text-public-muted lg:hidden" />
                  How many people?
                </span>
                <input
                  aria-describedby={error ? "offsite-team-error" : undefined}
                  aria-invalid={Boolean(error)}
                  className={`${finderInput} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                  id="offsite-team-size"
                  inputMode="numeric"
                  max={50}
                  min={1}
                  onChange={(event) => setTeamSize(event.target.value)}
                  placeholder="Add team size"
                  required
                  step={1}
                  type="number"
                  value={teamSize}
                />
              </label>

              <span aria-hidden="true" className="hidden h-9 w-px shrink-0 bg-public-control md:block" />

              <label className={`${finderField} md:flex-1`} htmlFor="offsite-dates">
                <span aria-hidden="true" className={finderBadge}>
                  <CalendarDays className="h-4 w-4" />
                </span>
                <span className={finderLabel}>
                  <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-public-muted lg:hidden" />
                  Dates
                </span>
                <input
                  className={finderInput}
                  id="offsite-dates"
                  onChange={(event) => setDates(event.target.value)}
                  placeholder="Add dates"
                  type="text"
                  value={dates}
                />
              </label>

              <button className="inline-flex h-14 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-public-ink px-7 text-base font-bold text-white transition hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transform-none motion-reduce:transition-none md:w-auto lg:bg-public-coral lg:text-public-ink lg:hover:bg-public-coral lg:hover:brightness-95" ref={submitRef} type="submit">
                Find my stay
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </button>
            </form>

            {error ? (
              <p className={`absolute inset-x-0 bottom-0 text-[13px] font-semibold leading-6 text-[#ffd3d4] lg:bottom-auto lg:top-full lg:mt-0.5 lg:leading-5 ${onPhotoShadow}`} id="offsite-team-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {/* Below lg only; from lg the button sits in the headline stack. */}
          <div className="relative flex w-full flex-col items-center gap-4 lg:hidden">
            {quoteLink("")}

            <ul className={`flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-white/90 ${onPhotoShadow}`}>
              {["GST invoices", "Bank transfer or UPI"].map((item) => (
                <li className="inline-flex items-center gap-1.5" key={item}>
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-public-coral" strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Dialog.Root onOpenChange={setResultOpen} open={resultOpen}>
        <Dialog.Portal container={portalHost ?? undefined}>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[80] max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-white/20 bg-public-ink/80 p-6 text-white shadow-2xl outline-none backdrop-blur-xl transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0"
            onCloseAutoFocus={handleDialogClosed}
          >
            <Dialog.Close aria-label="Close" className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <X aria-hidden="true" className="h-5 w-5" />
            </Dialog.Close>
            <Dialog.Title className="pr-12 text-xs font-bold uppercase tracking-[0.12em] text-white/75">Suggested for your team</Dialog.Title>
            <Dialog.Description className="mt-4 text-base font-semibold leading-6">{suggestion?.intro}</Dialog.Description>
            {suggestion?.stays.length ? (
              <ul className="mt-2 text-sm leading-5">
                {suggestion.stays.map((stay) => (
                  <li className="flex flex-wrap items-center gap-x-2" key={stay.href}>
                    <a className="inline-flex min-h-11 items-center rounded-sm font-semibold underline decoration-white/45 underline-offset-4 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href={stay.href} onClick={(event) => handleStayLink(event, stay.href)}>
                      {stay.label}
                    </a>
                    {stay.note ? <span className="text-xs text-white/70">({stay.note})</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {submittedPeople !== null && resultUrl ? (
              <a className={`mt-4 ${whatsappButton}`} href={resultUrl} onClick={trackQuoteClick} rel="noopener noreferrer" target="_blank">
                <WhatsAppButtonLabel />
              </a>
            ) : (
              <p className="mt-4 text-sm text-white/75">WhatsApp is not configured right now. Please contact us directly.</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
