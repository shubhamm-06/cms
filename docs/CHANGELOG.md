# Changelog

## Booking Hero Mobile and Tablet Layout

- Made the `/booking` hero photo-first below `lg`: the card fills the first screen under the header (`min-h-[calc(100svh-105px)]`, 16px gap below), and the headline (44px, split as `Stay in Goa.` / `Properly.`), copy, two full-width CTAs and centred trust line sit at its bottom with 12/24/10/16px spacing and 24px bottom padding. The phone embed is no longer in the hero below `lg`.
- Below `lg` the desktop scrim is replaced by a transparent-to-70%-black bottom gradient behind the text, so the top of the photo is neither dimmed nor blurred; the photo uses `object-[45%_center]` there so the windows fill the upper half.
- Added `BookingWhatsAppDemo`, a `lg:hidden` cream card (`bg-public-cream`) between the hero and the listing with `Book in one WhatsApp chat`, `Send your dates, get a direct price, pay by UPI. Done.` and the embed at `min(78vw,300px)` (320px from `md`).
- Mounted only one embed per device. Chrome does not lazy-load `display:none` iframes, so CSS hiding alone loaded both embeds everywhere (measured); each iframe now renders after hydration at its own breakpoint inside a CSS-sized box, so there is no layout shift.
- The floating WhatsApp button below `md` now stays hidden while either the hero or the demo card is in view, and fades back once both are out of view.
- `Check out properties` still lands on `#stays`, below the demo card.
- Verified at 360x740, 375x812, 390x844, 412x915 and 768x1024 (hero ends 16px above the fold, no overflow, full phone in the demo card) and at 1024x768, 1280x800, 1366x768 and 1920x900, where hero, phone and text geometry are identical to before and the demo card is not displayed.

## Booking Hero First-Screen Fit

