# 1. Project Summary

CurateMyStay is a small-to-medium property management web app for short-term rental operations. The MVP has a public marketing page, Supabase authentication, an admin operations dashboard, and an owner dashboard.

Current scope is Phase 1 only: users, properties, bookings, expenses, P&L, owner payouts, simple owner queries, settings, profile editing, and a reference-matched owner acquisition homepage. Later features such as calendar, Forma Sheet, budgeting, receipt uploads, channel sync, scheduled payout jobs, and owner statement PDFs are intentionally not built.

# 2. Tech Stack

- Next.js `16.2.9` with App Router and `proxy.ts` instead of deprecated `middleware.ts`.
- React `19.2.4`.
- TypeScript strict mode.
- Tailwind CSS v4 via `@tailwindcss/postcss`.
- Supabase via `@supabase/supabase-js` and `@supabase/ssr`.
- Supabase Auth with SSR cookie-based session refresh.
- Zod validation.
- React Hook Form dependencies are installed, though current forms mostly use simple server actions and native form posts.
- Lucide React icons.
- TanStack Table via `@tanstack/react-table` for dashboard and owner data tables.
- Resend for landing page enquiry email.
- No Redux/Zustand/UI framework.

# 3. Current Architecture

- Public landing page: `app/page.tsx` wraps `components/home/reference-home.tsx`, a Tailwind-first conversion of `reference/index.html` with auth-aware nav, owner acquisition sections, booking modal, WhatsApp CTA, and ROI calculator. The old custom homepage enquiry form is no longer mounted on `/`.
- Auth routes: `app/login/page.tsx`, `app/signup/page.tsx`, `app/auth/callback/route.ts`.
- Admin dashboard: `app/dashboard/*`, protected by `app/dashboard/layout.tsx`.
- Owner dashboard: `app/owner/*`, protected by `app/owner/layout.tsx`.
- API routes: `app/api/contact/route.ts`, `app/api/owner-forecast/route.ts`, and `app/api/owner-forecast/proposal/route.ts`.
- Server actions:
  - Auth actions in `src/features/auth/auth-actions.ts`.
  - Dashboard CRUD/query/profile/settings actions in `src/features/shared/actions.ts`.
  - Payout creation/review/payment actions in `src/features/payouts/payout-actions.ts`.
- Supabase data reads:
  - `src/features/shared/data.ts` has `getAdminData()` and `getOwnerData()`.
  - It uses normal authenticated Supabase server client, not service role, for dashboard reads.
- Shared components:
  - `components/layout/*` for shell, sidebar, topbar, headers.
  - `components/ui/*` for simple editable button/card/input/table/data-table/badge patterns.
  - `components/forms/*` for auth, contact, admin forms, and confirm delete button.
- Feature table wrappers:
  - `src/features/*/*-columns.tsx` define TanStack columns.
  - `src/features/*/*-table.tsx` are small client wrappers around `components/ui/data-table.tsx`.
  - Server route pages pass only serializable row data into table wrappers.
- Visual direction:
  - The dashboard and owner overview are shaped to match `reference/` mockups using Tailwind utilities and centralized CSS variables.

# 4. Folder Structure Map

```txt
app/
  App Router routes, layouts, pages, route handlers, and global CSS.

components/
  Top-level shared React components.
  components/layout/ contains dashboard shell, sidebar, topbar, page header.
  components/ui/ contains simple reusable UI primitives.
  components/forms/ contains concrete forms used by auth, contact, admin pages.

src/features/
  Feature-level server logic and lightweight table UI wrappers.
  src/features/auth/ contains auth actions, guards, role redirect.
  src/features/shared/ contains dashboard data queries and server actions.
  src/features/users/, properties/, bookings/, expenses/, payouts/, queries/, pnl/, dashboard/ contain TanStack table columns/wrappers.
  src/features/bookings/booking-calculations.ts contains simple booking form calculation helpers.
  src/features/payouts/payout-calculations.ts contains month revenue, expense, carry-forward, owner share, CMS share, and fixed TDS helpers.

src/lib/supabase/
  Supabase client factories:
  client.ts for browser client.
  server.ts for server components/actions.
  admin.ts for service role server-only usage.
  middleware.ts for session refresh helper used by proxy.ts.

src/lib/validators/
  Zod schemas for auth, contact, users, properties, bookings, expenses, and profile.

src/lib/constants/
  Navigation, roles, statuses, protected admin email.

src/lib/utils/
  Formatting, dates, money, permissions.

types/
  Database and app-level TypeScript types.

docs/
  Project documentation. This file is the master context file future agents should read first.

supabase/
  schema.sql reference schema.

reference/
  Provided mockup/prototype files. Do not delete. Excluded from ESLint because it uses browser-global React prototype code.
```

Note: there is no `src/components/` directory in the actual implementation; shared components are in top-level `components/`.

# 5. Routes and Access Rules

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Reference-style owner acquisition landing page | Public |
| `/login` | Email/password login and Google login | Public |
| `/signup` | Public signup; creates pending owner profile | Public |
| `/auth/callback` | Supabase OAuth/email callback | Public callback |
| `/pending-approval` | Pending account notice | Pending users / public |
| `/account-disabled` | Inactive account notice | Inactive users / public |
| `/api/contact` | Landing enquiry save/email route | Public POST |
| `/dashboard` | Admin overview | Active admin only |
| `/dashboard/users` | User management | Active admin only |
| `/dashboard/properties` | Property management | Active admin only |
| `/dashboard/bookings` | Booking management | Active admin only |
| `/dashboard/expenses` | Property/CMS expense management | Active admin only |
| `/dashboard/pnl` | Admin P&L view | Active admin only |
| `/dashboard/payouts` | Previous-month owner payout review, query status, and mark-paid actions | Active admin only |
| `/dashboard/queries` | Owner query resolution | Active admin only |
| `/dashboard/settings` | Dropdown settings | Active admin only |
| `/dashboard/profile` | Admin own profile | Active admin only |
| `/owner` | Owner overview | Active owner only |
| `/owner/property` | Owner property details | Active owner only |
| `/owner/bookings` | Owner bookings read-only | Active owner only |
| `/owner/expenses` | Owner property expenses read-only | Active owner only |
| `/owner/payout` | Owner payout review, approval, and payout query action | Active owner only |
| `/owner/queries` | Owner query create/view | Active owner only |
| `/owner/profile` | Owner own profile | Active owner only |

