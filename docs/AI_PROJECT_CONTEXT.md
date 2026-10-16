# AI Project Context

This is the canonical current-state technical handoff for CurateMyStay. Read [Documentation Index](./INDEX.md) first for source-of-truth rules and task-specific links. Historical implementation states belong in [Changelog](./CHANGELOG.md), not here.

## Product and Scope

CurateMyStay is a short-term rental management application for Goa. It combines:

- a public reference-style acquisition homepage;
- a server-authoritative owner revenue forecast and pitch-deck funnel;
- an admin operations dashboard; and
- an owner transparency dashboard scoped to assigned properties.

Phase 1 covers profiles, properties, bookings, expenses, P&L, owner payouts, simple owner queries, settings, profile editing, and public lead collection.

Deferred: calendar, Forma Sheet, budgeting, receipt upload, channel sync, payments, WhatsApp automation, advanced disputes, scheduled payout jobs, and owner statement PDFs.

The public property catalogue routes `/booking` and `/property/[slug]` are implemented. Still not implemented: separate public booking enquiries and an admin enquiry review/conversion workflow. The agreed plan and the manually completed live Supabase changes are documented in [Public Property Catalogue and Booking Enquiries](./PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md).

## Technology Stack

- Next.js `16.2.9` App Router with `proxy.ts`
- React `19.2.4` and strict TypeScript
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Supabase Auth/Postgres via `@supabase/ssr` and `@supabase/supabase-js`
- Zod validation
- TanStack Table for dashboard data tables
- Select shadcn/ui-compatible source primitives in `components/ui`
- Lucide icons
- Resend email
- Google Apps Script proposal/PDF generation

No global state framework, CSS-in-JS layer, repository/service architecture, or full UI framework is used.

## Architecture Map

```txt
app/
  Next.js routes, layouts, pages, metadata routes, and public route handlers.

components/
  home/       Public reference-style homepage and forecast UI.
  forms/      Concrete auth/admin/booking/contact forms.
  layout/     Admin/owner shell, sidebar, topbar, page headers.
  ui/         Small Tailwind/shadcn-compatible primitives and shared TanStack DataTable.

src/features/
  auth/            Auth actions, profile guards, redirects.
  shared/          Direct Supabase dashboard reads and server actions.
  owner-forecast/  Calculator, Apps Script adapter, forecast emails.
  payouts/         Payout calculations, processing actions, tables, live panel.
  bookings/        Form calculations and booking tables.
  other features/  Lightweight table column/wrapper modules.

src/lib/
  supabase/    Browser, server, service-role clients, session refresh.
  validators/  Zod schemas.
  constants/   Roles, statuses, navigation.
  utils/       Dates, money, formatting, protected-admin helper.

types/              Generated/manual database and application types.
supabase/schema.sql Checked-in schema reference; enables RLS but has no policies.
docs/               Current handoff guides plus append-only changelog.
reference/          Visual prototype inputs, not production code.
```

For the upcoming public property catalogue, checked-in `supabase/schema.sql` and `types/database.types.ts` now represent the manually added catalogue property fields and `property_images` table. The live `property-images` Storage bucket and deployed admin policies remain documented rather than represented in repository SQL, because `schema.sql` does not currently track Storage or policy definitions.

## Route Map

| Area | Active routes |
| --- | --- |
| Public | `/`, `/about`, `/booking`, `/property/[slug]`, `/case-studies`, `/property-management-goa`, `/property-management-proposal`, `/faq`, `/demo`, `/login`, `/signup`, `/auth/callback`, `/pending-approval`, `/account-disabled` |
| Public API | `/api/contact`, `/api/auth/send-email-hook`, `/api/owner-forecast`, `/api/owner-forecast/proposal` |
| Admin | `/dashboard`, `/dashboard/users`, `/dashboard/properties`, `/dashboard/bookings`, `/dashboard/expenses`, `/dashboard/pnl`, `/dashboard/payouts`, `/dashboard/queries`, `/dashboard/settings`, `/dashboard/profile` |
| Owner | `/owner`, `/owner/property`, `/owner/bookings`, `/owner/expenses`, `/owner/payout`, `/owner/queries`, `/owner/profile` |

See [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md) for purpose and security notes.

`/booking` and `/property/[slug]` exist. The remaining catalogue/enquiry routes are `/dashboard/booking-requests` and `/api/booking-requests`. They do not exist yet and must not use confirmed operational bookings for public enquiries.

## Roles and Permissions

### Visitor

- Views the homepage, public About page, or property-management proposal page and submits contact/forecast requests.
- Can log in or create a pending owner account.

### Pending or Inactive User

- Pending profiles redirect to `/pending-approval`.
- Inactive profiles redirect to `/account-disabled`.
- Neither may enter role dashboards.

### Active Admin

- Manages users, properties, bookings, expenses, P&L, payouts, queries, settings, and own profile.
- Cannot delete, demote, or disable the protected admin through current actions.
- Marks only approved/resolved payouts paid.
- Cannot edit payout TDS.

### Active Owner

- Reads assigned properties, their bookings (including guest contact), property expenses, own payouts, and own queries.
- Cannot see CMS expenses or other owners' data.
- May update own name, phone, and avatar URL.
- May create simple queries and approve/query eligible own payouts during days 1-5.
- Cannot edit operational data, payout amounts, TDS, roles, or account status.

## Authentication Flow

1. Email/password login calls Supabase and redirects from the current profile.
2. Public signup creates an Auth user and upserts a pending owner profile.
3. Google login uses Supabase OAuth and returns through `/auth/callback`.
4. Callback exchanges the code, obtains/creates a safe pending-owner profile, and redirects by status/role.
5. `getCurrentProfile()` reads role/status from Supabase, never local storage.
6. Admin and owner route layouts call `requireRole()`.
7. Server mutation actions re-check the required role.

`/api/auth/send-email-hook` is the signed Supabase Auth Send Email Hook endpoint. It verifies Standard Webhooks headers with server-only `SUPABASE_SEND_EMAIL_HOOK_SECRET`, validates the official Supabase payload, sends signup/recovery/invite/magiclink/email-change/reauthentication emails through the existing Resend setup, and only accepts redirect URLs that are same-origin with `NEXT_PUBLIC_SITE_URL`. Deploy the endpoint and set the secret before enabling the hook in Supabase.

`proxy.ts` refreshes Supabase sessions for matched routes. The public `/` and `/demo` routes skip session refresh to remain static/read-only acquisition surfaces. If Supabase reports `refresh_token_not_found`, the proxy clears stale `sb-*` auth cookies from the forwarded request and response so expired local browser sessions do not crash or spam the production server.

## Supabase Clients