- Sized the `/booking` hero card to the viewport from `lg`: `h-[calc(100svh-121px)]` (73px sticky header, 28px top margin, 20px bottom gap), clamped to `min-h-[560px]` and `max-h-[900px]`. The whole card, both bottom corners included, now fits below the header without scrolling at 1366x768, 1440x900, 1536x864, 1920x900 and 1920x1080 (at 1920x1080 the 900px cap leaves a 79px gap below). Below `lg` it stays auto height and stacked as before.
- Sized the phone embed by height from `lg`, `clamp(480px,calc(100svh-201px),820px)`, so it is the card less 40px above and below and its width comes from `aspect-[500/1024]`. The fixed 300px/340px widths are gone. It is now 277-400px wide on laptops and desktops, vertically centred with equal space, and flush with the right edge of the same content container as the heading (column gap 56px minimum). Phones and tablets keep the 260px width.
- Changed the embed aspect ratio from `560/1080` to `500/1024` for the updated embed. `public/cms-whatsapp-demo/` was not edited.
- Hid the floating WhatsApp button below `md` while the `/booking` hero is in view (an `IntersectionObserver` on the section's `data-hides-floating-whatsapp` marker), since the hero has its own `Chat on WhatsApp` button. It fades back in over 200ms once the hero scrolls out of view. From `md` it behaves as before.
- Replaced the `/booking` meta description with `Hand-picked villas and apartments in Goa, personally managed by our team. Book directly on WhatsApp for a better rate than Airbnb.` (130 characters).
- Left the hero photograph, its source, quality, sizes, `object-cover` and `center 58%` focal point, and the overlay unchanged; the room stays in view at the shortest supported height.

## Booking Hero WhatsApp Embed

- Removed the `Find your stay` search card from the `/booking` hero. It was used only there, so its `PanelField` select, the `Search Stays` button and the region, guests and date filter state that only it could set were deleted from `PropertyCatalogue`. The bedrooms and pool pills above the grid are unchanged. Filters were never read from URL search params, so there was no query-param logic to keep.
- `app/booking/page.tsx` now renders `BookingHero` directly above `PropertyCatalogue`; the hero no longer takes children and `PropertyCatalogue` no longer takes hero image props.
- Kept the hero card itself as it was: photo, `110deg` scrim, `rounded-[26px]`, outer margins, heading, supporting copy and their typography.
- Added two CTAs under the copy: coral `Check out properties` with a right arrow, which smooth-scrolls to `#stays` (instant under reduced motion), and white `Chat on WhatsApp` with a WhatsApp-green icon, built from the header's `getPublicWhatsAppUrl(buildGuestHeaderWhatsAppMessage())` and tracked as `whatsapp_click` with the new `cta_location: booking_hero`. Both are 52px, side by side from `sm` (wrapping when the column is narrow, as at 1024px) and full width on phones.
- Added one trust line, `Better rate than Airbnb`, with a green circle and white check.
- Embedded `public/cms-whatsapp-demo/index.html` where the search card was, as a decorative lazy iframe (`aspect-[560/1080]`, 260/300/340px wide below `lg`/at `lg`/at `xl`). The embed folder itself was not modified.
- Gave the listing section `scroll-mt-20 lg:scroll-mt-24` so the sticky header does not cover it after the scroll. The mobile hero no longer has a fixed 680px minimum; it grows to fit the stacked phone.
- Verified at 375, 768, 1024, 1280 and 1920px: the phone stays inside the hero with at least 40px clearance, text and phone never overlap, there is no horizontal overflow, the scroll lands below the header and the WhatsApp link carries the guest message. At 375px the fixed floating WhatsApp button crosses the phone's right edge while the phone scrolls past it; from 768px it does not.

## Public Navbar Phone Number

- Added a direct-call link to the shared `PublicHeader`, placed in the right-hand group as `phone, Owner Portal, Book a Call`. It is a standalone navigation item and is deliberately not in the `More` dropdown; both existing actions are unchanged.
- Sourced the number from the existing `getPublicContactNumber()` in `src/lib/public-whatsapp.ts` through two new one-line helpers, `getPublicPhoneUrl()` and `getPublicPhoneDisplay()`, so the navbar, the WhatsApp links and the property-page `Call us` action all resolve to the one configured `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER`. No environment variable, settings row or database field was added.
- Displayed it as `+91 62826 27601` over `tel:+916282627601`. The grouping is a three-line regex rather than a phone-number library; `libphonenumber-js` stays where it is, parsing user input in forms.
- Styled it as a quiet utility link: Lucide `Phone` at 18px, `text-sm` medium dark text matching `Owner Portal`, no background, border or pill at rest, a subtle `#f7f7f7` hover with the label and icon shifting to `#d63e43`, and the standard coral focus-visible ring. The coral `Book a Call` remains the only primary CTA.
- Pointed the property-page `Call us` link at `getPublicPhoneUrl()` instead of building `tel:` inline, so the two call links cannot drift apart.
- Kept the number reachable at every width with exactly one visible copy: the desktop row from `xl`, beside the hamburger from `md` to `xl` where the existing architecture collapses the desktop row, and a row in the open mobile menu below `md`. The existing hamburger architecture was not redesigned.
- Tightened only what was needed to fit it: the right-hand group gap from `2` to `1` below `2xl`, `Owner Portal` horizontal padding stepped `2.5/3/4` across `xl` and `2xl`, and `whitespace-nowrap` plus `shrink-0` on the group so nothing wraps to a second line.
- Verified at 320/360/390/430/768/900/1024/1200/1280/1440/1920: the number never wraps, the header bar never overflows, tap targets stay 44px, and `Owner Portal` and `Book a Call` stay visible wherever they were before. The homepage's own horizontal overflow at 768px is pre-existing and unrelated; it reproduces with this change reverted.

## Property Page Enquiry Card

- Rebuilt the `/property/[slug]` stay card on the `BookingWidget` of the `Curate My Stay — Property Detail Page` screen in `reference/booking.html`, measured against it rather than approximated: 20px radius, 24px padding, `#dddddd` border, `0 6px 16px rgba(0,0,0,0.12)` shadow, 26px/800 price, one 12px-radius bordered control with 56px-high fields at `10px 14px` padding, and 52px full-width CTAs at 17px/600 with a 12px radius, 10px apart, 14px below the control.
- Adapted the reference's reserve-and-pay actions to the real enquiry-only workflow. The card holds check-in, check-out and guest count in local state, calls no API, invokes no server action, and never touches `booking_requests` or `/api/booking-requests`. Verified in a browser that the only network calls during the whole interaction are the pre-existing GTM/GA beacons for the existing `whatsapp_click` event.
- Dropped `From` from the price, so the card now reads `<price> per night` from the same `starting_price` behind `show_price` that it already used. No pricing field, calculation or schema changed.
- Removed the Minimum stay row from this card. `minimum_nights` is untouched in the database and still appears in the page's own `Stay details` block.
- Removed the reference's strikethrough Airbnb price, `direct price` badge, rating, price breakdown, totals, taxes, `Reserve` / `Check availability` actions, `Secure payment`, `Free cancellation` and `You won't be charged yet`, because none of them is backed by real data or a real flow here.
- Added `Ask about this stay` as the primary WhatsApp CTA and a secondary `Call us` `tel:` link below it, followed by `Nothing is booked or charged here. Our team will confirm availability with you.` The configured check-in/check-out times stay in a hairline-separated block at the foot of the card.
- Built the WhatsApp message from the public name, both dates, the guest count and the absolute `siteOrigin` property URL. Dates are humanised to `18 August 2026` for the message; the fields themselves show the reference's short `18 Aug` form because the long form truncates in a half-width field at 320px.
- Made the whole date cell open the calendar. The transparent native input already covered the cell and was the top hit-target everywhere, so this was never a z-index, `pointer-events`, sizing or label-association problem: Chromium opens a date input's calendar only from the small picker indicator in its shadow DOM, and clicking anywhere else just focuses a segment to type into. With the input at `opacity: 0` that left an invisible ~16px hot spot at the right edge of a 165x56 cell. The indicator is now hidden and a click anywhere on the cell calls `showPicker()`, guarded for browsers without it, which keep their own tap-to-open behaviour. No date-picker package was added and the cell is unchanged visually.
- Blocked past check-in dates, constrained check-out to the day after check-in, cleared a check-out that a later check-in invalidates, and capped the guest range with `max_guests` when it is configured. Clicking the CTA before both dates are chosen is cancelled client-side and shows an inline `role="alert"` message wired to the CTA through `aria-describedby`.
- Added `getPublicContactNumber()` to `src/lib/public-whatsapp.ts` and rebuilt `getPublicWhatsAppUrl()` on it, so the WhatsApp link and the `tel:` link read the one configured `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER` and no second number can drift in. Existing callers are unaffected.
- Gave both CTAs their colour on an inner span: `app/globals.css` declares an unlayered `a { color: inherit }` that outranks Tailwind's layered `text-*` utilities, so the previous card's `text-white` never applied and its WhatsApp label was rendering in the dark body colour.
- Verified at 320/360/390/430/768/1024/1440 that `scrollWidth` equals `clientWidth`, labels do not clip, dates do not truncate, and both CTAs stay 52px. Desktop keeps the existing sticky sidebar; below `lg` the card keeps its existing static position above the long-form copy.
- Changed nothing else on the page: gallery, title, quick stats, highlights, description, amenities, stay details, house rules, location block, header, footer and the booking-request infrastructure elsewhere in the project are all untouched. No Supabase schema, RLS, policy or migration work was involved.

## Public Booking Page Visual Refinement

- Refined `/booking` against the `Curate My Stay` booking screen in `reference/booking.html`. No data source, query, view, schema, RLS, storage policy, admin workflow, slug rule, visibility rule or API behaviour changed, and no Supabase migration was created.
- Fixed the pixelated hero at its cause. Every `public/homepage/IMG_*.jpg` file is a 600x450 web thumbnail, including the `IMG_0600.jpg` the reference hero names, so the optimizer answered a 1920px request with a 600px image that the browser then upscaled roughly 3x. The fallback is now `/homepage/varca-2.jpg`, a 5712x4284 original of the same subject, which serves 1920x1440 and 3840x2880 for the same request. No blur, sharpening or upscaling was used, and a high-resolution original of `IMG_0600.jpg` is still absent from the repository.
- Extracted `components/home/booking-hero.tsx`. The copy sits at `top-[30%]`/`lg:top-[32%]` of the hero's own height rather than above bottom padding, which puts the heading at about 32% of the hero instead of about 58% and keeps it there as the hero height changes. Hero heights became 480/560/680/720px by breakpoint, so the photograph stayed immersive while the copy moved up.
- Replaced the heavier two-layer scrim with the reference's single `120deg` gradient, and moved hero type to the reference scale: 64px/800/1.04 heading and a 22px/1.5 description capped at 700px.
- Kept every existing filter field, option source and client-side filter behaviour. Only the panel's presentation changed: `#dddddd` hairline, lighter shadow, roomier field padding, and an overlap of about half the panel height onto the hero's bottom edge.
- Renamed the panel's primary action to `Search` and gave its label and icon an explicit white. `app/globals.css` declares an unlayered `a { color: inherit }`, which outranks Tailwind's layered `text-*` utilities, so the CTA had been rendering its label and search icon in the dark body colour; the colour now lives on a child span the rule does not target. The `#stays` jump behaviour is unchanged.
- Made the whole catalogue card navigate to `/property/[slug]` through one `absolute inset-0` overlay `Link` carrying the accessible name. Each card is one tab stop, there are no nested anchors, the focus ring is drawn on the card through `has-[a:focus-visible]`, and cards without a cover photo behave identically. `View stay` became presentational text driven by the card's hover state, which also restored its coral colour for the same cascade reason.
- Added `components/home/booking-why-direct.tsx` between the catalogue and the guest reviews: the reference's `WHY BOOK DIRECT` eyebrow, heading, intro, four centred benefits on pale-coral Lucide icon tiles, and the `Compare side-by-side` disclosure with the reference's six Airbnb-versus-direct rows. Four columns at `lg`, two at `sm`, one below. The copy and comparison rows are reference marketing claims kept in one typed module, not admin-editable; making them admin-configurable is a separate decision.
- Allowlisted image quality `85` in `next.config.ts` because Next.js 16 permits `75` alone by default, and moved the hero from the deprecated `priority` prop to `preload`. Other images keep the default quality and their existing props.
- Trimmed the catalogue grid's trailing padding so it no longer stacks with the new section's own spacing, and matched `app/booking/loading.tsx` to the new hero height, panel geometry and card footer.
- Verified at 320/360/390/430/768/1024/1440/1920: `scrollWidth` equals `clientWidth` at every width, so there is no horizontal overflow. The header, `Book a Call` and the shared floating WhatsApp button are unchanged.

## Public Property Detail Page

- Added `/property/[slug]`, the public property detail page: one server route loads a property by slug, renders it from Admin -> Properties content only, and reuses the existing public header, footer and floating WhatsApp button.
- Recorded that `public.public_property_details` and `public.public_property_gallery` were created manually in live Supabase and verified for the `anon` role before the application was pointed at them; no Supabase operation was performed from the repository.
- Added `loadPublicPropertyDetail()` in `src/features/catalogue/public-property-detail-data.ts`: it reads both public-safe views with the ordinary anon server client and explicit column lists, orders gallery rows by `is_cover` descending, `sort_order` ascending, then `created_at` ascending, and is wrapped in React `cache` so `generateMetadata` and the render share one pair of queries.
- Kept missing, unpublished and operationally inactive slugs indistinguishable: all three are simply absent from the views, so all three call `notFound()`. Real query failures return a separate public error state that logs only the Supabase error code and message.
- Built the layout from the `Curate My Stay — Property Detail Page` screen in `reference/booking.html`: hero-plus-2x2 gallery at the reference proportions, quick-stat tiles, hairline-separated detail blocks, and a sticky 384px stay card that stacks on mobile and tablet.
- Kept the stay card display-only: starting price behind `show_price`, price note, minimum stay, check-in/check-out and the admin enquiry note, plus a WhatsApp CTA reading `Ask about this stay`. Added no date inputs, guest selector, totals, taxes, availability check or enquiry submission, and replaced the CTA with a paused message when `accept_booking_requests` is false.
- Synchronized `types/database.types.ts` with both view Row types and added both view bodies to checked-in `supabase/schema.sql`; view ownership and grants stay documented rather than represented, matching that file's existing scope.
- Extended `components/home/floating-whatsapp.tsx` with a `/property/` path prefix so the single shared button appears on property pages without a second mount.
- Left `/booking`, catalogue cards, catalogue filters, the catalogue view query, the admin property form, property image management, confirmed bookings, expenses, P&L, payouts and the homepage untouched.
- `notFound()` on this route serves a documented soft 404: `loading.tsx` streams a fallback, so the response has already committed to 200 and Next.js injects `<meta name="robots" content="noindex">` instead of changing the status.
- Did not add `booking_requests`, `/api/booking-requests`, `/dashboard/booking-requests`, enquiry submission, enquiry-to-booking conversion, availability checking, a lightbox, a carousel or a map dependency. The separate booking-request system remains the next phase.

## Public Catalogue Live Data Source

- Replaced the temporary typed catalogue stub with one server-side read of the manually created `public.public_property_catalogue` view, so `/booking` now lists real published, operationally active properties.
- Recorded that the view was created manually in live Supabase and that anonymous SELECT access was verified before the application was pointed at it; no Supabase operation was performed from the repository.
- Queried the view with the ordinary anon server client and an explicit column list rather than `*`, ordered by `is_featured` descending, `display_order` ascending, then `public_name` ascending, and removed the now-redundant in-memory sort.
- Kept a failed query on the safe catalogue error state with only the Supabase error code and message logged server-side, distinct from a successful query returning zero rows.
- Synchronized `types/database.types.ts` with a `public_property_catalogue` view Row type, derived `CatalogueProperty` from it, and added the view body to checked-in `supabase/schema.sql`; view ownership and grants stay documented rather than represented, matching that file's existing scope.
- Left the approved hero, floating filter bar, property cards, client-side filters, empty state, loading state, header, footer and image URL helper unchanged, and did not query `properties` or `property_images` directly or use the service-role client.
- `/booking` is now a dynamic route because the read uses the cookie-aware server client. Property detail pages and booking enquiries remain pending; catalogue cards still imply no real-time availability.

## Public Property Catalogue Page

- Added `/booking`, the public property catalogue: a server component loads a public-safe catalogue array and one client component filters it in the browser by region, area, property type, guests, bedrooms and pool, with a live result count, clear-all-filters control and route-level loading skeleton.
- Kept filtering client-side because inventory is intentionally small; added no filter API, URL-state library, search service, map, carousel or new dependency.
- Ordered results featured first, then `display_order`, then `public_name`, and rendered cards from admin-editable public property content only, preferring the `property_images` cover with a branded placeholder fallback and `View stay` links to the future `/property/[slug]`.
- Kept starting price display-only behind `show_price`, avoided all availability-confirming wording, and left confirmed bookings, expenses, P&L, payouts, owner dashboards and the homepage untouched.
- Left `loadPublicCatalogue()` returning an empty catalogue because no public-safe read source exists yet: no service-role public read, no direct `properties` query with browser-side column hiding, and no mock property data. The required manual Supabase view and swap-in instructions are documented rather than applied.
- Scoped `next.config.ts` `images.remotePatterns` to the configured Supabase host under `/storage/v1/object/public/property-images/**` only, with no wildcard host or path.
- Did not add `/property/[slug]`, `booking_requests`, `/api/booking-requests`, `/dashboard/booking-requests`, or any public navigation or sitemap entry while the read source is pending.

## Property Image Upload Refinement

- Moved the single connected property save control below image management without nesting forms or changing the property save action.
- Added browser-native image processing: preserve aspect ratio, resize only above 2400px on the longest side, encode WebP at approximately 0.85 quality, and use it only when smaller than the valid original.

## Admin Property Image Management

- Added edit-mode gallery management to Admin -> Properties: direct authenticated uploads to `property-images`, generated Storage-path metadata rows, automatic first cover, cover changes, alt-text saves, move-up/move-down ordering, and confirmed deletion with Storage cleanup warnings.
- Kept image management unavailable until a property has been created, preserved legacy `properties.image_url`, and did not add public catalogue routes or booking enquiries.

## Admin Public Property Catalogue Fields

- Extended Admin -> Properties to manage non-image public catalogue fields in a separate Website listing section, without changing operational property status, financial shares, owner assignment, or legacy `image_url` preservation.
- Added conditional publication fields, editable slug assistance, publish-readiness validation, duplicate-slug feedback, line-based public lists, and a Published/Hidden table indicator separate from Active/Inactive.
- Did not add property image upload, public catalogue routes, or booking enquiries.

## Public Property Catalogue Schema and Type Sync

- Synchronized checked-in `supabase/schema.sql` and `types/database.types.ts` with the manually completed live Supabase catalogue changes for new `properties` fields, constraints, indexes, and the `property_images` table.
- Kept Storage bucket configuration, helper functions, and deployed RLS/storage policies documented rather than represented in SQL because `schema.sql` does not currently track those definitions.
- Made no Admin UI, validators, server actions, public routes, booking-enquiry table, or behaviour changes.

## Public Property Catalogue Documentation Plan

- Added `docs/PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md` as the primary handoff for the planned public property catalogue, property detail pages, separate booking enquiries, admin review route, and manual conversion workflow.
- Documented the manually completed live Supabase changes for catalogue fields on `properties`, the `property_images` table, `property-images` Storage bucket, active-admin helper/policies, and the temporary gap before checked-in schema/types are synchronized.
- Clarified that public booking requests must remain separate from confirmed operational bookings and must not affect availability, revenue, occupancy, expenses, P&L, owner payouts, or owner booking views until an admin manually creates a confirmed booking through the existing workflow.

## Property Management Goa Card Images

- Added the mapped existing property photographs to the four `/property-management-goa` “Properties we manage” cards using page-local responsive `next/image` elements, without changing other routes or shared card styling.

## Property Management Goa Service Page

- Added the public `/property-management-goa` service and Google Ads landing page with locked owner-facing copy, responsive sections, accessible native FAQ disclosure controls, FAQPage JSON-LD, and BreadcrumbList JSON-LD.
- Added its self-referencing public metadata and sitemap entry, and added `Property Management` to the shared desktop header, mobile menu, and footer navigation.
- Reused the public Calendly popup, owner forecast route, WhatsApp destination/tracking helper, shared header/footer, and existing visual design system without changing forecast, payment, authentication, or dashboard behavior.
- No `/privacy` or `/terms` public routes currently exist; the existing footer’s Privacy and Terms text remains non-linked and is an advertising-launch blocker.

## Supabase Auth Send Email Hook

- Added `/api/auth/send-email-hook`, a signed Standard Webhooks endpoint that reads the raw Supabase Auth Send Email Hook body, verifies `webhook-id`, `webhook-timestamp`, and `webhook-signature`, validates the payload, and sends branded signup, recovery, invite, magic link, email-change, and reauthentication emails through the existing Resend setup.
- Added same-origin redirect validation for auth verification links, server-only `SUPABASE_SEND_EMAIL_HOOK_SECRET` configuration, and deployment notes that the endpoint must be deployed before enabling the Supabase hook.

## Admin Booking Delete Flow Fix

- Fixed `/dashboard/bookings` deletion so the AlertDialog confirm control is a normal submit button inside the connected server-action form instead of a Radix dialog action that unmounted the form before submission.
- Added booking-delete pending feedback, disabled cancel/delete controls while submitting, and made `deleteBookingAction` validate the booking id, verify the row exists, confirm deletion after Supabase returns, and show booking-specific failure notices when deletion cannot be confirmed.
- Preserved booking edit flow, property filtering, pagination, automatic booking calculations/status logic, import flow, permissions, and unrelated dashboard behavior.

## Public Case Studies Page

- Added `/case-studies`, a server-rendered public proof page for the Panjim apartment and Varca villa with current portfolio figures, property metrics, accessible revenue-progression charts, owner testimonials, guest reviews, local images, and direct Airbnb links.
- Added Case Studies to the shared desktop/mobile public navigation, homepage teaser links, shared footer, sitemap, route matrix, public WhatsApp visibility, route metadata, and CollectionPage JSON-LD.
- Added a focused public footer component so the new server-rendered page reuses the existing footer rather than duplicating it; existing homepage, About, FAQ, and proposal footer output remains the same aside from the Case Studies destination.

## Public Metadata Title and Canonical Cleanup

- Updated the homepage, About, proposal, FAQ, and login metadata to use route-specific titles, descriptions, canonical URLs, and matching Open Graph/Twitter values through the shared SEO helper.
- Standardized the canonical metadata host to `https://www.curatemystay.net`, removed sitewide keyword metadata, and kept `/login` noindex/nofollow with its own route-correct canonical and Open Graph URL.
- Corrected the About page so it no longer inherits the homepage Twitter title.

## Shared Public Header Extraction

- Extracted the shared public marketing `PublicHeader` into `components/home/public-header.tsx` for the homepage, About, FAQ, and proposal pages.
- Removed the duplicate desktop and mobile `How It Works` navigation item; `Get Pitch Deck` keeps the existing proposal forecast destination and behavior.

## Public Forecast Phone and Result CTA Correction

- Kept the forecast phone country selector library-backed while preserving typed national digits across country changes, submitting the existing `phone` field as validated E.164, and replacing the Step 2 generic required-fields message with field-specific errors after a failed Continue attempt.
- Reordered forecast-result actions in source order so `Book a Call` is the coral primary CTA, followed by green WhatsApp, the pitch-deck action, and quiet `Start over`, while preserving Calendly/WhatsApp destinations and non-PII analytics.

## Public Forecast Contact and Result CTA Refinement

- Replaced the fixed `+91` forecast phone prefix with an accessible international country selector using `react-phone-number-input`; India remains the default and submitted values are normalized and validated as E.164 numbers.
- Added the maintained Font Awesome WhatsApp brand icon and a `Book a Call` action to the forecast result while preserving the existing WhatsApp destination, pitch-deck states, reset behavior, Calendly popup, and non-PII analytics events.

## Shared Public Navbar

- Centralized the public marketing navbar used by `/`, `/about`, `/faq`, and `/property-management-proposal`.
- Updated the shared navbar to show Home, About, How It Works, FAQs, and Get Pitch Deck in the center, with quieter `Owner Portal` access to `/login` and a primary `Book a Call` Calendly popup action on the right.
- Added exact active-route treatment with `aria-current="page"` for standard page links, kept Get Pitch Deck from becoming a second active item, and anchored the proposal forecast section at `/property-management-proposal#forecast`.
- Preserved the shared Calendly popup URL, `calendar_click` analytics event, non-PII tracking helper, public-page CTA behavior, dashboard/owner navigation, auth, and forecast logic.

## Shared Public Navbar Icon Refinement

- Added a consistent, restrained Lucide icon to every shared public navbar link and action across desktop and mobile while preserving the existing order, active-route treatment, Calendly popup, analytics, and responsive behavior.

## Public About Page Refinement

- Updated `/about` to match the final requested structure with a separate family-run "Who We Are" section before the Aravind founder section.
- Reused the existing homepage family image for the company section and the existing Aravind image for the founder section.
- Updated the About metadata copy to the final requested title, description, canonical URL, Open Graph title, Open Graph description, and standard Open Graph image.

## Public FAQ Page

- Added the compact public `/faq` page with the required introduction, twelve-question owner-focused FAQ accordion, and final WhatsApp/Calendly CTA.
- Reused the existing public header, footer, typography, colours, accordion styling, WhatsApp destination, shared Calendly popup, and non-PII analytics with `cta_location: faq_page`.
- Added the FAQ metadata and canonical URL `https://curatemystay.net/faq`, reused the standard Open Graph image, mirrored the visible FAQ content in `FAQPage` JSON-LD, and added the route only to the sitemap.
- Kept the page free of a large hero, testimonials, pricing cards, statistics, service grids, forecast form, pitch-deck preview, unsupported claims, and navigation changes.

## Public About Page

- Added the short public `/about` page with the required compact introduction, service overview, three-part operating approach, owner-transparency summary, supported Aravind founder section, and closing contact CTA.
- Reused the existing public header, footer, homepage imagery, WhatsApp destination, shared Calendly popup, button styling, typography, and non-PII analytics with `cta_location: about_page`; no new navigation link or Calendly loader was added.
- Added the exact About metadata and canonical URL `https://curatemystay.net/about`, reused the standard Open Graph image, and added the route only to the sitemap.
- Kept the page free of property counts, ratings, testimonials, case studies, pricing, forecast forms, unsupported services, and invented company claims.

## Public Goa Property Management Proposal Page

- Added the public `/property-management-proposal` SEO landing page with the required hero, four-step process, embedded forecast, six proposal inclusions, four CurateMyStay reasons, seven-question FAQ, and closing CTA sections.
- Reused the existing homepage public header, footer, complete forecast and pitch-deck flow, WhatsApp behavior, shared Calendly popup, and analytics; the homepage keeps its existing default presentation and event labels.
- Added the exact route metadata and canonical URL `https://curatemystay.net/property-management-proposal`, reused the standard Open Graph image, added matching visible `FAQPage` JSON-LD, and included the route in the sitemap without adding navigation links.
- Kept forecast calculations, API routes, Apps Script generation, email behavior, authentication, dashboards, Supabase, payouts, and existing homepage content unchanged.

## Final Calendly Popup Configuration and Documentation Audit

- Finalized the current Calendly booking documentation around the shared on-page popup URL `https://calendly.com/curatemystay/30min?hide_gdpr_banner=1`, which uses Calendly's default appearance and hides its GDPR banner where supported.
- Confirmed the custom CurateMyStay CTA design remains unchanged, the script and stylesheet load once, no floating badge or legacy booking modal is active, and `calendar_click` continues with non-PII `cta_location` plus `destination_type: calendly`.
- Consolidated current CSV import safeguards for properties, bookings, and expenses: preview-first validation, native disabled confirmation, client/server defensive guards, visible invalid rows, replacement-file feedback reset, pending duplicate-submission prevention, and intentionally non-blocking duplicate rows.
- Earlier coral and teal Calendly theme entries below remain as historical implementation steps and are superseded by this final configuration.

## Neutral Calendly Popup Theme

- Updated the canonical Calendly popup URL to use a clean white background (`#FFFFFF`), dark navy text (`#243B53`), and restrained deep-teal interactive accent (`#245C64`).
- Removed the previous coral popup theme while preserving the existing CurateMyStay booking-button design, all CTA locations, the single popup loader, and `calendar_click` analytics behavior.
- Added no badge, iframe styling, DOM manipulation, repeated scripts, or custom overlay behavior.

## Branded Calendly Popup Theme

- Updated the single canonical Calendly popup URL with CurateMyStay's warm off-white background (`#FFFBF7`), dark navy text (`#243B53`), and restrained coral primary accent (`#E45B5F`).
- Preserved every public booking CTA's existing design and placement, the one-script popup loader, repeat open/close behavior, mobile handling, and the existing `calendar_click` analytics event.
- Added no badge widget, iframe CSS, DOM manipulation, or cross-origin styling workaround.

## CSV Import Blocking Validation UX

- Updated property, booking, and expense CSV import dialogs so any file-level validation error or invalid preview row disables `Confirm Import` for the entire upload using the native disabled state and a clearly muted, non-interactive button treatment.
- Added accessible footer summaries with singular/plural invalid-row counts, highlighted invalid preview rows, and defensive form-submit guards that prevent programmatic confirmation while errors exist or an import is pending.
- Added matching server-action guards so re-validation never inserts partial ready rows when the same CSV also contains invalid rows; explicitly classified duplicate rows remain non-blocking and continue to be skipped by the existing import rules.
- Selecting a replacement CSV now hides previous server results and notices before calculating the new preview state, while existing parsing, BOM/quoted-value handling, demo downloads, success behavior, and modal close resets remain unchanged.

## Calendly Popup Booking CTA

- Replaced the public homepage Google Appointment Schedule destination with the Calendly `30min` popup while preserving every existing CurateMyStay booking CTA's copy, styling, iconography, placement, and responsive behavior.
- Added one homepage-only, typed Calendly loader using the App Router-compatible `next/script` pattern and the official external stylesheet; early clicks wait safely for script readiness and duplicate popup overlays are prevented.
- Kept the existing `calendar_click` dataLayer event and non-PII `cta_location` values, changing only `destination_type` from `google_appointment_schedule` to `calendly`.
- Removed the obsolete unreachable Google booking modal and left WhatsApp, forecast, auth, dashboard, Supabase, APIs, and business logic unchanged.

## Basic Public SEO Metadata and Preview Assets

- Added App Router metadata defaults for CurateMyStay with canonical title, description, keywords, `metadataBase`, Open Graph, and Twitter preview metadata driven by `NEXT_PUBLIC_SITE_URL` with `https://curatemystay.com` fallback.
- Added file-based public SEO routes for `robots`, `sitemap`, `manifest`, generated Open Graph/Twitter preview images, and app icons reusing the existing CurateMyStay logo.
- Marked private/auth route surfaces as noindex through route metadata on admin layout, owner layout, login, signup, pending approval, and account-disabled pages.
- Added a small truthful homepage JSON-LD `ProfessionalService` block for CurateMyStay without inventing address, phone, or review data.
- Preserved auth behavior, dashboard/owner logic, Supabase flows, GTM loading, APIs, payout behavior, and unrelated UI modules.

## Admin CSV Import QA Hardening

- Tightened the completed property, booking, and expense CSV imports with a final consistency pass across demo templates, parser behavior, row-level validation messages, and Excel-friendly downloads.
- Demo downloads now include a UTF-8 BOM and quoted comma-containing sample values so Excel/Google Sheets open the files cleanly while exercising quoted CSV parsing.
- Rows with more cells than the header row are now marked invalid with guidance to quote values containing commas instead of silently ignoring extra cells.
- Documented the shared import limits, exact headers, required/optional fields, duplicate rules, preview-confirm workflow, dialog reset behavior, and no-overwrite behavior consistently for properties, bookings, and expenses.
- Preserved normal property/booking/expense CRUD behavior, server-side active-admin checks, authenticated Supabase client usage, payout/P&L calculations, owner visibility rules, settings behavior, auth behavior, and schema.

## Admin Expense CSV Import Phase 3

- Added an admin-only CSV import workflow to `/dashboard/expenses` with `Download Demo CSV` and `Import CSV` actions next to the expense form controls.
- Supported headers are `expense_date`, `expense_for`, `property_name`, `category`, `amount`, `vendor`, and `note`; the demo file includes one property expense and one CMS expense with no database IDs.
- Added client preview and server re-validation for CSV extension, 5 MB size limit, 1,000 non-empty row limit, required headers, trimmed fields, quoted CSV values, `YYYY-MM-DD` dates, property-name resolution, CMS/property rules, settings-backed expense categories, positive amounts, and duplicate fingerprints.
- Property expense rows require a matching `property_name`; CMS expense rows must leave `property_name` blank so the server stores `property_id` as null.
- The duplicate fingerprint is expense date + expense type + resolved property or CMS context + normalized category + amount + normalized note.
- Imported expenses insert only ready rows, skip existing/repeated duplicates and invalid rows, revalidate `/dashboard/expenses`, `/dashboard/pnl`, and `/dashboard`, reset dialog upload/preview/result state whenever the popup closes, and do not create or alter payout rows.
- Preserved existing expense create/edit/delete behavior, CMS expense owner exclusion, payout logic, settings storage, properties/bookings imports, schema, permissions, and unrelated modules.

## Admin Booking CSV Import Phase 2

- Added an admin-only CSV import workflow to `/dashboard/bookings` with `Download Demo CSV` and `Import CSV` actions next to the booking form controls.
- Supported headers are `property_name`, `guest_name`, `guest_phone`, `check_in`, `check_out`, `guests`, `nightly_rate`, `total_amount`, `booking_source`, `concierge`, and `notes`; the demo file uses human-readable property names and no database IDs.
- Added client preview and server re-validation for CSV extension, 5 MB size limit, 1,000 non-empty row limit, required headers, trimmed fields, `YYYY-MM-DD` dates, property-name resolution, settings-backed booking source and concierge values, amount/rate rules, and duplicate fingerprints.
- Imported bookings recalculate nights and status from dates, derive missing nightly rate or total amount with the existing booking helpers, reject contradictory rate/total values, insert only ready rows, skip existing/repeated duplicates, and revalidate `/dashboard/bookings`, `/dashboard`, and `/dashboard/pnl`.
- The duplicate fingerprint is property + normalized guest name + normalized guest phone + check-in + check-out.
- Preserved existing booking create/edit/delete behavior, property import behavior, payout logic, owner permissions, schema, settings behavior, and unrelated modules.

## Admin Property CSV Import Refinement

- Added `bedrooms` to the supported property CSV headers, demo CSV, client preview, server re-validation, and final insert payload.
- Final supported headers are `property_name`, `owner_email`, `address`, `city`, `bedrooms`, `owner_share_percentage`, and `status`; address, city, and bedrooms remain optional supported property fields while property name, active owner email, owner share percentage, and status are required.
- Polished the property import dialog with a darker blurred backdrop, warmer elevated surface, clearer requirements groups, improved file-upload selected state, stronger summary cards, wider controlled preview-table scrolling, and sticky footer actions.
- Reset import dialog state on close so selected file, raw CSV, preview rows, validation errors, import result messages, and summary counts do not persist across sessions.

## Admin Property CSV Import Phase 1

- Added an admin-only CSV import workflow to `/dashboard/properties` with `Download Demo CSV` and `Import CSV` actions next to the property form controls.
- Supported headers are `property_name`, `owner_email`, `address`, `city`, `owner_share_percentage`, and `status`; the demo file uses human-readable owner emails and no database IDs.
- Added client preview and server re-validation for CSV extension, 5 MB size limit, 1,000 non-empty row limit, required headers, trimmed fields, active-owner email resolution, owner/CMS share validation through the existing property schema, allowed property status, and normalized property-name duplicates.
- Confirm import inserts only ready rows, skips existing property names, repeated CSV property names, invalid owners, and invalid field rows, then revalidates `/dashboard/properties` and `/dashboard`.
- Preserved existing single-property create/edit/delete behavior, property form field names, delete cascade behavior, permissions, schema, and unrelated modules.

## Admin Property Delete Cascade Fix

- Added a Supabase migration so `owner_queries.property_id` cascades with deleted properties and `owner_queries.payout_id` cascades with deleted owner payout statements.
- Updated the reference schema to match the migration while preserving nullable owner query property and payout links.
- Removed the application-level linked-query deletion block from `deletePropertyAction`; property deletion now relies on database cascades instead of manually deleting query rows or calling the query-delete action.
- Kept active-admin guarding, valid property ID validation, property existence checks, normal authenticated Supabase server client usage, truthful delete error handling, post-delete verification, and success notice only after confirmed deletion.
- Updated the property delete confirmation copy to clearly state that linked bookings, property expenses, payout statements, and owner queries are permanently removed.

## Admin User Deletion Verification Repair

- Repaired `/dashboard/users` deletion ordering and failure handling after the earlier Auth deletion patch remained unreliable in production.
- The action now verifies service-role Auth admin access and the target Auth user before profile deletion, blocks linked operational records before any destructive step, removes the FK-blocking profile row, deletes the Supabase Auth user, and verifies both Auth and profile records are gone before showing `user_deleted`.
- Added allowlisted failure notices for unavailable Auth admin deletion and linked-record blocking, with safe server-side diagnostic logging that does not expose credentials.
- Preserved protected-admin safeguards, existing delete confirmation UI, table behavior, role/status updates, auth flow, schema, RLS assumptions, and unrelated modules.

## Admin User Deletion Auth Fix

- Fixed `/dashboard/users` deletion so success is shown only after an eligible profile is removed and the linked Supabase Auth user is deleted through the server-only Auth admin API.
- Added linked-operational-data checks before deletion; users with assigned properties, owner payout statements, or owner queries are blocked with guidance to reassign records or mark the account inactive.
- Preserved protected-admin blocking, existing AlertDialog confirmation, row/table behavior, role/status update logic, permissions, auth flow, schema, RLS assumptions, and unrelated modules.

## Admin Profile Self-Service UI Pass

- Refined `/dashboard/profile` as a calm admin self-profile page with a stronger header, editable personal contact details, read-only account details, compact role/status/protection badges, and a route-level loading skeleton.
- Added pending save feedback and an allowlisted `admin_profile_updated` success toast that removes the notice from the URL after display.
- Narrowed the shared profile form props to editable profile fields while preserving submitted field names and existing `saveProfileAction` validation.
- Preserved self-profile-only updates, protected-admin safeguards, role/status/email read-only behavior, owner profile page behavior, auth, permissions, schema, routes, navigation, and unrelated dashboard pages.

## Admin Settings Operational UI Pass

- Refined `/dashboard/settings` as a clearer admin dropdown-option management page with a stronger header, separate Booking Sources, Expense Categories, and Concierge Options sections, one-option-per-line guidance, historical-value caution copy, and a route-level loading skeleton.
- Added a pending save state to the existing settings form and route-specific `settings_updated` success toast that removes the notice from the URL after display.
- Updated the settings save action to keep the same three keys and newline-to-JSON-array parsing while redirecting only after successful upserts; failed saves route back with an inline error message.
- Preserved existing settings keys, values, JSON-array storage, booking/expense/concierge downstream form behavior, legacy edit-value behavior, permissions, schema, routes, navigation, and unrelated workflows.

## Admin P&L Premium Financial Overview

- Refined `/dashboard/pnl` as a cleaner operational financial overview with a stronger header, CMS expense callout, existing-value summary cards, polished property P&L table columns, improved empty copy, and a route-level loading skeleton.
- Improved amount alignment, tabular financial values, property row hierarchy, and controlled mobile horizontal scrolling while preserving the existing TanStack search, sorting, and pagination behavior.
- Preserved all existing P&L row formulas, revenue totals, property expense totals, net profit, owner share, CMS share, CMS expense total, Supabase reads, permissions, payout logic, owner pages, admin pages, schema, routes, and navigation.

## Admin Queries Premium Operations Page

- Refined `/dashboard/queries` as a cleaner operational admin query inbox with a stronger header, open/resolved/statement-related summary cards, polished query table cells, and a route-level loading skeleton.
- Added admin query success notices for `admin_query_resolved` and `admin_query_deleted`, with URL cleanup after the toast displays.
- Added pending feedback for resolve/delete actions and replaced direct query deletion with an AlertDialog that identifies the owner, property context, query preview, and payout-statement impact when linked.
- Preserved owner query creation, owner query admin email notifications, admin permissions, query scoping, search/filter behavior, payout-linked query resolution, delete restoration rules, failure restoration handling, payout calculations, review windows, auto-approval, owner query pages, and admin payout pages.

## Admin Payouts Premium Operations Page

- Refined `/dashboard/payouts` as a cleaner admin payout-management screen with an operational header, payable-month context, KPI summary cards, polished payout table columns, clearer property-wise breakup sections, and a route-level loading skeleton.
- Added an AlertDialog confirmation and pending state before the existing admin mark-paid action submits, plus a route-specific `admin_payout_marked_paid` success toast that removes the notice from the URL after display.
- Improved admin payout statuses, query context, money alignment, no-wrap badges, compact actions, and no-payout empty copy while keeping admin search, sorting, pagination, and controlled horizontal scrolling.
- Preserved previous-month payout creation, recalculation, carry-forward, owner/CMS share, fixed 10% TDS, review-window rules, auto-approval, query transitions, mark-paid eligibility, owner payout pages, permissions, schema, routes, and payout formulas.

## Owner Profile Premium Self-Service Page

- Refined `/owner/profile` as a calm owner-facing self-service profile page.
- Added stronger hierarchy, editable personal contact details, read-only account information for email/role/status, pending save state, and route-level loading skeleton.
- Added owner-specific profile notice handling with allowlisted `owner_profile_updated`, which removes the notice from the URL after the success toast displays.
- Updated `saveProfileAction` to redirect owners with the success notice only after a successful profile update while preserving admin profile behavior.
- Preserved owner self-profile field scope: owners can update only their own name, phone, and avatar URL; no role, status, email, password, delete, auth, schema, route, navigation, or admin profile controls changed.

## Owner Query Admin Email Notification

- Added a server-side internal Resend notification after successful owner query creation.
- Normal owner queries and payout/statement-linked owner queries notify `ADMIN_CONTACT_EMAIL` with owner name, email, phone, property, query message, query type, and the admin `/dashboard/queries` link built from `NEXT_PUBLIC_SITE_URL` when available.
- Email delivery failures are logged server-side only and do not roll back, block, or falsely fail successful owner query creation.
- Documented that production `ADMIN_CONTACT_EMAIL` should be `curatemystay@gmail.com` and added an owner-query email verification step to the deployment runbook.
- Preserved owner query scoping, payout-linked query transitions, admin query resolution/deletion, existing owner toast behavior, public forecast emails, permissions, schema, routes, analytics, and navigation.

## Owner Queries Premium Support Page

- Refined `/owner/queries` as a calm owner-facing support page with a stronger heading, reassuring helper copy, separated new-query form and query history sections, and a route-level loading skeleton.
- Added a comfortable message field, inline helper text, pending submit state, and route-specific `owner_query_created` success toast that removes the notice from the URL after display.
- Improved owner query history readability with owner-facing Open/Resolved badges, clearer message/property/date hierarchy, and a simple statement-query label for payout-linked rows.
- Preserved owner-scoped query reads, owner query creation ownership checks, payout-linked query behavior, payout status transitions, admin query resolution/deletion workflows, permissions, auth, routes, schema, middleware, analytics, navigation, admin queries, and admin payout workflows.

## Owner Expenses Premium Read-Only Page

- Refined `/owner/expenses` as a calm owner-facing read-only property-expense history page.
- Added stronger property-only hierarchy, CMS-expense exclusion copy, recorded property-expense total, clearer date/category/property/vendor/note/amount table presentation, and aligned tabular amounts.
- Added `/owner/expenses/loading.tsx` to avoid blank loading states and match the final page hierarchy.
- Preserved owner-scoped expense reads through `getOwnerData()`, CMS-expense exclusion, existing owner expense search behavior, TanStack Table pagination/horizontal scrolling, read-only owner behavior, permissions, auth, routes, schema, middleware, navigation, admin expenses, and unrelated pages.

## Owner Bookings Premium Read-Only Page

- Refined `/owner/bookings` as a calm owner-facing read-only booking history page.
- Added stronger owner-scope hierarchy, booking count context, clearer guest/property/date/amount table presentation, compact no-wrap booking status badges, and an owner-only property filter treatment for multi-property owners.
- Added `/owner/bookings/loading.tsx` to avoid blank loading states and match the final page hierarchy.
- Preserved owner-scoped booking reads, guest name/phone visibility, property filtering behavior, TanStack Table pagination/horizontal scrolling, read-only owner behavior, permissions, auth, routes, schema, middleware, navigation, admin bookings, and unrelated pages.

## Owner Property Premium Read-Only Page

- Refined `/owner/property` as a calm owner-facing read-only property details page.
- Added stronger page hierarchy, owner-scope/helper copy, property summary cards, address/location display, restrained status badges, owner/CMS share cards, and a reassuring empty state for owners without an assigned property.
- Added `/owner/property/loading.tsx` to avoid blank loading states and match the final page hierarchy.
- Preserved owner-scoped reads through `getOwnerData()`, read-only owner behavior, permissions, auth, routes, schema, navigation, admin pages, owner dashboard, payout pages, bookings, expenses, queries, profile, analytics, and middleware.

## Admin Dashboard Premium Overview Pass

- Refined `/dashboard` as a premium operational admin overview with a stronger command-center header, clearer KPI cards, property performance, occupancy insights, upcoming check-ins, and recent booking/expense activity.
- Added intentional empty states for no properties, no upcoming check-ins, and no recent booking/expense activity.
- Added `/dashboard/loading.tsx` so the admin overview has a skeleton matching the final hierarchy.
- Polished the dashboard property performance table cells for clearer property identity, owner, money, profit, and occupancy scanning.
- Preserved existing admin data reads, dashboard calculations, occupancy logic, booking logic, P&L/payout behavior, permissions, routes, navigation, Supabase queries, schema, and unrelated pages.

## Owner Payout All-Time Property P&L

- Added a compact read-only all-time property performance section to `/owner/payout` between current-month live performance and payout history.
- The summary shows all-time booking revenue, all-time property expenses, and all-time net property profit only.
- The calculation uses owner-assigned property bookings, excludes cancelled/blocked bookings, excludes CMS expenses, and does not show owner share, CMS share, TDS, paid amount, estimated payout, or any payout action.
- Preserved current-month live performance, stored payout history, payout creation/recalculation, carry-forward/share/TDS logic, review actions, statuses, permissions, owner scoping, admin payout pages, and `/owner`.

## Owner Payout Premium UI Pass

- Refined `/owner/payout` with a calmer owner-facing page header, clearer separation between informational current-month live performance and reviewable stored payout statements, and a route loading skeleton.
- Updated the shared owner live-performance panel styling to match the refined owner dashboard language while keeping current-month values clearly non-final.
- Stabilized owner payout table widths, no-wrap status badges, compact action cells, and mobile horizontal scrolling through optional table column metadata.
- Added a simple AlertDialog confirmation before eligible owners approve a payout, while preserving the existing approval server action and review-window checks.
- Preserved payout creation/recalculation, `calculateOwnerLivePerformance`, carry-forward/share/TDS rules, status transitions, owner-facing paid-as-Approved mapping, permissions, owner scoping, admin payout pages, and `/owner`.

## Owner Dashboard Order and Typography Refinement

- Moved `/owner` property summary into a lower-page reference section after live performance, latest statement, recent bookings, expenses, and query sections.
- Strengthened the owner dashboard typography hierarchy so the page heading, section headings, and financial values are easier to scan without making supporting text compete.
- Updated `/owner/loading.tsx` to follow the revised dashboard section order.
- Preserved owner-scoped data reads, `calculateOwnerLivePerformance`, payout calculations, carry-forward/share/TDS logic, statuses, permissions, routing, actions, and `/owner/payout`.

## Owner Dashboard Premium UI Pass

- Reworked `/owner` as the first owner-facing premium dashboard pass with a calmer welcome section, clearer current-month live performance explanation, refined financial cards, and softer read-only supporting sections.
- Added property summary, latest statement, recent bookings, property expenses, and query sections with improved empty states and mobile-first one-column behavior.
- Added `/owner/loading.tsx` so the owner dashboard has a skeleton matching the final visual hierarchy.
- Preserved `calculateOwnerLivePerformance`, payout calculations, carry-forward/share/TDS logic, owner scoping, Supabase reads, permissions, schema, navigation, and `/owner/payout` behavior.

## Admin Users UI Reference Pass

- Improved `/dashboard/users` with clearer page hierarchy, status/role summary cards, a refined users table header, and a route loading skeleton.
- Polished user row spacing, no-wrap role/status badges, protected-admin identification, and row action readability while keeping TanStack DataTable search/pagination and horizontal mobile scrolling unchanged.
- Added row-level pending save feedback to the existing user update form.
- Added user-only notice handling for `user_updated`, `user_deleted`, and blocked protected-admin deletion attempts, with the page toast removing the notice from the URL after display.
- Replaced direct user deletion with an AlertDialog confirmation that identifies the selected user by name/email before submitting the existing delete action.
- Preserved protected-admin server-side behavior, role/status validation, public pending-owner signup flow, permissions, auth, schema, RLS assumptions, and unrelated dashboard modules.

## Admin Expenses UI Reference Pass

- Improved `/dashboard/expenses` with clearer page hierarchy, separate expense form/list cards, grouped CMS/property context, grouped category/date/amount/vendor controls, full-width notes, and a route loading skeleton.
- Added a pending save state to the existing expense server-action form while preserving field names, defaults, native selects, settings-backed categories, and legacy edit-value handling.
- Added expense-only success notice codes: `expense_created`, `expense_updated`, and `expense_deleted`, with a page-specific toast helper that removes the notice from the URL after display.
- Replaced direct expense deletion with an AlertDialog confirmation that names the selected category, amount, and CMS/property context before submitting the existing delete action.
- Polished admin expense table context badges and actions while keeping TanStack DataTable behavior unchanged.
- Preserved CMS as the default, CMS property clearing/disabling, server-side null `property_id` storage for CMS, property expense validation, owner visibility rules, payout exclusion behavior, permissions, schema, and unrelated dashboard modules.

## Admin Bookings UI Reference Pass

- Improved `/dashboard/bookings` with clearer page hierarchy, separate booking form/list cards, grouped guest/property fields, related date fields, grouped nights/guests/rate/amount controls, full-width notes, and a route loading skeleton.
- Added a pending save state to the existing booking server-action form while preserving field names, defaults, settings-backed source/concierge selects, and local booking auto-calculations.
- Added booking-only success notice codes: `booking_created`, `booking_updated`, and `booking_deleted`, with a page-specific toast helper that removes the notice from the URL after display.
- Replaced direct booking deletion with an AlertDialog confirmation that names the selected guest and property before submitting the existing delete action.
- Polished admin booking table actions and status badges while keeping TanStack DataTable and the existing property filter behavior unchanged.
- Preserved booking calculations, date validation, automatic status calculation, manual editability of nights/rate/amount, owner scoping assumptions, permissions, schema, and unrelated dashboard modules.

## Admin Properties UI Reference Pass

- Improved `/dashboard/properties` as the first dashboard UI reference module with clearer form/list hierarchy, stronger labels, compact field sizing, grouped owner/CMS share controls, and mobile-safe one-column form behavior.
- Added a pending save button state for the existing property server-action form.
- Added property-only success notice codes: `property_created`, `property_updated`, and `property_deleted`, with a page-specific toast helper that removes the notice from the URL after display.
- Replaced direct property deletion controls with an AlertDialog confirmation that names the selected property and explains linked operational records may be affected.
- Added a route loading skeleton and property-specific empty table message while keeping TanStack DataTable behavior unchanged.
- Preserved the existing `?edit=<id>` flow, form remount key, hidden `id`/`mode` fields, server-side update-id guard, image URL retention, owner/share/status rules, redirects, and delete permissions.
- No bookings, expenses, payouts, auth, analytics, homepage, middleware, Supabase queries, RLS assumptions, schema, shared navigation, or package changes were made.

## Dashboard Active Navigation

- Added a small client navigation link component for admin and owner dashboard navigation so active states update correctly during App Router client navigation.
- Replaced loose sidebar `startsWith` matching with exact root matching and segment-bound child matching.
- Added `aria-current="page"` to the active dashboard navigation link and reused the same active logic for desktop sidebar and mobile dashboard navigation.
- Kept navigation labels, routes, role visibility, page layout, forms, server actions, Supabase, auth, payouts, bookings, tables, homepage, analytics, and middleware unchanged.

## Minimal shadcn/ui Foundation

- Added a minimal shadcn/ui-compatible foundation with `components.json`, a shared `cn` helper, and selected source primitives in `components/ui`.
- Added Button, Input, Textarea, Card, Badge, AlertDialog, Skeleton, Tooltip, and Sonner primitives while preserving existing dashboard/homepage styling and existing table behavior.
- Mounted the Sonner toaster once in the root layout.
- Added `docs/UI_CONVENTIONS.md` and linked it from the documentation index.
- No active page route, form workflow, server action, Supabase query, analytics logic, payout logic, booking logic, auth flow, database schema, or dashboard design was changed.

## Supabase Stale Refresh Cookie Handling

- Updated the Supabase proxy session refresh helper to catch `refresh_token_not_found`, clear stale `sb-*` auth cookies, and continue the request.
- Prevents expired local browser cookies from producing repeated `Invalid Refresh Token: Refresh Token Not Found` errors during `next start`.
- No auth permissions, RLS policies, login behavior, schema, or dashboard business logic changed.

## Admin Property Edit Fix

- Fixed `/dashboard/properties?edit=<id>` so the client form remounts with the selected property id instead of keeping stale add-mode defaults.
- Updated the property save action to require a valid id for edit submissions, update the existing row by id, preserve existing `image_url`, and redirect back to `/dashboard/properties` after successful save.
- Add mode still inserts a new property with the same owner assignment, share, bedrooms, address, city, and status fields.
- No payout, booking, auth, RLS, forecast, or unrelated dashboard logic changed.

## Homepage Analytics Tracking

- Added a small browser-safe `dataLayer` helper for non-PII GTM event pushes.
- Tracked public homepage calendar clicks, WhatsApp clicks, forecast funnel entry/start, successful forecast lead generation, successful pitch-deck readiness, and pitch-deck downloads.
- Added `docs/ANALYTICS.md` and linked it from the documentation index.
- Kept GTM/GA4/ad-platform configuration inside GTM; no analytics packages, direct `gtag` calls, API behavior, forecast calculations, auth behavior, or database schema changed.

## Analytics Base Integration

- Added a guarded Google Tag Manager base snippet through the root App Router layout using built-in `next/script`.
- Added the standard GTM noscript iframe fallback inside `<body>`.
- Used only `NEXT_PUBLIC_GTM_ID`; when it is missing, no GTM script or fallback iframe renders.
- Kept GA4 configuration and event tracking out of application code because GA4 is managed inside GTM.
- No package, homepage UI, business logic, API route, Supabase, auth, or unrelated environment-variable changes were made.

## Homepage Public Correction Pass

- Normalized public homepage typography so nav, buttons, headings, cards, testimonial text, FAQ, and footer all follow the same reference-style Figtree hierarchy.
- Updated the header and footer to use `public/logo.png` with correct proportions and object-contain treatment, and removed the extra header subtitle.
- Changed the header/mobile booking CTA from `Book a property` to `Book a call`, pointing to the existing Google Calendar URL, while keeping `Dashboard` linked to `/dashboard`.
- Rebuilt the proof area with the approved track-record cards, Panjim and Varca case studies, and reference-style revenue ramp charts using only approved reference data.
- Replaced homepage testimonials with the approved reference quotes, names, and roles, using placeholder initial avatars instead of profile images.
- Restored the full ten-item FAQ accordion with accessible buttons, coral active state, and the approved default-open item.
- Replaced the old pricing section with the approved `Signature`, `Curated`, and `Bespoke` partnership cards, including the `Most Chosen` Curated treatment.
- Removed the standalone mid-page transparency block and moved its approved transparency/control/investment content into the bottom `More about how we work` accordion.
- Tightened homepage reference parity further by scoping `next/font/google` Figtree to `/`, restoring the missing comparison-table row/copy, and wiring the existing local `founder.jpg` and `aravind.jpg` assets back into the team/final CTA while keeping the existing working CTA destinations and forecast flow.
- Kept dashboard pages, owner pages, auth, APIs, Supabase, forecast calculations, pitch-deck generation, email workflows, and other backend logic unchanged.

## Initial Build

- Added Next.js 16 App Router structure for CurateMyStay.
- Added centralized theme tokens matching the dashboard reference.
- Added Supabase SSR clients, service-role-only admin client, and Next 16 `proxy.ts`.
- Added public landing page with contact form.
- Added auth pages, pending approval, and inactive account screens.
- Added admin and owner dashboard shells and Phase 1 routes.
- Added schema and setup documentation.

## Dashboard Visual Alignment

- Reworked `/owner` to follow the owner portal reference layout with Tailwind utilities.
- Reworked `/dashboard` to follow the admin overview reference layout with Tailwind utilities.
- Removed `next/font/google` to fix a runtime `adapterFn is not a function` issue and use a system/Figtree-style stack.

## Documentation Context

- Added `docs/AI_PROJECT_CONTEXT.md` as the required master context file for future AI tools and developers.

## TanStack Dashboard Tables

- Added `@tanstack/react-table` and a shared Tailwind-first `components/ui/data-table.tsx`.
- Added feature-local table column files and small client wrappers for users, properties, bookings, expenses, payouts, queries, P&L, and dashboard property performance.
- Converted admin data routes and owner read-only data routes from hand-written table markup to TanStack Table without changing Supabase permissions or server actions.
- Kept owner operational records read-only and preserved protected admin delete safeguards.

## Booking Form Conveniences

- Added auto-calculation of nights from check-in and check-out dates.
- Added auto-calculation of total amount from nights x nightly rate.
- Added auto-calculation of nightly rate from total amount / nights.
- Kept nights, nightly rate, and total amount manually editable.
- Preserved the existing booking schema, permissions, and server-action flow.

## Booking Workflow Simplification

- Removed manual selection of upcoming, in-house, and checked-out booking statuses.
- Added automatic booking status calculation from check-in/check-out dates.
- Kept cancelled and blocked as admin override statuses, with cancelled/blocked taking priority over calculated status.
- Removed cleaning/housekeeping fields from booking and settings UI without changing the database schema.
- Updated booking tables and dashboard counts to display/use calculated booking status.

## Booking Calculation Fix

- Restored stable booking form auto-calculation for nights, nightly rate, and total amount.
- Kept the automatic status preview and cancelled/blocked override behavior unchanged.

## Booking Property Filter

- Replaced the generic booking table search input with a property dropdown filter.
- Admin booking list includes All properties plus active property options.
- Owner booking list uses only owner-scoped property options and hides the dropdown when there is only one owner property.
- Kept filtering as UI convenience only; server-side owner scoping and Supabase/RLS remain the security boundary.

## Booking Edit Action

- Added a pencil edit action beside delete in the admin booking table.
- Edit loads the selected booking into the existing booking form via `/dashboard/bookings?edit=<id>`.
- Kept the existing admin-only save action as the mutation path.

## Homepage Reference Match

- Rebuilt `/` to follow `reference/homepage.html` with Tailwind-first sections, spacing, colors, cards, dark bands, tier cards, proof sections, FAQ, CTA, and footer.
- Extracted the reference homepage photos into `public/homepage/` and used them through Next Image.
- Kept the existing auth-aware dashboard/login/signup links and live contact form.
- No database schema, permissions, or dashboard workflows changed.

## Homepage Button Refinement

- Updated homepage CTA helpers to match the reference button sizing, 12px radius, hover shadows, secondary borders, ghost styling, and dark-section variants.
- Made hero/final CTAs large, header buttons compact, and tier CTA buttons full-width like the reference.
- Kept link destinations and contact form behavior unchanged.
- Fixed white-button contrast so white buttons force dark text instead of inheriting white text from dark homepage sections.

## Owner Payout Flow

- Added previous-month payout creation/recalculation when admin or owner payout pages load.
- Added booking revenue proration by nights in month, property-expense deduction, previous negative carry-forward, combined owner-month payout rows, and property-wise breakup display.
- Added fixed 10% TDS on positive owner share and removed manual TDS editing from the UI.
- Added owner payout review actions: approve or raise a linked query during the 1st-5th review window.
- Added after-5th auto-approval for untouched payouts.
- Added admin mark-paid action for approved or resolved payouts.
- Updated query resolution so linked payout queries move payouts from `query_raised` to `resolved`.
- Kept the database schema and permissions model unchanged.

## Owner Dashboard Payout Statement Fix

- Updated the `/owner` dashboard statement card to use the generated previous-month owner payout record.
- Reused shared payout helpers for carry-forward and owner/CMS share percentages instead of calculating partial payout values inside the dashboard.
- Added clear statement rows for rental revenue, property expenses, previous carry forward, adjusted profit, owner share, CMS management, TDS 10%, net payable, and status.
- Fixed status display so `Paid` only appears for paid payouts or rows with `paid_at`.

## Owner Payout UI Cleanup

- Removed internal status/date details from the owner payout summary card header.
- Removed owner-facing display of paid text and internal auto-approval owner notes.
- Mapped owner-facing internal `paid` payout status to `Approved` while preserving admin-side paid workflow.
- Hid previous carry-forward summary/table values when the carry-forward amount is not negative.
- Hid property-wise payout breakup for single-property owners and kept it visible only for multi-property owners.
- Removed the owner payout record table search input while keeping admin payout search unchanged.
- Split admin payout table columns into an admin-only module so owner payout pages do not import the admin mark-paid server action through their client table bundle.
- Kept payout calculation logic unchanged.

## Homepage Index Reference Rebuild

- Rebuilt `/` from `reference/index.html` as a dedicated `components/home/reference-home.tsx` client component.
- Kept the implementation Tailwind-first with simple local state for the ROI calculator and booking modal.
- Removed the custom Supabase enquiry form from the homepage.
- Added the reference owner acquisition flow: hero, math comparison, calculator, services, proof, transparency, risk FAQ, pricing tiers, team, final CTA, footer, sticky mobile CTA, booking modal, calendar link, and WhatsApp CTA.
- Copied missing reference photos into `public/homepage/` and rendered local assets with `next/image`.
- Kept auth-aware dashboard/login behavior and made no permission, schema, payout, booking, or dashboard workflow changes.

## Homepage Reference Refinement

- Restored the hero photo carousel with timed fading images and clickable dots.
- Forced reference button text colors so primary/dark/secondary variants do not inherit the wrong text color.
- Matched homepage heading scale more closely to `reference/index.html`.
- Rebuilt the ROI calculator as the reference-style three-step form with property details, contact details, confirmation, and forecast result cards.
- Tightened service card icon wrappers, spacing, typography, and list styling to better match the reference.
- Fixed the case-study photo grid so row-spanning images do not create broken extra rows.
- Made `/` a static public page again by removing homepage profile fetching and skipping proxy session refresh only for `/`.
- Kept the custom Supabase enquiry form removed from the homepage.

## Homepage CSS Runtime Recovery

- Fixed corrupted homepage styling caused by Tailwind scanning a renamed stale `.next` cache inside the repository.
- Stopped only stale Next processes tied to this workspace and rebuilt from a clean `.next` directory.
- Added `/.next-stale-*/` to `.gitignore` so Tailwind automatic source discovery cannot scan renamed generated caches again.
- Confirmed `/` and its emitted stylesheet both return HTTP 200 without CSS parser errors.

## Owner Forecast Funnel

- Added a pure shared April-March revenue calculator with the supplied base-rate tables, location and occupancy modifiers, beach rules, pool rules, area bands, amenity cap, furnishing setup notes, and fixed 15% operating cost.
- Added server-side Zod validation and `/api/owner-forecast`.
- Reused `contact_submissions` for owner leads with `source_page = owner_revenue_calculator`.
- Added Apps Script PDF generation with safe failure handling and returned PDF view/download links.
- Added internal-only Resend lead email containing inputs, forecast, setup note, PDF status, and WhatsApp link; no email is sent to the prospective owner.
- Connected the three-step homepage form to the endpoint, added optional amenity multi-select controls, duplicate-submit prevention, loading/error states, PDF download, and prefilled WhatsApp follow-up.
- Removed client mock math, owner share, CMS share, payout/split language, and long-term-rental comparison from the forecast result.
- Replaced `.env.example` credentials with blank placeholders and documented all required environment variables.

## Asynchronous Owner Pitch Deck

- Changed `/api/owner-forecast` to save the lead, send the internal notification, and return the forecast without waiting for Apps Script.
- Added `/api/owner-forecast/proposal` to revalidate the request, recalculate server-side, and generate the pitch deck separately.
- Made the homepage render forecast results immediately while the pitch-deck action transitions through preparing, ready, or temporarily unavailable states.
- Kept calculator rules, lead storage, admin-only email behavior, page design, permissions, and database schema unchanged.

## Owner Pitch Deck Ready State and Email Timing

- Made proposal success explicit with `ok`, `pdfViewUrl`, and `pdfDownloadUrl` from the Apps Script response.
- Activated the download button only when the proposal response is successful and includes `pdfDownloadUrl`.
- Removed admin email delivery from the initial forecast endpoint.
- Moved admin email delivery to the proposal endpoint after generation finishes, including final pitch-deck links or failed/unavailable status.
- Kept forecast results visible when proposal generation fails and kept all internal errors and credentials server-only.

## Owner Pitch Deck False Failure Fix

- Removed the Apps Script helper's premature 30-second abort, which could discard a successful PDF response after Drive had already created the file.
- Verified Apps Script returns flat `{ ok, pdfViewUrl, pdfDownloadUrl, pdfFileName, publicSharingEnabled, slidesViewUrl }` JSON.
- Verified the proposal route normalizes success to flat `{ ok: true, pdfDownloadUrl, pdfViewUrl }` JSON used directly by the client ready state.
- Removed all temporary server and client response logs after diagnosis.
- Left the forecast calculator and all unrelated flows unchanged.

## Forecast Loader and Owner Email

- Added a cream-and-coral Tailwind loader card while the initial forecast submission is being prepared.
- Kept the forecast result independent from the longer-running pitch-deck request.
- Added a link-only owner email after successful PDF generation using the existing Resend configuration.
- Kept admin email timing after the generation attempt and send it before the conditional owner email.
- Added `ownerEmailSent` to the safe proposal response so the ready message can confirm email delivery.
- Owner-email failure is logged server-side and never disables a successful PDF download.
- No owner email is sent when pitch-deck generation fails.

## Homepage Mobile Responsiveness

- Added mobile-first section spacing and breakpoint typography across the public homepage.
- Simplified the narrow header, stacked hero/final CTAs, constrained carousel overlays, and improved footer/modal/sticky action sizing.
- Replaced the wide comparison table with stacked comparison cards below tablet width.
- Made proof, testimonial, portal, pricing, team, accordion, and FAQ layouts safe at 320px widths.
- Refined the owner forecast card, segmented controls, phone row, navigation, loader, result cards, and download actions for small screens.
- Kept desktop styling and all backend/calculator behavior unchanged.

## Mobile Navigation Cleanup

- Removed the fixed bottom mobile CTA buttons.
- Added a touch-friendly hamburger menu for mobile and tablet navigation.
- Moved homepage links, booking action, and dashboard access inside the mobile menu while preserving the desktop navbar.
- Refined the menu with Lucide icons, stronger typography, cream/coral surfaces, grouped actions, improved touch targets, and Escape-key dismissal.

## Owner and Admin Dashboard Improvement Pass

- Fixed the shared TanStack search input spacing, alignment, and responsive width.
- Removed generic search from owner expenses and owner queries without changing owner scoping.
- Added default Current Payout and separate Payout History tabs; the current table uses the ensured previous-month live payout.
- Added property and expense edit-pencil actions using the existing `?edit=<id>` form pattern.
- Removed property Image URL from the form while preserving existing `image_url` values and the database column.
- Removed all booking status controls/client values; booking status is always calculated server-side from dates.
- Wired `booking_sources`, `expense_categories`, and `concierge_options` settings into their respective dropdowns with legacy edit-value preservation.
- Made CMS the default expense type, with cleared/disabled property selection, while property expenses require a valid server-checked property.
- Added admin-only query deletion with confirmation, feedback, and review-window-aware restoration of linked payouts from `query_raised`.
- No package, permission, payout-formula, RLS-assumption, or database-schema changes were made.

## Owner Payout Current-Month Performance

- Replaced the upper previous-month payout summary on `/owner/payout` with current-calendar-month live performance.
- Added one shared `calculateOwnerLivePerformance` helper and `OwnerLivePerformancePanel` used by both `/owner` and `/owner/payout`.
- Current revenue remains nightly-prorated with check-in inclusive/check-out exclusive; cancelled/blocked bookings and CMS expenses remain excluded through existing payout helpers.
- Kept payout review actions, carry-forward rules, and previous-month payout generation unchanged.
- No current-month `owner_payouts` row, schema change, package, or admin-page change was introduced.

## Owner Payout History Simplification

- Replaced the separate Current Payout and Payout History tabs with one payout-history table.
- Kept the current-month live performance panel separate and unchanged above the table.
- The combined table includes every owner payout statement, latest month first, including the previous-month payable record.
- Kept owner approval and query actions on eligible ready-for-review rows under the existing review-window rules.
- Kept owner payout search disabled and made no payout formula, creation, permission, schema, or admin-page changes.

## Documentation Consolidation

- Added `INDEX.md` and an AI-first recommended reading order.
- Added detailed owner forecast calculator, payout logic, API contracts, admin operations, and deployment documents.
- Updated README, setup, schema, routes, project overview, environment template, and AI context to reflect the current implementation.
- Clarified the source-of-truth hierarchy, RLS deployment responsibility, and AI handoff workflow.
- Preserved all prior changelog entries as historical records.

## Public Floating WhatsApp CTA

- Added one fixed, icon-only WhatsApp control for public marketing routes, using the configured public WhatsApp number and existing non-PII `whatsapp_click` tracking.

## Public Owner Dashboard Demo

- Added `/demo`, a public noindex preview of the owner dashboard using deterministic fictional Goa property data only.
- Kept real owner routes, authentication, Supabase reads, and payout logic unchanged; demo navigation remains read-only and isolated from protected owner pages.

## Project Health Audit Fixes

- Restored the documented pending-owner status on public signup.
- Repaired the owner payout approval dialog so its connected server-action form remains mounted during submission and shows pending feedback.
- Added truthful failure handling for admin user, booking, and expense saves instead of redirecting success after ignored database errors.
- Made booking contact notifications use the configured `RESEND_FROM_EMAIL` when available and removed a duplicate environment-template entry.

## Project Health Audit Follow-up

- Made previous-month payout generation stop on incomplete source reads, protect actioned rows with status-qualified updates, and safely reload concurrent owner/month insert conflicts.
- Added truthful owner/admin payout action feedback and compensating rollback for query/payout multi-step failures without changing payout calculations or review rules.
- Added best-effort property Storage cleanup using only trusted image paths after confirmed database deletion, with a warning when cleanup needs manual attention.
- Centralized server-only service-role key validation so `sb_publishable_` keys and legacy anon JWTs cannot be mistaken for service-role credentials.
- Documented the still-manual owner/month payout uniqueness index, duplicate-detection query, `contact_submissions` RLS verification, and Storage policy check without claiming they are deployed.

## Property CSV Import: Website Listing Fields

- Extended the admin property CSV import so one CSV can create a complete property, including the non-image website listing fields. The original seven headers (`property_name`, `owner_email`, `address`, `city`, `bedrooms`, `owner_share_percentage`, `status`) still work exactly as before, and a CSV with only those headers imports hidden (`show_on_website = false`).
- Added 34 optional headers: `show_on_website`, `accept_booking_requests`, `slug`, `public_name`, `public_property_type`, `promotional_badge`, `display_order`, `is_featured`, `show_in_similar_properties`, `region`, `area`, `short_location_line`, `public_location_text`, `google_maps_url`, `distance_from_beach`, `tagline`, `short_description`, `full_description`, `beds`, `bathrooms`, `max_guests`, `pool_type`, `property_highlights`, `amenities`, `house_rules`, `show_price`, `starting_price`, `price_note`, `minimum_nights`, `check_in_time`, `check_out_time`, `booking_enquiry_note`, `seo_title`, and `seo_description`.
- Values are validated through the existing `propertySchema`, so blank cells take the admin form defaults and rows with `show_on_website` true run the same publish-readiness checks as the admin form. Hidden rows only have the format of provided values validated, so partial listing data can be saved as a hidden draft.
- Booleans accept true/false, yes/no or 1/0; lists use `|` as the separator; times are 24-hour `HH:MM`. A slug is generated from `public_name` for published rows with a blank slug, and a slug that already exists or repeats in the CSV makes the row invalid. A `23505` slug violation on insert now returns a row-level message instead of a generic failure.
- The preview gained Website and Slug columns, per-row validation messages, a non-blocking "Published without images" warning, and a per-row details view for the remaining values. `image_url` is never written and images cannot be imported.
- Rebuilt the demo CSV with all headers and three fictional Goa sample rows (operational-only, fully published, and hidden with partial listing data).
- No schema, RLS, Storage, view, or Supabase change. Bookings, expenses, payouts, and public pages are untouched.

## Property Photo Tour, Scroll Lock and Pointer Cursor

- Rebuilt the `/property/[slug]` gallery: one set of photo buttons now serves a full-width snap carousel with a `1 / N` counter below `lg` and the 1 + 4 grid with `Show all photos` from `lg`. Only real photos render, which removes the empty beige tiles the old stacked mobile grid could show while lazy images loaded, and the cover is downloaded once instead of twice.
- Added a full-screen photo tour and lightbox on Radix Dialog with prev/next, a continuous `N / total` counter, captions, arrow keys, swipe and Esc. Open state syncs to `?photos=1` and `?photo=N` so the browser and phone back buttons close it, and deep links work. Added a Web Share / copy-link `ShareButton`.
- Fixed two bugs in that work: every `<button>` showed the default arrow because Tailwind v4's preflight no longer sets a pointer cursor (now one base-layer rule in `globals.css`), and the page behind the tour stayed scrollable, showing a second scrollbar, because the dialogs rendered no `Dialog.Overlay` (which carries Radix's scroll lock). Closing the lightbox also no longer moves the tour's scroll position.
- The tour groups photos into room sections inferred from the existing `alt_text` and sort order, with no schema change: an explicit `Room | description` prefix, else keyword inference with room numbers, else a final `Additional photos` section. A `Photo tour` thumbnail index jumps to each room. Logic and unit tests live in `src/lib/utils/photo-rooms.ts`; `npm test` runs them.
- Admin gallery manager: each photo card shows its detected room and a hint when none is found, a room picker writes the `Room | ` prefix into the alt text field, and several photos can be ticked and given a room at once through the existing alt-text action.
- Named the public catalogue colours as tokens in `globals.css` and added `@radix-ui/react-dialog`. No database, view, Storage or Supabase change. An earlier `room_label` column proposal was dropped and its code removed.