# 6. User Roles and Permissions

- Visitor:
  - Can view landing page.
  - Can use booking and WhatsApp CTAs.
  - Can login or signup.
- Pending user:
  - Is redirected to `/pending-approval`.
  - Cannot access admin or owner dashboard data.
- Inactive user:
  - Is redirected to `/account-disabled`.
  - Cannot access admin or owner dashboard data.
- Active admin:
  - Can view and manage users, properties, bookings, expenses, P&L, payouts, queries, settings, and own profile.
  - Can create CMS expenses and property expenses in same module.
  - Can resolve owner payout queries and mark approved/resolved payouts as paid.
  - Cannot manually edit fixed TDS from the UI.
  - Cannot delete protected admin `curatemystay@gmail.com`.
  - Protected admin delete button is hidden and action logic blocks deletion.
- Active owner:
  - Can view only their assigned property data.
  - Can view guest names and phone numbers for own bookings.
  - Can view property expenses for own property.
  - Cannot see CMS expenses.
  - Can view payout records for self.
  - Can approve ready-for-review payouts or raise linked payout queries during the 1st-5th review window.
  - Can create/view own simple queries.
  - Can edit only own profile fields: name, phone, avatar URL.
  - Cannot edit bookings, expenses, properties, users, settings, payout amounts, TDS, or delete anything.

# 7. Authentication Flow

- Login:
  - `components/forms/auth-form.tsx` posts to `loginAction`.
  - `loginAction` validates with `loginSchema`, signs in with Supabase, fetches profile, redirects by role/status.
- Signup:
  - Public signup is open.
  - `signupAction` validates with `signupSchema`.
  - Supabase Auth user is created.
  - Profile is upserted as `role = owner`, `status = pending`.
  - Public signup never creates admin.
- Google login:
  - `googleLoginAction` starts Supabase OAuth with redirect to `/auth/callback`.
- Callback:
  - `app/auth/callback/route.ts` exchanges code for session.
  - Fetches/creates safe fallback profile if needed.
  - Redirects using `roleRedirectPath`.
- Logout:
  - `logoutAction` signs out via Supabase and redirects to `/login`.
- Role/status:
  - `getCurrentProfile()` always reads profile from Supabase.
  - Role/status are not stored in localStorage.
  - `requireRole()` gates admin and owner layouts.

# 8. Supabase Schema Summary

## `profiles`

- Purpose: app profile linked to Supabase Auth user.
- Important fields: `id`, `email`, `name`, `phone`, `role`, `status`, `avatar_url`, `is_protected`.
- Relationships: `id` references `auth.users(id)`.
- Read/write:
  - Admin can manage profiles.
  - Owner can update own name/phone/avatar only.
- Security notes: RLS must prevent public/admin escalation and protect role/status/is_protected from owner edits.

## `properties`

- Purpose: property details and owner assignment.
- Important fields: `name`, `city`, `address`, `bedrooms`, `owner_id`, `owner_share`, `cms_share`, `status`.
- Relationships: `owner_id` references `profiles(id)`.
- Read/write:
  - Admin manages.
  - Owner reads only own assigned properties.
- Security notes: one property has one owner; owner/CMS share must total 100.

## `bookings`

- Purpose: booking and income records.
- Important fields: `property_id`, `guest_name`, `guest_phone`, `source`, `check_in`, `check_out`, `nights`, `guests`, `total_amount`, `status`.
- Relationships: `property_id` references `properties(id)`.
- Read/write:
  - Admin manages.
  - Owner reads bookings for own property, including guest name/phone.
- Security notes: owners cannot edit/delete.

## `expenses`

- Purpose: property and CMS/company expenses in one table.
- Important fields: `expense_for`, `property_id`, `date`, `category`, `amount`, `vendor`, `note`.
- Relationships: optional `property_id` references `properties(id)`.
- Read/write:
  - Admin manages property and CMS expenses.
  - Owner reads only `expense_for = property` rows for own property.
- Security notes: CMS rows must have `property_id = null`; owners must never see CMS expenses.

## `owner_payouts`

- Purpose: monthly owner payout review and reporting.
- Important fields: `property_id`, `owner_id`, `month`, revenue/expense/profit/share/TDS/final payout fields, `status`, `approved_at`, `paid_at`, `owner_note`.
- Relationships: `property_id` references `properties(id)`, `owner_id` references `profiles(id)`.
- Read/write:
  - Admin can view, resolve linked query state, and mark approved/resolved payouts paid.
  - Owner reads own payout rows and can approve/query ready-for-review payouts during the review window.
- Security notes: TDS is fixed at 10% of positive owner share in the application; admin does not manually edit it. The schema is unchanged, so `property_id` remains populated even for combined owner-month payout rows.
- Calculation notes:
  - Previous-month payouts are ensured when `/dashboard/payouts` or `/owner/payout` loads.
  - Month keys use `YYYY-MM`.
  - Booking revenue is prorated by stay nights inside the payout month, with check-in inclusive and check-out exclusive.
  - Revenue uses `nightly_rate`; if missing, it falls back to `total_amount / booking nights`.
  - Cancelled and blocked bookings are excluded.
  - Only property expenses in the month are deducted; CMS expenses are excluded from owner payouts.
  - Owners get one combined owner-month payout row; property-wise breakup is calculated live for display.
  - Prior negative owner-month results are carried forward and applied before owner/CMS/TDS split.
  - If adjusted profit is not positive, owner payout and TDS are zero and the negative amount carries forward.
  - If adjusted profit is positive, owner share percent is weighted by positive property net contributions; fixed 10% TDS is deducted from the owner share.
  - From the 1st through 5th, payouts are `ready_for_review`; after the 5th, untouched ready/draft payouts are auto-approved on page-load processing.
  - `cancelled`/`blocked` are booking statuses only and do not apply to payouts.

