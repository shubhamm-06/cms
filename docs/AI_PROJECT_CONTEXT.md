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
  Next.js routes, layouts, pages, and public route handlers.

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

## Route Map

| Area | Active routes |
| --- | --- |
| Public | `/`, `/login`, `/signup`, `/auth/callback`, `/pending-approval`, `/account-disabled` |
| Public API | `/api/contact`, `/api/owner-forecast`, `/api/owner-forecast/proposal` |
| Admin | `/dashboard`, `/dashboard/users`, `/dashboard/properties`, `/dashboard/bookings`, `/dashboard/expenses`, `/dashboard/pnl`, `/dashboard/payouts`, `/dashboard/queries`, `/dashboard/settings`, `/dashboard/profile` |
| Owner | `/owner`, `/owner/property`, `/owner/bookings`, `/owner/expenses`, `/owner/payout`, `/owner/queries`, `/owner/profile` |

See [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md) for purpose and security notes.

## Roles and Permissions

### Visitor

- Views homepage and submits contact/forecast requests.
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

`proxy.ts` refreshes Supabase sessions for matched routes. The public `/` route alone skips session refresh to remain a static acquisition page. If Supabase reports `refresh_token_not_found`, the proxy clears stale `sb-*` auth cookies from the forwarded request and response so expired local browser sessions do not crash or spam the production server.

## Supabase Clients

| Client | File | Use |
| --- | --- | --- |
| Browser | `src/lib/supabase/client.ts` | Client components when needed |
| Authenticated server | `src/lib/supabase/server.ts` | Server components, route handlers, server actions |
| Service role | `src/lib/supabase/admin.ts` | Server-only public lead inserts when configured |
| Session refresh | `src/lib/supabase/middleware.ts` | Called by root `proxy.ts` |

Normal dashboard reads use the authenticated server client, not service role. Owner reads are explicitly filtered in `getOwnerData()`.

## Security Boundaries

- RLS is the required primary database boundary.
- `supabase/schema.sql` enables RLS on every table but contains no policy definitions. Deployed policies must be created and verified separately.
- UI hiding is convenience only; role actions and payout actions re-check server-side.
- Service-role, Apps Script, and Resend credentials are server-only.
- Public signup cannot create admin.
- Protected-admin checks use `is_protected` or the configured protected address.
- Owner property/query/payout actions verify ownership before writes.
- CMS expenses are excluded from owner queries and payout calculations.

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
| `NEXT_PUBLIC_CMS_WHATSAPP_NUMBER` | Browser-safe | Public WhatsApp link number |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe | Auth callback/site origin |
| `NEXT_PUBLIC_GTM_ID` | Browser-safe | Google Tag Manager container ID for global analytics base loading |

Use blank placeholders from `.env.example`. Deployment steps are in [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md).

Global analytics is limited to the GTM base integration in `app/layout.tsx`. When `NEXT_PUBLIC_GTM_ID` is unset, no GTM script or noscript iframe renders. GA4 and event tracking are managed inside GTM, not directly in the application code.

Homepage funnel event tracking uses `src/lib/analytics.ts` to push non-PII objects to `window.dataLayer`. The helper no-ops during SSR, does not call `gtag`, does not include analytics IDs, and strips `undefined` values. The public homepage tracks calendar clicks, WhatsApp clicks, forecast-form open/start, successful lead generation, pitch-deck ready state, and pitch-deck downloads. The primary conversion is `generate_lead`, fired only after `/api/owner-forecast` succeeds and the forecast is accepted/displayed. See [Analytics Tracking](./ANALYTICS.md).

## Homepage and Forecast Funnel

- `/` renders `components/home/reference-home.tsx`, and `reference/index.html` is the visual source of truth for the owner landing page.
- The homepage is maintained as a Tailwind-first Next.js translation of `reference/index.html` with local assets rather than a separate HTML implementation.
- Homepage typography is normalized with scoped `next/font/google` Figtree loading for the public landing page so the reference hierarchy is preserved without changing dashboard typography.
- Header and footer both use `public/logo.png` as the official logo mark with `object-contain`; the header no longer adds an extra "For Property Owners" subtitle.
- Header and mobile navigation use `Book a call` for the external calendar CTA and keep `Dashboard` linked to `/dashboard`.
- The page includes a timed hero carousel, responsive hamburger menu, service/proof sections, booking modal, WhatsApp links, and three-step owner forecast.
- The proof section uses the reference portfolio metrics, the Panjim and Varca case studies, static first-month-normalized revenue ramp charts, and the approved testimonial copy rendered with placeholder initial avatars instead of profile photos.
- The FAQ restores all ten approved questions/answers as a two-column accessible accordion with one open item at a time.
- The old standalone transparency section is removed from the page flow; its approved transparency/control/investment content now lives inside the bottom `More about how we work` accordion.
- The partnership section uses the reference `Signature`, `Curated`, and `Bespoke` cards, with `Curated` visually featured as `Most Chosen`.
- Testimonial avatars stay as initials, while the team/about section and final CTA use the existing local `public/homepage/founder.jpg` and `public/homepage/aravind.jpg` assets.
- Initial submission calls `/api/owner-forecast`; server validates, calculates, stores the lead, and returns forecast without waiting for a deck.
- The browser immediately displays annual revenue, 15% operating cost, and net profit.
- It then calls `/api/owner-forecast/proposal` in the background.
- Proposal API recalculates server-side, calls Apps Script, sends the admin email after the generation attempt, and returns normalized URLs.
- Download becomes ready only when HTTP succeeds, `result.ok === true`, and `pdfDownloadUrl` exists.
- Owner receives a link-only email only after successful PDF generation. Email failure does not invalidate a successful deck.
- No owner/CMS split, TDS, payout, or fixed commercial terms are shown in the public funnel.
- Dashboard routes, auth, APIs, Supabase access, and backend business logic are untouched by homepage-only visual/content passes.