## Photo Tour Order Follows Admin Order

- The photo tour's room sections now follow the admin photo order (`sort_order`, then creation time) only. Previously the public loader's cover-first ordering fed the tour, so the cover's room always led it. The page's top grid still leads with the cover; the tour gives the cover no special place.
- Moved the ordering and grouping into `src/lib/utils/photo-rooms.ts` (`orderByAdminOrder`, `groupByRoom`, `tourRoomOrder`), shared by the tour and the admin. Each room sits at its earliest photo's position, "Additional photos" is always last, and fewer than two named rooms still falls back to a plain grid in admin order.
- The admin gallery manager shows a read-only `Tour order:` line above the photo list that updates live as photos are reordered or a room prefix is edited, including unsaved alt text edits.
- Added unit tests for a non-contiguous room, the cover in a later position, and a later photo moved to first. No database, view or Supabase change.

## Property Page: Show More, Hierarchy, Area Map and Enquiry Bar

- Added the shared `components/ui/show-more-dialog.tsx` (Radix Dialog; bottom sheet on mobile, centred modal on desktop, single scroll container through `Dialog.Overlay`) and used it for About (five clamped lines, `Show more` only when clamped), amenities (first ten, then all grouped by category from a keyword map in `amenity-categories.ts`) and house rules. Removed the unused `components/ui/modal.tsx` stub.
- Tightened the hierarchy: a data-built summary line under the title, capacity shown once (summary plus tiles), Stay details limited to check-in, check-out, minimum stay and beach distance, the first four highlights as icon rows using a `Title: subtitle` convention (the rest join the amenities), a company-level `Managed by Curate My Stay` card, and `Things to know` (House rules, Safety & property, Enquiry policy) opening the shared dialog.
- Added an area-only map to `Where you'll be`: a keyless Google Maps embed searched by area and region, never `google_maps_url`, with a soft approximate-area circle, lazy-loaded with its height reserved.
- Added a Share button by the title, a mobile sticky enquiry bar (WhatsApp with the property name and URL, plus Call), moved the full stay card to the end of the content on mobile, kept it sticky on desktop, and hid the floating WhatsApp button on `/property/*`. All enquiry CTAs share one message builder.
- Lifted the remaining hex literals on the page, route and stay card into the public tokens (adding `--color-public-error` for the existing error red). Admin-controlled price display is unchanged. No reviews section (no review data), no schema, view, Storage or Supabase change.