| Client | File | Use |
| --- | --- | --- |
| Browser | `src/lib/supabase/client.ts` | Client components when needed |
| Authenticated server | `src/lib/supabase/server.ts` | Server components, route handlers, server actions |
| Stateless public | `src/lib/supabase/public.ts` | Cached public-safe catalogue/detail/gallery views only; no cookies/session |
| Service role | `src/lib/supabase/admin.ts` | Server-only public lead inserts when configured |
| Session refresh | `src/lib/supabase/middleware.ts` | Called by root `proxy.ts` |

Normal dashboard reads use the authenticated server client, not service role. Owner reads are explicitly filtered in `getOwnerData()`.

### Data Loading and Cache Boundaries

`getAdminData(required)` and `getOwnerData(required)` preserve their response shapes but fetch only datasets selected by each page, with independent reads parallel. Private reads explicitly remain `no-store`: persisting their session-bound RLS client would violate the credential/cookie cache boundary. Auth/profile pure reads use React request-scoped `cache`, never persistent authorization; missing-profile provisioning stays outside that memoized read. Provider errors fail closed instead of producing successful zero financial values.

Public catalogue/detail/gallery reads alone use Next `unstable_cache` with a 60-second minute key and one public property tag. Stateless anonymous queries read only the existing public views. `connection()` preserves request rendering and clock advancement; expired keys require blocking fresh reads and failures are not cached as successes. Server Actions centrally invalidate dependent routes and immediately expire public data after property/image changes, including partial-write branches and imports. Payout page-load processing is unchanged and uncached, followed by fresh display reads. No application-wide Cache Components, router stale-time increase, service-role dashboard reader or new dependency is added. See [Caching and Invalidation](./CACHING_AND_INVALIDATION.md) for the complete mutation map, direct-database TTL and already-open session limitations.

## Security Boundaries

- RLS is the required primary database boundary.
- `supabase/schema.sql` enables RLS on every table but contains no policy definitions. Deployed policies must be created and verified separately.
- UI hiding is convenience only; role actions and payout actions re-check server-side.
- Service-role, Apps Script, and Resend credentials are server-only.
- Public signup cannot create admin.
- Protected-admin checks use `is_protected` or the configured protected address.
- Owner property/query/payout actions verify ownership before writes.
- CMS expenses are excluded from owner queries and payout calculations.
- Public booking enquiries must remain separate from confirmed `bookings` until an admin manually converts an enquiry through the existing booking workflow.

See [Supabase Schema](./SUPABASE_SCHEMA.md) for the full responsibility matrix.

## Environment Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe | Supabase anonymous/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Public lead insertion where RLS requires it |
| `APPS_SCRIPT_WEBHOOK_URL` | Server-only | Proposal service endpoint |
| `APPS_SCRIPT_SECRET` | Server-only | Proposal service shared secret |
| `RESEND_API_KEY` | Server-only | Email delivery |
| `RESEND_FROM_EMAIL` | Server-only | Verified forecast sender |
| `ADMIN_CONTACT_EMAIL` | Server config | Admin lead recipient |
| `SUPABASE_SEND_EMAIL_HOOK_SECRET` | Server-only | Standard Webhooks secret for Supabase Auth Send Email Hook |
| `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER` | Browser-safe | Public WhatsApp link number |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Canonical site origin used for auth callbacks, SEO metadata, robots, and sitemap |
| `NEXT_PUBLIC_GTM_ID` | Browser-safe | Google Tag Manager container ID for global analytics base loading |

Use blank placeholders from `.env.example`. Deployment steps are in [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md).

Global analytics is limited to the GTM base integration in `app/layout.tsx`. When `NEXT_PUBLIC_GTM_ID` is unset, no GTM script or noscript iframe renders. GA4 and event tracking are managed inside GTM, not directly in the application code.

The App Router metadata layer uses `app/seo.ts` as the shared helper for public route metadata. The canonical host is `https://www.curatemystay.net` through `metadataBase`, public page canonicals use relative route paths from that host, and public marketing/auth pages have explicit route-level title, description, Open Graph, Twitter, and canonical values to avoid accidental inheritance conflicts. Keyword metadata has been removed sitewide. Private/auth surfaces (`/dashboard`, `/owner`, `/login`, `/signup`, `/pending-approval`, and `/account-disabled`) remain noindex, with `/login` keeping its own canonical and Open Graph URL at `/login`.

Homepage funnel event tracking uses `src/lib/analytics.ts` to push non-PII objects to `window.dataLayer`. The helper no-ops during SSR, does not call `gtag`, does not include analytics IDs, and strips `undefined` values. The public homepage tracks calendar clicks, WhatsApp clicks, forecast-form open/start, successful lead generation, pitch-deck ready state, and pitch-deck downloads. The primary conversion is `generate_lead`, fired only after `/api/owner-forecast` succeeds and the forecast is accepted/displayed. See [Analytics Tracking](./ANALYTICS.md).

## Homepage and Forecast Funnel

