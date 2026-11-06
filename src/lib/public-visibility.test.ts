import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type { PropertyDetail } from "@/src/features/catalogue/public-property-detail-data";
import type { CatalogueProperty } from "@/src/features/catalogue/public-catalogue-data";

/** Run actual source with offline loader doubles, never a Supabase client. */
function harness(catalogue: () => Promise<unknown> = async () => ({ failed: false, properties: [] }), detail: () => Promise<unknown> = async () => ({ status: "notFound" })) {
  const cache = new Map<string, { exports: unknown }>();
  function load<T>(path: string): T {
    const filename = resolve(path);
    const cached = cache.get(filename);
    if (cached) return cached.exports as T;
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    runInNewContext(code, {
      module: loadedModule, exports: loadedModule.exports, Response, URL,
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://public.example.test" } },
      require: (name: string) => {
        if (name === "server-only") return {};
        if (name.endsWith("/public-catalogue-data")) return { loadPublicCatalogue: catalogue };
        if (name.endsWith("/public-property-detail-data")) return { loadPublicPropertyDetail: detail };
        if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
        throw new Error(`Unexpected test dependency: ${name}`);
      },
    }, { filename });
    return loadedModule.exports as T;
  }
  return {
    schema: load<typeof import("./public-structured-data")>("src/lib/public-structured-data.ts"),
    feed: load<typeof import("../features/catalogue/public-text-feed")>("src/features/catalogue/public-text-feed.ts"),
    copy: load<typeof import("./public-property-copy")>("src/lib/public-property-copy.ts"),
    robots: load<typeof import("../../app/robots")>("app/robots.ts"),
  };
}

/** Synthetic public row. Null means no fact has been supplied. */
function property(overrides: Partial<PropertyDetail> = {}): PropertyDetail {
  return {
    id: "test-property", slug: "test-studio", public_name: "Test studio", public_property_type: null,
    region: null, area: null, short_location_line: null, public_location_text: null, google_maps_url: null,
    airbnb_listing_url: null, tagline: null, short_description: null, full_description: null, promotional_badge: null,
    bedrooms: null, beds: null, bathrooms: null, max_guests: null, pool_type: null, distance_from_beach: null,
    amenities: [], property_highlights: [], house_rules: [], starting_price: null, show_price: false,
    price_note: null, minimum_nights: null, check_in_time: null, check_out_time: null, booking_enquiry_note: null,
    accept_booking_requests: true, seo_title: null, seo_description: null, ...overrides,
  };
}

function catalogueProperty(row: PropertyDetail): CatalogueProperty {
  return { ...row, is_featured: false, display_order: 0, cover_storage_path: null, cover_alt_text: null, images: [] };
}

test("new catalogue slugs appear in the text feed without a registry entry", async () => {
  const slugs = ["casa-verde-airport-side-studio-bogmalo", "breezy-balcony-studio-bogmalo", "casa-verde-cozy-studio-bogmalo", "casa-verde-sea-view-suite-bogmalo", "casa-verde-upper-floor-sea-view-suite-bogmalo", "terrace-studio-bogmalo"];
  const properties = slugs.map((slug) => catalogueProperty(property({ slug, public_name: slug })));
  const { feed } = harness(async () => ({ failed: false, properties: [...properties, properties[0]] }));
  const text = await feed.buildPublicTextFeed(false);
  for (const slug of slugs) assert.equal(text.split(`/property/${slug})`).length - 1, 1);
  const response = feed.publicTextResponse(text);
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "public, max-age=0, must-revalidate");
});

test("catalogue errors, thrown reads and detail failures return only static sections", async () => {
  for (const catalogue of [async () => ({ failed: true, properties: [] }), async () => { throw new Error("offline"); }]) {
    const { feed } = harness(catalogue);
    const text = await feed.buildPublicTextFeed(true);
    assert.ok(text.startsWith("# Curate My Stay\n"));
    assert.ok(text.includes("## Contact"));
    assert.ok(!text.includes("## Stays"));
  }
  const row = property();
  const { feed } = harness(async () => ({ failed: false, properties: [catalogueProperty(row)] }), async () => ({ status: "failed" }));
  assert.ok(!(await feed.buildPublicTextFeed(true)).includes("test-studio"));
});

test("full feed contains public details, omits withdrawn properties and never serializes unrelated fields", async () => {
  const row = property({ full_description: "Public description.", amenities: ["Kitchen"], house_rules: ["No smoking"], check_in_time: "14:00:00" });
  const withdrawn = catalogueProperty(property({ slug: "withdrawn" }));
  let call = 0;
  const { feed } = harness(async () => ({ failed: false, properties: [catalogueProperty(row), withdrawn] }), async () => ++call === 1 ? { status: "found", property: { ...row, owner_id: "private-owner" }, gallery: [] } : { status: "notFound" });
  const text = await feed.buildPublicTextFeed(true);
  for (const value of ["Public description.", "Kitchen", "No smoking", "14:00:00"]) assert.ok(text.includes(value));
  assert.ok(!text.includes("private-owner"));
  assert.ok(!text.includes("withdrawn"));
});

