import {
  AirVent, ArrowUpDown, BedDouble, BookOpen, Building2, CalendarCheck, CircleParking, Coffee, ConciergeBell, Fence,
  Flower2, Footprints, Grid2x2, House, KeyRound, Laptop, MapPin, Plane, Receipt, ShieldCheck, Sofa, Sunset, Users,
  UtensilsCrossed, Waves, Wifi, Wind, Zap, type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CorporateOffsiteEnquiryLink } from "@/components/home/corporate-offsite-enquiry-link";
import { CorporateOffsiteFeaturePhotoCarousel, type FeaturePhoto } from "@/components/home/corporate-offsite-feature-carousel";
import { loadPublicCatalogue, type CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";
import { loadPublicPropertyDetail } from "@/src/features/catalogue/public-property-detail-data";
import {
  bogmaloChapter,
  bogmaloOption,
  panjimOption,
  stayOptionsCopy,
  villasOption,
  type SmallerStayOption,
  type StayFeature,
  type StayOption,
  type StayPoint,
  type StayPointIcon,
} from "@/src/features/corporate-offsite/stay-options-copy";
import { publicType } from "@/src/lib/public-type";
import { getPropertyImageUrl } from "@/src/lib/utils/property-image-url";

/**
 * Section 2 of `/corporate-offsite-villas-goa`: an editorial layout with no cards. Chapter 1 is the
 * Bogmalo building in four alternating photo and text rows; chapter 2 holds the two smaller options.
 * Every read goes through the public catalogue helpers (anon views, shared 60 s cache).
 */

type Stay = { alt: string; area: string | null; name: string; photo: string; slug: string };
type GalleryImage = {
  alt_text: string | null;
  created_at: string;
  property_name: string;
  property_slug: string;
  sort_order: number;
  url: string;
};
type AssignedFeaturePhoto = FeaturePhoto & { caption: string; listingName: string };
type FeaturePhotoRow = { feature: StayFeature; photos: AssignedFeaturePhoto[] };

const icons: Record<StayPointIcon, LucideIcon> = {
  ac: AirVent,
  airport: Plane,
  art: Flower2,
  balcony: Fence,
  beach: Footprints,
  bed: BedDouble,
  bookingRule: CalendarCheck,
  breezy: Wind,
  building: Building2,
  caretaker: ShieldCheck,
  glass: Grid2x2,
  guests: Users,
  keyCard: KeyRound,
  library: BookOpen,
  lift: ArrowUpDown,
  parking: CircleParking,
  place: MapPin,
  pool: Waves,
  power: Zap,
  restaurants: UtensilsCrossed,
  sea: Waves,
  seaView: Sunset,
  sofa: Sofa,
  staff: ConciergeBell,
  tea: Coffee,
  villa: House,
  wifi: Wifi,
  workTable: Laptop,
};

// Anchor targets for the finder links: offset for the sticky header, a coral ring when targeted.
const anchor = "scroll-mt-24 rounded-[4px] target:ring-2 target:ring-public-coral target:ring-offset-8 target:ring-offset-background";

// The homepage eyebrow coral (#ff5a5f) is about 3:1 on this background, so the darker coral is used at the same size.
const eyebrow = `${publicType.eyebrow} text-[color-mix(in_oklab,var(--color-public-coral-ink)_90%,black)]`;
const ruleHeading = "flex items-center gap-5";

/** "Casa Verde Sea View Suite studio in Bogmalo, Goa", without repeating a word the name already has. */
function photoAlt(name: string, type: string | null, area: string | null) {
  const has = (word: string) => name.toLowerCase().includes(word.toLowerCase());
  if (!area || has(area)) return `${name}, Goa`;

  return `${name}${type && !has(type) ? ` ${type.toLowerCase()}` : ""} in ${area}, Goa`;
}

/** The option's published properties that have a photo, in the listed order. Others are skipped. */
function publishedStays(option: StayOption, bySlug: Map<string, CatalogueProperty>): Stay[] {
  return option.slugs.flatMap((slug) => {
    const property = bySlug.get(slug);
    const url = getPropertyImageUrl(property?.images[0]?.storage_path);
    if (!property?.public_name || !url) return [];

    const name = property.public_name;
    return [{ alt: photoAlt(name, property.public_property_type, property.area), area: property.area, name, photo: url, slug }];
  });
}

function matchesKeyword(value: string, keywords: string[]) {
  const normalized = value.toLocaleLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLocaleLowerCase()));
}