- `/` renders `components/home/reference-home.tsx`, and `reference/index.html` is the visual source of truth for the owner landing page.
- The homepage is maintained as a Tailwind-first Next.js translation of `reference/index.html` with local assets rather than a separate HTML implementation.
- The homepage also emits a small truthful JSON-LD `ProfessionalService` block for CurateMyStay without inventing address, phone, or review data.
- Homepage typography is normalized with scoped `next/font/google` Figtree loading for the public landing page so the reference hierarchy is preserved without changing dashboard typography.
- Header and footer both use `public/logo.png` as the official logo mark with `object-contain`; the header no longer adds an extra "For Property Owners" subtitle.
- The shared public marketing `PublicHeader` lives in `components/home/public-header.tsx` and is used across `/`, `/about`, `/case-studies`, `/faq`, and `/property-management-proposal`. It uses the official `public/logo.png` mark, centered links for Home, About, Case Studies, FAQs, and Get Pitch Deck, plus a direct-call link, quiet `Owner Portal` access to `/login` and a primary `Book a Call` Calendly popup action, in that order. Each navbar item uses one restrained Lucide icon rendered from the shared navigation configuration on desktop and mobile. The call link is `PhoneNavLink` in the same file: it shows the configured contact number as `+91 XXXXX XXXXX` over `tel:+<digits>`, never sits inside the `More` dropdown, and reads `getPublicPhoneUrl()` and `getPublicPhoneDisplay()` from `src/lib/public-whatsapp.ts`, so it cannot drift from the WhatsApp links or the property-page `Call us` action. Exactly one copy is visible at any width: in the desktop row from `xl`, beside the hamburger from `md` to `xl` where the desktop row is collapsed, and as a row in the open mobile menu below `md`. Active navigation uses exact route matching for the standard page links, and the proposal forecast section is anchored at `/property-management-proposal#forecast` with sticky-header scroll margin.
- `/property-management-goa` is a public service and Google Ads landing page for Goa property owners. It uses the shared public header, footer, Calendly popup, WhatsApp helper, forecast route, metadata helper, and Figtree public typography. The route is linked as `Property Management` in desktop navigation, mobile navigation, and the public footer; it has self-referencing canonical metadata, FAQPage and BreadcrumbList JSON-LD, and is included in the public sitemap. Its four “Properties we manage” cards use page-local `next/image` presentations backed by the existing `public/homepage` property photography.
- All public booking CTAs open the Calendly `30min` popup through one shared Calendly stylesheet/script loader using `https://calendly.com/curatemystay/30min?hide_gdpr_banner=1`. Calendly uses its default appearance; the loader queues an early click until the script is ready, does not use `window.onload`, adds no floating badge, and preserves the existing `calendar_click` analytics event with `destination_type: calendly`.
- A shared fixed WhatsApp icon appears only on the public marketing routes (`/`, `/about`, `/booking`, `/case-studies`, `/faq`, `/property-management-goa`, and `/property-management-proposal`). Property detail pages (`/property/*`) deliberately do not show it: their sticky mobile enquiry bar and sticky stay card replace it. It is mounted once in `app/layout.tsx` and gates itself in `components/home/floating-whatsapp.tsx` on an allowlist of exact paths, so adding a route means adding one entry there rather than mounting a second button. It builds its URL from `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER`, uses the existing public prefilled message, opens in a new tab, and emits the non-PII `whatsapp_click` event with `cta_location: floating_whatsapp` on every route. Calendly has no fixed badge, so the controls do not overlap. `/booking` therefore carries no inline WhatsApp CTA of its own; note that the shared prefilled message remains the owner-facing one.
- The page includes a timed hero carousel, responsive hamburger menu, service/proof sections, the shared Calendly popup, WhatsApp links, and the three-step owner forecast.
- The proof section uses the reference portfolio metrics, the Panjim and Varca case studies, static first-month-normalized revenue ramp charts, and the approved testimonial copy rendered with placeholder initial avatars instead of profile photos.
- The FAQ restores all ten approved questions/answers as a two-column accessible accordion with one open item at a time.
- The old standalone transparency section is removed from the page flow; its approved transparency/control/investment content now lives inside the bottom `More about how we work` accordion.
- The partnership section uses the reference `Signature`, `Curated`, and `Bespoke` cards, with `Curated` visually featured as `Most Chosen`.
- Testimonial avatars stay as initials, while the team/about section and final CTA use the existing local `public/homepage/founder.jpg` and `public/homepage/aravind.jpg` assets.
- Initial submission calls `/api/owner-forecast`; server validates, calculates, stores the lead, and returns forecast without waiting for a deck.
- The forecast contact step uses the installed phone-number libraries with India (`+91`) selected by default; country changes preserve the typed national digits, the existing `phone` field is submitted as a validated E.164 number, and contact-step errors stay field-specific after a failed Continue attempt.
- The forecast result CTA order is `Book a Call`, `WhatsApp us now`, pitch-deck action, then `Start over`; Book a Call uses the shared Calendly popup with `cta_location: forecast_result`, WhatsApp keeps its existing destination with the brand icon/green styling, and both analytics events remain non-PII.
- The browser immediately displays annual revenue, 15% operating cost, and net profit.
- It then calls `/api/owner-forecast/proposal` in the background.
- Proposal API recalculates server-side, calls Apps Script, sends the admin email after the generation attempt, and returns normalized URLs.
- Download becomes ready only when HTTP succeeds, `result.ok === true`, and `pdfDownloadUrl` exists.
- Owner receives a link-only email only after successful PDF generation. Email failure does not invalidate a successful deck.
- No owner/CMS split, TDS, payout, or fixed commercial terms are shown in the public funnel.
- Dashboard routes, auth, APIs, Supabase access, and backend business logic are untouched by homepage-only visual/content passes.

`/property-management-proposal` is the standalone SEO acquisition page for the keyword `Goa property management proposal`. It reuses the homepage public header, footer, complete three-step forecast, forecast result, background proposal generation, pitch-deck download, WhatsApp behavior, Calendly popup, and non-PII analytics without duplicating forecast business logic. Its metadata uses the canonical `https://www.curatemystay.net/property-management-proposal`, the existing Open Graph image, and visible seven-question FAQ content mirrored exactly in `FAQPage` JSON-LD. The page appears in the sitemap but is not added to public or dashboard navigation.

`/about` is a short public company page based only on supported homepage and project information. It explains CurateMyStay's Goa short-term-rental operations, three-part owner working approach, owner-facing transparency, a separate family-run "Who We Are" section using the existing homepage family image, and a distinct Aravind founder section using the existing founder image. It reuses the homepage header, footer, WhatsApp URL, Calendly popup, imagery, typography, and non-PII analytics with `cta_location: about_page`. Its metadata uses the canonical `https://www.curatemystay.net/about`, the existing Open Graph image, and its own About-specific Twitter title instead of inheriting the homepage share title. The route appears in the sitemap but is not added to navigation.

`/faq` is a compact public FAQ page for common property-owner questions about CurateMyStay's Goa property management service, forecast estimates, owner visibility, payout review, and onboarding. It reuses the homepage header, footer, typography, accordion styling, WhatsApp CTA, shared Calendly popup, and non-PII analytics with `cta_location: faq_page`. Its metadata uses the canonical `https://www.curatemystay.net/faq`, the existing Open Graph image, and visible twelve-question FAQ content mirrored exactly in `FAQPage` JSON-LD. The route appears in the sitemap but is not added to navigation.

`/case-studies` is a server-rendered public proof page for the managed Panjim apartment and Varca villa. It draws the current portfolio proof figures, case-study metrics, revenue-progression data, owner testimonials, guest reviews, and local property photos from `components/home/case-studies-data.ts`, and reuses the shared public header, footer, Calendly popup, WhatsApp CTA, and existing local homepage images. Its metadata uses the canonical `https://www.curatemystay.net/case-studies`, a `CollectionPage`/`ItemList` JSON-LD block, and the existing Open Graph image. The route appears in the public navigation and sitemap.

`/booking` is the public property catalogue. The server component calls `loadPublicCatalogue()` in `src/features/catalogue/public-catalogue-data.ts` and passes one public-safe array to the `PropertyCatalogue` client component, which filters the already-loaded array in the browser by region, area, property type, guests, bedrooms and pool. Client-side filtering is deliberate because the catalogue holds roughly 4-15 properties; there is no filter API, URL-state library or search service. Ordering is featured first, then `display_order`, then `public_name`. Cards show only admin-editable public property content from Admin -> Properties, link to `/property/[slug]`, use `View stay` wording, and show `From <price> / night` only when `show_price` is true and `starting_price` exists. The page never checks live availability and never creates booking requests. It reuses `PublicHeader`, `PublicFooter`, the Calendly loader, the shared SEO helper, Figtree public typography and the shared `Skeleton` primitive, and is included in the public sitemap but not public navigation.

