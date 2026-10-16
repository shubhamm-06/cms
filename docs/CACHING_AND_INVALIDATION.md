# Caching and Invalidation

## Scope and Freshness

The installed stack is Next.js 16.2.9, React 19.2.4, Supabase SSR 0.12.0 and Supabase JS 2.108.1. Cache Components and enlarged browser router stale times are not enabled.

| Reads | Scope | Freshness |
| --- | --- | --- |
| Auth user and profile | React `cache`, one server render/request only | Never persisted across requests; role/status checks still run before private reads |
| Admin and owner business data | Uncached authenticated Supabase reads | Requested datasets only; independent reads run in parallel; owner property assignments are read freshly |
| Public catalogue, detail and gallery views | Next Data Cache, anonymous public-safe rows only | 60 seconds maximum on the next server read; property/image mutations immediately expire the shared tag |
| Existing Google map resolution | Existing independent cache | Unchanged: successful short-link resolution one week; failed lookup one minute |

Private loaders cannot safely persist their current cookie/session-bound RLS queries without capturing session credentials, putting credentials in cache keys, or replacing RLS reads with privileged reads. None of those workarounds is used. The ordinary server client explicitly uses `cache: "no-store"`; there is no private persistent data cache. Failed reads throw instead of presenting incomplete financial inputs as successful zero figures. Missing-profile provisioning remains outside the memoized pure auth read.

Public loaders use a fresh stateless anonymous client in `src/lib/supabase/public.ts`, never request cookies or service role. Only the existing public-safe views are read. Cache keys contain a public project URL, slug/property ID where needed, and a minute bucket; credentials are not key parts or cached results. Nested SDK fetches are not separately persisted. `connection()` keeps the routes request-rendered so the time bucket advances; `unstable_cache` reuses successful public rows within that bucket. A new bucket requires a blocking miss rather than stale-while-revalidate. Failed reads are not stored as success; a failed gallery retains its existing placeholder but is retried.

## Mutation Coverage

Server Actions call `invalidateBusinessData` in `src/features/shared/cache-invalidation.ts`. The dependency map lives in `cache-policy.ts`. `updateTag` immediately expires public property data, and `revalidatePath` invalidates affected routes. Existing import `router.refresh()` calls are retained.

| Confirmed writes | Invalidated views |
| --- | --- |
| Profile update, user update/delete, login/logout, successful signup profile write | Admin and owner layout trees, including profile, user list and account-dependent pages |
| Property create/update/delete and property CSV import | Public catalogue/details; admin and owner property, booking, expense, query and financial views |
| Property image metadata, cover, ordering, alt text and deletion | Public catalogue/details and admin property gallery |
| Booking create/update/delete and CSV import | Admin/owner booking views, overviews, P&L and payout views |
| Expense create/update/delete and CSV import | Admin/owner expense views, overviews, P&L and payout views |
| Payout approval, query, mark-paid | Admin/owner payout, query and owner overview views |
| Owner query creation, admin resolution/deletion | Query, payout and owner overview views; linked payout writes included |
| Settings save | Settings and dependent admin booking/expense forms |

Property invalidation covers all owner routes, not just the currently assigned owner, so both the previous and new owner's next render reflects reassignment. Cascaded property records use the same dependency map; no new manual child deletion is added. Multi-step actions invalidate after the first confirmed change, before fallible verification, email, Storage cleanup or rollback. Settings and image-order bulk writes settle every operation and invalidate any successful subset even if the overall action fails. Failed imports do not invalidate; successful bulk inserts do. No financial record or formula is recalculated by the invalidation helper itself.

Payout processing remains uncached and page-load driven on `/dashboard/payouts`, `/owner/payout` and `/owner`. It runs before fresh display reads, with the same status guards, review windows and concurrency handling. Rendering cannot call Server Action invalidation APIs; no persistent payout/financial data exists to expire in that render workflow. Do not wrap the processor in `cache` or `unstable_cache`. Date-derived booking statuses, current-month performance and review eligibility continue to be derived on fresh renders using existing date rules.

## Future Changes and Open Sessions

- Add every new business Server Action to the dataset map; call invalidation immediately after a confirmed write and before later work can fail. A new dataset should include every derived consumer. Do not use this Server Action helper during rendering or in a Route Handler.
- Keep auth, active-account checks and owner assignment filters outside persistent caches. Never enlarge authenticated router cache lifetimes to disguise slow queries. Auth cookie changes and layout invalidation refresh the mutation initiator's account views; each new private request rechecks access.
- Server invalidation is not a live broadcast. An already-open page or browser back/forward snapshot can keep its rendered content until navigation/refresh; another admin's role change does not erase pixels already delivered to that browser. New server reads enforce the current account and RLS state.
- Direct Supabase edits do not emit application invalidation. Private data is fresh on the next server read; public rows may lag until the next minute bucket (at most 60 seconds). Already-rendered pages still require refresh. No polling or realtime subscription is introduced.
- The focused offline tests execute actual loader/action source with provider and Next cache doubles. They verify scope, expiry-key wiring, failures and invalidation coverage, not real RLS enforcement or production database request counts. Use a disposable authenticated environment for mutation, payout lifecycle and account-switch browser verification. Do not claim a measured speed improvement from unit tests or a successful build.

## Verification (2026-10-14)

Read-only HTTP checks against a local `next start` production build returned successful public catalogue/detail pages. The first catalogue response took 1711 ms, then 80 ms and 54 ms on immediate repeats; a detail read took 892 ms, then 56 ms. Tagged Next cache files were created, and the next minute's catalogue request created a new entry (1199 ms). These are local full-response timings and cache-file observations, not browser RSC navigation timings, database query telemetry or a before/after dashboard benchmark. A network-restricted attempt showed the existing error state and created no successful public cache entry. No live mutations or payout-processing routes were exercised.