function studioListingType(value: string): "cozy" | "breezy" | "king" | "sea-view" | null {
  const normalized = value.toLocaleLowerCase().replaceAll("-", " ");
  if (normalized.includes("cozy")) return "cozy";
  if (normalized.includes("breezy")) return "breezy";
  if (normalized.includes("terrace") || (normalized.includes("king") && normalized.includes("balcony"))) return "king";
  if (normalized.includes("sea view")) return "sea-view";
  return null;
}

function matchingPhotos(feature: StayFeature, gallery: GalleryImage[]) {
  return gallery.filter((image) => {
    // public_property_gallery has no tag column; blank captions are untagged and skipped.
    const caption = image.alt_text?.trim() ?? "";
    return Boolean(caption) && !matchesKeyword(caption, feature.exclude) && matchesKeyword(caption, feature.include);
  });
}

function pairFeaturePhotos(features: StayFeature[], gallery: GalleryImage[]): FeaturePhotoRow[] {
  const assignedUrls = new Set<string>();
  return features.map((feature) => {
    let candidates = matchingPhotos(feature, gallery).filter((image) => !assignedUrls.has(image.url));

    if (feature.id === "studios") {
      const byType = new Map(["cozy", "breezy", "king", "sea-view"].map((type) => [type, [] as GalleryImage[]]));
      candidates.forEach((image) => {
        const type = studioListingType(`${image.property_slug} ${image.property_name}`);
        if (type) byType.get(type)?.push(image);
      });
      candidates = [];
      for (const list of byType.values()) if (list[0]) candidates.push(list[0]);
      for (const list of byType.values()) if (list[1]) candidates.push(list[1]);
    }

    if (feature.id === "work-ready") {
      candidates.sort((a, b) => {
        const priority = (image: GalleryImage) => matchesKeyword(image.alt_text ?? "", ["work", "desk", "table"]) ? 0 : 1;
        return priority(a) - priority(b);
      });
    }

    const selected = candidates.filter((image) => !assignedUrls.has(image.url)).slice(0, 6);
    selected.forEach((image) => assignedUrls.add(image.url));
    return {
      feature,
      photos: selected.map((image, index) => ({
        alt: image.alt_text?.trim() || `${feature.title} photo ${index + 1}`,
        caption: image.alt_text?.trim() ?? "",
        listingName: image.property_name,
        url: image.url,
      })),
    };
  });
}

async function loadBogmaloGallery(): Promise<GalleryImage[]> {
  const details = await Promise.all(bogmaloOption.slugs.map((slug) => loadPublicPropertyDetail(slug)));
  const images = details.flatMap((detail) => detail.status === "found"
    ? detail.gallery.map((image) => ({
      alt_text: image.alt_text,
      created_at: image.created_at,
      property_name: detail.property.public_name ?? "",
      property_slug: detail.property.slug ?? "",
      sort_order: image.sort_order,
      url: getPropertyImageUrl(image.storage_path),
    }))
    : []);
  const seenUrls = new Set<string>();

  return images
    .filter((image): image is typeof image & { url: string } => Boolean(image.url))
    .sort((first, second) => first.sort_order - second.sort_order || first.created_at.localeCompare(second.created_at))
    .filter((image) => !seenUrls.has(image.url) && Boolean(seenUrls.add(image.url)));
}

