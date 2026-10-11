import Link from "next/link";
import { createElement } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  Clock,
  Footprints,
  MapPin,
  Moon,
  Sparkles,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { siteOrigin } from "@/app/seo";
import { ShowMoreDialog } from "@/components/ui/show-more-dialog";
import { amenityIcon, groupAmenities } from "@/src/features/catalogue/amenity-categories";
import { PropertyAbout } from "@/src/features/catalogue/property-about";
import { PropertyEnquiryCard } from "@/src/features/catalogue/property-enquiry-card";
import { PropertyGallery } from "@/src/features/catalogue/property-gallery";
import type {
  PropertyDetail,
  PropertyGalleryImage,
} from "@/src/features/catalogue/public-property-detail-data";
import { formatMoney } from "@/src/lib/utils/money";

/**
 * Public property detail layout for `/property/[slug]`.
 *
 * Every property-specific value here comes from Admin -> Properties through the
 * public-safe detail view. Only the generic section headings are in code. The
 * page checks no availability, calculates no totals and submits no enquiry.
 *
 * Visual structure follows the "Curate My Stay — Property Detail Page" screen in
 * `reference/booking.html`: hero-plus-grid gallery, quick-stat tiles, stacked
 * detail blocks separated by hairline rules, and a sticky stay card on the right.
 */

/**
 * Admins store either "Private" or "Private pool", so only append the noun when
 * it is missing. "None" is a real stored value that is not worth showing.
 */
function poolLabel(poolType: string | null) {
  const value = poolType?.trim();
  if (!value || /^none$/i.test(value)) return null;

  return /pool/i.test(value) ? value : `${value} pool`;
}

/** Long lists show this many items inline; the rest open in the shared dialog. */
const inlineAmenityCount = 10;
const inlineRuleCount = 3;

function plural(count: number, singular: string) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

