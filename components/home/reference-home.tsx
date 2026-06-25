"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Banknote,
  BedDouble,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ForecastResult as ServerForecastResult } from "@/src/features/owner-forecast/forecast-calculator";

const photo = (name: string) => `/homepage/${name}`;
const BOOK_CALL_URL = "https://calendar.app.google/U1j59uGweQoZ7hZd7";
const WHATSAPP_URL = "https://wa.me/916282627601?text=Hi%20CMS%20-%20I%20am%20interested%20in%20property%20management%20for%20my%20property%20in%20Goa.";

const navLinks = [
  ["How it works", "services"],
  ["Earnings", "calculator"],
  ["Proof", "proof"],
  ["FAQ", "risk"],
  ["Pricing", "tiers"],
];

const mobileNavIcons: Record<string, LucideIcon> = {
  calculator: TrendingUp,
  proof: Award,
  risk: ShieldCheck,
  services: BedDouble,
  tiers: Banknote,
};

const carouselPhotos = [
  "IMG_0524.jpg",
  "IMG_0375.jpg",
  "IMG_0532.jpg",
  "IMG_0600.jpg",
  "IMG_1541.jpg",
  "IMG_1548.jpg",
  "IMG_1569.jpg",
  "IMG_1581.jpg",
  "IMG_1941.jpg",
  "IMG_2017.jpg",
  "IMG_2023.jpg",
  "IMG_2098.jpg",
  "IMG_2161.jpg",
  "IMG_2166.jpg",
  "IMG_2173.jpg",
  "IMG_2685.jpg",
  "IMG_2687.jpg",
  "IMG_2693.jpg",
  "IMG_2708.jpg",
];

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
  phone: string;
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

type ForecastRequestPayload = Omit<CalculatorData, "areaSqft"> & { areaSqft: number };

