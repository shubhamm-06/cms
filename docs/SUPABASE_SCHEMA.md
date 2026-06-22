# Supabase Schema

The checked-in source of truth is `supabase/schema.sql`. It creates eight tables and enables RLS on each one. It does **not** define RLS policies, triggers, storage buckets, or scheduled jobs.

## Relationship Summary

```txt
auth.users 1---1 profiles
profiles 1---many properties
properties 1---many bookings
properties 1---many property expenses
profiles/properties 1---many owner_payouts
profiles/properties/owner_payouts 1---many owner_queries
settings and contact_submissions are standalone
```

## Tables

### `profiles`

| Item | Details |
| --- | --- |
| Purpose | Application identity and authorization profile linked to Supabase Auth |
| Key fields | `id`, `email`, `name`, `phone`, `role`, `status`, `avatar_url`, `is_protected` |
| Relationship | `id` is the primary key and references `auth.users(id)` |
| Constraints | Unique non-null email; role is `admin` or `owner`; status is `pending`, `active`, or `inactive` |
| Reads | Current user reads own profile; admin dashboard reads profiles |
| Writes | Signup/fallback profile creation, admin user management, self-profile update |
| Business rules | Public signup creates pending owner; protected admin remains active/admin and cannot be deleted through actions |

### `properties`

| Item | Details |
| --- | --- |
| Purpose | Managed property and owner assignment |
| Key fields | `name`, `city`, `address`, `bedrooms`, `owner_id`, `owner_share`, `cms_share`, `image_url`, `status` |
| Relationship | Optional `owner_id` references `profiles(id)` |
| Constraints | Status is active/inactive; owner and CMS shares must total exactly 100 |
| Reads | Admin reads all; owner reads assigned properties |
| Writes | Admin only in application actions |
| Business rules | One `owner_id` per property; current form omits image URL, and edits preserve the stored `image_url` by not submitting it |

### `bookings`

| Item | Details |
| --- | --- |
| Purpose | Stay, guest, and booking revenue records |
| Key fields | `property_id`, guest fields, source, dates, nights, guests, `nightly_rate`, `total_amount`, status, concierge, notes |
| Relationship | Required `property_id` references properties with cascade delete |
| Constraints | Check-out cannot precede check-in; status is upcoming/in-house/checked-out/cancelled/blocked |
| Reads | Admin reads all; owner reads bookings for assigned properties |
| Writes | Admin only in application actions |
| Business rules | Form auto-calculates nights/rates for convenience; server action calculates date-based status. The schema retains `cleaning_schedule`, but the application does not use it |

### `expenses`

| Item | Details |
| --- | --- |
| Purpose | Property and CMS/company expenses in one table |
| Key fields | `expense_for`, `property_id`, `date`, `category`, `amount`, vendor, note |
| Relationship | Optional `property_id` references properties with cascade delete |
| Constraints | Property expense requires property ID; CMS expense requires null property ID |
| Reads | Admin reads all; owner reads only property expenses for assigned properties |
| Writes | Admin only in application actions |
| Business rules | CMS is the form default; server clears property ID for CMS expenses; CMS expenses never enter owner payout calculations |

### `owner_payouts`

| Item | Details |
| --- | --- |
| Purpose | Stored monthly payable owner statements |
| Key fields | owner/property/month, revenue, expense, net profit, owner/CMS shares, TDS, final payout, status, notes, timestamps |
| Relationships | Required property and owner references |
| Constraints | Status is draft/ready_for_review/approved/query_raised/resolved/paid |
| Reads | Admin reads all; owner reads rows where `owner_id` is their profile ID |
| Writes | Page-load payout generation plus guarded owner/admin actions |
| Business rules | One combined owner-month row is intended; `property_id` stores a representative property for schema compatibility; `net_profit` stores adjusted net after negative carry-forward; fixed TDS is 10% of positive owner share |

The database has no unique constraint on `(owner_id, month)`. The application prevents duplicates by reading before insert, so concurrent processing remains an application-level risk.

### `owner_queries`

| Item | Details |
| --- | --- |
| Purpose | Simple owner queries, including payout-linked queries |
| Key fields | `owner_id`, optional `property_id`, optional `payout_id`, message, status, resolved fields |
| Relationships | References profiles, properties, and optionally owner payouts |
| Constraints | Status is open/resolved; owner and message are required |
| Reads | Admin reads all; owner reads own queries |
| Writes | Owner creates; admin resolves/deletes |
| Business rules | Resolving a payout query moves a queried payout to resolved; deleting an open linked query restores payout state according to review-window timing |

### `settings`

| Item | Details |
| --- | --- |
| Purpose | Admin-managed option lists |
| Key fields | Unique `key`, JSONB `value` |
| Relationships | Standalone; no foreign keys |
| Constraints | Primary UUID; unique non-null key; non-null JSONB value |
| Reads | Admin data loader; options feed admin booking/expense forms |
| Writes | Admin only in application actions |
| Business rules | Active keys are `booking_sources`, `expense_categories`, and `concierge_options`; values are arrays created from one-option-per-line text |

### `contact_submissions`

| Item | Details |
| --- | --- |
| Purpose | General enquiries and owner forecast leads |
| Key fields | name, email, phone, message, `source_page`, created timestamp |
| Relationships | Standalone; no foreign keys |
| Constraints | Primary UUID; name, email, and message are required |
| Reads | No dashboard reader is implemented |
| Writes | Public API routes through service role when valid/configured, otherwise authenticated/anonymous server client subject to RLS |
| Business rules | General contact uses `landing_page`; forecast leads use `owner_revenue_calculator` |

## Data Ownership Model

- A property has at most one assigned owner in the current schema.
- Owner operational scope is derived from `properties.owner_id = authenticated profile id`.
- Owner payout and query scope also use direct `owner_id` filters.
- Admin application routes read broad datasets after an active-admin role check.

## Access Responsibility Matrix

| Data | Admin application access | Owner application access | Required database enforcement |
| --- | --- | --- | --- |
| Profiles | Manage users | Own profile update only | Prevent owner role/status/protection edits |
| Properties | CRUD | Read assigned | Restrict owner reads by `owner_id`; block owner writes |
| Bookings | CRUD | Read assigned-property rows | Restrict through property ownership |
| Expenses | CRUD | Read assigned property expenses only | Exclude CMS rows and other properties |
| Payouts | Read/process/mark paid | Read and limited own review actions | Restrict owner ID and allowed transitions |
| Queries | Read/resolve/delete | Create/read own | Restrict owner ID and admin-only resolution/deletion |
| Settings | Read/write | No direct requirement | Admin-only writes |
| Contact submissions | Server route insert | No dashboard access | Permit only intended server inserts; block public reads |

## RLS Honesty and Deployment Responsibility

**Verified in repository SQL:** RLS is enabled on all eight tables.

**Verified in application code:** route layouts and server actions check roles; owner queries filter by owner/property IDs; service role is isolated to server modules.

**Not present in repository SQL:** actual `CREATE POLICY` statements. Therefore the repository does not prove which policies are deployed in any Supabase project. Production setup must manually create, review, and test policies matching [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md). Application guards are defense in depth, not a substitute for RLS.