/** Supabase `time` values arrive as "14:00:00"; visitors want "2:00 PM". */
function formatTime(value: string | null) {
  const match = value ? /^(\d{1,2}):(\d{2})/.exec(value) : null;
  if (!match) return null;

  const hours = Number(match[1]);
  if (hours > 23) return null;

  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 === 0 ? 12 : hours % 12}:${match[2]} ${suffix}`;
}

/** Drops copy that a longer field already contains, so nothing reads twice. */
function isRepeated(candidate: string | null, longerText: string | null) {
  if (!candidate?.trim()) return true;
  if (!longerText?.trim()) return false;

  return longerText.trim().toLowerCase().includes(candidate.trim().toLowerCase());
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

function ShowAllButton({ label }: { label: string }) {
  return (
    <button
      className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-public-ink bg-white px-4 py-2.5 text-[15px] font-semibold text-public-ink outline-none transition-colors hover:bg-public-hover focus-visible:ring-2 focus-visible:ring-public-coral focus-visible:ring-offset-2"
      type="button"
    >
      {label}
    </button>
  );
}

function AmenityRow({ amenity }: { amenity: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-public-divider py-2.5">
      {createElement(amenityIcon(amenity), { "aria-hidden": true, className: "h-5 w-5 shrink-0 text-public-body" })}
      <span className="min-w-0 text-[14.5px] leading-6 text-public-body [overflow-wrap:anywhere] sm:text-[15px]">{amenity}</span>
    </div>
  );
}

function RuleRow({ rule }: { rule: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-public-divider py-2.5">
      <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-public-taupe" />
      <span className="min-w-0 text-[14.5px] leading-6 text-public-body [overflow-wrap:anywhere] sm:text-[15px]">{rule}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[21px] font-bold leading-tight tracking-[-0.01em] text-[#222222] sm:text-[23px]">
      {children}
    </h2>
  );
}

function Rule() {
  return <div className="my-7 h-px bg-[#ebebeb] sm:my-8" />;
}

/** Bordered icon tile used by the quick stats and the location facts. */
function FactTile({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-[14px] border border-[#ebebeb] p-3 sm:gap-3 sm:p-4">
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#ff5a5f]" />
      <span className="min-w-0 text-[13.5px] font-bold leading-5 text-[#222222] [overflow-wrap:anywhere] sm:text-[14.5px]">
        {label}
      </span>
    </div>
  );
}

export function PropertyDetailPage({
  gallery,
  property,
}: {
  gallery: PropertyGalleryImage[];
  property: PropertyDetail;
}) {
  const name = property.public_name || "Curated stay";
  const pool = poolLabel(property.pool_type);
  const location =
    property.short_location_line || [property.area, property.region].filter(Boolean).join(", ");
  const amenities = cleanList(property.amenities);
  const highlights = cleanList(property.property_highlights);
  const houseRules = cleanList(property.house_rules);
  const checkIn = formatTime(property.check_in_time);
  const checkOut = formatTime(property.check_out_time);
  const showPrice = property.show_price && property.starting_price != null;
  const propertyUrl = `${siteOrigin}/property/${property.slug}`;

  const quickStats = [
    property.max_guests != null
      ? { icon: Users, label: plural(property.max_guests, "guest") }
      : null,
    property.bedrooms != null
      ? { icon: BedDouble, label: plural(property.bedrooms, "bedroom") }
      : null,
    property.beds != null ? { icon: BedDouble, label: plural(property.beds, "bed") } : null,
    property.bathrooms != null
      ? { icon: Bath, label: plural(property.bathrooms, "bathroom") }
      : null,
    pool ? { icon: Waves, label: pool } : null,
  ].filter((stat) => stat !== null);

  // Stay facts repeat some capacity numbers on purpose: this block is the
  // practical "before you enquire" summary rather than the headline strip.
  const stayFacts = [
    property.minimum_nights != null
      ? { icon: Moon, label: `Minimum ${plural(property.minimum_nights, "night")}` }
      : null,
    checkIn ? { icon: Clock, label: `Check-in from ${checkIn}` } : null,
    checkOut ? { icon: Clock, label: `Check-out by ${checkOut}` } : null,
    property.max_guests != null
      ? { icon: Users, label: `Sleeps ${property.max_guests}` }
      : null,
    property.bedrooms != null
      ? { icon: BedDouble, label: plural(property.bedrooms, "bedroom") }
      : null,
    property.beds != null ? { icon: BedDouble, label: plural(property.beds, "bed") } : null,
    property.bathrooms != null
      ? { icon: Bath, label: plural(property.bathrooms, "bathroom") }
      : null,
    pool ? { icon: Waves, label: pool } : null,
    property.distance_from_beach
      ? { icon: Footprints, label: property.distance_from_beach }
      : null,
  ].filter((fact) => fact !== null);

  const locationFacts = [
    property.area ? { icon: MapPin, label: property.area } : null,
    property.region ? { icon: MapPin, label: property.region } : null,
    property.distance_from_beach
      ? { icon: Footprints, label: property.distance_from_beach }
      : null,
  ].filter((fact) => fact !== null);

  // Skip copy a longer field already covers so the page never reads twice.
  const showTagline = !isRepeated(property.tagline, property.full_description);
  const showShortDescription =
    !isRepeated(property.short_description, property.full_description) &&
    !isRepeated(property.short_description, property.tagline);
  const hasDescription =
    showTagline || showShortDescription || Boolean(property.full_description?.trim());

  const enquiryCard = (
    <PropertyEnquiryCard
      acceptBookingRequests={property.accept_booking_requests}
      bookingEnquiryNote={property.booking_enquiry_note}
      checkInLabel={checkIn}
      checkOutLabel={checkOut}
      maxGuests={property.max_guests}
      priceLabel={showPrice ? formatMoney(property.starting_price) : null}
      priceNote={property.price_note}
      propertyName={name}
      propertyUrl={propertyUrl}
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pb-20 md:px-8">
      <Link
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md pr-2 text-[14.5px] font-semibold text-[#222222] outline-none transition-colors hover:text-[#e54b50] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
        href="/booking"
      >
        <ArrowLeft aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
        All stays
      </Link>

      <div className="mt-2 mb-4 sm:mb-5">
        <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[#222222] [overflow-wrap:anywhere] sm:text-[32px]">
          {name}
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[14.5px] text-[#484848]">
          {property.public_property_type ? (
            <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#9e4347]">
              {property.public_property_type}
            </span>
          ) : null}
          {property.promotional_badge ? (
            <span className="rounded-full bg-[#ff5a5f] px-2.5 py-1 text-[11.5px] font-semibold text-white">
              {property.promotional_badge}
            </span>
          ) : null}
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-[#9a7770]" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{location}</span>
            </span>
          ) : null}
        </div>
      </div>

      <PropertyGallery images={gallery} propertyName={name} propertyUrl={propertyUrl} />

      <div className="pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_384px] lg:gap-14 lg:pt-10">
        <div className="min-w-0">
          {quickStats.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {quickStats.map((stat) => (
                <FactTile icon={stat.icon} key={stat.label} label={stat.label} />
              ))}
            </div>
          ) : null}

          {/* Mobile and tablet: the stay card sits before the long-form copy. */}
          <div className="mt-7 lg:hidden">{enquiryCard}</div>

          {highlights.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2 sm:gap-2.5">
              {highlights.map((highlight) => (
                <span
                  className="inline-flex min-w-0 items-center gap-2 rounded-xl bg-[#fff1f1] px-3 py-2.5 text-[13.5px] font-semibold leading-5 text-[#d63e43] [overflow-wrap:anywhere] sm:text-sm"
                  key={highlight}
                >
                  <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-[#ff5a5f]" />
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}

          {hasDescription ? (
            <>
              <Rule />
              <PropertyAbout
                heading={
                  property.public_property_type
                    ? `About this ${property.public_property_type.toLowerCase()}`
                    : "About this stay"
                }
                paragraphs={[
                  showShortDescription ? property.short_description?.trim() : null,
                  property.full_description?.trim() || null,
                ].filter((text): text is string => Boolean(text))}
                tagline={showTagline ? property.tagline : null}
              />
            </>
          ) : null}

          {amenities.length > 0 ? (
            <>
              <Rule />
              <section>
                <SectionHeading>What this place offers</SectionHeading>
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {amenities.slice(0, inlineAmenityCount).map((amenity) => (
                    <AmenityRow amenity={amenity} key={amenity} />
                  ))}
                </div>
                {amenities.length > inlineAmenityCount ? (
                  <ShowMoreDialog
                    title="What this place offers"
                    trigger={<ShowAllButton label={`Show all ${amenities.length} amenities`} />}
                  >
                    <div className="grid gap-7">
                      {groupAmenities(amenities).map((group) => (
                        <section aria-label={group.category} key={group.category}>
                          <h3 className="mb-1 text-[16.5px] font-bold text-public-ink">{group.category}</h3>
                          {group.items.map((amenity) => (
                            <AmenityRow amenity={amenity} key={amenity} />
                          ))}
                        </section>
                      ))}
                    </div>
                  </ShowMoreDialog>
                ) : null}
              </section>
            </>
          ) : null}

          {stayFacts.length > 0 ? (
            <>
              <Rule />
              <section>
                <SectionHeading>Stay details</SectionHeading>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {stayFacts.map((fact) => (
                    <FactTile icon={fact.icon} key={fact.label} label={fact.label} />
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {houseRules.length > 0 ? (
            <>
              <Rule />
              <section>
                <SectionHeading>House rules</SectionHeading>
                <div className="max-w-2xl">
                  {houseRules.slice(0, inlineRuleCount).map((rule) => (
                    <RuleRow key={rule} rule={rule} />
                  ))}
                </div>
                {houseRules.length > inlineRuleCount ? (
                  <ShowMoreDialog title="House rules" trigger={<ShowAllButton label="Show all rules" />}>
                    {houseRules.map((rule) => (
                      <RuleRow key={rule} rule={rule} />
                    ))}
                  </ShowMoreDialog>
                ) : null}
              </section>
            </>
          ) : null}

          {property.public_location_text || locationFacts.length > 0 || property.google_maps_url ? (
            <>
              <Rule />
              <section>
                <SectionHeading>Where you&rsquo;ll be</SectionHeading>
                {property.public_location_text ? (
                  <p className="mb-4 whitespace-pre-line text-[15.5px] leading-[1.7] text-[#484848] sm:text-base">
                    {property.public_location_text}
                  </p>
                ) : null}
                {locationFacts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {locationFacts.map((fact) => (
                      <FactTile icon={fact.icon} key={fact.label} label={fact.label} />
                    ))}
                  </div>
                ) : null}
                {property.google_maps_url ? (
                  <a
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#222222] px-4 py-2.5 text-[14.5px] font-semibold text-[#222222] outline-none transition-colors hover:bg-[#f7f7f7] focus-visible:ring-2 focus-visible:ring-[#ff5a5f] focus-visible:ring-offset-2"
                    href={property.google_maps_url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <MapPin aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                    View on Google Maps
                  </a>
                ) : null}
              </section>
            </>
          ) : null}
        </div>

        {/* Desktop: the same card, sticky beside the content. */}
        <div className="hidden lg:block">
          <div className="sticky top-24">{enquiryCard}</div>
        </div>
      </div>
    </div>
  );
}