/** One point per line: a coral line icon, a short label, and a hairline between lines. */
function PointList({ feature = false, points }: { feature?: boolean; points: StayPoint[] }) {
  return (
    <ul>
      {points.map((point) => {
        const Icon = icons[point.icon];

        return (
          <li className="flex min-h-[52px] items-center gap-3 border-t border-public-taupe/25 py-[14px] first:border-t-0" key={point.label}>
            <Icon aria-hidden="true" className={`${feature ? "h-[22px] w-[22px]" : "h-5 w-5"} shrink-0 text-public-coral`} strokeWidth={1.5} />
            <span className={`min-w-0 flex-1 ${feature ? "text-[17px]" : "text-base"} font-medium leading-6 text-public-ink`}>
              {point.label}
              {point.detail ? <span className={`block ${feature ? "text-[15px]" : "text-sm"} font-normal leading-5 text-public-muted`}>{point.detail}</span> : null}
            </span>
            {point.note ? <span className={`shrink-0 ${feature ? "text-[15px]" : "text-sm"} text-public-muted`}>{point.note}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

/** A heading with a hairline running from its end to the right edge. */
function RuledHeading({ as: Tag, children, className, id }: { as: "h2" | "h3"; children: ReactNode; className: string; id?: string }) {
  return (
    <Tag className={`${ruleHeading} ${className}`} id={id}>
      <span className="min-w-0 text-balance">{children}</span>
      <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-public-taupe/30" />
    </Tag>
  );
}

/** Studio links as outlined pills. The link is 44px tall; the pill inside it is the visible part. */
function StudioPills({ stays }: { stays: Stay[] }) {
  return (
    <ul aria-label={stayOptionsCopy.studiosLabel} className="flex flex-wrap gap-x-2">
      {stays.map((stay) => (
        <li className="max-w-full" key={stay.slug}>
          <Link className="group/link inline-flex min-h-11 items-center outline-none" href={`/property/${stay.slug}`}>
            <span className="rounded-2xl border border-public-control px-3 py-1.5 text-sm font-semibold leading-5 transition-colors group-hover/link:bg-public-hover group-focus-visible/link:ring-2 group-focus-visible/link:ring-public-ink motion-reduce:transition-none">
              {stay.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Quiet text links to each property page. */
function QuietLinks({ label, links }: { label: string; links: { href: string; text: string }[] }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-x-6">
      {links.map((link) => (
        <li key={link.href}>
          <Link className="group/link inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-public-ink outline-none focus-visible:ring-2 focus-visible:ring-public-ink" href={link.href}>
            {/* The unlayered `a { text-decoration: none }` outranks a utility on the link itself. */}
            <span className="underline decoration-public-taupe/50 underline-offset-4 group-hover/link:decoration-public-ink">{link.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A Casa Verde feature row: alternating photo and centered feature copy on wider screens. */
function FeatureRow({ feature, flip, photos, stays, eager }: { eager: boolean; feature: StayFeature; flip: boolean; photos: FeaturePhoto[]; stays: Stay[] }) {
  const hasPhotos = photos.length > 0;

  return (
    <div className={`grid items-center gap-6 md:gap-14 ${hasPhotos ? (flip ? "md:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]" : "md:grid-cols-[minmax(0,58fr)_minmax(0,42fr)]") : "md:grid-cols-1"}`}>
      {hasPhotos ? (
        <div className={`min-w-0 ${flip ? "md:order-2" : ""}`}>
          <CorporateOffsiteFeaturePhotoCarousel eager={eager} photos={photos} rowTitle={feature.title} />
        </div>
      ) : null}

      <div className="relative w-full">
        <h3 className="text-balance text-[22px] font-extrabold leading-[1.12] tracking-[-0.28px] text-public-ink md:text-[28px]">{feature.title}</h3>
        <div className="mt-5">
          <PointList feature points={feature.points} />
        </div>
        {feature.footnote ? <p className="border-t border-public-taupe/25 pt-3 text-sm leading-6 text-public-muted">{feature.footnote}</p> : null}
        {feature.showStudioLinks && stays.length > 0 ? (
          <div className="mt-5">
            <StudioPills stays={stays} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BogmaloChapter({ rows, stays }: { rows: ReturnType<typeof pairFeaturePhotos>; stays: Stay[] }) {
  const whyIcons = { building: Building2, laptop: Laptop, users: Users, receipt: Receipt };

  return (
    <section aria-labelledby="stay-options-heading" className={anchor} id={bogmaloOption.id}>
      <header className="max-w-3xl">
        <p className={eyebrow}>{stayOptionsCopy.eyebrow}</p>
        <h2 className="mt-2 text-balance text-[28px] font-extrabold leading-[1.12] sm:text-4xl md:text-[44px] md:leading-[1.08]" id="stay-options-heading">
          {stayOptionsCopy.heading}
        </h2>
        <p className="mt-3 text-[19px] leading-7 text-public-muted">{stayOptionsCopy.subhead}</p>
        <ul className="mt-4 flex flex-wrap items-center gap-y-1 text-base leading-7 text-public-body">
          {stayOptionsCopy.propertyChips.map((chip, index) => (
            <li className="inline-flex items-center" key={chip}>
              {index > 0 ? <span aria-hidden="true" className="mx-3 h-1 w-1 rounded-full bg-public-taupe/60" /> : null}
              {chip}
            </li>
          ))}
        </ul>
      </header>

      <ul aria-label="Why this home fits teams of up to 12" className="mt-10 grid border-t border-public-taupe/30 md:grid-cols-2 lg:grid-cols-4">
        {stayOptionsCopy.whyTeams.map((item, index) => {
          const Icon = whyIcons[item.icon as keyof typeof whyIcons];
          return (
            <li className={`py-7 ${index > 0 ? "border-t border-public-taupe/30 md:border-l md:pl-6 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l lg:pl-6" : ""} ${index % 2 === 1 ? "md:pl-6" : "md:pr-6"}`} key={item.label}>
              <Icon aria-hidden="true" className="mb-3 h-[22px] w-[22px] text-public-coral" strokeWidth={1.5} />
              <p className="text-base font-bold leading-6 text-public-ink">{item.label}</p>
              <p className="mt-1 text-sm leading-5 text-public-muted">{item.note}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 grid gap-12 md:mt-[72px] md:gap-20">
        {rows.map(({ feature, photos }, index) => (
          <FeatureRow eager={index === 0} feature={feature} flip={index % 2 === 1} key={feature.id} photos={photos} stays={stays} />
        ))}
      </div>

      <div className="mt-10">
        <CorporateOffsiteEnquiryLink optionId={bogmaloOption.id} title={bogmaloOption.title} variant="primary" />
      </div>
    </section>
  );
}

/** A compact row for the smaller options: photo at 38% beside the text, stacked below `md`. */
function SmallerOption({ links, option, stays }: { links: { href: string; text: string }[]; option: SmallerStayOption; stays: Stay[] }) {
  const cover = stays[0];

  return (
    <article className={`grid items-center gap-6 md:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] md:gap-12 ${anchor}`} id={option.id}>
      {cover ? (
        <div className="relative -mx-4 aspect-[4/3] overflow-hidden bg-public-sand sm:-mx-6 md:mx-0 md:w-full md:max-w-[420px] md:rounded-[4px]">
          <Image alt={cover.alt} className="object-cover" fill loading="lazy" sizes="(min-width: 1180px) 420px, (min-width: 768px) 38vw, 100vw" src={cover.photo} />
        </div>
      ) : null}
      <div className={`px-1 md:px-0 ${cover ? "" : "md:col-span-2"}`}>
        <h4 className={`text-balance ${publicType.cardTitle}`}>{option.title}</h4>
        <div className="mt-3">
          <PointList points={option.points} />
        </div>
        {links.length > 0 ? (
          <div className="mt-2">
            <QuietLinks label={`Properties: ${option.title}`} links={links} />
          </div>
        ) : null}
        <div className="mt-4">
          <CorporateOffsiteEnquiryLink optionId={option.id} title={option.title} variant="secondary" />
        </div>
      </div>
    </article>
  );
}

export async function CorporateOffsiteOptions() {
  // A failed read leaves the options without photos or links rather than failing the page.
  const [catalogue, gallery] = await Promise.all([loadPublicCatalogue(), loadBogmaloGallery()]);
  const bySlug = new Map(catalogue.properties.map((property) => [property.slug, property]));
  const bogmaloStays = publishedStays(bogmaloOption, bySlug);
  const panjimStays = publishedStays(panjimOption, bySlug);
  const villaStays = publishedStays(villasOption, bySlug);
  const rows = pairFeaturePhotos(bogmaloChapter.features, gallery);
  if (process.env.NODE_ENV !== "production") {
    console.table(rows.flatMap(({ feature, photos }) => photos.length
      ? photos.map((photo) => ({
        rowTitle: feature.title,
        photoCount: photos.length,
        listingName: photo.listingName,
        tag: "(no tag field)",
        caption: photo.caption,
      }))
      : [{ rowTitle: feature.title, photoCount: 0, listingName: "", tag: "(no tag field)", caption: "" }]));
  }

  return (
    <section aria-labelledby="stay-options-heading" className="bg-background py-16 text-public-ink lg:py-24">
      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        <BogmaloChapter rows={rows} stays={bogmaloStays} />

        <div className="mt-16 border-t border-public-taupe/30 pt-6 md:mt-24 md:pt-6">
          <RuledHeading as="h3" className={publicType.subheading}>{stayOptionsCopy.smallerTeamsHeading}</RuledHeading>
          <div className="mt-8 grid gap-12">
            <SmallerOption
              links={panjimStays.map((stay) => ({ href: `/property/${stay.slug}`, text: stay.name }))}
              option={panjimOption}
              stays={panjimStays}
            />
            <SmallerOption
              links={villaStays.map((stay) => ({ href: `/property/${stay.slug}`, text: stay.area ? `${stay.area} villa` : stay.name }))}
              option={villasOption}
              stays={villaStays}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
