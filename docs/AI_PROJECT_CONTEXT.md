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
- Lucide icons
- Resend email
- Google Apps Script proposal/PDF generation

No global state framework, CSS-in-JS layer, repository/service architecture, or UI framework is used.

## Architecture Map

```txt
app/
  Next.js routes, layouts, pages, and public route handlers.

components/
  home/       Public reference-style homepage and forecast UI.
  forms/      Concrete auth/admin/booking/contact forms.
  layout/     Admin/owner shell, sidebar, topbar, page headers.
  ui/         Small Tailwind primitives and shared TanStack DataTable.

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

`proxy.ts` refreshes Supabase sessions for matched routes. The public `/` route alone skips session refresh to remain a static acquisition page.

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
- Cleaning UI is removed; schema column remains unused.

## Expense Workflow

- Admin manages property and CMS expenses in one module.
- CMS is the default and always stores null property ID.
- Property expenses require a valid property.
- Expense categories come from settings.
- Owners read only property expenses for assigned properties.

## Owner Payout Workflow

- `/owner` and the top of `/owner/payout` share current-calendar-month live performance from `calculateOwnerLivePerformance`.
- Live performance uses owner-scoped bookings and property expenses and creates no current-month payout row.
- `/owner/payout` has one latest-first history table containing all owner payout records and no search/tabs.
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

- Users: approve/change roles/status; protected admin remains active/admin and undeletable.
- Properties: CRUD and owner/share assignment; image URL field is absent and existing values are preserved on edit.
- Bookings: CRUD, settings-backed source/concierge, automatic status.
- Expenses: CRUD; CMS default and property requirement rules.
- P&L: operational summary.
- Payouts: previous-month page-load generation, combined owner rows, property breakup, mark paid.
- Queries: resolve/delete; linked payout state is updated/restored safely.
- Settings: newline-managed arrays for sources/categories/concierge.

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

Prefer direct authenticated Supabase queries and feature server actions. Keep components and helpers small; do not introduce repositories, factories, or service layers without demonstrated need.

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
