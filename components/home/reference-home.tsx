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
  CheckCircle2,
  ChevronDown,
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

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Image alt="Curate My Stay" className="h-8 w-8 shrink-0 rounded-lg object-contain sm:h-9 sm:w-9 sm:rounded-xl" height={36} src="/logo.png" width={36} />
      <span className="min-w-0 leading-none">
        <span className={`block whitespace-nowrap text-sm font-extrabold sm:text-base ${light ? "text-white" : "text-[#222222]"}`}>Curate My Stay</span>
        <span className={`mt-1 hidden text-xs font-bold sm:block ${light ? "text-white/50" : "text-[#717171]"}`}>For Property Owners</span>
      </span>
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

function Photo({ alt, className = "", src }: { alt: string; className?: string; src: string }) {
  return <Image alt={alt} className={`h-full w-full object-cover [filter:saturate(1.06)_contrast(1.03)_brightness(1.02)] ${className}`} height={900} sizes="(min-width: 1024px) 560px, 100vw" src={photo(src)} width={1200} />;
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
          <ButtonLink href="#contact" size="sm" variant="ghost">
            Book a property
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
                <a className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dddddd] bg-white px-3 text-sm font-bold text-[#332c28] transition hover:border-[#ffb1b3] hover:bg-[#fff8f8]" href="#contact" onClick={() => setMenuOpen(false)}>
                  <Calendar className="h-4 w-4 text-[#d63e43]" /> Book a property
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
    ["Maintenance", "Tenant calls, tenant terms", "Daily care, deep cleans, restocking"],
    ["Control", "Locked in 11 months", "Block dates anytime, use it yourself"],
    ["Vacancy risk", "1-2 month gaps", "Spread across 100+ guests per year"],
    ["Seasonality", "Fixed rent", "Higher earnings in peak tourism months"],
    ["Guest quality", "Single tenant dependency", "Verified guests and reviews"],
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
      <Heading eyebrow="Track record and proof" lead="We lead with real figures, not adjectives. Here is what the portfolio looks like today." title="The numbers behind the promise." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 md:grid-cols-4 md:gap-5">
        {[
          ["4.98 / 5", "Airbnb rating across all listings"],
          ["150+", "Five-star guest reviews"],
          ["200+", "Successful stays delivered"],
          ["Superhost", "11+ months running"],
        ].map(([value, label]) => (
          <div className="rounded-2xl border border-[#ebebeb] bg-white p-5 text-center shadow-sm sm:p-7" key={label}>
            <div className="text-3xl font-extrabold text-[#ff5a5f] sm:text-4xl">{value}</div>
            <div className="mt-3 text-sm font-semibold leading-5 text-[#484848]">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-6 sm:mt-16 sm:gap-8 lg:grid-cols-2">
        <CaseCard photos={["panjim-1.jpg", "panjim-2.jpg", "panjim-3.jpg", "panjim-4.jpg"]} title="Panjim apartment portfolio" />
        <CaseCard photos={["varca-1.jpg", "varca-2.jpg", "varca-3.jpg"]} title="Varca villa relaunch" />
      </div>
      <Testimonials />
    </Section>
  );
}

function CaseCard({ photos, title }: { photos: string[]; title: string }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#ebebeb] bg-white shadow-sm">
      <div className="grid h-52 grid-cols-2 grid-rows-2 gap-1 bg-[#ebebeb] sm:h-64">
        {photos.slice(0, 3).map((src, index) => (
          <Photo alt={title} className={index === 0 ? "row-span-2" : ""} key={src} src={src} />
        ))}
      </div>
      <div className="p-4 sm:p-6">
        <Eyebrow>Case study</Eyebrow>
        <h3 className="mt-3 break-words text-xl font-extrabold sm:text-2xl">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#484848]">Professional operations, stronger pricing, transparent reporting, and owner-approved monthly statements.</p>
        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#ebebeb] bg-[#ebebeb]">
          {[
            ["Revenue", "Rs 8.5 L"],
            ["Owner paid", "Rs 5.5 L"],
            ["Peak month", "Rs 1.98 L"],
            ["Avg net", "Rs 78k+"],
          ].map(([label, value]) => (
            <div className="min-w-0 bg-white p-3 sm:p-4" key={label}>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#717171]">{label}</div>
              <div className="mt-1 break-words text-base font-extrabold sm:text-lg">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const items = [
    {
      photo: "ayushi.png",
      prop: "Owner - Varca 3 BHK Villa",
      q: "Aravind has been managing several of our rental properties and has been a dependable partner throughout. He is professional, responsive, and has great attention to detail.",
      who: "Ayushi Chand",
    },
    {
      photo: "sadhna.png",
      prop: "Owner - Majorda 3 BHK Villa",
      q: "The house is always kept clean, guests are well cared for, and he handles everything with great sincerity. Highly appreciated and fully trusted.",
      who: "Sadhna S.",
    },
    {
      photo: "aravind.jpg",
      prop: "Founder-led operations",
      q: "What sold me was that I approve every payout before it moves. The monthly statement makes the business feel transparent.",
      who: "Venu K.",
    },
  ];

  return (
    <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-6 lg:grid-cols-3">
      {items.map((item) => (
        <figure className="flex h-full min-w-0 flex-col rounded-[20px] border border-[#ebebeb] bg-white p-5 shadow-sm sm:rounded-[24px] sm:p-7" key={item.who}>
          <Quote className="h-7 w-7 text-[#ff9295]" />
          <blockquote className="mt-4 flex-1 text-base italic leading-7 text-[#222222]">&quot;{item.q}&quot;</blockquote>
          <figcaption className="mt-6 flex min-w-0 items-center gap-3">
            <Image alt={item.who} className="h-11 w-11 rounded-full object-cover" height={44} src={photo(item.photo)} width={44} />
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">{item.who}</span>
              <span className="block text-xs font-semibold text-[#717171]">{item.prop}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Transparency() {
  return (
    <Section id="transparency" tone="dark">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="min-w-0">
          <Eyebrow light>No black box</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-[42px]">Every booking. Every expense. Every month. In your inbox.</h2>
          <p className="mt-5 text-base leading-7 text-white/70 sm:text-lg sm:leading-8">The biggest reason owners hesitate is fear of the unknown: inflated expenses, mystery deductions, and surprise charges. We built CMS to eliminate that fear.</p>
          <div className="mt-8 grid gap-1">
            {[
              ["Monthly P&L statement", "Every booking, expense, and final profit is shared by the 5th."],
              ["Owner approval", "No payout moves until you review and approve the statement."],
              ["Bank transfer in 3 days", "Once approved, your share is transferred with confirmation."],
              ["Audit access anytime", "Bills, receipts, IDs, and booking records stay centrally available."],
            ].map(([title, body], index) => (
              <div className={`flex gap-3 py-4 sm:gap-4 ${index ? "border-t border-white/10" : ""}`} key={title}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-extrabold text-[#e9aa4b] sm:h-11 sm:w-11">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-white">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-white/65">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <OwnerPortalMock />
      </div>
    </Section>
  );
}

function OwnerPortalMock() {
  return (
    <div className="min-w-0">
      <div className="min-w-0 rounded-[20px] border border-[#ebebeb] bg-white text-[#222222] shadow-[0_12px_32px_rgba(0,0,0,0.16)] sm:rounded-[24px]">
        <div className="flex items-center gap-3 border-b border-[#ebebeb] bg-[#f7f7f7] px-4 py-3">
          <Image alt="" className="h-6 w-6 rounded-md" height={24} src="/logo.png" width={24} />
          <span className="text-sm font-extrabold">Owner dashboard</span>
          <span className="ml-auto flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#dddddd]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#dddddd]" />
          </span>
        </div>
        <div className="grid min-w-0 gap-3 p-3 sm:p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniMetric label="Revenue YTD" tone="green" value="Rs 8.5 L" />
            <MiniMetric label="This month" tone="amber" value="3 confirmed" />
          </div>
          <div className="rounded-xl border border-[#ebebeb] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase text-[#717171] sm:text-xs">Calendar - peak season</span>
              <span className="rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-extrabold text-[#d63e43]">Nov-Feb</span>
            </div>
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
              {Array.from({ length: 28 }).map((_, index) => (
                <span className={`aspect-square rounded-[3px] ${[2, 3, 4, 8, 9, 10, 11, 15, 16, 17, 22, 23, 24, 25].includes(index) ? "bg-[#ff5a5f]" : "bg-[#f7f7f7]"}`} key={index} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["P&L - Dec.pdf", "P&L - Nov.pdf", "License.pdf"].map((doc) => (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-[#f7f7f7] px-2.5 py-2 text-xs font-bold text-[#484848] sm:px-3" key={doc}>
                <FileText className="h-3.5 w-3.5 text-[#ff5a5f]" /> {doc}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-sm italic text-[#e9aa4b]">Real-time owner portal, monthly statements, and approval workflow.</p>
    </div>
  );
}

function MiniMetric({ label, tone, value }: { label: string; tone: "amber" | "green"; value: string }) {
  return (
    <div className="rounded-xl bg-[#fbf7f1] p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#717171]">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className={`mt-1 text-xs font-bold ${tone === "green" ? "text-[#2f8f4e]" : "text-[#c58a00]"}`}>{tone === "green" ? "78% to target" : "1 pending approval"}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ebebeb]">
        <div className={`h-full rounded-full ${tone === "green" ? "w-[78%] bg-gradient-to-r from-[#e98363] via-[#e1914f] to-[#e9aa4b]" : "w-[66%] bg-[#3c8399]"}`} />
      </div>
    </div>
  );
}

function Tiers() {
  const tiers = [
    ["Essential", "Plug-and-play properties.", "80 / 20", "Rs 0 - we absorb it", ["Airbnb-ready homes", "High-demand zones", "Monthly P&L approval", "7 personal-use days"], false],
    ["Curated", "Properties that need polish before they perform.", "70 / 30", "Recovered from early profit", ["Styling refresh", "Listing audit", "Professional photo plan", "Relaunch strategy"], true],
    ["Bespoke", "New, raw, or under-developed properties.", "65 / 35", "Quoted case-by-case", ["Furniture sourcing", "Fit-out support", "Partner network", "Property brand build"], false],
  ] as const;

  return (
    <Section className="pt-0" id="tiers" tone="cream">
      <Heading eyebrow="The tier system" lead="Three ways to work with us. The right tier depends on whether your property is plug-and-play or needs setup." title="Pick the model that matches your goals." />
      <div className="mt-12 grid items-start gap-6 sm:mt-14 lg:grid-cols-3">
        {tiers.map(([name, tag, split, setup, items, featured]) => (
          <div className={`relative min-w-0 rounded-[20px] bg-white p-5 shadow-sm sm:rounded-[24px] sm:p-7 ${featured ? "border-2 border-[#ff5a5f] shadow-[0_6px_16px_rgba(0,0,0,0.12)] lg:-translate-y-2" : "border border-[#dddddd]"}`} key={name}>
            {featured ? <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff5a5f] px-4 py-1.5 text-xs font-extrabold uppercase text-white">Most chosen</div> : null}
            <h3 className="text-2xl font-extrabold">{name}</h3>
            <p className="mt-2 min-h-10 text-sm leading-6 text-[#717171]">{tag}</p>
            <div className={`mt-5 text-3xl font-extrabold sm:text-4xl ${featured ? "text-[#ff5a5f]" : "text-[#222222]"}`}>{split}</div>
            <p className="mt-1 text-sm font-semibold text-[#717171]">Owner / CMS on net profit</p>
            <div className="mt-5 flex min-w-0 items-start gap-2 rounded-xl bg-[#f7f7f7] px-3.5 py-3 text-sm font-bold leading-5 text-[#484848] sm:px-4">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-[#2f8f4e]" /> <span className="min-w-0 break-words">Setup: {setup}</span>
            </div>
            <div className="mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-[#b0b0b0]">Right for you if it is</div>
            <ul className="mt-4 grid gap-3">
              {items.map((item) => (
                <li className="flex gap-2 text-sm leading-5 text-[#484848]" key={item}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5a5f]" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <ButtonLink className="w-full" href="#contact" variant={featured ? "primary" : "secondary"}>Choose {name}</ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Team() {
  return (
    <Section id="about">
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[24px] bg-[#f7f7f7] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
          <Image alt="The Curate My Stay family" className="h-full max-h-[560px] w-full object-contain" height={900} sizes="(min-width: 1024px) 460px, 100vw" src={photo("founder.jpg")} width={720} />
        </div>
        <div>
          <Eyebrow>Who we are</Eyebrow>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-[40px]">A family-run business, in a corner of the market that is anything but.</h2>
          <p className="mt-5 text-base leading-7 text-[#484848] sm:leading-8">Curate My Stay is a Goa-based property management firm run by a family with facility management and investment-side thinking. We approach each property like an asset with an ROI, an operational P&L, and a clear strategy.</p>
          <p className="mt-4 text-base leading-7 text-[#484848] sm:leading-8">Communication runs directly through the founder. No call centres, no ticket queues, no account-manager churn. That is how we built a 4.98 rating, and how we plan to scale deliberately.</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              [Rocket, "Founded 2024", "In active growth mode"],
              [MapPin, "Based in Goa", "Team on the ground"],
              [Target, "Mid-market focus", "Rs 4,000-14,000 / night"],
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
  return (
    <Section className="pt-0" id="control" tone="cream">
      <div className="mx-auto max-w-4xl">
        <Heading eyebrow="Dig deeper" lead="Everything you would want to know before signing." title="More about how we work." />
        <div className="mt-10 grid gap-4">
          {[
            [CheckCircle2, "You approve", "Monthly P&L statements, meaningful expenses, furnishing upgrades, long stays, and tier deviations pass through you."],
            [Zap, "We handle", "Guest communication, cleaning, restocking, routine maintenance, pricing tweaks, listings, and reporting cadence stay with us."],
            [Building2, "Thinking of buying in Goa?", "We can help estimate STR yield, operating expenses, and the combined property return before you commit."],
          ].map(([Icon, title, summary]) => {
            const IconComponent = Icon as LucideIcon;
            return (
              <details className="group min-w-0 rounded-[20px] border border-[#dddddd] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6" key={title as string}>
                <summary className="flex min-w-0 cursor-pointer list-none items-center gap-3 sm:gap-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1f1] text-[#ff5a5f] sm:h-12 sm:w-12 sm:rounded-2xl">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-base font-extrabold sm:text-lg">{title as string}</span>
                    <span className="mt-1 block text-sm leading-6 text-[#717171]">{summary as string}</span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
                </summary>
                <div className="mt-5 rounded-2xl bg-[#fbf7f1] p-4 text-sm leading-6 text-[#484848] sm:p-5">
                  This is kept intentionally simple: clear monthly approvals, transparent records, and no hidden operating layer.
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function RiskSection() {
  const faqs = [
    ["What if I lose control of my property?", "You retain 100% ownership. The Leave & License agreement is a standard legal instrument that creates no tenancy rights."],
    ["What if you inflate expenses?", "Every expense is itemised in your monthly P&L with a receipt or invoice attached. You approve the statement before any payout."],
    ["What if guests damage my property?", "Every booking goes through ID verification and a security deposit. House rules are explicit and enforced."],
    ["What happens during monsoon with no bookings?", "Monsoon is part of the Goa rental cycle, and we actively plan for it with pricing, offline agents, repeat guests, and preventive maintenance."],
    ["What if I want to use my own property?", "You get personal-use days every year, plus anything we mutually agree. Just give advance notice so we can block the dates."],
    ["What if I am not happy and want to exit?", "After the lock-in, either party can exit with written notice. We still recommend evaluating across a full 12-month cycle."],
    ["Is this fully legal?", "Yes. Tourism license and homestay registration stay in your name, and Statistic Forma reporting is filed for every guest."],
    ["What about TDS and tax compliance?", "We deduct 10% TDS on your share, deposit it, and share records ready for your CA."],
  ];

  return (
    <Section id="risk" tone="cream">
      <Heading eyebrow="Risk and objections" lead="We do not pretend property management is risk-free. Here is what owners worry about and how each concern is handled." title="What could go wrong. And what we have already done about it." />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {faqs.map(([q, a], index) => (
          <details className="group rounded-2xl border border-[#ebebeb] bg-white shadow-sm" key={q} open={index === 0}>
            <summary className="flex min-w-0 cursor-pointer list-none items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
              <span className="min-w-0 flex-1 break-words text-[15px] font-extrabold leading-6 sm:text-base">{q}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f7f7f7] transition group-open:rotate-180 group-open:bg-[#ff5a5f] group-open:text-white">
                <ChevronDown className="h-4 w-4" />
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm leading-6 text-[#484848] sm:px-5 sm:pb-5">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function FinalCTA({ onBook }: { onBook: () => void }) {
  return (
    <Section id="contact" tone="dark">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-[50px]">
          The math is simple. The execution is the hard part. <span className="text-[#e9aa4b]">We have already done it.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">Book a 30-minute discovery call. We will look at your property together, talk numbers, and tell you honestly whether short-term rental management is the right move.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink className="w-full sm:w-auto" href="https://calendar.app.google/U1j59uGweQoZ7hZd7" size="lg" variant="onDark">
            <Calendar className="h-4 w-4" /> Book a discovery call
          </ButtonLink>
          <ButtonLink className="w-full sm:w-auto" href="https://wa.me/916282627601?text=Hi%20CMS%20-%20I%20am%20interested%20in%20property%20management%20for%20my%20property%20in%20Goa." size="lg" variant="outlineDark">
            <MessageCircle className="h-4 w-4" /> WhatsApp us directly
          </ButtonLink>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-5 rounded-[20px] border border-white/10 bg-white/[0.05] p-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-6 sm:rounded-[24px] sm:p-6 md:p-8">
        <Image alt="Aravind" className="h-20 w-20 shrink-0 self-center rounded-[18px] object-cover object-top sm:h-24 sm:w-24 sm:self-auto sm:rounded-[20px]" height={96} src={photo("aravind.jpg")} width={96} />
        <div className="min-w-0">
          <div className="text-center text-lg font-extrabold text-white sm:text-left">Aravind <span className="block text-sm font-semibold text-white/50 sm:inline">: Founder, Curate My Stay</span></div>
          <p className="mt-2 text-sm italic leading-6 text-white/70">&quot;Every property we take on is still personally overseen by me. That level of involvement is a big part of how we maintain consistency, trust, and attention to detail across every stay.&quot;</p>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#241e19] text-white/70">
      <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 text-sm italic text-[#e9aa4b]">&quot;Wealth managers for property.&quot;</p>
            <div className="mt-5 grid gap-3 text-sm">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-white/50" /> Goa, India</span>
              <a className="inline-flex min-w-0 items-center gap-2 break-all" href="mailto:curatemystay@gmail.com"><Mail className="h-4 w-4 shrink-0 text-white/50" /> curatemystay@gmail.com</a>
              <a className="inline-flex items-center gap-2" href="https://wa.me/916282627601"><MessageCircle className="h-4 w-4 text-white/50" /> WhatsApp us</a>
            </div>
          </div>
          <FooterLinks title="Site" items={["For Owners", "For Guests / Book a Stay", "About", "Case Studies", "Blog (soon)"]} />
          <FooterLinks title="Resources" items={["Sample P&L Statement", "Standard L&L Agreement", "Tier System One-Pager", "ROI Calculator"]} />
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

function FooterLinks({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/40">{title}</div>
      <div className="mt-4 grid gap-3 text-sm">
        {items.map((item) => (
          <a className="hover:text-white" href={item.includes("Calculator") ? "#calculator" : "#top"} key={item}>
            {item}
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
          <ButtonLink className="w-full" href="https://calendar.google.com/calendar/appointments/schedules/?add=curatemystay@gmail.com" size="lg">
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
    <main className="min-h-screen bg-white font-sans text-[#222222]">
      <Header />
      <Hero />
      <MathAnchor />
      <CalculatorSection />
      <Services />
      <StatsAndProof />
      <Transparency />
      <RiskSection />
      <Tiers />
      <Team />
      <CollapsibleExtras />
      <FinalCTA onBook={() => setBookingOpen(true)} />
      <Footer />
      <BookingModal onClose={() => setBookingOpen(false)} open={bookingOpen} />
    </main>
  );
}
