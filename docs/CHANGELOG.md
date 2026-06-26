# Changelog

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