## Photo Tour Opens at the Top

- Fixed the photo tour opening scrolled to the end ("Additional photos") when opened from the page's cover photo or `Show all photos`: the tour no longer scrolls to the tapped photo at all, always opens at scrollTop 0 with the `Photo tour` heading and room index, and sends initial focus to the Back button without scrolling. The lightbox still opens only from a photo inside the tour.

## Where You'll Be: Map From the Saved Google Maps URL

- The `Where you'll be` map now comes from the property's saved `google_maps_url` (replacing the area-text search) through `src/lib/maps.ts`: coordinates are read from long links, `<iframe>` embed codes and embed URLs, and short links are followed on the server only (Google hosts only at every hop, 5 second timeout, cached for a week). The embed is `google.com/maps?ll=lat,lng&z=14&output=embed`, pinless (`q=` would drop a pin on the exact spot), with coordinates rounded to about 1 km and a non-interactive iframe, under the existing pink circle and `Approximate area` pill.
- A property with no saved Google Maps URL no longer renders `Where you'll be`. A value that cannot be embedded keeps the placeholder card and the `View on Google Maps` button (web links only). The admin field accepts a pasted embed code and stores the link inside it. No schema, key or dependency change. Unit tests for the parser and the redirect resolver run with `npm test`.

## Where You'll Be: Map Fallback Chain