Exact formulas: [Owner Forecast Calculator](./OWNER_FORECAST_CALCULATOR.md). HTTP shapes: [API Contracts](./API_CONTRACTS.md).

## Booking Workflow

- Admin create/edit uses one form and direct server action.
- Dates auto-calculate nights; nights/rates auto-calculate total or rate according to the last amount edited. All remain manually editable.
- Check-out before check-in is rejected.
- Status is calculated server-side: upcoming before check-in, in-house through the day before check-out, checked-out on/after check-out.
- Current form submits no manual status override. Cancelled/blocked remain recognized in schema and revenue logic.
- Booking source and concierge options come from settings.
- Admin booking form UI groups guest/property, dates, amount helpers, calculated status, and full-width notes while preserving the same server-action field names and local calculation helpers.
- Booking create/update/delete redirects use booking-only notice codes: `booking_created`, `booking_updated`, and `booking_deleted`; the page toast removes the notice from the URL after display.
- Admin booking deletion is confirmed with an AlertDialog that names the guest and property before submitting the existing delete action.
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
- Payable records are for the previous completed calendar month and are ensured on payout-page load.
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
- Users: approve/change roles/status; protected admin remains active/admin and undeletable. `/dashboard/users` shows status/role summary cards, no-wrap role/status badges, row-level pending save feedback, user-only notice codes for update/delete results, AlertDialog delete confirmation for non-protected users, and a route-level loading skeleton.
- Properties: CRUD and owner/share assignment. Edit mode remounts the existing form with the selected property id, server-side updates require that id, and successful saves redirect back to `/dashboard/properties` so edit mode resets. The image URL field is absent and existing `image_url` values are preserved on edit. Create/update/delete redirects use property-only notice codes for one-time success toasts, and property deletion is confirmed with an AlertDialog before submitting the existing delete action.
- Bookings: CRUD, settings-backed source/concierge, automatic status, booking-only success notices, and AlertDialog delete confirmation.
- Expenses: CRUD; CMS default, property requirement rules, expense-only success notices, and AlertDialog delete confirmation.
- P&L: premium operational financial overview with report-level existing-value summary cards, CMS expenses called out separately, aligned property P&L table amounts, and unchanged revenue/expense/share calculations.
- Payouts: premium admin payout operations page with previous-month page-load generation, combined owner rows, property breakup, query clarity, confirmed mark-paid action, and `admin_payout_marked_paid` success notice. Existing mark-paid eligibility remains approved/resolved payouts only.
- Queries: premium admin query inbox with open/resolved/statement context, pending resolve/delete actions, AlertDialog delete confirmation, `admin_query_resolved`/`admin_query_deleted` notices, and unchanged linked-payout resolve/restoration behavior.
- Settings: operational dropdown option management page for newline-managed `booking_sources`, `expense_categories`, and `concierge_options` arrays, with one-option-per-line guidance, pending save state, `settings_updated` notice, and unchanged downstream booking/expense form behavior.

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
- No unique owner/month payout database constraint.
- Apps Script template and output-folder configuration live outside this repository.
- Proposal generation can exceed 30 seconds; helper has no shorter abort timeout.
- Forecast/contact lead storage depends on service role or appropriate insert policies.
- General contact email uses a fixed Resend development sender in source; forecast email uses `RESEND_FROM_EMAIL`.
- No owner statement PDFs, receipt uploads, channel sync, payments, or advanced dispute workflow.
- Reference prototypes are excluded from production linting.
- Renamed stale `.next` directories inside the repository can confuse Tailwind source discovery unless ignored.

## Verification

```bash
npm run lint
npm run build
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