The page sections are `BookingHero`, `PropertyCatalogue`, `BookingWhyDirect`, `BookingGuestReviews`, `BookingGuestServices` and `FamilySection`, all matched to the `Curate My Stay` booking screen in `reference/booking.html`. `components/home/booking-hero.tsx` owns the photographic hero: 480/560/680/720px tall by breakpoint, the reference's `120deg` directional scrim, and copy positioned at `top-[30%]`/`lg:top-[32%]` of the hero's own height so the heading stays in the upper third at every hero height instead of being pushed down by bottom padding. The photograph is a `fill` image with `sizes="100vw"`, `preload` and `quality={85}`; the fallback is `/homepage/varca-2.jpg` (5712x4284) because every `public/homepage/IMG_*.jpg` file, including the `IMG_0600.jpg` the reference names, is only a 600x450 web thumbnail that the browser had to upscale roughly 3x across a desktop hero. The lead property's cover still takes over when one exists, so the fallback governs sharpness only until then. The floating filter panel keeps its existing fields and client-side filter behaviour; its primary action reads `Search` on the coral accent and overlaps the hero's bottom edge by roughly half its height.

Catalogue cards navigate as a whole: `CataloguePropertyCard` is a `relative` article whose only anchor is a single `absolute inset-0` overlay `Link` to `/property/[slug]` carrying the accessible name, so each card is one tab stop, there are no nested anchors, and cards without a cover photo behave identically. `View stay` is presentational text that responds to the card's hover state. `BookingWhyDirect` is the reference's four-benefit `Why book direct` section plus its `Compare side-by-side` disclosure; its copy and the Airbnb-versus-direct comparison rows are reference marketing claims held in one typed module in `components/home/booking-why-direct.tsx`, with no admin content mechanism behind them yet.

`loadPublicCatalogue()` reads the manually created `public_property_catalogue` view with the stateless anonymous public client, using an explicit column list rather than `*`, and ordering by `is_featured` descending, `display_order` ascending, then `public_name` ascending. The view is the security boundary: it exposes public columns only and already filters to `show_on_website = true`, `status = 'active'` and a non-null slug, so no visibility filtering lives in application code. `properties` and `property_images` are never queried directly for public reads, and service role is never used. A failed query returns the catalogue error state and logs only the Supabase error code and message, which keeps it distinct from a successful query with zero rows. Successful public rows are cached for at most 60 seconds with immediate property/image mutation expiry; `connection()` keeps `/booking` request-rendered without reading cookies. See [Caching and Invalidation](./CACHING_AND_INVALIDATION.md). `next.config.ts` allows `next/image` to load catalogue covers from the configured Supabase host under `/storage/v1/object/public/property-images/**` only, with no wildcard host or path, and allowlists optimizer qualities `[75, 85]` because Next.js 16 permits `75` alone by default and the `/booking` hero requests `85`.

`/property/[slug]` is the public property detail page. `app/property/[slug]/page.tsx` resolves the slug, calls `loadPublicPropertyDetail()` in `src/features/catalogue/public-property-detail-data.ts`, and renders `PropertyDetailPage`. Its layout follows the `Curate My Stay — Property Detail Page` screen in `reference/booking.html`: an `All stays` back link, the title with a Share button, a summary line and the promotional badge, a gallery (a snap-scrolling carousel below `lg`, the 1 + 4 grid from `lg`, both opening the photo tour), then a two-column body with the content on the left and a sticky 384px stay card on the right. Below `lg` the layout is one column, the stay card comes last and a sticky enquiry bar handles quick enquiries. Every property-specific value comes from Admin -> Properties; only generic headings and company-level copy live in code, and empty optional fields hide their whole section. `PublicHeader`, `PublicFooter`, the shared SEO helper, Figtree typography, the shared `Skeleton` primitive, `getPropertyImageUrl()` and the shared `ShareButton` are all reused.

When `airbnb_listing_url` holds a valid HTTPS Airbnb listing link (`isAirbnbListingUrl` in `src/lib/validators/properties.ts`), `property-airbnb-section.tsx` renders after Stay details: `See Our Guest Reviews & Airbnb Listing` with a new-tab link to the listing, then `Book Directly for a Better Rate` with the existing enquiry-context WhatsApp button (`cta_location: property_page_direct_booking`). Nothing renders without a valid link. The column is exposed by the `public_property_details` view (manual Supabase change, confirmed live).