- The map now degrades in steps instead of dropping to the placeholder: coordinates from the saved Google Maps value, else an embed searched by the area text shown in the `Approximate area` pill (never anything from the saved URL), else the placeholder card. `View on Google Maps` still links to the saved value in every case.
- Short-link lookups log one `[property map] short link lookup` line per attempt (input, hop hosts, trimmed final URL and a reason: `dns-failure`, `timeout`, `network-error`, `non-google-host`, `no-redirect`, `no-coordinates`). A failed lookup is remembered for one minute only (previously five), concurrent visitors share one lookup, and only successes are cached for a week. Unit tests cover the fallback order and DNS, network and timeout failures.

## Public Property Detail and Photo Tour Fixes (2026-10-13)

- Removed the unused Managed by card and its divider. Coordinate maps retain full precision at zoom 15 with pinless `ll=` embeds; admin saves resolve Google short links into long URLs when possible and keep unresolved links with a warning and field hint. Existing cached short-link and area-text fallbacks remain.
- Shared enquiry dates/guests and validation between the stay card and sticky mobile WhatsApp bar. Missing, past and reversed dates show inline feedback and focus the relevant input; valid messages include readable dates, nights and guests. Call remains independent.
- Added shared native-share, secure-copy, insecure-HTTP textarea-copy and manual WhatsApp/selectable-link fallbacks using canonical public URLs. Photo-tour room titles stick within each section on tablet/desktop with matching thumbnail offsets; mobile titles remain static.
- Added map-save, date-validation and share-fallback tests. No database, RLS, Storage, dependency or booking/payout calculation changes.