const emptyCalculatorData: CalculatorData = {
  propertyCategory: "Apartment",
  configuration: "Studio",
  areaSqft: "",
  beachDistance: "Less than 500m",
  email: "",
  furnishingStatus: "",
  location: "Assagao",
  name: "",
  phone: "",
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

function Logo({
  light = false,
  showWord = true,
  size = "md",
}: {
  light?: boolean;
  showWord?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    lg: {
      image: "h-12 w-12 sm:h-14 sm:w-14",
      text: "text-lg sm:text-[22px]",
    },
    md: {
      image: "h-10 w-10 sm:h-11 sm:w-11",
      text: "text-[15px] sm:text-[17px]",
    },
    sm: {
      image: "h-8 w-8 sm:h-9 sm:w-9",
      text: "text-sm sm:text-[15px]",
    },
  }[size];

  return (
    <span className="inline-flex min-w-0 items-center gap-3 sm:gap-3.5">
      <Image
        alt="Curate My Stay"
        className={`${sizes.image} shrink-0 object-contain`}
        height={56}
        src="/logo.png"
        width={56}
      />
      {showWord ? (
        <span className={`min-w-0 whitespace-nowrap font-extrabold leading-none tracking-[-0.02em] ${sizes.text} ${light ? "text-white" : "text-[#222222]"}`}>
          Curate My Stay
        </span>
      ) : null}
    </span>
  );
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
  onClick?: () => void;
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
  eyebrow: string;
  lead?: string;
  title: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
      <Eyebrow light={dark}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[28px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]">{title}</h2>
      {lead ? <p className={`mt-4 max-w-2xl text-base leading-7 sm:mt-[18px] sm:text-[18px] sm:leading-[1.6] md:text-[19px] ${align === "center" ? "mx-auto" : ""} ${dark ? "text-white/70" : "text-[#717171]"}`}>{lead}</p> : null}
    </div>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-[1180px] items-center justify-between gap-2 px-4 py-2.5 sm:min-h-[76px] sm:gap-5 sm:px-6 sm:py-3 md:px-8">
        <Link aria-label="Curate My Stay home" href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map(([label, id]) => (
            <a className="text-sm font-bold text-[#484848] transition hover:text-[#222222]" href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href={BOOK_CALL_URL} rel="noreferrer" size="sm" target="_blank" variant="ghost">
            Book a call
          </ButtonLink>
          <ButtonLink href="/dashboard" size="sm">
            Dashboard <ArrowRight className="h-4 w-4 shrink-0" />
          </ButtonLink>
        </div>
        <button
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition lg:hidden ${menuOpen ? "border-[#ff9295] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#222222] hover:border-[#ffb1b3] hover:bg-[#fff8f8]"}`}
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen ? (
        <nav className="border-t border-[#ebebeb] bg-white/95 px-3 pb-4 pt-3 shadow-[0_16px_32px_rgba(0,0,0,0.12)] sm:px-6 lg:hidden" id="mobile-navigation">
          <div className="mx-auto max-w-[1180px]">
            <div className="ml-auto max-w-md overflow-hidden rounded-2xl border border-[#ebebeb] bg-[#fbf7f1] p-2 shadow-sm">
              <div className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9a7770]">Explore</div>
              <div className="grid gap-1">
                {navLinks.map(([label, id]) => {
                  const Icon = mobileNavIcons[id];
                  return (
                    <a className="group flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-bold text-[#332c28] transition hover:bg-white hover:text-[#d63e43]" href={`#${id}`} key={id} onClick={() => setMenuOpen(false)}>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#ffd6d7] bg-[#fff1f1] text-[#d63e43] transition group-hover:border-[#ff9295]">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">{label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#b0a29d] transition group-hover:translate-x-0.5 group-hover:text-[#d63e43]" />
                    </a>
                  );
                })}
              </div>
              <div className="my-2 h-px bg-[#eadfd8]" />
              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dddddd] bg-white px-3 text-sm font-bold text-[#332c28] transition hover:border-[#ffb1b3] hover:bg-[#fff8f8]"
                  href={BOOK_CALL_URL}
                  onClick={() => setMenuOpen(false)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Calendar className="h-4 w-4 text-[#d63e43]" /> Book a call
                </a>
                <a className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a5f] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e54b50]" href="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % carouselPhotos.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative h-80 overflow-hidden rounded-[20px] bg-[#f7f7f7] shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:h-[min(70vh,540px)] sm:min-h-[380px] sm:rounded-[24px]">
      {carouselPhotos.map((src, photoIndex) => (
        <Image
          alt={`Curate My Stay property ${photoIndex + 1}`}
          className={`object-cover [filter:saturate(1.06)_contrast(1.03)_brightness(1.02)] transition-opacity duration-[1200ms] ease-in-out ${photoIndex === index ? "opacity-100" : "opacity-0"}`}
          fill
          key={src}
          priority={photoIndex === 0}
          sizes="(min-width: 1024px) 540px, 100vw"
          src={photo(src)}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {carouselPhotos.map((src, photoIndex) => (
          <button
            aria-label={`Show property photo ${photoIndex + 1}`}
            className={`h-2 rounded-full border-0 bg-white p-0 transition-all duration-300 ${photoIndex === index ? "w-5 opacity-100" : "w-2 opacity-50"}`}
            key={src}
            onClick={() => setIndex(photoIndex)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <Section className="overflow-hidden [&>div]:pb-16 [&>div]:pt-10 sm:[&>div]:py-14 md:[&>div]:pb-20 md:[&>div]:pt-14" id="top" tone="cream">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="min-w-0">
          <Eyebrow>Goa - Short-term rental management</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-[34px] font-extrabold leading-[1.08] sm:mt-[18px] sm:text-[44px] lg:text-[60px] lg:leading-[1.04]">
            Your Property. Professionally Managed. <span className="text-[#ff5a5f]">For Higher Returns.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-7 text-[#484848] sm:mt-6 sm:text-xl sm:leading-[1.55] lg:text-[22px]">
            We help Goa homeowners earn more through fully managed short-term rentals, with complete financial transparency.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <ButtonLink className="w-full sm:w-auto" target="_blank" href="https://calendar.app.google/U1j59uGweQoZ7hZd7" size="lg">
              Book a discovery call <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink className="w-full sm:w-auto" href="#calculator" size="lg" variant="secondary">
              <FileText className="h-4 w-4" /> Get my custom pitch deck
            </ButtonLink>
          </div>
          <div className="mt-[26px] flex flex-wrap gap-x-[22px] gap-y-3 text-[14.5px] font-semibold text-[#484848]">
            <span className="inline-flex items-center gap-2"><Star className="h-[17px] w-[17px] fill-[#ff5a5f] text-[#ff5a5f]" /> 4.98 / 5 on Airbnb</span>
            <span className="inline-flex items-center gap-2"><Award className="h-[17px] w-[17px] text-[#ff5a5f]" /> Superhost</span>
            <span className="inline-flex items-center gap-2"><FileCheck2 className="h-[17px] w-[17px] text-[#ff5a5f]" /> Monthly P&L, owner-approved</span>
          </div>
          <p className="mt-4 text-[13.5px] font-medium text-[#717171]">No commitment. 30-min call. We&apos;ll tell you upfront if your property is a fit.</p>
        </div>
        <div className="relative min-w-0">
          <HeroCarousel />
          <div className="absolute -bottom-6 left-3 w-48 rounded-[16px] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:left-4 sm:w-56 sm:rounded-[18px] sm:px-5 sm:py-4 md:-left-5">
            <div className="text-[28px] font-extrabold leading-none tracking-[-0.02em]">150+</div>
            <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#484848]">
              <Star className="h-4 w-4 fill-[#ff5a5f] text-[#ff5a5f]" /> 5-star reviews
            </div>
            <div className="my-2 h-px bg-[#ebebeb]" />
            <div className="text-[22px] font-extrabold tracking-[-0.02em]">200+</div>
            <div className="mt-0.5 text-[13px] font-semibold text-[#484848]">successful stays</div>
          </div>
          <div className="absolute right-3 top-3 rounded-full border border-[#dddddd] bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm sm:right-[18px] sm:top-[18px] sm:px-[13px]">
            <Star className="mr-1 inline h-4 w-4 fill-[#ff5a5f] text-[#ff5a5f]" />
            4.98 average
          </div>
        </div>
      </div>
    </Section>
  );
}

function MathAnchor() {
  const rows = [
    ["ROI", "3-4%", "Upwards of 6%"],
    ["Maintenance", "Tenant call, tenant terms", "Daily care, deep cleans, restocking"],
    ["Condition over 12 months", "Wears down", "Hotel-grade"],
    ["Control", "Locked in 11 months", "Block dates anytime, use it yourself"],
    ["Vacancy risk", "1-2 month gaps", "Spread across 100+ guests / year"],
    ["Seasonality", "Fixed rent regardless of demand", "Higher earnings during peak tourism months"],
    ["Guest quality", "Single tenant dependency", "Verified guests & reviews"],
  ];

  return (
    <Section id="math" tone="dark">
      <Heading
        dark
        eyebrow="The math that changes everything"
        lead="Most owners in Goa lease long-term and accept the rental yield they are given. Here is what the same property looks like under short-term rental management."
        title="Same property. A different operating model."
      />
      <div className="mt-8 grid gap-3 md:hidden">
        {rows.map(([label, ltr, cms]) => (
          <div className="overflow-hidden rounded-2xl border border-white/10" key={label}>
            <div className="bg-white/[0.06] px-4 py-3 text-sm font-extrabold text-white">{label}</div>
            <div className="grid grid-cols-2">
              <div className="min-w-0 border-r border-white/10 p-3">
                <div className="text-[11px] font-extrabold uppercase text-white/45">Long-term</div>
                <div className="mt-1 break-words text-[13px] leading-5 text-white/65">{ltr}</div>
              </div>
              <div className="min-w-0 bg-[#ff5a5f]/10 p-3">
                <div className="text-[11px] font-extrabold uppercase text-[#e9aa4b]">With CMS</div>
                <div className="mt-1 break-words text-[13px] font-bold leading-5 text-white">{cms}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 hidden rounded-[24px] border border-white/10 md:block">
        <div className="grid min-w-[650px] grid-cols-[1.25fr_1fr_1.15fr]">
          <div className="bg-white/[0.03] p-5" />
          <div className="border-l border-white/10 bg-white/[0.03] p-5 text-xs font-extrabold uppercase tracking-[0.14em] text-white/60">Long-term rental</div>
          <div className="border-l-2 border-[#ff5a5f] bg-[#ff5a5f]/15 p-5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#e9aa4b]">Short-term with CMS</div>
          {rows.map(([label, ltr, cms]) => (
            <div className="contents" key={label}>
              <div className="border-t border-white/10 p-5 text-sm font-bold text-white/85">{label}</div>
              <div className="border-l border-t border-white/10 p-5 text-sm text-white/60">{ltr}</div>
              <div className="border-l-2 border-t border-[#ff5a5f] bg-[#ff5a5f]/10 p-5 text-sm font-bold text-white">{cms}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 text-center">
        <p className="mx-auto max-w-2xl text-2xl font-extrabold italic tracking-tight text-[#e9aa4b]">&quot;Same property. Different operating model. Better cash flow.&quot;</p>
        <a className="mt-6 inline-flex items-center gap-2 border-b-2 border-[#ff5a5f] pb-1 text-base font-extrabold text-white" href="#calculator">
          See the full numbers for your property <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Section>
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
    <div className="flex min-w-0 flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            className={`min-h-11 min-w-0 flex-[1_1_88px] rounded-xl border px-2.5 py-2.5 text-[14px] font-semibold transition sm:px-3 sm:py-[11px] sm:text-[14.5px] ${active ? "border-[#ff5a5f] bg-[#fff1f1] text-[#d63e43]" : "border-[#dddddd] bg-white text-[#484848] hover:bg-[#f7f7f7]"}`}
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
  data,
  onReset,
  ownerEmailSent,
  pdfDownloadUrl,
  pitchDeckStatus,
  response,
}: {
  data: CalculatorData;
  onReset: () => void;
  ownerEmailSent: boolean;
  pdfDownloadUrl: string | null;
  pitchDeckStatus: PitchDeckStatus;
  response: ForecastApiResponse;
}) {
  const number = (process.env.NEXT_PUBLIC_CMS_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const whatsappMessage = `Hi CurateMyStay, I generated a forecast for my ${data.configuration} ${data.propertyCategory} in ${data.location} and would like to discuss it.`;
  const whatsappUrl = number ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage)}` : null;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
        {whatsappUrl ? (
          <ButtonLink href={whatsappUrl} rel="noreferrer" size="lg" target="_blank">
            <MessageCircle className="h-4 w-4" /> WhatsApp us now
          </ButtonLink>
        ) : (
          <ButtonLink disabled size="lg">
            <MessageCircle className="h-4 w-4" /> WhatsApp unavailable
          </ButtonLink>
        )}
        {pitchDeckStatus === "ready" && pdfDownloadUrl ? (
          <ButtonLink href={pdfDownloadUrl} rel="noreferrer" size="lg" target="_blank" variant="secondary">
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

function CalculatorSection() {
  const [data, setData] = useState<CalculatorData>(emptyCalculatorData);
  const [result, setResult] = useState<ForecastApiResponse | null>(null);
  const [pitchDeckStatus, setPitchDeckStatus] = useState<PitchDeckStatus>("idle");
  const [proposal, setProposal] = useState<ProposalApiResponse | null>(null);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
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
  const step2Ok = Boolean(data.name.trim() && data.phone.trim().length >= 7 && emailOk && data.residency);
  const configurationOptions = data.propertyCategory === "Apartment" ? apartmentConfigurations : villaConfigurations;

  function setField<Key extends keyof CalculatorData>(key: Key, value: CalculatorData[Key]) {
    setData((current) => ({ ...current, [key]: value }));
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
    setSubmitError("");
  }

  function toggleAmenity(amenity: string) {
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
        phone: `+91 ${data.phone.trim()}`,
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
      setPitchDeckStatus("ready");
    } catch {
      setPitchDeckStatus("failed");
    }
  }

  return (
    <Section id="calculator">
      <Heading
        eyebrow="The ROI calculator"
        lead="Tell us about your property. We'll generate a transparent annual revenue, operating-cost, and net-profit forecast, plus a downloadable custom pitch deck."
        title="What could your property actually earn?"
      />
      <div className="mx-auto mt-8 min-w-0 max-w-[880px] sm:mt-12">
        {result ? (
          <ForecastResult
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
                  <TextInput invalid={touched && !data.name.trim()} onChange={(event) => setField("name", event.target.value)} placeholder="Your name" value={data.name} />
                </Field>
                <Field hint="Default +91: change for international" label="Phone" required>
                  <div className="flex min-w-0 gap-2">
                    <span className="grid h-12 w-14 shrink-0 place-items-center rounded-xl border border-[#dddddd] bg-[#f7f7f7] text-[15px] font-semibold sm:w-16 sm:text-[15.5px]">+91</span>
                    <div className="min-w-0 flex-1">
                      <TextInput invalid={touched && data.phone.trim().length < 7} onChange={(event) => setField("phone", event.target.value)} placeholder="98765 43210" type="tel" value={data.phone} />
                    </div>
                  </div>
                </Field>
                <Field label="Email" required>
                  <TextInput invalid={touched && !emailOk} onChange={(event) => setField("email", event.target.value)} placeholder="you@email.com" type="email" value={data.email} />
                </Field>
                <Field hint="Helps us route your follow-up" label="Where are you based?" required>
                  <SelectBox invalid={touched && !data.residency} onChange={(value) => setField("residency", value)} options={["In Goa", "In India (outside Goa)", "Abroad (NRI)"]} placeholder="Select" value={data.residency} />
                </Field>
                {touched && !step2Ok ? <div className="text-[13.5px] text-[#c13515] md:col-span-2">Please enter your name, a valid phone and email, and where you&apos;re based.</div> : null}
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

function Services() {
  const cards: Array<{ icon: LucideIcon; items: string[]; title: string }> = [
    {
      icon: BedDouble,
      items: ["Guest coordination: pre, in & post-stay", "Check-in & check-out (or self check-in)", "Housekeeping & deep cleans between stays", "Linen, toiletries & consumables restocking", "Minor repairs and on-call maintenance", "24/7 guest support by our team"],
      title: "Property operations",
    },
    {
      icon: TrendingUp,
      items: ["Listed on Airbnb, Booking.com, MMT & direct", "Dynamic pricing tuned for Goa's seasons", "Calendar sync: no double-bookings, ever", "Guest screening & ID verification", "Photography, listing copy & review management", "Marketing pushes during low season"],
      title: "Booking & revenue",
    },
    {
      icon: ShieldCheck,
      items: ["Tourism / homestay registration (in your name)", "Statistic Forma Reporting for every guest", "Fire NOC, trade license, GST registration", "House rules drafted, enforced, documented", "Damage recovery via deposits & AirCover", "Society & neighbour liaison"],
      title: "Compliance and care",
    },
  ];

  return (
    <Section className="[&>div]:pt-14 md:[&>div]:pb-[104px]" id="services">
      <Heading eyebrow="What we actually do" lead="End-to-end management. You stay informed; we handle execution." title="What you hand over. What we handle." />
      <div className="mt-[52px] grid gap-[22px] lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div className="h-full rounded-2xl border border-[#ebebeb] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.06)]" key={card.title}>
              <div className="mb-[18px] grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-gradient-to-br from-[#e98363] via-[#e1914f] to-[#e9aa4b] text-white">
                <Icon className="h-[26px] w-[26px]" />
              </div>
              <h3 className="text-[21px] font-extrabold tracking-[-0.01em]">{card.title}</h3>
              <ul className="mt-4 grid gap-[11px]">
                {card.items.map((item) => (
                  <li className="flex items-start gap-2.5 text-[14.5px] leading-[1.45] text-[#484848]" key={item}>
                    <Check className="mt-px h-[17px] w-[17px] shrink-0 text-[#ff5a5f]" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-xl font-bold italic text-[#ff5a5f] sm:mt-[52px] sm:text-2xl md:text-[26px]">&quot;You don&apos;t need to lift a finger. Unless you want to.&quot;</p>
    </Section>
  );
}

function StatsAndProof() {
  return (
    <Section id="proof" tone="cream">
      <Heading
        eyebrow="Track record & proof"
        lead="We lead with real figures, not adjectives. Here's what the portfolio looks like today."
        title="The numbers behind the promise."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:grid-cols-4 md:gap-5">
        {[
          ["4.98 / 5", "Airbnb rating across all listings"],
          ["150+", "Five-star guest reviews"],
          ["200+", "Successful stays delivered"],
          ["Superhost", "11+ months running"],
        ].map(([value, label]) => (
          <div className="rounded-2xl border border-[#ebebeb] bg-white px-5 py-6 text-center shadow-sm sm:rounded-[24px] sm:px-6 sm:py-7" key={label}>
            <div className="text-[34px] font-extrabold leading-none tracking-[-0.02em] text-[#ff5a5f] sm:text-[42px]">{value}</div>
            <div className="mt-3 text-sm leading-5 text-[#484848]">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-14 sm:mt-16 sm:gap-18">
        <CaseStudy
          body="Rather than adapting a residential apartment for short-term rentals, this property was designed from day one with guests in mind. From workcation-friendly interiors and fully air-conditioned spaces to a furnished balcony, modern kitchen, pool access, and a central Panjim location, every element was optimized to maximize guest appeal and occupancy throughout the year."
          chart={[
            { m: "Nov '25", v: 1 },
            { m: "Dec '25", v: 1.73 },
            { m: "Jan '26", v: 1.38 },
            { m: "Feb '26", v: 1.18 },
            { m: "Mar '26", v: 1.16 },
          ]}
          eyebrow="Case study · Managed since November 2025"
          photos={["panjim-1.jpg", "panjim-2.jpg", "panjim-3.jpg", "panjim-4.jpg"]}
          stats={[
            ["Average occupancy", "77%"],
            ["Location average occupancy", "28.7%"],
            ["Guest rating", "5 *"],
            ["Expense ratio", "9.9%"],
          ]}
          subtitle="Modern 2 BHK Apartment in Panjim"
          title="Designed for Short-Term Rentals from Day One"
        />
        <CaseStudy
          body="When we took over this 3 BHK villa in Varca, the property was not operationally ready for the short-term rental market. We invested in setup, operational improvements, and guest-readiness during the first month. The investment was recovered the very next month, with revenue doubling shortly thereafter: transforming the villa into a high-performing holiday home just 700 metres from the beach."
          chart={[
            { m: "Oct '25", v: 1 },
            { m: "Nov '25", v: 1.36 },
            { m: "Dec '25", v: 2.11 },
            { m: "Jan '26", v: 1.81 },
            { m: "Feb '26", v: 1.29 },
            { m: "Mar '26", v: 1.37 },
          ]}
          eyebrow="Case study · Managed since September 2025"
          photos={["varca-1.jpg", "varca-2.jpg", "varca-3.jpg"]}
          reverse
          stats={[
            ["Average occupancy", "65.4%"],
            ["Location average occupancy", "31.2%"],
            ["Guest rating", "4.95 *"],
            ["Expense ratio", "15.5%"],
          ]}
          subtitle="Private 3 BHK Villa in Varca, South Goa"
          title="From Underperforming Asset to Proven Performer"
        />
      </div>
      <Testimonials />
    </Section>
  );
}

function RampChart({ data }: { data: Array<{ m: string; v: number }> }) {
  const width = 360;
  const height = 130;
  const pad = 8;
  const max = Math.max(...data.map((point) => point.v));
  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((point, index) => [pad + index * step, height - pad - (point.v / max) * (height - pad - 22)] as const);
  const line = points.map((point, index) => `${index ? "L" : "M"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${points.at(-1)?.[0].toFixed(1)} ${height - pad} L ${points[0]?.[0].toFixed(1)} ${height - pad} Z`;

  return (
    <svg className="block w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="case-ramp-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e98363" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e98363" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#case-ramp-fill)" />
      <path d={line} fill="none" stroke="#ff5a5f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      {points.map((point, index) => {
        const peak = data[index]?.v === max;
        return <circle cx={point[0]} cy={point[1]} fill={peak ? "#ff5a5f" : "#ffffff"} key={data[index]?.m} r={peak ? 4.5 : 3} stroke="#ff5a5f" strokeWidth="2" />;
      })}
      {data.map((point, index) => (
        <text fill="#b0b0b0" fontSize="9" fontWeight="600" key={point.m} textAnchor="middle" x={points[index]?.[0]} y={height - 1}>
          {point.m}
        </text>
      ))}
    </svg>
  );
}

function CaseStudy({
  body,
  chart,
  eyebrow,
  photos,
  reverse = false,
  stats,
  subtitle,
  title,
}: {
  body: string;
  chart: Array<{ m: string; v: number }>;
  eyebrow: string;
  photos: string[];
  reverse?: boolean;
  stats: Array<[string, string]>;
  subtitle: string;
  title: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [photos]);

  const imagePanel = (
    <div className="relative h-[300px] overflow-hidden rounded-[20px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:h-[360px] lg:h-[min(56vh,440px)]">
      {photos.map((src, photoIndex) => (
        <Image
          alt={title}
          className={`object-cover transition-opacity duration-[1000ms] ease-in-out ${photoIndex === index ? "opacity-100" : "opacity-0"}`}
          fill
          key={src}
          sizes="(min-width: 1024px) 520px, 100vw"
          src={photo(src)}
        />
      ))}
      {photos.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {photos.map((src, photoIndex) => (
            <button
              aria-label={`Show ${title} photo ${photoIndex + 1}`}
              className={`h-2 rounded-full border-0 bg-white p-0 transition-all duration-300 ${photoIndex === index ? "w-5 opacity-100" : "w-2 opacity-55"}`}
              key={src}
              onClick={() => setIndex(photoIndex)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const copyPanel = (
    <div className="min-w-0">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="mt-4 text-[28px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#222222] sm:text-[32px]">{title}</h3>
      <p className="mt-2 text-[17px] font-semibold text-[#717171]">{subtitle}</p>
      <p className="mt-4 text-[15px] leading-7 text-[#484848] sm:text-[16.5px] sm:leading-[1.6]">{body}</p>
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-[#ebebeb] bg-[#ebebeb]">
        {stats.map(([label, value], statIndex) => (
          <div className="bg-white px-4 py-4 sm:px-[18px]" key={label}>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#717171]">{label}</div>
            <div className={`mt-1 text-[21px] font-extrabold tracking-[-0.01em] ${statIndex === stats.length - 1 ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[20px] border border-[#ebebeb] bg-white px-4 py-4 sm:px-[18px] sm:pb-3">
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#717171]">Monthly revenue progression (first month = 1.0x)</div>
        <RampChart data={chart} />
      </div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-[52px]">
      {reverse ? (
        <>
          {copyPanel}
          {imagePanel}
        </>
      ) : (
        <>
          {imagePanel}
          {copyPanel}
        </>
      )}
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      initials: "AC",
      prop: "Owner · Varca 3 BHK Villa",
      q: "Aravind has been managing several of our rental properties and has been a dependable partner throughout. He is professional, responsive, and has a great attention to detail. He strives hard to ensure both great guest experience and adequate property care, making day-to-day hosting much easier.",
      who: "Ayushi Chand",
    },
    {
      initials: "SS",
      prop: "Owner · Majorda 3 BHK Villa",
      q: "Aravind has been an outstanding host. He is extremely honest, responsible, disciplined, and punctual in managing the Airbnb. The house is always kept clean, guests are well cared for, and he handles everything with great sincerity. Highly appreciated and fully trusted.",
      who: "Sadhna S.",
    },
    {
      initials: "VC",
      prop: "Owner · Panjim 2 BHK Apartment",
      q: "Working with Aravind has made hosting our property far more seamless and stress-free. He is proactive, communicates clearly, and genuinely cares about maintaining the home to a high standard. Guests have consistently had smooth experiences, and we have appreciated the level of reliability and transparency throughout.",
      who: "Venu Chand",
    },
  ];

  return (
    <div className="mt-12 sm:mt-16">
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <figure className="flex h-full min-w-0 flex-col rounded-[20px] border border-[#ebebeb] bg-white p-5 shadow-sm sm:rounded-[24px] sm:p-[30px]" key={item.who}>
            <Quote className="h-7 w-7 text-[#ff9295]" />
            <blockquote className="mt-4 flex-1 text-[16px] italic leading-7 text-[#222222]">&quot;{item.q}&quot;</blockquote>
            <figcaption className="mt-6 flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#e98363_0%,#e1914f_45%,#e9aa4b_100%)] text-sm font-extrabold text-white">
                {item.initials}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold text-[#222222]">{item.who}</span>
                <span className="block text-xs text-[#717171]">{item.prop}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href={BOOK_CALL_URL} rel="noreferrer" size="lg" target="_blank">
          Book a discovery call <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
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
              <ButtonLink className="w-full" href={BOOK_CALL_URL} rel="noreferrer" target="_blank" variant={tier.featured ? "primary" : "secondary"}>
                Choose {tier.name}
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="mx-auto max-w-3xl text-base leading-7 text-[#717171]">Not sure which model fits? Tell us about your property in the calculator above and we will recommend one in your custom pitch deck.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink className="w-full sm:w-auto" href={BOOK_CALL_URL} rel="noreferrer" size="lg" target="_blank">
            Book a discovery call <ArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink className="w-full sm:w-auto" href="#calculator" size="lg" variant="secondary">
            See how we calculate your share
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

function TeamPlaceholder() {
  return (
    <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[24px] bg-[#f7f7f7] p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] sm:min-h-[460px] sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,90,95,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(60,131,153,0.18),_transparent_35%)]" />
      <div className="relative flex items-center gap-3">
        <div className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#d63e43] shadow-sm">
          Founder-led operations
        </div>
      </div>
      <div className="relative space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[22px] border border-white/70 bg-white/90 p-5 shadow-sm">
            <Logo showWord={false} size="lg" />
            <div className="mt-5 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#222222] sm:text-[30px]">
              A hands-on management partner for owners who want better hospitality returns.
            </div>
            <div className="mt-4 text-sm leading-6 text-[#717171]">
              Built for clear reporting, strong guest stays, and long-term property care.
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[20px] border border-white/70 bg-[#1b1714] p-5 text-white shadow-sm">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#e9aa4b]">Owner mindset</div>
              <div className="mt-3 text-lg font-extrabold tracking-[-0.02em]">Treating each property like an asset, not just an address.</div>
            </div>
            <div className="rounded-[20px] border border-white/70 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#717171]">What matters</span>
                <span className="rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#d63e43]">
                  4.98 rating
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["Reporting", "Monthly P&L shared clearly"],
                  ["Operations", "Guest and property care managed"],
                  ["Control", "Owners approve where it matters"],
                ].map(([label, value]) => (
                  <div className="flex items-start justify-between gap-3 border-t border-[#ebebeb] pt-3 first:border-t-0 first:pt-0" key={label}>
                    <span className="text-sm font-bold text-[#222222]">{label}</span>
                    <span className="text-right text-xs leading-5 text-[#717171]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FounderPlaceholder() {
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[18px] border border-white/15 bg-[linear-gradient(160deg,_rgba(233,131,99,0.92),_rgba(233,170,75,0.9),_rgba(60,131,153,0.86))] shadow-sm sm:h-24 sm:w-24 sm:rounded-[20px]">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/18 backdrop-blur-sm sm:h-14 sm:w-14">
        <Logo light showWord={false} size="sm" />
      </div>
    </div>
  );
}

function Team() {
  return (
    <Section id="about">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <TeamPlaceholder />
        <div>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-[40px]">A Family-Run Approach to Property Management</h2>
          <p className="mt-5 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">Curate My Stay is a Goa-based property management firm run by a family with two complementary backgrounds: facility management and investment-side thinking. We currently manage 5 properties and we are scaling deliberately.</p>
          <p className="mt-4 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">We approach property management the way a wealth manager approaches a portfolio: every property is an asset with an ROI, an operational P&amp;L, and a strategy attached to it. That framing is what consistently delivers strong returns for our owners without compromising the property itself.</p>
          <p className="mt-4 text-base leading-7 text-[#484848] sm:text-[16.5px] sm:leading-8">Communication stays direct, operations stay hands-on, and every property is managed with long-term value in mind.</p>
          <p className="mt-4 text-base font-semibold leading-7 text-[#222222] sm:text-[16.5px] sm:leading-8">It is how we built a 4.98 rating. It is how we plan to scale.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              [Rocket, "Founded 2025", "In active growth mode"],
              [MapPin, "Based in Goa", "Operational team on the ground"],
              [Target, "Cross-domain expertise", "20+ yrs facility management (Dubai) · Investment advisory & Fortune 500 background"],
            ].map(([Icon, title, body]) => {
              const IconComponent = Icon as LucideIcon;
              return (
                <div className="rounded-2xl border border-[#ebebeb] bg-[#fbf7f1] p-5" key={title as string}>
                  <IconComponent className="h-6 w-6 text-[#ff5a5f]" />
                  <div className="mt-3 text-sm font-extrabold">{title as string}</div>
                  <div className="mt-1 text-xs leading-5 text-[#717171]">{body as string}</div>
                </div>
              );
            })}
          </div>
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

function RiskSection() {
  const faqs = [
    ["What if I lose control of my property?", "You retain 100% ownership. The Leave & License agreement is a standard legal instrument that creates no tenancy rights. You can exit after the lock-in with 2 months' notice. We never take a stake in the property itself."],
    ["What if you inflate expenses?", "Every expense is itemised in your monthly P&L with a receipt or invoice attached. You approve the statement before any payout. You have audit access to the underlying receipts any time. If you disagree with anything, we discuss it before payment."],
    ["What if guests damage my property?", "Every booking goes through ID verification and a security deposit. House rules are explicit and enforced, and property condition is photographed before and after every stay. Airbnb's Host Protection adds cover. Damages get a documented recovery plan within 48 hours."],
    ["What happens during monsoon with no bookings?", "Monsoon is part of the Goa rental cycle, and we actively plan for it. We use dynamic pricing, flexible stay strategies, offline agents, third-party partners, and a strong repeat guest network to maintain occupancy through the season.\n\nWe also have a growing contact base of 200+ past guests and enquiries who often return during off-season months for longer stays at value pricing. At the same time, monsoon is used for preventive maintenance and upgrades so the property is fully peak-season ready."],
    ["What if I want to use my own property?", "You get personal-use days every year (5-7 depending on tier), plus anything we mutually agree. Just give advance notice so we can block the dates. It's still your home."],
    ["What if I'm not happy and want to exit?", "After the 6-8 month lock-in, either party can exit with 2 months' written notice. There are no hidden exit fees.\n\nThat said, Goa is a highly seasonal market, and properties typically perform best when evaluated across a full 12-month cycle. Staying through the full year gives a far more accurate picture of occupancy, cash flow, and overall returns."],
    ["Is this fully legal? Do I need permissions?", "Yes. The tourism license / homestay registration goes in your name (we handle the paperwork). Statistic Forma Reporting is filed for every guest. The Leave & License agreement is the same instrument used across India for short-stay arrangements."],
    ["What if you misrepresent earnings?", "Every OTA booking carries a complete platform paper trail, and revenue is fully verifiable from the platform records themselves. We also share supporting screenshots and booking-level details in the monthly P&L.\n\nFor offline or direct bookings, entries are backed by payment proofs, guest records, and internal invoices/logs; so all revenue remains trackable and transparent. There is no scenario where one number is shown internally and another exists on the actual booking source."],
    ["What about TDS and tax compliance?", "We deduct 10% TDS on your share, deposit it with the government monthly, and share quarterly TDS filings ready for your CA. NRIs receive Form 16A on request. Your accountant gets everything they need."],
    ["What if you can't fill the property?", "We share occupancy projections in your custom pitch deck before you sign. If actuals fall materially below projection for two consecutive months, we trigger a joint review: pricing, listing, or operations: at no cost."],
  ];
  const [openIndex, setOpenIndex] = useState(4);
  const midpoint = Math.ceil(faqs.length / 2);
  const columns = [faqs.slice(0, midpoint), faqs.slice(midpoint)];

  return (
    <Section id="risk" tone="cream">
      <Heading
        eyebrow="Risk & objections"
        lead="We don't pretend property management is risk-free. Here's a frank list of what owners worry about, and exactly how each is handled."
        title="What could go wrong. And what we've already done about it."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {columns.map((column, columnIndex) => (
          <div className="grid gap-4" key={columnIndex}>
            {column.map(([question, answer], index) => {
              const absoluteIndex = columnIndex * midpoint + index;
              const isOpen = openIndex === absoluteIndex;

              return (
                <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors ${isOpen ? "border-[#ff9295]" : "border-[#ebebeb]"}`} key={question}>
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
                    onClick={() => setOpenIndex((current) => (current === absoluteIndex ? -1 : absoluteIndex))}
                    type="button"
                  >
                    <span className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-6 text-[#222222] sm:text-base">{question}</span>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${isOpen ? "bg-[#ff5a5f] text-white rotate-180" : "bg-[#f7f7f7] text-[#484848]"}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-6 whitespace-pre-line text-[#484848] sm:px-5 sm:pb-5">{answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
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
        <ButtonLink className="w-full" href={BOOK_CALL_URL} rel="noreferrer" size="lg" target="_blank">
          Thinking of buying? Get a custom analysis <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}

function FinalCTA() {
  return (
    <Section id="contact" tone="dark">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[50px]">
          The math is simple. The execution is the hard part. <span className="text-[#e9aa4b]">We&apos;ve already done it.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">Book a 30-minute discovery call. We will look at your property together, talk numbers, and tell you honestly whether short-term rental management is the right move for you. If it&apos;s not, we&apos;ll say so.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink className="w-full sm:w-auto" href={BOOK_CALL_URL} size="lg" variant="onDark">
            <Calendar className="h-4 w-4" /> Book a discovery call
          </ButtonLink>
          <ButtonLink className="w-full sm:w-auto" href={WHATSAPP_URL} size="lg" variant="outlineDark">
            <MessageCircle className="h-4 w-4" /> WhatsApp us directly
          </ButtonLink>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-5 rounded-[20px] border border-white/10 bg-white/[0.05] p-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-6 sm:rounded-[24px] sm:p-6 md:p-8">
        <FounderPlaceholder />
        <div className="min-w-0">
          <div className="text-center text-lg font-extrabold text-white sm:text-left">Aravind <span className="block text-sm font-semibold text-white/50 sm:inline">: Founder, Curate My Stay</span></div>
          <p className="mt-2 text-sm italic leading-6 text-white/70">&quot;Every property we take on is still personally overseen by me. That level of involvement is a big part of how we maintain consistency, trust, and attention to detail across every stay.&quot;</p>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  const siteLinks = [
    { href: "#top", label: "For Owners" },
    { href: "#top", label: "For Guests / Book a Stay" },
    { href: "#about", label: "About" },
    { href: "#proof", label: "Case Studies" },
    { href: "#top", label: "Blog (soon)" },
  ];
  const resourceLinks = [
    { href: "#extras", label: "Sample P&L Statement" },
    { href: "#extras", label: "Standard L&L Agreement" },
    { href: "#tiers", label: "Tier System One-Pager" },
    { href: "#calculator", label: "ROI Calculator" },
  ];

  return (
    <footer className="bg-[#241e19] text-white/70">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light size="lg" />
            <p className="mt-4 text-sm italic text-[#e9aa4b]">&quot;Wealth managers for property.&quot;</p>
            <div className="mt-5 grid gap-3 text-sm">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-white/50" /> Goa, India</span>
              <a className="inline-flex min-w-0 items-center gap-2 break-all" href="mailto:curatemystay@gmail.com"><Mail className="h-4 w-4 shrink-0 text-white/50" /> curatemystay@gmail.com</a>
              <a className="inline-flex items-center gap-2" href={WHATSAPP_URL} rel="noreferrer" target="_blank"><MessageCircle className="h-4 w-4 text-white/50" /> WhatsApp us</a>
            </div>
          </div>
          <FooterLinks items={siteLinks} title="Site" />
          <FooterLinks items={resourceLinks} title="Resources" />
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-white/45 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span>Copyright Curate My Stay 2026 - Privacy - Terms - Cookies</span>
          <div className="flex gap-4">
            <Globe className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
            <Star className="h-5 w-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ items, title }: { items: Array<{ href: string; label: string }>; title: string }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">{title}</div>
      <div className="mt-4 grid gap-3 text-sm">
        {items.map((item) => (
          <a className="hover:text-white" href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function BookingModal({ onClose, open }: { onClose: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#140c08]/55 p-3 backdrop-blur sm:p-5" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-[20px] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:max-h-[90vh] sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
        <div className="flex min-w-0 items-start justify-between gap-3 border-b border-[#ebebeb] p-5 sm:gap-4 sm:p-7">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Logo />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#484848]">30 minutes with the founder. We will look at your property, talk numbers, and tell you honestly if STR is the right move.</p>
          </div>
          <button aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f7f7f7]" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 sm:p-7">
          <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.14em] text-[#717171]">Pick a slot</div>
          <ButtonLink className="w-full" href={BOOK_CALL_URL} rel="noreferrer" size="lg" target="_blank">
            <Calendar className="h-4 w-4" /> Book via Google Calendar
          </ButtonLink>
          <p className="mt-3 text-center text-xs text-[#b0b0b0]">Calendar: curatemystay@gmail.com</p>
          <div className="my-5 flex items-center gap-3 text-xs text-[#717171]">
            <span className="h-px flex-1 bg-[#ebebeb]" /> or <span className="h-px flex-1 bg-[#ebebeb]" />
          </div>
          <ButtonLink className="w-full" href="https://wa.me/916282627601?text=Hi%20CMS%20-%20I%20am%20interested%20in%20property%20management%20for%20my%20property%20in%20Goa." size="lg" variant="secondary">
            <MessageCircle className="h-4 w-4" /> WhatsApp us directly
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function ReferenceHome() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white font-sans text-[#222222] antialiased">
      <Header />
      <Hero />
      <MathAnchor />
      <CalculatorSection />
      <Services />
      <StatsAndProof />
      <RiskSection />
      <Tiers />
      <Team />
      <CollapsibleExtras />
      <FinalCTA />
      <Footer />
      <BookingModal onClose={() => setBookingOpen(false)} open={bookingOpen} />
    </main>
  );
}