Below the title sit a Share button (`ShareButton`: immediate Web Share, secure clipboard, legacy copying on insecure LAN connections, then a selectable-link/WhatsApp popover; copying shows a Sonner toast) and a summary line built from the data, for example `Villa in Varca, South Goa · 8 guests · 3 bedrooms · 3 beds · 3.5 bathrooms`, skipping empty parts and never saying "Entire". The body then shows compact capacity tiles (capacity appears only there and in the summary line), up to four highlight rows (icon, bold title and subtitle from a `Title: subtitle` convention inside `property_highlights`; later highlights join the amenities so nothing is dropped), About (tagline plus five clamped lines, with `Show more` only when the text is actually clamped), the first ten amenities with `Show all N amenities` grouped by category, Stay details (check-in, check-out, minimum stay and beach distance), `Things to know` (House rules, Safety & property built from safety-category amenities, and Enquiry policy built from `booking_enquiry_note`, minimum nights and a company-level line; 3 columns from `md`, chevron rows below; empty blocks hidden; there is no cancellation policy field, so none is shown) and `Where you'll be`. Long content opens in the shared `components/ui/show-more-dialog.tsx` (Radix Dialog: a bottom sheet below `sm`, a centred modal from `sm`, and `Dialog.Overlay` for the page scroll lock, so the dialog body is the only scroll container). Amenity icons and categories come from keyword maps in `src/features/catalogue/amenity-categories.ts` with an `Other` fallback, so no schema change is needed. The map (`property-area-map.tsx`) is built from the property's saved `google_maps_url` by `src/lib/maps.ts`, with no API key. Long links (`@lat,lng`, `!3d!4d`, `?q=`/`?ll=`/`?query=` coordinates), pasted `<iframe>` embed codes and `/maps/embed` URLs are read with no network. Short links (`maps.app.goo.gl`, `goo.gl/maps`) are followed on the server only, one redirect at a time with every hop restricted to Google hosts, a 5 second cap and a week-long data cache for successes only (`property-map-embed.ts`, `unstable_cache`). A failed lookup (DNS, network, timeout or no coordinates) is never cached for the week: it is remembered for one minute so a dead link cannot make every visit wait, concurrent visitors share one in-flight lookup, and the map recovers by itself once Google can be reached. Every attempt logs one `[property map] short link lookup {...}` line (input, hop hosts, trimmed final URL, outcome and reason). Coordinate embeds use `https://www.google.com/maps?ll=<lat>,<lng>&z=15&output=embed`: full source precision centres the circle correctly, `ll=` avoids a marker and place card, and the iframe stays non-interactive. The fallback order is: coordinates from the saved value; else the area text, the same text as the `Approximate area` pill (`https://www.google.com/maps?q=<area text>&z=13&output=embed`, built from the area alone, never from anything in the saved URL, so a house name or street is not revealed); else the same beige card without a map (`chooseMapEmbed` in `src/lib/maps.ts`). `View on Google Maps` keeps linking to the saved value in every case and appears only for a web link. A property with no `google_maps_url` does not render `Where you'll be` at all. The admin Google Maps URL field accepts a pasted embed code and stores its Google link. `savePropertyAction` resolves short links before saving: successful resolution stores the coordinate-bearing long URL in the existing `google_maps_url` column; failure keeps the short link and redirects with `property_created_map_warning` or `property_updated_map_warning`, advising the admin to paste the full browser address-bar URL. The field shows the same hint. Existing short-link data retains cached render-time resolution. Only coordinates identify the actual property; the area-text fallback is approximate and can show Google's place card. Below `lg`, a sticky bottom bar (`property-mobile-enquiry-bar.tsx`, rendered after the footer with an in-flow spacer so it never covers content) offers `Ask about this stay` on WhatsApp using the stay card's shared dates, guests and validation, plus a Call icon, and the full stay card comes last in the content; from `lg` the card is sticky beside the content. All enquiry CTAs share one message builder (`property-enquiry-message.ts`) and emit `whatsapp_click` with `property_page_enquiry_card` or `property_page_mobile_bar`, only after valid dates. No review data exists, so no reviews section is rendered.

The gallery (`src/features/catalogue/property-gallery.tsx`) renders one set of photo buttons for both layouts, so the cover is preloaded once, photos hidden on desktop are never downloaded, and only real photos render (no placeholder tiles). Below `lg` it is a full-width snap-scrolling carousel with a `1 / N` counter; from `lg` it is the 1 + 4 grid with a `Show all photos` button. Any photo, and that button, opens the photo tour (`property-photo-tour.tsx`), a full-screen Radix dialog whose open state lives in the URL (`?photos=1`, `?photos=1&photo=N`, through `use-photo-tour-url.ts`), so the browser and phone back buttons close the lightbox, then the tour, instead of leaving the page, and a deep link opens straight onto a photo. The tour is laid out like a photo tour: a `Photo tour` heading with one thumbnail per room (a wrapping row, a horizontally scrolling strip on mobile), then one section per room with the name sticky on the left while that room's photos scroll on the right from `md` (static name above below `md`). Each room bounds its title; the 61px top bar and 16px gap share `--photo-tour-bar-height` for sticky and thumbnail scroll offsets. The first photo is full width (3:2), the rest are in side-by-side pairs (4:3), and one leftover photo at the end is full width. Each photo's room is inferred from its `alt_text` by `src/lib/utils/photo-rooms.ts`, with no schema change. An explicit `Room | description` prefix wins (the room name is normalised so spelling variants share a section, and the prefix is stripped from the image alt text and the caption). Otherwise a keyword map decides, resolved in a documented priority order (WC, Bathroom, Kitchen, Pool, Dining area, Work area, Balcony, Bedroom, Living room, Exterior, Common area) with room numbers read from the text (`Bedroom 2`, `2nd bathroom`, `Bedroom two`). Anything empty, generic or unmatched goes to a final `Additional photos` section. Rooms are ordered by their earliest photo in the admin `sort_order` (then creation time) only: the public loader sends the cover first for the page's top grid, but the tour re-sorts and gives the cover no special place. With fewer than two detected rooms the index and headings are skipped and the photos show in one plain 2-column grid. The lightbox counter and caption are continuous across rooms (`7 / 24`, room name then description) and it supports arrow keys, swipe and Esc. The tour and lightbox render a `Dialog.Overlay`, which is what carries Radix's scroll lock, so the page behind is locked (with scrollbar-width compensation) and the tour is the only scroll container. `npm test` runs the `photo-rooms` unit tests with Node's built-in test runner.

`loadPublicPropertyDetail()` reads the manually created `public_property_details` and `public_property_gallery` views with the stateless anonymous public client and explicit column lists, then orders gallery rows by `is_cover` descending, `sort_order` ascending, then `created_at` ascending so the cover is always first. It is wrapped in request-scoped React `cache`, so `generateMetadata` and the page render share one result. Separate persistent Next caches reuse successful public detail/gallery rows for at most 60 seconds and expire immediately after property/image mutations; `connection()` keeps the page request-rendered. A failed gallery is never persisted as an empty success. The views are the security boundary and already apply the `show_on_website`, `status = 'active'` and non-null-slug filters, so missing, unpublished and operationally inactive slugs are indistinguishable and all call `notFound()`; a real query failure returns a separate public error state and logs only the Supabase error code and message. A gallery-only failure still renders the property with the no-images placeholder. `properties`, `property_images` and the legacy `image_url` are never used, and service role is never used. Because `loading.tsx` streams a fallback, `notFound()` here is a documented soft 404: the response has already committed to 200, so Next.js injects `<meta name="robots" content="noindex">` rather than changing the status.

The stay card is an enquiry builder, laid out from the `BookingWidget` of the same reference screen: 20px radius, 24px padding, `public-control` hairline, `0 6px 16px rgba(0,0,0,0.12)` shadow, one bordered 12px-radius control holding check-in and check-out side by side above a full-width guests row, and two 52px full-width CTAs at 17px/600 with a 12px radius. It shows `<price> per night` behind `show_price` and a non-null `starting_price`, plus price note, `booking_enquiry_note` and the configured check-in/check-out times. It shows no minimum stay, no totals, no taxes, no rating and no cancellation or payment copy.

One `PropertyEnquiryProvider` wraps the stay card and sticky bar, sharing check-in, check-out, guest count and a single validation/click handler. Those selections only build a WhatsApp message: the card calls no API, invokes no server action, never touches `booking_requests` or `/api/booking-requests`, and never claims a date is available. Each date cell is a transparent native `<input type="date">` stretched across it with the picker indicator hidden, and a click anywhere on the cell calls a guarded `showPicker()`, because Chromium otherwise opens the calendar only from that indicator. Both WhatsApp buttons require valid dates: check-in cannot be in the past and check-out must be after check-in, with specific inline errors announced through `aria-live="polite"`. Invalid submission scrolls to the visible card below the sticky header and focuses/opens the relevant date input, check-in first when both are missing. Errors clear once both dates become valid; the guest range is capped by `max_guests` when configured. The phone link has no date requirement; the card uses a scroll margin and the bar keeps its safe-area spacer. Fields display the reference's short `18 Aug` form because the long form overflows a half-width field at 320px; the message uses `18 Aug 2026` and includes calendar nights. The message carries the public name, both dates, the guest count and the absolute `siteOrigin` property URL, and is passed through the shared `getPublicWhatsAppUrl()` helper, so the number is never hard-coded. The secondary `Call us` CTA is a `tel:` link built from `getPublicContactNumber()` in the same module, so both CTAs always use the one configured `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER`. The WhatsApp CTA still emits `whatsapp_click` with `cta_location: property_page_enquiry_card`, and the `Call us` link adds no new analytics event. When `accept_booking_requests` is false the whole control-and-CTA block is replaced by `Enquiries for this stay are currently paused.` Metadata prefers `seo_title` then a title derived from `public_name`, `area` and Goa, prefers `seo_description` then `short_description` then `tagline`, and uses the gallery cover for Open Graph when one exists.

`/demo` is a public, noindex, read-only preview of the owner dashboard for prospective owners. It uses only deterministic fictional local data from `src/features/demo/demo-owner-data.ts`, bypasses session refresh, does not query Supabase or read cookies, and cannot navigate into protected owner routes. The demo is intentionally absent from all public, authenticated, and footer navigation.

Exact formulas: [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md). HTTP shapes: [API Contracts](./API_CONTRACTS.md).

## Booking Workflow

- Admin create/edit uses one form and direct server action.
- Dates auto-calculate nights; nights/rates auto-calculate total or rate according to the last amount edited. All remain manually editable.
- Check-out before check-in is rejected.
- Status is calculated server-side: upcoming before check-in, in-house through the day before check-out, checked-out on/after check-out.
- Current form submits no manual status override. Cancelled/blocked remain recognized in schema and revenue logic.
- Booking source and concierge options come from settings.
- Admin booking form UI groups guest/property, dates, amount helpers, calculated status, and full-width notes while preserving the same server-action field names and local calculation helpers.
- Booking create/update/delete redirects use booking-only notice codes: `booking_created`, `booking_updated`, `booking_deleted`, `booking_delete_failed`, and `booking_delete_not_found`; the page toast removes the notice from the URL after display.
- Admin booking deletion is confirmed with an AlertDialog that names the guest and property, keeps the connected server-action form mounted while pending, and verifies deletion before showing success.
- `/dashboard/bookings/loading.tsx` provides a route-level skeleton for the booking form and list.
- Cleaning UI is removed; schema column remains unused.

## Expense Workflow

- Admin manages property and CMS expenses in one module.
- CMS is the default and always stores null property ID.
- Property expenses require a valid property.
- Expense categories come from settings.
- Admin expense form UI makes CMS versus property expense context clear near the top, disables and clears the property selector for CMS, and uses full-width notes while preserving the same server-action field names and validation rules.
- Expense create/update/delete redirects use expense-only notice codes: `expense_created`, `expense_updated`, and `expense_deleted`; the page toast removes the notice from the URL after display.
- Admin expense deletion is confirmed with an AlertDialog that names the category, amount, and CMS/property context before submitting the existing delete action.
- `/dashboard/expenses/loading.tsx` provides a route-level skeleton for the expense form and list.
- Admins can bulk-import expenses from CSV with headers `expense_date`, `expense_for`, `property_name`, `category`, `amount`, `vendor`, and `note`; the import is admin-only, previews rows client-side, re-parses and re-validates server-side, resolves property names only for property expenses, requires CMS rows to leave `property_name` blank, validates settings-backed expense categories, skips existing/repeated duplicates using date + type + property/CMS context + normalized category + amount + normalized note, blocks confirmation and server insertion when any file-level or row-level validation error exists, resets dialog upload/preview/result state whenever the popup closes or a replacement CSV is selected, and does not create or alter payout rows.
- Owners read only property expenses for assigned properties.

## Owner Payout Workflow

- `/owner` and the top of `/owner/payout` share current-calendar-month live performance from `calculateOwnerLivePerformance`.
- `/owner` presents the current-month live figures in a premium owner-facing dashboard layout with clear revenue, property expense, net profit, and estimated payout cards.
- `/owner` information order is current-month context, live financial performance, latest previous-month statement, recent activity/query sections, then lower-page property summary reference details.
- `/owner/loading.tsx` provides a route-level skeleton matching the owner dashboard hierarchy and section order.
- `/owner/property` is a premium read-only property reference page for owner-assigned properties, with clear property identity, address/location, bedroom count, status, owner/CMS share, reassuring no-property empty state, and route-level loading skeleton.
- `/owner/bookings` is a premium read-only owner booking history page with clear owner-scope context, guest/property/date/amount hierarchy, compact no-wrap status badges, owner property filtering only when multiple assigned properties exist, and a route-level loading skeleton.
- `/owner/expenses` is a premium read-only property-expense history page with clear property-only scope, CMS-expense exclusion copy, date/category/vendor/note/amount hierarchy, aligned amounts, existing search behavior, and a route-level loading skeleton.
- `/owner/queries` is a premium owner support page with a clear new-query form, pending submit state, owner-query success notice code `owner_query_created`, owner-scoped query history, owner-facing Open/Resolved statuses, and payout-linked rows labeled only as statement queries.
- Successful owner query creation sends a server-side internal Resend notification to `ADMIN_CONTACT_EMAIL` after the query row is inserted. Email failure is logged server-side and never rolls back or blocks the owner query flow.
- `/owner/profile` is a premium owner self-service profile page with editable name, phone, and avatar URL only; read-only email, role, and account status; pending save state; `owner_profile_updated` success notice; and route-level loading skeleton.
- Live performance uses owner-scoped bookings and property expenses and creates no current-month payout row.
- `/owner/payout` has a premium owner-facing payout page: informational current-month live performance at the top, a compact read-only all-time property P&L summary, one latest-first history table containing all owner payout records, no search, and no tabs.
- The all-time property P&L summary uses owner-scoped assigned-property bookings and property expenses, excludes cancelled/blocked bookings and CMS expenses, and never shows owner share, CMS share, TDS, paid amount, or estimated payout.
- Owner payout status badges are kept compact/no-wrap; paid and approved remain owner-facing `Approved`, and eligible approve/query actions stay gated by existing server-side review rules.
- Payable records are for the previous completed calendar month and are ensured on payout-page load. One combined row is identified by `(owner_id, month)`; application writes handle uniqueness conflicts, while the production unique index remains a documented manual action until applied and confirmed.
- Revenue is prorated by overlapping stay nights, check-in inclusive/check-out exclusive; cancelled/blocked are excluded.
- Only property expenses are deducted; CMS expenses are excluded.
- Prior negative results carry forward before split.
- Positive adjusted profit uses property-weighted owner share, complementary CMS share, and fixed 10% TDS on owner share.
- Days 1-5: owned ready-for-review rows may be approved or queried.
- After day 5: untouched previous-month rows auto-approve only when payout processing runs on page load.
- Query resolution and mark-paid remain admin-controlled.
- Owner-facing paid status displays as Approved.

Exact rules and statuses: [Payout Logic](./PAYOUT_LOGIC.md).

## Admin Operations

- `/dashboard` is the premium operational admin overview with a concise command-center header, KPI cards, property performance table, occupancy insights, upcoming check-ins, recent booking/expense activity, and a route-level loading skeleton. Its data calculations remain local to the page and read through `getAdminData()`.
- Properties: Admin -> Properties manages non-image public catalogue fields in a separate Website listing section and, after a property is first saved, its gallery images. `show_on_website` is distinct from operational `status`; turning visibility off preserves public listing data. Active admins upload JPEG/PNG/WebP files directly to the `property-images` Storage bucket, while `property_images` stores only the generated Storage paths and editable metadata. Browser-native processing leaves static images below 950 KB unchanged unless their longest side exceeds 2400px. Images at or above 950 KB, or above that dimension limit, are processed before upload: preserve aspect ratio without upscaling, resize to at most 2400px, and encode WebP at 85%, 80%, 75%, 70%, then 65% quality until at most 700 KB. The 500-700 KB target is soft: smaller results are kept immediately, and if the target is unreachable the smallest result at acceptable quality is kept only when smaller than the original. KB uses 1024 bytes. Transparency is preserved; animated PNG/WebP files are left unchanged. Unsupported formats still follow existing validation, and processing failure retains the original subject to the existing 10 MB final-upload limit. Cover and gallery images share this path. The gallery supports cover selection, linearly ordered images, alt text (also the public photo caption, and where a `Room | ` prefix names the photo's room, set per photo or in bulk from a room picker, with the detected room shown on each card), and confirmed deletion; legacy `image_url` remains preserved. The property save button follows image management. Separate public booking enquiries and their admin review workflow remain pending.
- Property, booking, and expense CSV imports preview every row before writing. Any file-level error or row classified as invalid keeps `Confirm Import` natively disabled with visible inactive styling; the client submit handler and server action both reject the import defensively, invalid rows and messages remain visible, selecting a replacement file hides previous import feedback, and pending state blocks duplicate submission. Existing/repeated duplicates remain non-blocking because these importers intentionally classify and skip them.
- Users: approve/change roles/status; protected admin remains active/admin and undeletable. `/dashboard/users` shows status/role summary cards, no-wrap role/status badges, row-level pending save feedback, user-only notice codes for update/delete results, AlertDialog delete confirmation for non-protected users, and a route-level loading skeleton. Eligible user deletion first checks for linked operational records and requires server-only Supabase Auth admin access through `SUPABASE_SERVICE_ROLE_KEY`; assigned properties, payout statements, or owner queries block deletion with guidance to reassign records or mark the account inactive. Success is shown only after Auth deletion is verified and the app profile is gone.
- Properties: CRUD and owner/share assignment. Edit mode remounts the existing form with the selected property id, server-side updates require that id, and successful saves redirect back to `/dashboard/properties` so edit mode resets. The image URL field is absent and existing `image_url` values are preserved on edit. Create/update/delete redirects use property-only notice codes for one-time success toasts, and property deletion is confirmed with an AlertDialog before submitting the existing delete action. Property deletion relies on database cascades for linked operational rows, then best-effort removes trusted image paths from `property-images`; Storage cleanup failure produces a warning without falsely failing the completed database deletion. Admins can bulk-import properties from CSV with required headers `property_name`, `owner_email`, `address`, `city`, `bedrooms`, `owner_share_percentage`, and `status`, plus 34 optional non-image website listing headers (`show_on_website`, `accept_booking_requests`, `slug`, `public_name`, `public_property_type`, `promotional_badge`, `display_order`, `is_featured`, `show_in_similar_properties`, `region`, `area`, `short_location_line`, `public_location_text`, `google_maps_url`, `distance_from_beach`, `tagline`, `short_description`, `full_description`, `beds`, `bathrooms`, `max_guests`, `pool_type`, `property_highlights`, `amenities`, `house_rules`, `show_price`, `starting_price`, `price_note`, `minimum_nights`, `check_in_time`, `check_out_time`, `booking_enquiry_note`, `seo_title`, `seo_description`); the import is admin-only, accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews rows client-side, re-parses and re-validates server-side, resolves owner emails to active owner profiles, validates optional bedrooms as a nonnegative whole number, skips existing/repeated normalized property names, rejects malformed rows with more cells than the header row, blocks confirmation and server insertion when any file-level or row-level validation error exists, never overwrites existing properties, and resets dialog upload/preview/result state whenever the popup closes or a replacement CSV is selected. Listing values are validated through `propertySchema`: blank cells use the admin form defaults, booleans accept true/false, yes/no or 1/0, list fields use `|` as the separator, times are 24-hour `HH:MM`, and rows with `show_on_website` true run the same publish-readiness checks as the admin form while hidden rows only have provided values format-checked and are saved as hidden drafts. A blank slug on a published row is generated from `public_name`; a slug that already exists or repeats in the CSV makes the row invalid (unlike property names, which are skipped), and a `23505` slug violation on insert returns a row-level message. Images cannot be imported and `image_url` is never written, so published rows show a non-blocking "Published without images" warning. The CSV parsing, validation, and demo live in `src/features/properties/property-import.ts`.
- Bookings: CRUD, settings-backed source/concierge, automatic status, booking-only success notices, and AlertDialog delete confirmation. Admins can bulk-import bookings from CSV with headers `property_name`, `guest_name`, `guest_phone`, `check_in`, `check_out`, `guests`, `nightly_rate`, `total_amount`, `booking_source`, `concierge`, and `notes`; the import is admin-only, accepts `.csv` files up to 5 MB and 1,000 non-empty rows, previews rows client-side, re-parses and re-validates server-side, resolves property names to existing properties, validates settings-backed source/concierge values, recalculates nights/status from dates, derives missing nightly rate or total amount from existing booking helpers, rejects contradictory rate/total values and malformed rows with more cells than the header row, skips existing/repeated duplicates using property + normalized guest name + normalized phone + check-in + check-out, blocks confirmation and server insertion when any file-level or row-level validation error exists, resets dialog upload/preview/result state whenever the popup closes or a replacement CSV is selected, never overwrites existing bookings, and does not create or alter payout rows.
- Expenses: CRUD; CMS default, property requirement rules, expense-only success notices, and AlertDialog delete confirmation. Admins can bulk-import expenses from CSV with headers `expense_date`, `expense_for`, `property_name`, `category`, `amount`, `vendor`, and `note`; the import is admin-only, accepts `.csv` files up to 5 MB and 1,000 non-empty rows, resolves human-readable property names for property expenses, requires CMS rows to have no property name, validates settings-backed categories, rejects malformed rows with more cells than the header row, skips existing/repeated duplicates using date + type + property/CMS context + normalized category + amount + normalized note, blocks confirmation and server insertion when any file-level or row-level validation error exists, resets dialog upload/preview/result state whenever the popup closes or a replacement CSV is selected, never overwrites existing expenses, and does not create or alter payout rows.
- P&L: premium operational financial overview with report-level existing-value summary cards, CMS expenses called out separately, aligned property P&L table amounts, and unchanged revenue/expense/share calculations.
- Payouts: premium admin payout operations page with previous-month page-load generation, combined owner rows, property breakup, query clarity, and confirmed mark-paid action. Page-load processing stops on incomplete source reads, preserves actioned rows with status-qualified writes, and handles unique owner/month insert conflicts. Owner approve/query and admin mark-paid actions now return one-time success/failure feedback; mark-paid eligibility remains approved/resolved payouts only.
- Queries: premium admin query inbox with open/resolved/statement context, pending resolve/delete actions, AlertDialog delete confirmation, `admin_query_resolved`/`admin_query_deleted` notices, and unchanged linked-payout resolve/restoration behavior.
- Settings: operational dropdown option management page for newline-managed `booking_sources`, `expense_categories`, and `concierge_options` arrays, with one-option-per-line guidance, pending save state, `settings_updated` notice, and unchanged downstream booking/expense form behavior.
- Profile: calm admin self-profile page with editable own name, phone, and avatar URL only; read-only email, role, status, protected-account context; pending save state; `admin_profile_updated` notice; and route-level loading skeleton.

Practical details: [Admin Operations Guide](./ADMIN_OPERATIONS_GUIDE.md).

## Common Edit Locations

| Change | Primary files |
| --- | --- |
| Public forecast rules | `src/features/owner-forecast/forecast-calculator.ts`, validator, calculator doc |
| Proposal response/email | proposal route, `proposal-generator.ts`, `forecast-email.ts`, API doc |
| Payout formula | `src/features/payouts/payout-calculations.ts`, payout doc |
| Payout transitions | `src/features/payouts/payout-actions.ts`, payout/admin docs |
| Owner/admin data reads | `src/features/shared/data.ts` |
| CRUD behavior | `src/features/shared/actions.ts` and relevant validators/forms |
| Navigation | `src/lib/constants/nav.ts` |
| Auth/roles | `src/features/auth/*`, route layouts, route/schema docs |
| Theme/layout | `app/globals.css`, `components/layout/*`, route pages |
| Tables | `components/ui/data-table.tsx`, feature columns/wrappers |
| Shared UI primitives | `components/ui/*`, [UI Conventions](./UI_CONVENTIONS.md) |
| Public property catalogue / booking enquiries | `docs/PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md` first, then schema/types once manually confirmed |

Prefer direct authenticated Supabase queries and feature server actions. Keep components and helpers small; do not introduce repositories, factories, or service layers without demonstrated need.

## UI Conventions

- Tailwind utilities handle layout, spacing, responsiveness, and page-level styling.
- `components/ui` contains selectively reused source primitives: Button, Input, Textarea, Card, Badge, AlertDialog, Skeleton, Tooltip, Sonner, and the existing table utilities.
- `app/layout.tsx` mounts the Sonner toaster once for application feedback.
- Business forms stay in `components/forms` and keep current server-action submission flows.
- Existing server-action forms use native selects unless a future focused task changes one safely.
- Delete/destructive actions should use `AlertDialog`; success/failure feedback can use Sonner toasts.
- Admin create/edit pages can use small page-specific notice query codes for one-time success toasts after server-action redirects.
- Booking form feedback uses allowlisted booking notice codes and keeps the existing local date/night/rate/amount helper behavior intact.
- Expense form feedback uses allowlisted expense notice codes and preserves CMS/property select behavior.
- User-management feedback uses user-only notice codes and keeps protected-admin role/status/delete controls locked in the UI while server actions remain the enforcement boundary.
- Owner dashboard hierarchy should remain calmer than admin pages, with current-month performance first, latest statement next, recent activity after that, and slower-changing property reference details lower on the page.
- Tables continue using TanStack Table, with controlled horizontal scrolling as the default mobile behavior.
- Dashboard navigation active states use `usePathname` in `components/layout/navigation-links.tsx` with exact root matching and segment-bound child matching.
- Admin navigation stays efficient and operational; owner navigation can be slightly calmer and more polished because owners are the primary product-facing users.
- Avoid generic UI abstractions that make future human editing harder.

See [UI Conventions](./UI_CONVENTIONS.md) for the short practical checklist.

## Known Limitations

- No checked-in RLS policy definitions; deployment must supply/test them.
- Payout processing is page-load driven, with no scheduler.
- The owner/month payout unique index is still a manual production action; run the documented duplicate query first and do not auto-delete historical duplicates.
- Apps Script template and output-folder configuration live outside this repository.
- Proposal generation can exceed 30 seconds; helper has no shorter abort timeout.
- Forecast/contact lead storage depends on service role or appropriate insert policies.
- General contact and forecast emails use `RESEND_FROM_EMAIL` when configured, with the contact route retaining the Resend development sender only as a fallback.
- Supabase Auth Send Email Hook delivery depends on the deployed signed endpoint and `SUPABASE_SEND_EMAIL_HOOK_SECRET`; do not enable the hook before both are configured.
- No owner statement PDFs, receipt uploads, channel sync, payments, or advanced dispute workflow.
- Reference prototypes are excluded from production linting.
- Renamed stale `.next` directories inside the repository can confuse Tailwind source discovery unless ignored.

## Verification

```bash
npm run lint
npm run build
npm test
```

Core smoke checks:

- Public forecast validates, stores lead, renders result before proposal completion, and handles PDF success/failure safely.
- Pending/inactive/role redirects work.
- Owner reads remain scoped and CMS expenses remain hidden.
- Admin CRUD and settings-backed forms work.
- Current-month live performance matches on `/owner` and `/owner/payout` without creating a payout row.
- Previous-month payout review/query/resolve/paid lifecycle works.

## Latest Stable Implementation State

As of 2026-06-22, the current application includes the full Phase 1 public/auth/admin/owner scope described above. The owner payout page uses an unchanged shared current-month live panel followed by one complete latest-first payout history table with eligible review actions. The public forecast remains server-authoritative and asynchronous with respect to pitch-deck generation.

The most recent documentation audit verified source, schema, routes, validators, environment usage, and active workflows. Run lint/build again after any subsequent code change rather than relying on this date.