## Property Page: Mobile Layout (below md)

- Below `md` the property detail page follows a familiar listing flow, in CurateMyStay's own styling: an edge-to-edge swipeable photo hero (native scroll snap, `1 / N` counter, tap opens the photo tour) with round back and share buttons in place of the site header and `All stays` link; a white title sheet with rounded top corners overlapping the photo, with the title, a place line and a capacity line centred (replacing the capacity chips); highlights; About clamped to six lines; six amenities with a full-width `Show all N amenities` button; `Where you'll be` with an area line, a 224px map with a corner expand link to the saved Google Maps URL (replacing the separate button and the location chips); an inline `Select dates` calendar; and `Things to know` rows.
- The inline calendar (`property-mobile-date-picker.tsx`, plain `Date` maths, no new dependency) replaces the stay card below `md` and shares the enquiry context with the sticky bar, so picked dates show in the bar at once. The bar shows `Add dates` or the chosen range (which scrolls to the calendar); its no-dates validation now scrolls to and focuses the calendar and shows the error there. The guest picker is shared between the stay card and the calendar.
- Long content keeps using the shared Radix bottom sheet, which now slides up on phones via Tailwind's `starting:` variant. Mobile ordering uses `order-*` utilities inside a `md:block` column, so tablet and desktop layout, data fetching, metadata, map privacy and validation rules are unchanged. No custom CSS, schema or dependency change.

## Airbnb Listing Link as Social Proof

- Added an optional `Airbnb listing URL` to the Website listing section of Admin -> Properties, validated as an HTTPS Airbnb listing link (`/rooms/<id>` on an Airbnb domain) and saved through the existing property action.
- `/property/[slug]` shows `See Our Guest Reviews & Airbnb Listing` with a new-tab, `noopener noreferrer` link to the listing, followed by `Book Directly for a Better Rate` using the existing WhatsApp enquiry button. It renders only for a valid link, so no stay implies reviews it does not have. No Airbnb API, scraping, package or table.
- The `properties` column and its `public_property_details` view column were added manually in Supabase (SQL in the catalogue doc).
- Follow-up: with the view column confirmed live, removed the temporary Postgres 42703 fallback; the detail page reads `airbnb_listing_url` in its normal single query.

## Safe Read Caching and Mutation Freshness (2026-10-14)

- Narrowed admin/owner loaders to each page's required datasets while preserving parallel reads, owner filters and response shapes. Auth/profile pure reads are request-memoized only; private RLS data and payout processing remain uncached, and failed financial reads fail closed.
- Added a stateless anonymous client and 60-second, immediately invalidated Next data cache for public-safe catalogue/detail/gallery views. Minute keys and request rendering bound direct-edit staleness and prevent expired success fallback on read failure.
- Centralized mutation dependency invalidation for operational saves/deletes, imports, user/account changes, payout/query actions and gallery changes, including confirmed partial writes before later failures. Preserved formulas, permissions, payout lifecycle, redirects and existing refresh behaviour.
- Added focused offline loader/action tests and documented cache scope, mutation mapping, direct database edits and already-open session limitations. No schema, RLS, package or production configuration changes.

## Guest Navbar for Booking and Property Pages (2026-10-19)

- Added `GuestHeader` (`components/home/guest-header.tsx`) for `/booking` and `/property/[slug]` in place of the owner-focused `PublicHeader`: logo to `/booking`, `Explore Stays` (`All Stays` on a property page), `List Your Property` (existing `/property-management-goa`), the configured phone number as a `tel:` link and a coral `WhatsApp Us` button. Home, Property Management, the More menu, Owner Portal and Book a Call are not shown there.
- Below `lg` the header shows the logo, a call icon, `WhatsApp` and a menu button that opens the two links in the existing Radix `ShowMoreDialog`. The property page header is now visible on phones too (the hero keeps its own back and share buttons).
- The WhatsApp message is general on `/booking` and names the property on a property page (`guest-whatsapp-message.ts`, tested). It does not use the stay enquiry context, so the form keeps its dates and guests. No new package, route, schema or SQL; other routes keep `PublicHeader`.

## Booking Page Refinement (2026-10-19)

- `/booking` hero: the existing photograph is blurred 2px on its own layer, the supporting copy is shortened to `Hand-picked villas and apartments, personally managed by our team.`, and the hero is shorter on phones (400px).
- Search panel: a compact 2 x 2 field grid with a full-width `Search` button below `lg`; the desktop pill is unchanged. Fields, filtering and reset behaviour are unchanged.
- Property grid: one column on phones, two from `sm` (previously three on desktop), 3:2 image area. Each card with several photos has a swipe/arrow carousel (`CardImageCarousel`) fed by one batched `public_property_gallery` read; the card still opens its property. No schema, package or navbar change.
