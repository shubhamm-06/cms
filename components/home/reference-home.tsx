"use client";

import Image from "next/image";
import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import countryLabels from "react-phone-number-input/locale/en.json";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { FaWhatsapp } from "react-icons/fa6";
import {
  ArrowRight,
  Banknote,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  FileText,
  LoaderCircle,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { CalendlyPopupLoader, openCalendlyPopup } from "@/components/home/calendly-popup";
import { PublicFooter } from "@/components/home/public-footer";
import { PublicHeader } from "@/components/home/public-header";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { trackDataLayerEvent, trackWhatsAppClick } from "@/src/lib/analytics";
import type { ForecastResult as ServerForecastResult } from "@/src/features/owner-forecast/forecast-calculator";
import { FamilySection } from "@/components/home/family-section";
import { getPublicWhatsAppUrl } from "@/src/lib/public-whatsapp";
import { GuestHeader } from "@/components/home/guest-header";
import { BookingGuestReviews } from "@/components/home/booking-guest-reviews";
import { BookingWhyDirect } from "@/components/home/booking-why-direct";
import { BookingGuestServices } from "@/components/home/booking-guest-services";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { PropertyCatalogue } from "@/src/features/catalogue/property-catalogue";
import type { CatalogueLoadResult } from "@/src/features/catalogue/public-catalogue-data";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

const photo = (name: string) => `/homepage/${name}`;
const WHATSAPP_URL = getPublicWhatsAppUrl() || "#";

function trackCalendarClick(ctaLocation: string) {
  trackDataLayerEvent("calendar_click", {
    cta_location: ctaLocation,
    destination_type: "calendly",
  });
  openCalendlyPopup();
}

const trackWhatsappClick = trackWhatsAppClick;

function trackForecastFormOpen(ctaLocation: string) {
  trackDataLayerEvent("forecast_form_open", {
    cta_location: ctaLocation,
    form_name: "owner_forecast",
  });
}

const locations = [
  "Panjim",
  "Margao",
  "Saligao",
  "Assagao",
  "Anjuna",
  "Vagator",
  "Candolim",
  "Calangute",
  "Baga",
  "Morjim",
  "Ashvem",
  "Mandrem",
  "Arambol",
  "Varca",
  "Cavelossim",
  "Colva",
  "Loutolim",
  "Other South Goa",
  "Other North Goa",
];

const apartmentConfigurations = ["Studio", "1BHK", "2BHK", "3BHK"];
const villaConfigurations = ["Studio", "1-2BHK", "3BHK", "4BHK", "5BHK+"];
const amenities = [
  "Garden / outdoor area",
  "Gym / fitness access",
  "Dedicated parking",
  "BBQ / outdoor kitchen",
  "Jacuzzi / hot tub",
  "Home theatre / entertainment room",
  "Rooftop / terrace with view",
  "EV charging",
  "Chef service available",
  "Pet-friendly",
];

type CalculatorData = {
  propertyCategory: "Apartment" | "Villa";
  configuration: string;
  areaSqft: string;
  location: string;
  beachDistance: string;
  poolType: string;
  amenities: string[];
  furnishingStatus: string;
  currentlyRented: string;
  email: string;
  name: string;
  residency: string;
  whatsappInterest: boolean;
};

type ForecastApiResponse = {
  forecast: ServerForecastResult;
  message: string;
};

type ProposalApiResponse = {
  ok: boolean;
  ownerEmailSent: boolean;
  pdfDownloadUrl: string | null;
  pdfViewUrl: string | null;
};

type PitchDeckStatus = "idle" | "generating" | "ready" | "failed";

type ForecastRequestPayload = Omit<CalculatorData, "areaSqft"> & { areaSqft: number; phone: string };

const defaultPhoneCountry: Country = "IN";
const phoneCountries = getCountries();

function getPhoneCountryName(country: Country) {
  return countryLabels[country] || country;
}

function getNormalizedPhone(country: Country, nationalPhone: string) {
  const phoneNumber = parsePhoneNumberFromString(nationalPhone, country);
  return phoneNumber?.isValid() ? phoneNumber.number : "";
}

const emptyCalculatorData: CalculatorData = {
  propertyCategory: "Apartment",
  configuration: "Studio",
  areaSqft: "",
  beachDistance: "Less than 500m",
  email: "",
  furnishingStatus: "",
  location: "Assagao",
  name: "",
  poolType: "Private pool",
  amenities: [],
  currentlyRented: "",
  residency: "",
  whatsappInterest: false,
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function ButtonLink({
  children,
  className = "",
  disabled = false,
  href,
  onClick,
  rel,
  size = "md",
  target,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  rel?: string;
  size?: "sm" | "md" | "lg";
  target?: React.HTMLAttributeAnchorTarget;
  variant?: "primary" | "secondary" | "ghost" | "onDark" | "outlineDark";
}) {
  const sizes = {
    sm: "px-3.5 py-2.5 text-sm sm:px-[15px]",
    md: "px-4 py-3 text-[15px] sm:px-[22px] sm:text-base",
    lg: "px-5 py-3.5 text-base sm:px-7 sm:py-4 sm:text-[17px]",
  };
  const variants = {
    ghost: "border-transparent bg-transparent !text-[#222222] hover:bg-[#f7f7f7]",
    onDark: "border-transparent bg-white !text-[#222222] hover:shadow-[0_6px_16px_rgba(0,0,0,0.18)]",
    outlineDark: "border-white/45 bg-transparent !text-white hover:border-white/70 hover:bg-white/10",
    primary: "border-transparent bg-[#ff5a5f] !text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#e54b50] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]",
    secondary: "border-[#dddddd] bg-white !text-[#222222] hover:bg-[#f7f7f7]",
  };
  const classes = `inline-flex min-h-11 max-w-full items-center justify-center gap-[9px] rounded-xl border text-center font-semibold leading-[1.2] whitespace-normal transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick} rel={rel} target={target}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`text-xs font-extrabold uppercase tracking-[0.18em] ${light ? "text-[#e9aa4b]" : "text-[#ff5a5f]"}`}>{children}</div>;
}

function Section({
  children,
  className = "",
  id,
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "white" | "cream" | "dark";
}) {
  const tones = {
    cream: "bg-[#fbf7f1] text-[#222222]",
    dark: "bg-[#1b1714] text-white",
    white: "bg-white text-[#222222]",
  };

  return (
    <section className={`${tones[tone]} ${className}`} id={id}>
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-[104px]">{children}</div>
    </section>
  );
}

function Heading({
  align = "center",
  dark = false,
  eyebrow,
  lead,
  title,
}: {
  align?: "center" | "left";
  dark?: boolean;
  eyebrow?: string | null;
  lead?: string;
  title: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
      {eyebrow ? <Eyebrow light={dark}>{eyebrow}</Eyebrow> : null}
      <h2 className={`${eyebrow ? "mt-4" : ""} text-[28px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]`}>{title}</h2>
      {lead ? <p className={`mt-4 max-w-2xl text-base leading-7 sm:mt-[18px] sm:text-[18px] sm:leading-[1.6] md:text-[19px] ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/70" : "text-[#717171]"}`}>{lead}</p> : null}
    </div>
  );
}

function Field({ children, hint, label, required }: { children: React.ReactNode; hint?: string; label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-[7px] block text-sm font-semibold text-[#484848]">
        {label}
        {required ? <span className="text-[#ff5a5f]"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12.5px] text-[#b0b0b0]">{hint}</span> : null}
    </label>
  );
}

function TextInput({
  invalid = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
}) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border bg-white px-3.5 text-[15.5px] text-[#222222] outline-none transition focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ffe0e1] ${invalid ? "border-[#c13515]" : "border-[#dddddd]"}`}
    />
  );
}

function SelectBox({
  invalid = false,
  onChange,
  options,
  placeholder,
  value,
}: {
  invalid?: boolean;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <span className="relative block">
      <select
        className={`h-12 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-[15.5px] font-medium outline-none transition focus:border-[#ff5a5f] focus:ring-4 focus:ring-[#ffe0e1] ${value ? "text-[#222222]" : "text-[#b0b0b0]"} ${invalid ? "border-[#c13515]" : "border-[#dddddd]"}`}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#484848]" />
    </span>
  );
}

function Segmented({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2 min-[360px]:grid-cols-2 min-[480px]:grid-cols-3">
      {options.map((option) => {
        const active = value === option;
        const narrowFullWidth = options.length === 3 && option === "None";
        return (
          <button
            className={`flex min-h-14 w-full min-w-0 items-center justify-center rounded-xl border px-2.5 py-3 text-center text-[14px] font-semibold leading-5 whitespace-normal break-words transition sm:px-3 sm:text-[14.5px] ${narrowFullWidth ? "min-[360px]:col-span-2 min-[480px]:col-span-1" : ""} ${active ? "border-[#ff5a5f] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#484848] hover:bg-[#f7f7f7]"}`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Dots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span className={`h-2 rounded-full transition-all ${index === step ? "w-[22px] bg-[#ff5a5f]" : index < step ? "w-2 bg-[#ff9295]" : "w-2 bg-[#dddddd]"}`} key={index} />
      ))}
    </div>
  );
}

function ForecastCard({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#ebebeb] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:px-6 sm:py-[22px]">
      <div className="text-xs font-bold uppercase tracking-[0.05em] text-[#484848]">{label}</div>
      <div className="mt-2 break-words text-[26px] font-extrabold leading-none text-[#222222] sm:text-[30px] md:text-[34px]">{value}</div>
      {sub ? <div className="mt-[7px] text-[13.5px] text-[#484848]">{sub}</div> : null}
    </div>
  );
}

function ForecastLoader() {
  return (
    <div aria-live="polite" className="min-w-0 rounded-[20px] border border-[#ffb1b3] bg-[#fbf7f1] p-5 text-center shadow-[0_6px_16px_rgba(0,0,0,0.1)] sm:rounded-[24px] sm:p-9 md:p-[52px]">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff1f1] text-[#ff5a5f]">
        <LoaderCircle aria-hidden="true" className="h-7 w-7 animate-spin" />
      </div>
      <h3 className="mt-5 text-[22px] font-extrabold leading-tight text-[#222222] sm:text-[26px] md:text-[30px]">Preparing your property forecast</h3>
      <p className="mx-auto mt-2 max-w-[570px] text-[15px] leading-6 text-[#484848]">
        We are calculating your revenue estimate and preparing your proposal details.
      </p>
      <div className="mx-auto mt-7 h-1.5 max-w-[440px] overflow-hidden rounded-full bg-[#f0dfd8]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-[#ff5a5f]" />
      </div>
      <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5a5f]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff8b8f] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ffb1b3] [animation-delay:300ms]" />
      </div>
      <p className="mt-4 text-[13px] font-semibold text-[#6b625e]">Applying Goa location and seasonal performance factors...</p>
    </div>
  );
}

function ForecastResult({
  analyticsLocation,
  data,
  onReset,
  ownerEmailSent,
  pdfDownloadUrl,
  pitchDeckStatus,
  response,
}: {
  analyticsLocation?: string;
  data: CalculatorData;
  onReset: () => void;
  ownerEmailSent: boolean;
  pdfDownloadUrl: string | null;
  pitchDeckStatus: PitchDeckStatus;
  response: ForecastApiResponse;
}) {
  const whatsappMessage = `Hi CurateMyStay, I generated a forecast for my ${data.configuration} ${data.propertyCategory} in ${data.location} and would like to discuss it.`;
  const whatsappUrl = getPublicWhatsAppUrl(whatsappMessage);
  const summary = `${data.configuration} ${data.propertyCategory} - ${data.location} - ${data.areaSqft} sq.ft.`;

  return (
    <div className="min-w-0 rounded-[20px] border border-[#ff9295] bg-[#fbf7f1] p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:rounded-[24px] sm:p-7 md:p-10">
      <div className="mb-1 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f4ec] px-[13px] py-1.5 text-[13px] font-semibold text-[#1b8a5a]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#1b8a5a]" />
          Forecast ready
        </span>
        <span className="min-w-0 break-words text-[13.5px] leading-5 text-[#484848]">
          {pitchDeckStatus === "ready"
            ? ownerEmailSent
              ? "Your pitch deck is ready. We have also emailed you a copy."
              : "Your forecast and full pitch deck are ready."
            : pitchDeckStatus === "failed"
              ? "Your forecast is ready. The pitch-deck download is temporarily unavailable."
              : "Your forecast is ready. Your pitch deck is being prepared."}
        </span>
      </div>
      <h3 className="mt-3 text-[24px] font-extrabold leading-tight sm:text-[28px] md:text-[32px]">Here&apos;s what your property could earn.</h3>
      <p className="mt-1 break-words text-[15px] font-semibold text-[#484848]">{summary}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ForecastCard label="Estimated annual revenue" value={formatINR(response.forecast.annualRevenue)} />
        <ForecastCard label="Estimated operating cost" sub="15% of revenue" value={formatINR(response.forecast.annualOperatingCost)} />
        <ForecastCard label="Estimated net profit" sub="After operating costs" value={formatINR(response.forecast.annualNetProfit)} />
      </div>
      <div className="mt-5 min-w-0 break-words rounded-2xl border border-[#ebebeb] bg-white p-4 text-sm leading-6 text-[#484848] sm:p-5">
        <p>{response.forecast.setup.note}</p>
        <p className="mt-2 font-semibold text-[#222222]">Commercial terms are discussed after reviewing your property.</p>
      </div>
      <p className="my-[18px] text-[12.5px] italic leading-normal text-[#b0b0b0]">
        These are estimates based on comparable Goa properties. Actual results depend on property condition, location, season, and market dynamics.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
        <ButtonLink onClick={() => trackCalendarClick("forecast_result")} size="lg">
          <Calendar aria-hidden="true" className="h-4 w-4" /> Book a Call
        </ButtonLink>
        {whatsappUrl ? (
          <ButtonLink className="!border-transparent !bg-[#25d366] !text-white hover:!bg-[#128c7e]" href={whatsappUrl} onClick={() => trackWhatsappClick(analyticsLocation || "forecast_result")} rel="noreferrer" size="lg" target="_blank">
            <FaWhatsapp aria-hidden="true" className="h-5 w-5" /> WhatsApp us now
          </ButtonLink>
        ) : (
          <ButtonLink className="!border-transparent !bg-[#25d366] !text-white" disabled size="lg">
            <FaWhatsapp aria-hidden="true" className="h-5 w-5" /> WhatsApp unavailable
          </ButtonLink>
        )}
        {pitchDeckStatus === "ready" && pdfDownloadUrl ? (
          <ButtonLink href={pdfDownloadUrl} onClick={() => trackDataLayerEvent("pitch_deck_download", { asset_type: "pitch_deck_pdf", cta_location: analyticsLocation || "forecast_result" })} rel="noreferrer" size="lg" target="_blank" variant="secondary">
            <FileText className="h-4 w-4" /> Download full pitch deck
          </ButtonLink>
        ) : pitchDeckStatus === "generating" ? (
          <ButtonLink disabled size="lg" variant="secondary">
            <FileText className="h-4 w-4" /> Preparing pitch deck...
          </ButtonLink>
        ) : (
          <ButtonLink disabled size="lg" variant="secondary">
            <FileText className="h-4 w-4" /> Pitch deck temporarily unavailable
          </ButtonLink>
        )}
        <ButtonLink onClick={onReset} size="lg" variant="ghost">
          Start over
        </ButtonLink>
      </div>
    </div>
  );
}

function CalculatorSection({
  analyticsLocation,
  eyebrow = "The ROI calculator",
  id = "calculator",
  lead = "Tell us about your property. We'll generate a transparent annual revenue, operating-cost, and net-profit forecast, plus a downloadable custom pitch deck.",
  sectionClassName = "",
  title = "What could your property actually earn?",
  tone = "white",
}: {
  analyticsLocation?: string;
  eyebrow?: string | null;
  id?: string;
  lead?: string;
  sectionClassName?: string;
  title?: string;
  tone?: "white" | "cream";
} = {}) {
  const [data, setData] = useState<CalculatorData>(emptyCalculatorData);
  const [result, setResult] = useState<ForecastApiResponse | null>(null);
  const [pitchDeckStatus, setPitchDeckStatus] = useState<PitchDeckStatus>("idle");
  const [proposal, setProposal] = useState<ProposalApiResponse | null>(null);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultPhoneCountry);
  const [nationalPhone, setNationalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const forecastStartedRef = useRef(false);
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email);
  const area = Number(data.areaSqft);
  const step1Ok = Boolean(
    data.propertyCategory &&
      data.configuration &&
      area >= 100 &&
      area <= 20000 &&
      data.location &&
      data.beachDistance &&
      data.poolType &&
      data.furnishingStatus &&
      data.currentlyRented,
  );
  const normalizedPhone = getNormalizedPhone(selectedCountry, nationalPhone);
  const phoneOk = Boolean(normalizedPhone);
  const step2Ok = Boolean(data.name.trim() && phoneOk && emailOk && data.residency);
  const showStep2Errors = step === 1 && touched;
  const configurationOptions = data.propertyCategory === "Apartment" ? apartmentConfigurations : villaConfigurations;

  function setField<Key extends keyof CalculatorData>(key: Key, value: CalculatorData[Key]) {
    trackForecastStarted();
    setData((current) => ({ ...current, [key]: value }));
  }

  function trackForecastStarted() {
    if (forecastStartedRef.current) return;
    forecastStartedRef.current = true;
    trackDataLayerEvent("forecast_form_started", {
      ...(analyticsLocation ? { cta_location: analyticsLocation } : {}),
      form_name: "owner_forecast",
      form_step: `step_${step + 1}`,
    });
  }

  function nextStep() {
    setTouched(true);
    if ((step === 0 && step1Ok) || (step === 1 && step2Ok)) {
      setTouched(false);
      setStep((current) => current + 1);
    }
  }

  function reset() {
    setData(emptyCalculatorData);
    setResult(null);
    setPitchDeckStatus("idle");
    setProposal(null);
    setStep(0);
    setTouched(false);
    setSelectedCountry(defaultPhoneCountry);
    setNationalPhone("");
    setSubmitError("");
  }

  function toggleAmenity(amenity: string) {
    trackForecastStarted();
    setData((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  }

  async function submitForecast() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        ...data,
        areaSqft: area,
        phone: normalizedPhone,
      };
      const response = await fetch("/api/owner-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ForecastApiResponse | { message?: string };
      if (!response.ok || !("forecast" in body)) {
        throw new Error(body.message || "Could not generate your forecast right now.");
      }
      setResult(body);
      trackDataLayerEvent("generate_lead", {
        ...(analyticsLocation ? { cta_location: analyticsLocation } : {}),
        form_name: "owner_forecast",
        lead_type: "pitch_deck_forecast",
      });
      setPitchDeckStatus("generating");
      window.setTimeout(() => void generateProposal(payload), 0);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not generate your forecast right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function generateProposal(payload: ForecastRequestPayload) {
    try {
      const response = await fetch("/api/owner-forecast/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ProposalApiResponse | { message?: string };
      if (
        !response.ok ||
        !("ok" in body) ||
        body.ok !== true ||
        !body.pdfDownloadUrl
      ) {
        throw new Error("Pitch deck generation failed.");
      }
      setProposal(body);
      trackDataLayerEvent("pitch_deck_ready", {
        ...(analyticsLocation ? { cta_location: analyticsLocation } : {}),
        lead_type: "pitch_deck_forecast",
      });
      setPitchDeckStatus("ready");
    } catch {
      setPitchDeckStatus("failed");
    }
  }

  return (
    <Section className={sectionClassName} id={id} tone={tone}>
      <Heading
        eyebrow={eyebrow}
        lead={lead}
        title={title}
      />
      <div className="mx-auto mt-8 min-w-0 max-w-[880px] sm:mt-12">
        {result ? (
          <ForecastResult
            analyticsLocation={analyticsLocation}
            data={data}
            onReset={reset}
            ownerEmailSent={proposal?.ownerEmailSent === true}
            pdfDownloadUrl={proposal?.pdfDownloadUrl || null}
            pitchDeckStatus={pitchDeckStatus}
            response={result}
          />
        ) : isSubmitting ? (
          <ForecastLoader />
        ) : (
          <div className="min-w-0 rounded-[20px] border border-[#dddddd] bg-[#fbf7f1] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] sm:rounded-[24px] sm:p-7 md:p-11">
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#ff5a5f]">Step {step + 1} of 3</div>
                <h3 className="mt-1 text-xl font-extrabold text-[#222222]">{["Tell us about your property", "How do we reach you?", "Confirm & generate"][step]}</h3>
              </div>
              <Dots step={step} />
            </div>

            {step === 0 ? (
              <div className="grid gap-[18px] md:grid-cols-2">
                <Field label="Property category" required>
                  <Segmented
                    onChange={(value) => {
                      trackForecastStarted();
                      const propertyCategory = value as CalculatorData["propertyCategory"];
                      setData((current) => ({
                        ...current,
                        propertyCategory,
                        configuration: propertyCategory === "Apartment" ? apartmentConfigurations[0] : villaConfigurations[0],
                      }));
                    }}
                    options={["Apartment", "Villa"]}
                    value={data.propertyCategory}
                  />
                </Field>
                <Field label="Configuration" required>
                  <SelectBox invalid={touched && !data.configuration} onChange={(value) => setField("configuration", value)} options={configurationOptions} placeholder="Select size" value={data.configuration} />
                </Field>
                <Field hint="Enter a practical built-up area between 100 and 20,000 sq.ft." label="Built-up area (sq.ft.)" required>
                  <TextInput invalid={touched && !(area >= 100 && area <= 20000)} min="100" onChange={(event) => setField("areaSqft", event.target.value)} placeholder="e.g. 1800" type="number" value={data.areaSqft} />
                </Field>
                <Field label="Location" required>
                  <SelectBox invalid={touched && !data.location} onChange={(value) => setField("location", value)} options={locations} placeholder="Select area" value={data.location} />
                </Field>
                <Field label="Distance from beach" required>
                  <SelectBox invalid={touched && !data.beachDistance} onChange={(value) => setField("beachDistance", value)} options={["Less than 500m", "500m-1km", "1-2km", "2-5km", "5km+"]} placeholder="Select distance" value={data.beachDistance} />
                </Field>
                <Field label="Pool" required>
                  <Segmented onChange={(value) => setField("poolType", value)} options={["Private pool", "Society/shared pool", "None"]} value={data.poolType} />
                </Field>
                <Field label="Furnishing status" required>
                  <SelectBox invalid={touched && !data.furnishingStatus} onChange={(value) => setField("furnishingStatus", value)} options={["Fully furnished and ready", "Mostly furnished, minor work", "Needs significant work", "Empty"]} placeholder="Select status" value={data.furnishingStatus} />
                </Field>
                <Field label="Currently being rented?" required>
                  <SelectBox invalid={touched && !data.currentlyRented} onChange={(value) => setField("currentlyRented", value)} options={["No, idle", "Yes, long-term", "Yes, on Airbnb (self-managed)", "Yes, with another agency"]} placeholder="Select" value={data.currentlyRented} />
                </Field>
                <div className="md:col-span-2">
                  <Field hint="Optional - select every amenity that applies." label="Amenities">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {amenities.map((amenity) => {
                        const selected = data.amenities.includes(amenity);
                        return (
                          <button
                            aria-pressed={selected}
                            className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition ${selected ? "border-[#ff5a5f] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#484848] hover:bg-[#f7f7f7]"}`}
                            key={amenity}
                            onClick={() => toggleAmenity(amenity)}
                            type="button"
                          >
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${selected ? "border-[#ff5a5f] bg-[#ff5a5f]" : "border-[#dddddd] bg-white"}`}>
                              {selected ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                            </span>
                            {amenity}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
                {touched && !step1Ok ? <div className="text-[13.5px] text-[#c13515] md:col-span-2">Please complete the required fields above.</div> : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-[18px] md:grid-cols-2">
                <Field label="Full name" required>
                  <TextInput invalid={showStep2Errors && !data.name.trim()} onChange={(event) => setField("name", event.target.value)} placeholder="Your name" value={data.name} />
                  {showStep2Errors && !data.name.trim() ? <p className="mt-1 text-[13px] text-[#c13515]">Enter your full name.</p> : null}
                </Field>
                <Field hint={`${getPhoneCountryName(selectedCountry)} (+${getCountryCallingCode(selectedCountry)}) selected. Choose another country for international numbers.`} label="Phone" required>
                  <div className={`cms-forecast-phone ${showStep2Errors && !phoneOk ? "cms-forecast-phone--invalid" : ""}`}>
                    <div className="relative flex min-h-12 shrink-0 items-center gap-2 border-r border-[#ebebeb] pr-3">
                      <span aria-hidden="true" className="cms-forecast-phone-flag">
                        {(() => {
                          const Flag = flags[selectedCountry];
                          return Flag ? <Flag title={getPhoneCountryName(selectedCountry)} /> : null;
                        })()}
                      </span>
                      <span className="whitespace-nowrap text-[15px] font-semibold text-[#484848]">+{getCountryCallingCode(selectedCountry)}</span>
                      <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#717171]" />
                      <select
                        aria-label="Phone country"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={(event) => {
                          trackForecastStarted();
                          setSelectedCountry(event.target.value as Country);
                        }}
                        value={selectedCountry}
                      >
                        {phoneCountries.map((country) => (
                          <option key={country} value={country}>
                            {getPhoneCountryName(country)} (+{getCountryCallingCode(country)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      aria-invalid={showStep2Errors && !phoneOk}
                      aria-label="National phone number"
                      autoComplete="tel-national"
                      className="min-h-12 min-w-0 flex-1 bg-transparent px-3 py-3 text-[15.5px] font-medium text-[#222222] outline-none placeholder:text-[#b0b0b0]"
                      inputMode="tel"
                      onChange={(event) => {
                        trackForecastStarted();
                        setNationalPhone(event.target.value);
                      }}
                      placeholder="98765 43210"
                      type="tel"
                      value={nationalPhone}
                    />
                  </div>
                  {showStep2Errors && !phoneOk ? <p className="mt-1 text-[13px] text-[#c13515]">Enter a valid phone number for the selected country.</p> : null}
                </Field>
                <Field label="Email" required>
                  <TextInput invalid={showStep2Errors && !emailOk} onChange={(event) => setField("email", event.target.value)} placeholder="you@email.com" type="email" value={data.email} />
                  {showStep2Errors && !emailOk ? <p className="mt-1 text-[13px] text-[#c13515]">Enter a valid email address.</p> : null}
                </Field>
                <Field hint="Helps us route your follow-up" label="Where are you based?" required>
                  <SelectBox invalid={showStep2Errors && !data.residency} onChange={(value) => setField("residency", value)} options={["In Goa", "In India (outside Goa)", "Abroad (NRI)"]} placeholder="Select" value={data.residency} />
                  {showStep2Errors && !data.residency ? <p className="mt-1 text-[13px] text-[#c13515]">Select where you&apos;re based.</p> : null}
                </Field>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-3.5">
                <div className="rounded-2xl border border-[#ebebeb] bg-white p-[18px]">
                  <label className="flex cursor-pointer items-start gap-3 py-1">
                    <span className={`mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] border ${data.whatsappInterest ? "border-[#ff5a5f] bg-[#ff5a5f]" : "border-[#dddddd] bg-white"}`}>
                      {data.whatsappInterest ? <Check className="h-[15px] w-[15px] text-white" /> : null}
                    </span>
                    <input checked={data.whatsappInterest} className="hidden" onChange={(event) => setField("whatsappInterest", event.target.checked)} type="checkbox" />
                    <span className="text-[15px] leading-normal text-[#484848]">I&apos;d like to discuss this on WhatsApp.</span>
                  </label>
                </div>
                <div className="flex items-start gap-2.5 text-[13.5px] leading-5 text-[#484848]">
                  <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#1b8a5a]" /> Your details stay private and are used only to prepare this forecast and follow up.
                </div>
                {submitError ? <div className="text-[13.5px] font-semibold text-[#c13515]">{submitError}</div> : null}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <ButtonLink className="w-full sm:w-auto" onClick={() => setStep((current) => current - 1)} variant="ghost">
                  Back
                </ButtonLink>
              ) : (
                <span />
              )}
              {step < 2 ? (
                <ButtonLink className="w-full sm:w-auto" onClick={nextStep} size="lg">
                  Continue <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              ) : (
                <ButtonLink className="w-full sm:w-auto" disabled={isSubmitting} onClick={submitForecast} size="lg">
                  {isSubmitting ? "Generating your forecast..." : "Generate my forecast"} <Sparkles className="h-4 w-4" />
                </ButtonLink>
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function Tiers() {
  const tiers = [
    {
      featured: false,
      forWhom: [
        "Existing Airbnb properties with a proven track record",
        "Fully furnished and guest-ready homes",
        "Recently renovated properties",
        "Homes requiring little to no setup work",
      ],
      gets: [
        "End-to-end property operations",
        "Multi-platform listing & revenue management",
        "Guest communication & support",
        "Monthly owner reporting & approvals",
        "Compliance assistance & recurring oversight",
      ],
      name: "Signature",
      split: "80 / 20",
      splitNote: "Owner / CMS on net profit",
      tag: "For market-ready homes that are ready to start hosting immediately.",
    },
    {
      featured: true,
      forWhom: [
        "First-time Airbnb owners",
        "Furnished homes entering the STR market",
        "Properties requiring repositioning or branding",
        "Homes needing compliance and operational readiness support",
      ],
      gets: [
        "Everything in Signature, plus:",
        "Professional photography & listing creation",
        "Property positioning & launch strategy",
        "Styling and presentation recommendations",
        "Assistance with licenses, registrations & NOCs",
        "Safety, compliance & operational readiness guidance",
        "Ongoing liaison support for approvals and renewals",
      ],
      name: "Curated",
      split: "70 / 30",
      splitNote: "Owner / CMS on net profit",
      tag: "For homes that need activation before they can perform as professional short-term rentals.",
    },
    {
      featured: false,
      forWhom: [
        "Newly purchased properties",
        "Empty or partially furnished homes",
        "Properties requiring fit-out or furnishing",
        "Owners building a hospitality asset from the ground up",
      ],
      gets: [
        "Everything in Curated, plus:",
        "Architect & design partner coordination",
        "Furniture, decor & procurement support",
        "End-to-end fit-out project management",
        "Property branding & positioning",
        "Launch strategy from concept to first booking",
      ],
      name: "Bespoke",
      split: "Custom",
      splitNote: "Structured around the scope of work",
      tag: "For properties that require complete transformation before launch.",
    },
  ] as const;

  return (
    <Section id="tiers" tone="cream">
      <Heading
        eyebrow="The tier system"
        lead="Every property is different. Some are ready to generate revenue immediately, while others need repositioning, compliance support, or a complete setup before launch. We will recommend the most suitable model after assessing your property."
        title="Choose the partnership model that fits your property."
      />
      <div className="mt-12 grid items-start gap-6 sm:mt-14 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            className={`relative min-w-0 rounded-[20px] bg-white px-5 py-7 sm:rounded-[24px] sm:px-7 sm:py-8 ${
              tier.featured ? "border-2 border-[#ff5a5f] shadow-[0_12px_28px_rgba(0,0,0,0.14)] lg:-translate-y-2" : "border border-[#dddddd] shadow-sm"
            }`}
            key={tier.name}
          >
            {tier.featured ? <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff5a5f] px-4 py-1.5 text-xs font-extrabold uppercase text-white">Most Chosen</div> : null}
            <h3 className="text-2xl font-extrabold text-[#222222]">{tier.name}</h3>
            <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#717171]">{tier.tag}</p>
            <div className={`mt-5 text-[34px] font-extrabold leading-none tracking-[-0.02em] ${tier.featured ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{tier.split}</div>
            <p className="mt-1 text-sm text-[#717171]">{tier.splitNote}</p>
            <div className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b0b0b0]">Best suited for</div>
            <ul className="mt-4 grid gap-3">
              {tier.forWhom.map((item) => (
                <li className="flex gap-2 text-sm leading-5 text-[#484848]" key={item}>
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b0b0b0]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="my-6 h-px bg-[#ebebeb]" />
            <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b0b0b0]">Includes</div>
            <ul className="mt-4 grid gap-3">
              {tier.gets.map((item) => (
                <li className="flex gap-2 text-sm leading-5 text-[#484848]" key={item}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5a5f]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink className="w-full" onClick={() => trackCalendarClick("tier_card")} variant={tier.featured ? "primary" : "secondary"}>
                Choose {tier.name}
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="mx-auto max-w-3xl text-base leading-7 text-[#717171]">Not sure which model fits? Tell us about your property in the calculator above and we will recommend one in your custom pitch deck.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink className="w-full sm:w-auto" onClick={() => trackCalendarClick("tiers")} size="lg">
            Book a discovery call <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink className="w-full sm:w-auto" href="#calculator" onClick={() => trackForecastFormOpen("tiers")} size="lg" variant="secondary">
            See how we calculate your share
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

function CollapsibleExtras() {
  const [openIndex, setOpenIndex] = useState(0);
  const sections = [
    {
      content: <TransparencyInline />,
      icon: Eye,
      summary: "Every booking, every expense, every month. Full transparency on how your money moves.",
      title: "No black box",
    },
    {
      content: <ApprovalsInline />,
      icon: Zap,
      summary: "What you sign off on, and what we handle without bothering you.",
      title: "You stay in control",
    },
    {
      content: <InvestmentInline />,
      icon: Building2,
      summary: "The math on a Goa STR investment: rental yield, appreciation, and combined IRR.",
      title: "Thinking of buying in Goa?",
    },
  ] as const;

  return (
    <Section className="pt-0" id="extras" tone="cream">
      <div className="mx-auto max-w-[860px]">
        <Heading eyebrow="Dig deeper" lead="Everything you'd want to know before signing." title="More about how we work." />
        <div className="mt-10 grid gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const IconComponent = Icon as LucideIcon;
            const isOpen = openIndex === index;

            return (
              <div className="overflow-hidden rounded-[20px] border border-[#dddddd] bg-white shadow-sm sm:rounded-[24px]" key={section.title}>
                <button
                  aria-expanded={isOpen}
                  className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left sm:gap-5 sm:px-6 sm:py-6"
                  onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                  type="button"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1f1] text-[#ff5a5f] sm:h-12 sm:w-12 sm:rounded-2xl">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-base font-extrabold text-[#222222] sm:text-lg">{section.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-[#717171]">{section.summary}</span>
                  </span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${isOpen ? "bg-[#ff5a5f] text-white rotate-180" : "bg-[#f7f7f7] text-[#484848]"}`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-6 sm:pb-6">{section.content}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function TransparencyInline() {
  const steps = [
    ["Monthly P&L statement", "A detailed sheet with every booking, every expense, and the final profit: shared by the 5th of every month for the month prior."],
    ["Owner approval", "No payout is made until you review and approve. If something looks off, we discuss it. Full control stays with you."],
    ["Bank transfer in 3 days", "Once you approve, your share is transferred within 3 working days. TDS handled. UTR confirmation shared."],
    ["Audit access anytime", "All bills, receipts, ID copies and booking records are kept centrally. Verify any expense, any time."],
  ];

  return (
    <div className="rounded-2xl bg-[#fbf7f1] p-4 sm:p-5">
      <p className="text-[15px] leading-7 text-[#484848]">The biggest reason owners hesitate to hand over their property is fear of the unknown: inflated expenses, mystery deductions, surprise charges. We built CMS specifically to eliminate that fear.</p>
      <div className="mt-5 grid gap-1">
        {steps.map(([title, body], index) => (
          <div className={`flex gap-4 py-4 ${index ? "border-t border-[#ebebeb]" : ""}`} key={title}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff1f1] text-sm font-extrabold text-[#ff5a5f]">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold text-[#222222]">{title}</div>
              <div className="mt-1 text-sm leading-6 text-[#717171]">{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalsInline() {
  const youApprove = [
    "Monthly P&L statement, before any payout",
    "Any expense above Rs 5,000 outside standard ops",
    "Any furnishing, repair or upgrade above Rs 10,000",
    "Pricing strategy review (quarterly, optional)",
    "Long-stay (30+ night) guest bookings",
    "Any deviation from the agreed tier model",
  ];
  const weHandle = [
    "Day-to-day guest communication",
    "Cleaning, restocking, minor repairs (under Rs 5,000)",
    "Standard seasonal pricing adjustments",
    "Compliance filings (Statistic Forma, TDS returns, etc.)",
    "Marketing and listing optimisations",
    "Routine owner reporting",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#ff9295] bg-[#fbf7f1] p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#ff5a5f]" />
          <span className="text-base font-extrabold text-[#222222]">You approve</span>
        </div>
        <ul className="grid gap-3">
          {youApprove.map((item) => (
            <li className="flex gap-2 text-sm leading-6 text-[#484848]" key={item}>
              <Check className="mt-1 h-4 w-4 shrink-0 text-[#ff5a5f]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-[#ebebeb] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#3c8399]" />
          <span className="text-base font-extrabold text-[#222222]">We handle</span>
        </div>
        <ul className="grid gap-3">
          {weHandle.map((item) => (
            <li className="flex gap-2 text-sm leading-6 text-[#484848]" key={item}>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#3c8399]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InvestmentInline() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenarios = [
    {
      groups: [
        {
          rows: [
            ["Property purchase price", "Rs 1.80 Cr"],
            ["Stamp duty & registration (~4-6%)", "Rs 7.2-10.8 L"],
            ["Total investment", "~Rs 1.87-1.91 Cr", true],
          ],
          title: "Investment",
        },
        {
          rows: [
            ["Annual gross STR revenue", "Rs 15 L"],
            ["Operational expenses (~15%)", "Rs 2.25 L"],
            ["Net operating income", "Rs 12.75 L"],
            ["Owner share (80%)", "Rs 10.2 L", true],
          ],
          title: "Annual Returns",
        },
        {
          rows: [
            ["Gross rental yield (on total investment)", "~7.8-8.0% p.a."],
            ["Net rental yield (post ops + management)", "~5.3-5.5% p.a."],
            ["Estimated asset appreciation", "4-6% p.a."],
            ["Potential combined return profile", "~9-11.5% p.a.", true],
          ],
          title: "Yield Profile",
        },
      ],
      label: "2 BHK Apartment in Panjim",
    },
    {
      groups: [
        {
          rows: [
            ["Property purchase price", "Rs 2.25 Cr"],
            ["Stamp duty & registration (~4-6%)", "Rs 9-13.5 L"],
            ["Total investment", "~Rs 2.34-2.39 Cr", true],
          ],
          title: "Investment",
        },
        {
          rows: [
            ["Annual gross STR revenue", "Rs 15 L"],
            ["Operational expenses (~15%)", "Rs 2.25 L"],
            ["Net operating income", "Rs 12.75 L"],
            ["Owner share (80%)", "Rs 10.2 L", true],
          ],
          title: "Annual Returns",
        },
        {
          rows: [
            ["Gross rental yield (on total investment)", "~6.3-6.4% p.a."],
            ["Net rental yield (post ops + management)", "~4.2-4.4% p.a."],
            ["Estimated asset appreciation", "6-10% p.a."],
            ["Potential combined return profile", "~10-14% p.a.", true],
          ],
          title: "Yield Profile",
        },
      ],
      label: "3 BHK Villa in South Goa",
    },
  ] as const;

  const scenario = scenarios[scenarioIndex];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        {scenarios.map((entry, index) => (
          <button
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              scenarioIndex === index ? "border-[#ff5a5f] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#484848]"
            }`}
            key={entry.label}
            onClick={() => setScenarioIndex(index)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {scenario.groups.map((group) => (
          <div className="overflow-hidden rounded-2xl border border-[#dddddd] bg-[#fbf7f1]" key={group.title}>
            <div className="bg-[#1b1714] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{group.title}</div>
            {group.rows.map(([label, value, highlight], index) => (
              <div className={`flex items-center justify-between gap-3 px-5 py-3 ${index ? "border-t border-[#ebebeb]" : ""} ${highlight ? "bg-[#fff1f1]" : ""}`} key={label}>
                <span className={`text-sm ${highlight ? "font-bold text-[#484848]" : "text-[#484848]"}`}>{label}</span>
                <span className={`text-sm font-extrabold whitespace-nowrap ${highlight ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12.5px] italic leading-5 text-[#b0b0b0]">These are illustrative scenarios based on current Goa market data. Actual returns depend on property specifics, location, season, and market dynamics.</p>
      <div className="mt-5">
        <ButtonLink className="w-full" onClick={() => trackCalendarClick("investment_accordion")} size="lg">
          Thinking of buying? Get a custom analysis <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}

function FinalCTA() {
  return (
    <section aria-labelledby="closing-cta-title" className="bg-white" id="contact">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 lg:px-16 lg:py-24">
        <div className="flex flex-col gap-7 rounded-3xl bg-[#1f1f1d] p-8 text-white lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:p-14">
          <div className="max-w-[560px]">
            <h2 id="closing-cta-title" className="text-[28px] font-bold leading-tight tracking-tight lg:text-4xl">Not sure which stay fits?<br />Message us.</h2>
            <p className="mt-5 text-base leading-relaxed text-[#d8d3c9] lg:text-[17px]">Tell us your dates and group size. We will suggest the right place and send you a direct rate.</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2">
            <a className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-public-coral-ink px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:w-auto" href={WHATSAPP_URL} onClick={() => trackWhatsappClick("footer_cta")} rel="noopener noreferrer" target="_blank"><span className="text-white">Message us on WhatsApp</span></a>
            <a className="inline-flex min-h-11 items-center rounded-sm text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="#stays"><span className="text-white">See all stays</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

type ProposalFaq = {
  answer: string;
  question: string;
};

function ProposalScrollLink({ children }: { children: React.ReactNode }) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    event.preventDefault();
    trackForecastFormOpen("property_management_proposal");

    const form = document.getElementById("forecast");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <ButtonLink className="w-full sm:w-auto" href="#forecast" onClick={handleClick} size="lg">
      {children}
    </ButtonLink>
  );
}

export function PropertyManagementProposal({ faqs }: { faqs: ProposalFaq[] }) {
  const steps: Array<{ description: string; icon: LucideIcon; title: string }> = [
    {
      description: "Tell us about the property type, configuration, location, size, amenities and current setup.",
      icon: FileText,
      title: "Share Your Property Details",
    },
    {
      description: "Receive an estimated seasonal and annual rental forecast based on the details provided.",
      icon: TrendingUp,
      title: "View Your Revenue Forecast",
    },
    {
      description: "Your customised pitch deck is prepared using the same property information and forecast.",
      icon: Sparkles,
      title: "Generate Your Proposal",
    },
    {
      description: "Connect with the CurateMyStay team to discuss management requirements and commercial terms.",
      icon: MessageCircle,
      title: "Discuss the Next Steps",
    },
  ];
  const proposalItems: Array<{ description: string; icon: LucideIcon; title: string }> = [
    {
      description: "An estimated annual rental revenue based on the property details submitted.",
      icon: TrendingUp,
      title: "Estimated Annual Revenue",
    },
    {
      description: "A month-by-month view showing how seasonal demand may affect property performance.",
      icon: Calendar,
      title: "Seasonal Revenue Forecast",
    },
    {
      description: "An initial estimate of the operating costs associated with managing the property.",
      icon: Banknote,
      title: "Estimated Operating Costs",
    },
    {
      description: "An estimated net profit after the operating-cost assumption used in the forecast.",
      icon: Target,
      title: "Estimated Net Profit",
    },
    {
      description: "Initial recommendations related to furnishing, amenities and preparing the property for guests.",
      icon: Building2,
      title: "Property Setup Recommendations",
    },
    {
      description: "A clear outline of what can happen next if you choose to discuss property management with CurateMyStay.",
      icon: ArrowRight,
      title: "Recommended Next Steps",
    },
  ];
  const reasons: Array<{ description: string; icon: LucideIcon; title: string }> = [
    {
      description: "Our service is designed specifically around the operational requirements of short-term rental properties in Goa.",
      icon: MapPin,
      title: "Goa-Focused Property Management",
    },
    {
      description: "Owners can view relevant property performance, bookings, expenses and payout information through their dashboard.",
      icon: Eye,
      title: "Transparent Owner Reporting",
    },
    {
      description: "Operational and financial information is organised around the owner’s assigned property.",
      icon: Building2,
      title: "Property-Level Visibility",
    },
    {
      description: "Owners can review property information and raise queries through a structured and transparent process.",
      icon: MessageCircle,
      title: "Clear Communication",
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="property_management_proposal" />

      <Section className="overflow-hidden [&>div]:pb-16 [&>div]:pt-12 sm:[&>div]:py-20 md:[&>div]:py-24" id="top" tone="cream">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-[34px] font-extrabold leading-[1.08] sm:text-[44px] lg:text-[60px] lg:leading-[1.04]">
            Get a Custom Goa Property Management Proposal
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-7 text-[#484848] sm:mt-6 sm:text-xl sm:leading-[1.55] lg:text-[22px]">
            Share a few details about your property and receive an estimated rental revenue forecast along with a customised property management pitch deck.
          </p>
          <div className="mt-7 flex justify-center sm:mt-8">
            <ProposalScrollLink>
              Generate My Proposal <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </ProposalScrollLink>
          </div>
          <p className="mt-4 text-[13.5px] font-medium text-[#717171]">Free to generate. No fixed commercial terms or guaranteed returns.</p>
        </div>
      </Section>

      <Section>
        <Heading
          lead="Get an initial view of your property’s short-term rental potential in a few simple steps."
          title="How It Works"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="h-full rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" key={step.title}>
                <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#fff1f1] text-[#d63e43]">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold leading-6">{step.title}</h3>
                <p className="mt-2 text-[14.5px] leading-6 text-[#484848]">{step.description}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <CalculatorSection
        analyticsLocation="property_management_proposal"
        eyebrow={null}
        id="forecast"
        lead="Complete the form below to view your estimated rental forecast and generate your customised property management pitch deck."
        sectionClassName="scroll-mt-24"
        title="Generate Your Property Proposal"
        tone="cream"
      />

      <Section>
        <Heading
          lead="The proposal gives you a practical initial view of your property’s rental potential and the next steps required to prepare it for short-term rental management."
          title="What Your Proposal Includes"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
          {proposalItems.map((item) => {
            const Icon = item.icon;
            return (
              <article className="h-full rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" key={item.title}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1f1] text-[#d63e43]">
                  <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold leading-6">{item.title}</h3>
                <p className="mt-2 text-[14.5px] leading-6 text-[#484848]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="cream">
        <Heading
          lead="CurateMyStay combines local property operations with clear owner visibility across bookings, revenue, expenses and payouts."
          title="Why Property Owners Choose CurateMyStay"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-12">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <article className="flex h-full min-w-0 gap-4 rounded-2xl border border-[#ebebeb] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-6" key={reason.title}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1f1] text-[#d63e43]">
                  <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold leading-6">{reason.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-6 text-[#484848]">{reason.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section>
        <Heading title="Frequently Asked Questions" />
        <div className="mt-10 md:mt-12">
          <FaqAccordion faqs={faqs} idPrefix="proposal-faq" />
        </div>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[50px]">Ready to Explore Your Property’s Rental Potential?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
            Generate your customised proposal or speak with the CurateMyStay team about your Goa property.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ProposalScrollLink>Generate My Proposal</ProposalScrollLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href={WHATSAPP_URL}
              onClick={() => trackWhatsappClick("property_management_proposal")}
              rel="noreferrer"
              size="lg"
              target="_blank"
              variant="outlineDark"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> Talk to Our Team
            </ButtonLink>
          </div>
          <div className="mt-3 flex justify-center">
            <ButtonLink className="w-full sm:w-auto" onClick={() => trackCalendarClick("property_management_proposal")} size="lg" variant="onDark">
              <Calendar aria-hidden="true" className="h-4 w-4" /> Book a discovery call
            </ButtonLink>
          </div>
        </div>
      </Section>

      <PublicFooter analyticsLocation="property_management_proposal" homeAnchorPrefix="/" />
    </main>
  );
}

export function AboutPublicPage() {
  const serviceAreas = [
    {
      title: "Property Readiness",
      description:
        "We review the property details, existing setup, furnishing, amenities and rental potential before discussing the right next steps with the owner.",
    },
    {
      title: "Short-Term Rental Operations",
      description:
        "The operating approach covers relevant booking activity, guest coordination, housekeeping, upkeep and property expenses for the managed home.",
    },
    {
      title: "Owner Reporting and Communication",
      description:
        "Owners receive property-level visibility across relevant performance, bookings, expenses and payouts, with a structured way to raise questions.",
    },
  ];
  const workingSteps = [
    {
      title: "Understand the Property",
      description:
        "CurateMyStay first reviews the property details, current setup and short-term rental potential. Prospective owners can also use the public forecast to receive an initial estimate and property proposal.",
    },
    {
      title: "Manage the Operations",
      description:
        "Once a property is managed, the team handles the relevant local booking activity, property expenses and ongoing operations needed to support short-term stays.",
    },
    {
      title: "Keep Owners Informed",
      description:
        "Owners can follow the information relevant to their assigned property, including bookings, property expenses, current performance and payout statements.",
    },
  ];
  const transparencyItems = [
    "Assigned property details",
    "Booking visibility",
    "Guest information where permitted",
    "Property expenses",
    "Current-month performance",
    "Payout history and status",
    "Owner queries",
    "Profile information",
  ];
  const whoWeAreFacts = [
    {
      title: "Founded 2025",
      description: "In active growth mode",
    },
    {
      title: "Based in Goa",
      description: "Operational team on the ground",
    },
    {
      title: "Cross-domain expertise",
      description: "20+ yrs facility management (Dubai) · Investment advisory & Fortune 500 background",
    },
  ];

  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="about_page" />

      <Section className="[&>div]:py-12 sm:[&>div]:py-16 md:[&>div]:py-20" tone="cream">
        <div className="max-w-4xl">
          <Eyebrow>About CurateMyStay</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[34px] font-extrabold leading-[1.08] sm:text-[44px] md:text-[52px] md:leading-[1.05]">
            Property Management Built Around Owner Visibility
          </h1>
          <div className="mt-5 max-w-3xl space-y-3 text-[16px] leading-7 text-[#484848] sm:text-lg sm:leading-8">
            <p>
              CurateMyStay is focused on short-term rental property management in Goa, combining local property operations with clear, practical visibility for owners.
            </p>
            <p>
              We work with property owners who want hands-on management while retaining a useful view of their property, bookings, expenses, performance and payouts.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight sm:text-4xl">What We Do</h2>
            <p className="mt-4 text-base leading-7 text-[#484848] sm:text-[17px] sm:leading-8">
              CurateMyStay supports the journey from understanding a property’s rental potential to managing its day-to-day short-term rental operations and keeping the owner informed.
            </p>
          </div>
          <div className="divide-y divide-[#ebebeb] border-y border-[#ebebeb]">
            {serviceAreas.map((area) => (
              <article className="py-5 first:pt-0 last:pb-0 sm:py-6" key={area.title}>
                <h3 className="text-lg font-extrabold leading-6">{area.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-[#484848]">{area.description}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <Heading title="How We Work" />
        <div className="mx-auto mt-10 max-w-4xl divide-y divide-[#ded8d1] border-y border-[#ded8d1] md:mt-12">
          {workingSteps.map((step, index) => (
            <article className="grid gap-3 py-6 sm:grid-cols-[72px_1fr] sm:gap-5 sm:py-7" key={step.title}>
              <span aria-hidden="true" className="text-sm font-extrabold text-[#d63e43]">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-xl font-extrabold leading-7">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-[#484848] sm:text-base">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-4xl">
          <Heading
            lead="CurateMyStay is designed to give property owners a clearer view of what is happening with their property."
            title="Built for Transparent Ownership"
          />
          <p className="mx-auto mt-6 max-w-3xl text-center text-[15px] leading-7 text-[#484848] sm:text-base">
            The owner experience keeps operational and financial information organised around the assigned property. It excludes CMS expenses and admin-only information while presenting the records and communication relevant to the owner.
          </p>
          <ul className="mt-8 grid gap-x-8 gap-y-3 border-y border-[#ebebeb] py-6 sm:grid-cols-2">
            {transparencyItems.map((item) => (
              <li className="flex items-center gap-3 text-[15px] font-semibold text-[#484848]" key={item}>
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#d63e43]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <Eyebrow>Who We Are</Eyebrow>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-4xl">
              A Family-Run Approach to Property Management
            </h2>
            <div className="mt-5 max-w-2xl space-y-4 text-base leading-7 text-[#484848] sm:text-[17px] sm:leading-8">
              <p>
                Curate My Stay is a Goa-based property management firm run by a family with two complementary backgrounds: facility management and investment-side thinking. We currently manage 5 properties and we are scaling deliberately.
              </p>
              <p>
                We approach property management the way a wealth manager approaches a portfolio: every property is an asset with an ROI, an operational P&amp;L, and a strategy attached to it. That framing is what consistently delivers strong returns for our owners without compromising the property itself.
              </p>
              <p>
                Communication stays direct, operations stay hands-on, and every property is managed with long-term value in mind.
              </p>
              <p className="font-semibold text-[#222222]">
                It is how we built a 4.98 rating. It is how we plan to scale.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {whoWeAreFacts.map((fact) => (
                <div className="rounded-2xl border border-[#ded8d1] bg-white p-4" key={fact.title}>
                  <p className="text-sm font-extrabold text-[#222222]">{fact.title}</p>
                  <p className="mt-2 text-[13px] leading-5 text-[#484848]">{fact.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[24px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)] lg:mx-0">
            <Image
              alt="The Curate My Stay family"
              className="block h-auto w-full"
              fetchPriority="high"
              height={1067}
              loading="eager"
              sizes="(min-width: 1024px) 420px, calc(100vw - 2rem)"
              src={photo("founder.jpg")}
              width={800}
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-[24px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)] lg:mx-0">
            <Image
              alt="Aravind, Founder of Curate My Stay"
              className="aspect-[4/5] w-full object-cover object-top"
              height={640}
              sizes="(min-width: 1024px) 430px, 100vw"
              src={photo("aravind.jpg")}
              width={512}
            />
          </div>
          <div>
            <h2 className="text-[28px] font-extrabold leading-tight sm:text-4xl">The People Behind CurateMyStay</h2>
            <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.04em] text-[#d63e43]">Aravind, Founder of Curate My Stay</p>
            <p className="mt-2 text-lg font-extrabold text-[#222222]">Aravind - Founder</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#484848] sm:text-[17px] sm:leading-8">
              Curate My Stay is a Goa-based, family-run property management firm. Its approach combines facility-management and investment-side thinking, with direct communication, hands-on operations and long-term property value in mind.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[50px]">Have a Property in Goa?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
            Connect with CurateMyStay to discuss your property, understand its short-term rental potential and explore the next steps.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              className="w-full sm:w-auto"
              href={WHATSAPP_URL}
              onClick={() => trackWhatsappClick("about_page")}
              rel="noreferrer"
              size="lg"
              target="_blank"
              variant="onDark"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> Talk to Our Team
            </ButtonLink>
            <ButtonLink className="w-full sm:w-auto" onClick={() => trackCalendarClick("about_page")} size="lg" variant="outlineDark">
              <Calendar aria-hidden="true" className="h-4 w-4" /> Book a Call
            </ButtonLink>
          </div>
        </div>
      </Section>

      <PublicFooter analyticsLocation="about_page" homeAnchorPrefix="/" />
    </main>
  );
}

export function FaqPublicPage({ faqs }: { faqs: ProposalFaq[] }) {
  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <CalendlyPopupLoader />
      <PublicHeader analyticsLocation="faq_page" />

      <Section className="[&>div]:py-12 sm:[&>div]:py-14 md:[&>div]:py-16" tone="cream">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[34px] font-extrabold leading-[1.08] sm:text-[44px] md:text-[52px] md:leading-[1.05]">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-[#484848] sm:text-lg sm:leading-8">
            Find answers to common questions about CurateMyStay&apos;s property management service, revenue forecasts, owner visibility and onboarding process.
          </p>
        </div>
      </Section>

      <Section>
        <FaqAccordion faqs={faqs} />
      </Section>

      <Section className="[&>div]:py-12 sm:[&>div]:py-16 md:[&>div]:py-20" tone="dark">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[50px]">Still Have a Question?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Speak with the CurateMyStay team about your Goa property and the next steps.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              className="w-full sm:w-auto"
              href={WHATSAPP_URL}
              onClick={() => trackWhatsappClick("faq_page")}
              rel="noreferrer"
              size="lg"
              target="_blank"
              variant="onDark"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> Talk to Our Team
            </ButtonLink>
            <ButtonLink className="w-full sm:w-auto" onClick={() => trackCalendarClick("faq_page")} size="lg" variant="outlineDark">
              <Calendar aria-hidden="true" className="h-4 w-4" /> Book a Call
            </ButtonLink>
          </div>
        </div>
      </Section>

      <PublicFooter analyticsLocation="faq_page" homeAnchorPrefix="/" />
    </main>
  );
}

// Keep existing owner-resource URLs functional without adding sections to the guest homepage.
function subscribeToHomeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHomeResource() {
  const hash = window.location.hash;
  return ["#calculator", "#extras", "#tiers"].includes(hash) ? hash : "";
}

export function ReferenceHome({ catalogue }: { catalogue: CatalogueLoadResult }) {
  const resource = useSyncExternalStore(subscribeToHomeHash, getHomeResource, () => "");
  const leadProperty = catalogue.properties[0];

  function closeResource(open: boolean) {
    if (!open) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1f1f1d] antialiased [font-family:var(--font-homepage)]" id="top">
      <CalendlyPopupLoader />
      <GuestHeader page="home" />
      <main>
        <PropertyCatalogue failed={catalogue.failed} heroImageAlt={leadProperty?.cover_alt_text} heroImageUrl={getPropertyImageUrl(leadProperty?.cover_storage_path)} properties={catalogue.properties} />
        <BookingGuestReviews />
        <BookingWhyDirect />
        <BookingGuestServices />
        <FamilySection id="about" />
        <FinalCTA />
      </main>
      <PublicFooter />
      <ShowMoreDialog open={Boolean(resource)} onOpenChange={closeResource} title={resource === "#calculator" ? "ROI calculator" : resource === "#tiers" ? "Management tiers" : "Owner resources"}>
        {resource === "#calculator" ? <CalculatorSection /> : resource === "#tiers" ? <Tiers /> : resource === "#extras" ? <CollapsibleExtras /> : null}
      </ShowMoreDialog>
    </div>
  );
}