## `owner_queries`

- Purpose: simple owner query and payout query record.
- Important fields: `owner_id`, `property_id`, `payout_id`, `message`, `status`, `resolved`, `resolved_at`.
- Relationships: owner/profile, optional property, optional payout.
- Read/write:
  - Owner creates/views own queries.
  - Admin views and marks resolved.
- Security notes: no threaded conversation or advanced dispute flow. When admin resolves a query linked to a payout, the payout moves from `query_raised` to `resolved`; admin can then mark it paid.

## `settings`

- Purpose: configurable dropdown arrays.
- Important fields: `key`, `value`.
- Read/write:
  - Admin manages.
  - Owners generally do not need direct access.

## `contact_submissions`

- Purpose: landing page enquiry submissions.
- Important fields: `name`, `email`, `phone`, `message`, `source_page`.
- Read/write:
  - Public POST through `/api/contact`.
  - Insert uses service role when configured, otherwise normal server client fallback.
- Security notes: route validates with Zod and server-only Resend key.

# 9. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

APPS_SCRIPT_WEBHOOK_URL=
APPS_SCRIPT_SECRET=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_CONTACT_EMAIL=

NEXT_PUBLIC_CMS_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=
```

- `NEXT_PUBLIC_SUPABASE_URL`: browser-safe; used by browser/server clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: browser-safe; Supabase anon key, still protected by RLS.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only; never import into client code.
- `APPS_SCRIPT_WEBHOOK_URL`: server-only deployed Apps Script endpoint used to generate the owner pitch-deck PDF.
- `APPS_SCRIPT_SECRET`: server-only shared secret sent only to the Apps Script webhook.
- `NEXT_PUBLIC_SITE_URL`: browser-safe; used for auth redirect URLs.
- `RESEND_API_KEY`: server-only; used for contact and internal forecast-lead email.
- `RESEND_FROM_EMAIL`: server-only verified Resend sender used after `/api/owner-forecast/proposal` completes.
- `ADMIN_CONTACT_EMAIL`: safe but treated as server config; defaults to `curatemystay@gmail.com`.
- `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER`: browser-safe digits-only WhatsApp number used to build the result-screen follow-up link.

# 10. Supabase Client Usage

- Browser client: `src/lib/supabase/client.ts`
  - Uses `createBrowserClient`.
  - For client components if needed.
- Server client: `src/lib/supabase/server.ts`
  - Uses `createServerClient` and Next cookies.
  - Used by server components, server actions, route handlers.
- Admin/service role client: `src/lib/supabase/admin.ts`
  - Uses `createClient` from `@supabase/supabase-js`.
  - Server-only via `import "server-only"`.
  - Currently used by contact route when service role key exists.
- Session refresh helper: `src/lib/supabase/middleware.ts`
  - Used by root `proxy.ts`.
  - Next.js 16 calls this Proxy, not Middleware.

Warnings:

- Do not import `admin.ts` into client components.
- Do not use service role for normal dashboard reads.
- RLS must remain the primary data boundary.
- UI hiding is only convenience, not security.

# 11. Server Actions and API Routes

## Auth Actions

- `loginAction`: public; validates login and signs in.
- `signupAction`: public; creates pending owner profile.
- `googleLoginAction`: public; starts Supabase Google OAuth.
- `logoutAction`: authenticated; signs out.

## Shared Dashboard Actions

File: `src/features/shared/actions.ts`

- `saveProfileAction`: active user; updates own name/phone/avatar.
- `updateUserAction`: admin only; updates profile role/status/name/phone. Protected admin role/status stay admin/active.
- `deleteUserAction`: admin only; blocks protected admin deletion.
- `savePropertyAction`, `deletePropertyAction`: admin only.
- `saveBookingAction`, `deleteBookingAction`: admin only.
- `saveExpenseAction`, `deleteExpenseAction`: admin only. CMS expenses force `property_id = null`.
- `resolveQueryAction`: admin only. If the query is linked to a payout, resolving it moves the payout from `query_raised` to `resolved`.
- `createOwnerQueryAction`: owner only.
- `saveSettingsAction`: admin only.

## Payout Actions

File: `src/features/payouts/payout-actions.ts`

- `ensureAdminPayoutsForPreviousMonth`: admin only; creates/recalculates previous-month payout rows on `/dashboard/payouts` page load.
- `ensureOwnerPayoutForPreviousMonth`: owner only; creates/recalculates that owner's previous-month payout row on `/owner/payout` page load.
- `approveOwnerPayoutAction`: owner only; approves the owner's own `ready_for_review` payout during the 1st-5th review window.
- `raisePayoutQueryAction`: owner only; creates a linked owner query and moves the payout to `query_raised` during the review window.
- `markPayoutPaidAction`: admin only; marks only `approved` or `resolved` payouts as paid.

## API Routes

- `app/api/contact/route.ts`
  - Public POST.
  - Validates via `contactSchema`.
  - Saves to `contact_submissions`.
  - Sends email through Resend when `RESEND_API_KEY` exists.
- `app/api/owner-forecast/route.ts`
  - Public POST for the three-step owner revenue funnel.
  - Validates with `ownerForecastSchema`, calculates through the pure shared calculator, and saves the lead to `contact_submissions` with `source_page = owner_revenue_calculator`.
  - Returns the forecast without waiting for Apps Script and does not send email.
- `app/api/owner-forecast/proposal/route.ts`
  - Public POST used after the forecast is visible.
  - Revalidates the same payload, recalculates the forecast server-side, and calls Apps Script to generate the custom PDF.
  - Sends one internal CurateMyStay email only after pitch-deck generation finishes. Successful emails include view/download links; failed attempts are marked unavailable.
  - Returns safe PDF links on success or a generic temporary-unavailability response on failure. It never exposes raw Apps Script or email errors.
  - Never emails the prospective owner.

# 12. UI and Styling System

- Visual target: `reference/` dashboard mockup.
- Public homepage target: `reference/index.html`; keep the Next.js version visually close while using Tailwind utilities and simple React state.
- Styling approach:
  - Tailwind-first for page layouts and components.
  - Small global CSS only for theme variables and reusable primitive classes.
  - No CSS-in-JS.
  - No large copied reference CSS.
- Data tables:
  - `components/ui/data-table.tsx` is the shared TanStack Table client component.
  - Listed admin/owner data routes use feature-local column files instead of route-local `<table>` markup.
  - Dashboard overview property performance uses TanStack with search/pagination hidden to keep the reference-style compact look.
  - Booking list tables use property dropdown filters instead of generic search.
  - Admin booking filter options come from active properties already fetched for the admin page.
  - Owner booking filter options come only from owner-scoped `getOwnerData()` properties and are hidden when only one owner property is available.
- Homepage:
  - `/` uses `components/home/reference-home.tsx` and local images under `public/homepage/`.
  - `/` is intentionally static and no longer fetches the current Supabase profile before rendering.
  - `proxy.ts` skips only `/` so the public homepage can load without Supabase session refresh; protected dashboard/owner/auth routes still use the normal guards and proxy flow.
  - The custom Supabase contact form was removed from the homepage in favor of the reference-style booking modal, calendar link, WhatsApp CTA, proof sections, and ROI calculator.
  - The hero uses a timed fading photo carousel with clickable dots, matching the behavior in `reference/index.html`.
  - The owner forecast funnel follows the reference three-step visual flow, posts to `/api/owner-forecast`, and displays only server-returned annual revenue, 15% operating cost, and net profit.
  - `src/features/owner-forecast/forecast-calculator.ts` is the single authoritative calculator. It applies the specified seasonal rate midpoints, location rate/occupancy modifiers, Panjim beach floor, pool uplift/occupancy rules, area bands, capped amenity multiplier, monthly occupancy clamp, and 15% operating cost.
  - Furnishing and current-rental status do not alter revenue. Furnishing produces only a setup-investment/launch-time note.
  - The forecast renders before pitch-deck generation begins. The download action shows generating, ready, or temporarily unavailable while the forecast remains visible, and becomes active only when `pdfDownloadUrl` is returned.
  - The result can download the Apps Script PDF and open a prefilled WhatsApp message. It contains no owner share, CMS share, TDS, payout, fixed split, or long-term-rental comparison.
  - `/api/contact` and the reusable contact form component still exist for future use, but are not the current homepage workflow.
- Booking form conveniences:
  - `components/forms/booking-form.tsx` auto-calculates nights from check-in/check-out.
  - It auto-calculates total amount from nights x nightly rate.
  - It auto-calculates nightly rate from total amount / nights.
  - It auto-calculates status from booking dates unless admin marks the row cancelled or blocked.
  - Nights, nightly rate, and total amount remain manually editable.
  - Manual selection of upcoming/in-house/checked-out is removed; cancelled/blocked remain admin overrides.
  - Cleaning/housekeeping fields are removed from the UI, but the database schema is unchanged.
  - Admin booking table actions include an edit pencil linking to `/dashboard/bookings?edit=<id>`, which loads the existing booking into the same form.
- Payout workflow:
  - `/dashboard/payouts` and `/owner/payout` automatically ensure the previous calendar month's owner payout.
  - Admin payout table shows combined owner payout rows, fixed 10% TDS, query status, and mark-paid action for approved/resolved payouts.
  - Payout detail cards show property-wise revenue, property expenses, net profit, owner share percent, and CMS share percent.
  - Owner payout page shows the current payout summary, review actions during the 1st-5th window, property-wise breakup, and payout history.
  - Owner payout UI hides internal paid/auto-approval notes; owner-facing `paid` status displays as `Approved`.
  - Owner payout UI shows previous carry-forward only when it is negative.
  - Owner payout UI shows property-wise breakup only when the owner has multiple properties.
  - Owner payout record table hides search; admin payout table keeps search.
  - Owner payout table imports must stay owner-only; admin mark-paid columns/actions live in `src/features/payouts/admin-payout-columns.tsx` and `admin-payouts-table.tsx`.
  - Owner overview statement card uses the generated previous-month `owner_payouts` row and shared payout helpers; do not calculate owner share, CMS share, TDS, or final payout separately in `app/owner/page.tsx`.
  - Payout amounts and TDS are not manually editable in the UI.
- Theme tokens:
  - Defined in `app/globals.css`.
  - Important colors: `--background`, `--surface`, `--surface-2`, `--border`, `--foreground`, `--muted`, `--brand`, `--brand-soft`, `--green`, `--amber`, `--teal`.
- Dashboard shell:
  - `components/layout/dashboard-shell.tsx`
  - `components/layout/sidebar.tsx`
  - `components/layout/topbar.tsx`
- Current visual match work:
  - `/dashboard` mirrors reference admin overview: compact header, 4 KPIs, property performance table, occupancy bars, upcoming check-ins.
  - `/owner` mirrors reference owner portal: greeting, property chips, 5 KPI hero, statement, side lists, query banner/table.
- Prefer Tailwind utilities directly in route pages when it makes the mockup easier to edit.
- Avoid complex design system abstractions.

# 13. Current Feature Status

Implemented:

- Reference-style public landing page
- End-to-end owner forecast lead/PDF/internal-email funnel
- Contact enquiry API/reusable form component
- `/api/contact`
- Email/password login
- Public signup as pending owner
- Google OAuth action and callback route
- Logout
- Pending approval screen
- Inactive account screen
- Admin dashboard shell
- Owner dashboard shell
- Admin overview
- Admin users management
- Admin properties management
- Admin bookings management
- Admin expenses management
- Admin P&L
- Admin payouts final Phase 1 flow
- Admin query resolution
- Admin settings
- Admin profile
- Owner overview
- Owner property read-only
- Owner bookings read-only
- Owner expenses read-only
- Owner payout review/approval/query
- Owner query create/view
- Owner profile edit
- Supabase schema docs and SQL reference

Partial / Placeholder:

- Owner queries are simple create/view and admin mark-resolved only.
- Settings editing is simple newline-to-array JSON.
- Forms are simple server-action forms; not all admin rows have edit modals yet.
- Booking form calculations are convenience-only; submitted values still flow through `bookingSchema` and `saveBookingAction`.
- Booking status is calculated from dates in both the booking form and server action; stored cancelled/blocked values override the calculated status.
- Payout processing runs on payout page load; a scheduled cron/job is still a later enhancement.

Not implemented / Later:

- Booking calendar
- Forma Sheet
- Budgeting
- Receipt/image upload
- Airbnb/Booking.com sync
- Razorpay/payment integration
- WhatsApp automation
- Advanced disputes
- Automated owner statements/PDFs
- Scheduled payout processing jobs
- Advanced analytics

# 14. Known Limitations

- Payout creation/auto-approval currently happens when payout pages load; there is no background scheduler yet.
- Owner payout statements/PDF exports are not implemented.
- Existing historical manual payout rows, if any, may need admin cleanup before relying on carry-forward totals.
- Owner query/dispute system is intentionally basic.
- No receipt upload in Phase 1.
- RLS policies are documented/required but must be applied in Supabase separately.
- The app depends on correct Supabase env variables and configured auth providers.
- Owner pitch-deck download requires configured `APPS_SCRIPT_WEBHOOK_URL` and `APPS_SCRIPT_SECRET`; forecast results render first and remain available when the webhook is unavailable.
- Apps Script proposal generation can take longer than 30 seconds. The proposal helper intentionally does not apply a shorter local abort timeout, allowing the route/platform request lifecycle to receive the completed PDF response.
- Internal forecast-lead delivery requires `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`. No email is sent to the prospective owner.
- Forecast lead storage requires a real Supabase service-role/secret key when anonymous `contact_submissions` inserts are blocked by RLS. A publishable key in `SUPABASE_SERVICE_ROLE_KEY` is invalid and the route deliberately will not treat it as admin credentials.
- Git status may fail in this environment due to dubious ownership/safe-directory settings.
- Hidden background dev server launch had issues on this Windows environment, but foreground `node node_modules\next\dist\bin\next dev -p 3000` works.
- `reference/` prototype is not production code and is excluded from ESLint.
- Do not rename `.next` to another folder inside the repository unless that folder is ignored. Tailwind v4 automatic source discovery can scan stale generated CSS and emit malformed utilities. The repo ignores `/.next-stale-*/` as a safeguard.

# 15. Security Notes

- RLS is required and is the main security boundary.
- UI hiding is not sufficient.
- Server actions re-check role using `requireRole()`.
- Protected admin deletion is blocked in `deleteUserAction`.
- Owners are scoped to their own property IDs in `getOwnerData()`.
- Owners cannot see CMS expenses because owner reads filter to `expense_for = property`.
- Booking property dropdown filters are only UI convenience; Supabase/RLS and server-side owner scoping remain the data boundary.
- Payout page filters/actions are only UI convenience; owner payout reads are scoped by server-side owner queries and RLS.
- Owner payout approve/query actions re-check role, owner ownership, `ready_for_review` status, and review window server-side.
- Admin mark-paid re-checks admin role and only allows `approved` or `resolved` payouts.
- Fixed TDS is calculated server-side in payout actions and is not editable by admin forms.
- Service role client is server-only.
- Resend key is server-only.
- Role/status must come from Supabase `profiles`, not localStorage.
- Public signup always creates pending owner profile.
- Public signup must never create admin.

# 16. Common Development Tasks

## Add a dashboard page

1. Create `app/dashboard/new-page/page.tsx`.
2. Add nav item in `src/lib/constants/nav.ts`.
3. Fetch data through direct Supabase server client or simple helper in `src/features/shared/data.ts`.
4. Re-check admin role in server action if mutation is added.
5. Update this file and `docs/ROUTES_AND_PERMISSIONS.md`.

## Add an owner-facing page

1. Create `app/owner/new-page/page.tsx`.
2. Add nav item in `src/lib/constants/nav.ts`.
3. Use `getOwnerData()` or owner-scoped Supabase query.
4. Do not expose other owners or CMS expenses.
5. Update docs.

## Add a nav item

Edit `src/lib/constants/nav.ts`. Use Lucide icons. Keep labels short.

## Add a table column

Edit the relevant `src/features/*/*-columns.tsx` file. Keep route pages focused on direct data reads and small serializable row-shaping only. Use `components/ui/data-table.tsx` for sortable/searchable/paginated tables, and keep overview summary lists simple when a full table would hurt the reference layout.

## Add a form field

1. Add field to form component or page form.
2. Add validation in relevant `src/lib/validators/*`.
3. Add action payload handling in `src/features/shared/actions.ts`.
4. Confirm schema supports the field.

## Add a setting/dropdown

1. Add key in settings form in `components/forms/admin-forms.tsx`.
2. Store as JSON array using `saveSettingsAction`.
3. Use from `settings` table where needed.

## Modify theme colors

Edit CSS variables in `app/globals.css`. Keep colors centralized. Prefer Tailwind utilities using variables.

## Add later feature placeholder

Only add placeholders if requested. Keep them disabled/read-only and document that the feature is later.

# 17. Testing Checklist

- [ ] Landing page loads and booking CTA opens the reference-style modal.
- [ ] Login works.
- [ ] Signup creates pending owner.
- [ ] Google login works after Supabase provider setup.
- [ ] Pending user redirects to `/pending-approval`.
- [ ] Inactive user redirects to `/account-disabled`.
- [ ] Admin can access `/dashboard`.
- [ ] Owner cannot access `/dashboard`.
- [ ] Owner can access `/owner`.
- [ ] Admin cannot delete protected admin.
- [ ] Admin can manage users.
- [ ] Admin can manage properties.
- [ ] Admin can manage bookings.
- [ ] Admin can manage expenses.
- [ ] Admin can create CMS expenses.
- [ ] Owner sees own property only.
- [ ] Owner sees own bookings and guest phone numbers.
- [ ] Owner sees own property expenses only.
- [ ] Owner cannot see CMS expenses.
- [ ] Previous-month payouts are created on admin/owner payout page load.
- [ ] Owner can approve a ready-for-review payout from the 1st through 5th.
- [ ] Owner can raise a linked payout query from the 1st through 5th.
- [ ] Untouched payouts auto-approve after the 5th.
- [ ] Admin can resolve linked payout queries and then mark resolved payouts paid.
- [ ] Fixed 10% TDS appears only when owner share is positive and is not manually editable.
- [ ] Owner can create a simple query.
- [ ] Admin can mark query resolved.
- [ ] Owner can edit own profile only.
- [ ] Public booking/WhatsApp CTAs point to the expected destinations.
- [ ] Owner forecast rejects invalid category/configuration, area, contact, and enum values server-side.
- [ ] Owner forecast annual totals equal the sum of April-March monthly rows.
- [ ] Owner forecast saves `contact_submissions` with source `owner_revenue_calculator`.
- [ ] Forecast submission returns the forecast without waiting for Apps Script.
- [ ] Proposal generation success enables the PDF download; failure leaves the forecast visible and disables the button with a safe message.
- [ ] Internal forecast email is sent to CurateMyStay only after proposal generation and includes final PDF links or failed/unavailable status.
- [ ] Forecast result contains revenue, 15% operating cost, and net profit only.
- [ ] Contact API still validates/saves if reused later.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

Last verified by Codex on 2026-06-13:

- `npm run lint` passed.
- `npm run build` passed.
- Local unauthenticated requests to `/dashboard` and `/owner` redirected to `/login`.

# 18. Latest Change Log

Date: 2026-06-13  
Change: Initial MVP build with landing page, auth, admin routes, owner routes, Supabase clients/actions, docs, and SQL schema.  
Files touched: `app/*`, `components/*`, `src/*`, `types/*`, `docs/*`, `supabase/schema.sql`, `.env.example`, `proxy.ts`.  
Reason: Build CurateMyStay Phase 1 property management website.  
Security impact: Added role guards, server-action role checks, service-role isolation, protected admin delete block, and RLS assumptions.  
Follow-up needed: Apply RLS policies in Supabase and configure real env variables/providers.

Date: 2026-06-13  
Change: Reworked `/owner` to closely match the reference owner portal using Tailwind utilities.  
Files touched: `app/owner/page.tsx`.  
Reason: User requested owner dashboard to visually match mockup.  
Security impact: No permission change; owner data remains scoped via `getOwnerData()`.  
Follow-up needed: Visual QA with real owner data.

Date: 2026-06-13  
Change: Reworked `/dashboard` to closely match the reference admin overview using Tailwind utilities.  
Files touched: `app/dashboard/page.tsx`.  
Reason: User requested admin dashboard to visually match mockup.  
Security impact: No permission change; admin route remains guarded by layout.  
Follow-up needed: Visual QA with real property/booking/expense data.

Date: 2026-06-13  
Change: Removed `next/font/google` and switched to a system/Figtree-style font stack.  
Files touched: `app/layout.tsx`, `app/globals.css`.  
Reason: Fix runtime `adapterFn is not a function` error path and keep dashboard typography close to reference.  
Security impact: None.  
Follow-up needed: Restart dev server and hard refresh browser after this change.

Date: 2026-06-13  
Change: Created master AI/developer context document.  
Files touched: `docs/AI_PROJECT_CONTEXT.md`.  
Reason: New global documentation rule requires this file before/after meaningful changes.  
Security impact: Documents existing security assumptions and guardrails.  
Follow-up needed: Future agents must read this file before editing and update it after meaningful changes.

Date: 2026-06-13  
Change: Converted admin and owner dashboard data tables to TanStack Table with feature-local column files and simple client wrappers.  
Files touched: `package.json`, `package-lock.json`, `components/ui/data-table.tsx`, `src/features/*/*-columns.tsx`, `src/features/*/*-table.tsx`, `app/dashboard/*/page.tsx`, `app/owner/*/page.tsx`, `docs/*`.  
Reason: User requested dashboard tables to use TanStack Table while preserving simple Supabase reads/actions and Tailwind-first styling.  
Security impact: No permission changes; route guards, owner scoping, protected admin delete blocking, and server-action role checks remain in place.  
Follow-up needed: Visual QA with real data in authenticated admin and owner sessions.

Date: 2026-06-14  
Change: Added booking form auto-calculations for nights, total amount, and nightly rate while keeping those fields manually editable.  
Files touched: `components/forms/booking-form.tsx`, `components/forms/admin-forms.tsx`, `app/dashboard/bookings/page.tsx`, `src/features/bookings/booking-calculations.ts`, `docs/*`.  
Reason: Improve booking form convenience without changing schema, permissions, or booking business logic.  
Security impact: None; admin-only booking action and existing validation remain in place.  
Follow-up needed: Authenticated browser QA for the booking form interactions.

Date: 2026-06-14  
Change: Refined booking workflow with automatic date-based status, cancelled/blocked admin overrides, and removed cleaning UI.  
Files touched: `components/forms/booking-form.tsx`, `components/forms/admin-forms.tsx`, `src/features/bookings/booking-calculations.ts`, `src/features/bookings/booking-columns.tsx`, `src/features/shared/actions.ts`, `src/lib/validators/bookings.ts`, `app/dashboard/page.tsx`, `docs/*`.  
Reason: Simplify Phase 1 booking workflow and remove unused housekeeping complexity while keeping schema unchanged.  
Security impact: None; booking mutations remain admin-only and server action recalculates status before persistence.  
Follow-up needed: Authenticated browser QA for calculated status preview and cancelled/blocked overrides.

Date: 2026-06-14  
Change: Stabilized booking form amount auto-calculation handlers so nights, nightly rate, and total amount recalculate from the latest typed values.  
Files touched: `components/forms/booking-form.tsx`, `docs/*`.  
Reason: Restore the booking form convenience calculations after the status workflow refinement.  
Security impact: None; no schema, permission, or server-action access changes.  
Follow-up needed: Authenticated browser QA for check-in/check-out, nights, nightly rate, and total amount interactions.

Date: 2026-06-14  
Change: Replaced booking list generic search with property dropdown filtering for admin and multi-property owner views.  
Files touched: `src/features/bookings/bookings-table.tsx`, `app/dashboard/bookings/page.tsx`, `app/owner/bookings/page.tsx`, `docs/*`.  
Reason: Make booking list filtering match the property-management workflow instead of generic text search.  
Security impact: No permission change; admin still receives admin data, and owner options still come only from owner-scoped server data/RLS.  
Follow-up needed: Authenticated browser QA for admin property filtering and owner single-property hidden filter behavior.

Date: 2026-06-14  
Change: Added admin booking edit pencil action that loads the selected booking into the existing booking form.  
Files touched: `src/features/bookings/booking-columns.tsx`, `app/dashboard/bookings/page.tsx`, `docs/*`.  
Reason: Allow admins to edit bookings from the booking table without introducing a new route or modal.  
Security impact: No permission change; edit still submits through the existing admin-only `saveBookingAction`.  
Follow-up needed: Authenticated browser QA for pencil action, edit form population, and update submission.

Date: 2026-06-14  
Change: Rebuilt the public homepage to visually follow `reference/homepage.html` using Tailwind utilities and extracted reference photos into public assets.  
Files touched: `app/page.tsx`, `public/homepage/*`, `docs/*`.  
Reason: User requested the Next.js homepage to match the supplied reference homepage design as closely as practical while keeping the implementation editable.  
Security impact: None; auth-aware dashboard/login/signup links and the existing contact form remain in place.  
Follow-up needed: Browser visual QA against the reference when the local browser tooling/dev server is available.

Date: 2026-06-14  
Change: Refined homepage button styles to more closely match the reference homepage button component.  
Files touched: `app/page.tsx`, `docs/*`.  
Reason: User requested homepage buttons to look more like the supplied reference.  
Security impact: None; links and form behavior are unchanged.  
Follow-up needed: Browser visual QA when local browser tooling is available.

Date: 2026-06-14  
Change: Fixed homepage button contrast so white buttons explicitly render dark text and dark/primary buttons explicitly render white text.  
Files touched: `app/page.tsx`, `components/ui/button.tsx`, `docs/*`.  
Reason: User reported a white button with white text on the homepage.  
Security impact: None; styling-only change.  
Follow-up needed: Browser visual QA when local browser tooling is available.

Date: 2026-06-14  
Change: Implemented the final Phase 1 owner payout flow with page-load previous-month payout generation, review-window owner approval/query actions, after-window auto-approval, fixed 10% TDS, carry-forward loss handling, property-wise breakup display, linked query resolution, and admin mark-paid action.  
Files touched: `app/dashboard/payouts/page.tsx`, `app/owner/payout/page.tsx`, `app/dashboard/pnl/page.tsx`, `app/owner/page.tsx`, `src/features/payouts/*`, `src/features/shared/actions.ts`, `src/lib/utils/dates.ts`, `components/forms/admin-forms.tsx`, `docs/*`.  
Reason: User requested the final owner payout business flow without changing database schema or permissions.  
Security impact: Owner payout actions re-check owner role, payout ownership, status, and review window; admin mark-paid remains admin-only; TDS is server-calculated and no longer manually edited in the UI.  
Follow-up needed: Add a scheduled payout job later if page-load processing is not enough for production operations.

Date: 2026-06-15  
Change: Fixed the owner dashboard statement card to use the generated previous-month payout record and shared payout helpers instead of local placeholder payout math.  
Files touched: `app/owner/page.tsx`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Owner dashboard showed impossible payout rows where positive profit displayed zero owner share, CMS share, TDS, and net payable.  
Security impact: No permission or schema changes; owner data remains scoped through existing owner page guards and payout generation still runs through owner-only server logic.  
Follow-up needed: Authenticated browser QA with a real owner payout row.

Date: 2026-06-15  
Change: Cleaned owner payout UI by hiding internal paid/auto-approval notes, mapping owner-facing paid status to Approved, hiding non-negative previous carry-forward, and showing property-wise breakup only for multi-property owners.  
Files touched: `app/owner/payout/page.tsx`, `app/owner/page.tsx`, `src/features/payouts/payout-columns.tsx`, `src/features/payouts/payouts-table.tsx`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Owner payout page needed a cleaner owner-facing presentation without exposing internal workflow details.  
Security impact: No permission, schema, or calculation changes; admin paid workflow remains intact.  
Follow-up needed: Authenticated browser QA for one-property and multi-property owner payout views.

Date: 2026-06-15  
Change: Removed the search input from the owner payout record table while keeping admin payout search available.  
Files touched: `src/features/payouts/payouts-table.tsx`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: User requested no search payout option on the owner dashboard.  
Security impact: None; display-only table option change.  
Follow-up needed: Visual QA on `/owner/payout`.

Date: 2026-06-15  
Change: Split admin payout columns/table into admin-only files so owner payout pages no longer import the admin mark-paid server action through their client table module, and fixed the owner search removal placement.  
Files touched: `src/features/payouts/payout-columns.tsx`, `src/features/payouts/payouts-table.tsx`, `src/features/payouts/admin-payout-columns.tsx`, `src/features/payouts/admin-payouts-table.tsx`, `app/dashboard/payouts/page.tsx`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: `/owner/payout` was throwing `adapterFn is not a function`, and the previous search removal patch had hidden admin search instead of owner search.  
Security impact: No permission or schema changes; admin mark-paid action remains admin-only and is no longer imported by the owner payout table path.  
Follow-up needed: Restart the local Next dev server if it is still serving the stale broken bundle.

Date: 2026-06-19  
Change: Rebuilt `/` from `reference/index.html` as a dedicated Tailwind-first client component and removed the custom Supabase enquiry form from the homepage.  
Files touched: `app/page.tsx`, `components/home/reference-home.tsx`, `public/homepage/*`, `docs/*`.  
Reason: User requested the homepage to visually match `reference/index.html` as closely as practical while keeping the code editable with Tailwind.  
Security impact: No permission, schema, auth, dashboard, or payout workflow changes.  
Follow-up needed: Browser visual QA against `reference/index.html` after starting the local dev server.

Date: 2026-06-20  
Change: Refined the homepage reference match by restoring the timed hero carousel, forcing reference button text colors, matching heading scale, rebuilding the ROI calculator as a three-step forecast form, tightening service icon/card styling, fixing case-study image grid overflow, and making `/` static by removing homepage auth/profile fetching.  
Files touched: `app/page.tsx`, `components/home/reference-home.tsx`, `proxy.ts`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: User reported broken homepage layout, non-working carousel, incorrect button/icon/typography styling, and a mismatched forecast form.  
Security impact: No dashboard/owner permission changes; only the public `/` route skips proxy session refresh. Protected routes still use route layouts and server-side role guards.  
Follow-up needed: Visual QA in a normal browser session with Supabase network access.

Date: 2026-06-20  
Change: Recovered homepage styling after a renamed stale `.next` directory was scanned by Tailwind and generated malformed CSS utilities. Stopped only stale repo dev/build workers, removed generated caches, and added `/.next-stale-*/` to `.gitignore`.  
Files touched: `.gitignore`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: The homepage returned CSS parser errors and appeared unstyled/corrupted despite valid source styles.  
Security impact: None.  
Follow-up needed: None; avoid keeping unignored generated Next caches inside the repository.

Date: 2026-06-20  
Change: Implemented the end-to-end owner forecast funnel with an exact shared revenue calculator, server validation, Supabase lead storage, Apps Script PDF generation, internal Resend email, downloadable pitch deck, and WhatsApp follow-up. Removed client mock math and all forecast owner-share/commercial-split outputs.  
Files touched: `components/home/reference-home.tsx`, `src/features/owner-forecast/forecast-calculator.ts`, `src/lib/validators/owner-forecast.ts`, `app/api/owner-forecast/route.ts`, `.env.example`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Build the production owner lead funnel using the supplied exact calculator and delivery workflow.  
Security impact: Calculator authority and Zod validation are server-side; Supabase service key, Apps Script secret, and Resend key remain server-only.  
Follow-up needed: Configure Apps Script, verified Resend sender, and WhatsApp environment values in deployment.

Date: 2026-06-20  
Change: Split owner forecast submission from pitch-deck generation so the forecast renders immediately and the PDF is generated through a background client request with clear generating, ready, and unavailable states.  
Files touched: `components/home/reference-home.tsx`, `app/api/owner-forecast/route.ts`, `app/api/owner-forecast/proposal/route.ts`, `src/features/owner-forecast/proposal-generator.ts`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Apps Script generation should not block the owner from seeing their forecast.  
Security impact: Both endpoints validate and calculate server-side; Apps Script credentials remain server-only and no owner email was introduced.  
Follow-up needed: Complete an end-to-end submission with valid Supabase service-role, Apps Script, and Resend deployment credentials.

Date: 2026-06-20  
Change: Fixed the asynchronous owner forecast completion flow so proposal success is explicit, the download button activates only for a returned `pdfDownloadUrl`, and the admin email is sent after generation with final view/download links or failure status.  
Files touched: `components/home/reference-home.tsx`, `app/api/owner-forecast/route.ts`, `app/api/owner-forecast/proposal/route.ts`, `src/features/owner-forecast/proposal-generator.ts`, `src/features/owner-forecast/forecast-email.ts`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Successful decks were appearing unavailable and admin notifications were sent before PDF links existed.  
Security impact: Apps Script, Resend, and Supabase secrets remain server-only; no owner email was added.  
Follow-up needed: End-to-end production credential test for Apps Script generation and Resend delivery.

Date: 2026-06-20  
Change: Fixed successful owner pitch decks being shown as unavailable by removing the proposal helper's premature 30-second abort. Verified the live Apps Script returns flat JSON with `ok`, `pdfViewUrl`, and `pdfDownloadUrl`, and that the proposal route returns the normalized ready response.  
Files touched: `src/features/owner-forecast/proposal-generator.ts`, `docs/CHANGELOG.md`, `docs/AI_PROJECT_CONTEXT.md`.  
Reason: Apps Script could finish Drive PDF creation at or after the helper timeout, causing the browser to receive a false failure despite a valid generated file.  
Security impact: No calculator, permission, schema, or credential exposure changes; temporary response logs were removed.  
Follow-up needed: None.
