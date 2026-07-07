# Changelog

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