test("property schema preserves public identifiers and broad types, omits unknown facts and retains fractional bathrooms", () => {
  const { schema } = harness();
  const row = property({ id: "stable-id", public_property_type: "Studio", area: "Bogmalo", bedrooms: 0, bathrooms: 1.5, max_guests: 2, check_in_time: "14:00:00", check_out_time: "25:00:00", amenities: ["Kitchen", "Kitchen", " "] });
  const data = schema.buildPropertyJsonLd(row, []);
  assert.equal(data["@type"], "VacationRental");
  assert.equal(data.identifier, "stable-id");
  assert.equal(data.additionalType, "Apartment");
  assert.equal(data.address.addressRegion, "Goa");
  assert.equal(data.containsPlace["@type"], "Accommodation");
  assert.equal(data.containsPlace.numberOfBedrooms, 0);
  assert.equal(data.containsPlace.occupancy?.value, 2);
  assert.equal(data.containsPlace.numberOfBathroomsTotal, undefined);
  assert.equal(data.containsPlace.additionalProperty?.value, 1.5);
  assert.equal(data.amenityFeature?.length, 1);
  assert.equal(data.checkinTime, "14:00:00");
  assert.equal(data.checkoutTime, undefined);
  assert.equal(data.image, undefined);
  assert.equal(schema.buildPropertyJsonLd(property({ bathrooms: 2 }), []).containsPlace.numberOfBathroomsTotal, 2);
  assert.equal(schema.buildPropertyJsonLd(property({ id: "", slug: "slug-id", public_property_type: "Holiday villa" }), []).identifier, "slug-id");
  assert.equal(schema.buildPropertyJsonLd(property({ public_property_type: "Villa" }), []).additionalType, "Villa");
  assert.equal(schema.buildPropertyJsonLd(property({ public_property_type: "Holiday home" }), []).additionalType, "VacationRental");
  const text = JSON.stringify(data);
  for (const unsupported of ["numberOfBathroomUnits", "aggregateRating", "review", "latitude", "longitude", "geo", "price", "availability"]) assert.ok(!text.includes(unsupported));
  const escaped = schema.serializeJsonLd({ description: "</script><script>alert(1)</script>" });
  assert.ok(!escaped.includes("<"));
  assert.equal(JSON.parse(escaped).description, "</script><script>alert(1)</script>");
});

test("FAQ answers match their input exactly and breadcrumb/catalogue links point to public canonical URLs", () => {
  const { schema } = harness();
  const answer = "Use WhatsApp. <Booking> isn't confirmed yet.";
  assert.equal(schema.buildFaqJsonLd([{ question: "How?", answer }]).mainEntity[0].acceptedAnswer.text, answer);
  const data = schema.buildCatalogueJsonLd([catalogueProperty(property())]);
  assert.equal(data.itemListElement[0].item.url, "https://www.curatemystay.net/property/test-studio");
  const crumbs = schema.buildBreadcrumbJsonLd([{ name: "Home", url: "https://www.curatemystay.net" }, { name: "Stays", url: "https://www.curatemystay.net/booking" }]);
  assert.equal(crumbs.itemListElement[1].position, 2);
  const organization = schema.buildOrganizationJsonLd();
  assert.equal(organization["@type"], "Organization");
  assert.ok(!("address" in organization));
  assert.ok(!("sameAs" in organization));
  assert.ok(!("contactPoint" in organization));
  assert.equal(schema.buildServiceJsonLd().provider["@id"], organization["@id"]);
});

test("every explicit crawler group retains the original wildcard disallows", () => {
  const { robots } = harness();
  const output = robots.default();
  assert.ok(Array.isArray(output.rules));
  const rules = output.rules;
  assert.equal(rules.length, 13);
  assert.equal(rules[0].userAgent, "*");
  assert.deepEqual(Array.from(rules[0].disallow as string[]), ["/dashboard/", "/owner/", "/api/", "/auth/callback", "/pending-approval", "/account-disabled"]);
  for (const rule of rules) {
    assert.equal(rule.allow, "/");
    assert.equal(JSON.stringify(rule.disallow), JSON.stringify(rules[0].disallow));
  }
});

test("at-a-glance quotes existing distance and breakfast sentences and preserves zero bedrooms", () => {
  const { copy } = harness();
  const text = copy.buildPropertyGlance(property({ public_property_type: "Studio", bedrooms: 0, short_description: "Breakfast included. The airport is 3.7 km away." }));
  assert.ok(text.includes("0 bedrooms"));
  assert.ok(text.includes("Breakfast included."));
  assert.ok(text.includes("3.7 km away."));
  assert.equal(copy.buildPropertyGlance(property()), "");
});
