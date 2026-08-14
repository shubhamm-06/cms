# Supabase Schema

The checked-in source of truth is `supabase/schema.sql`. It creates nine tables, enables RLS on each one, and defines the `public_property_catalogue`, `public_property_details` and `public_property_gallery` views. It does **not** define RLS policies, roles, grants, triggers, storage buckets, or scheduled jobs.

For the public property catalogue, checked-in `supabase/schema.sql` and generated TypeScript types now represent the manually added `properties` fields, the `property_images` table, and the `public_property_catalogue` view body. Live Storage bucket configuration, view ownership and grants, and deployed policies remain documented in [Public Property Catalogue and Booking Enquiries](./PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md) rather than represented in this SQL file, because this repository's schema file does not currently track Storage, role or policy definitions.

## Relationship Summary

```txt
auth.users 1---1 profiles
profiles 1---many properties
properties 1---many property_images
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
| Business rules | Public signup creates pending owner; protected admin remains active/admin and cannot be deleted through actions; hard user deletion is blocked when assigned properties, payout statements, or owner queries reference the profile |

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

Operational property fields must not be renamed, removed, or repurposed for the public catalogue. `name` remains the internal property name, `address` remains private, `status` remains operational active/inactive, `owner_id` controls owner scoping, `owner_share`/`cms_share` control financial calculations, `image_url` remains legacy data, and `bedrooms` is reused rather than duplicated.

The live Supabase project has manually added catalogue fields to `properties`, and checked-in schema/types now represent them. These include separate publishing controls (`show_on_website`, `accept_booking_requests`), public identity/location/copy/capacity/list/price/stay/catalogue/SEO fields, plus catalogue constraints for slug format/uniqueness and non-negative or positive numeric values. Properties are published individually by setting `show_on_website = true`. No public-read policy was added to `properties`; anonymous catalogue reads go through the `public_property_catalogue` view instead.

### `property_images`

The live Supabase project includes `public.property_images`, now represented in checked-in `supabase/schema.sql` and TypeScript database types.

| Item | Details |
| --- | --- |
| Purpose | Multiple public catalogue images for a property |
| Key fields | `property_id`, `storage_path`, `alt_text`, `sort_order`, `is_cover` |
| Relationship | Required `property_id` references `properties(id)` with cascade delete |
| Constraints | Non-empty unique storage path; non-negative sort order; at most one cover image per property |
| Reads | Active admins through live policies; public delivery through the public Storage bucket/read strategy |
| Writes | Active admins only through live policies |

The live Supabase Storage bucket is `property-images`, public read enabled, 10 MB max file size, and allowed MIME types `image/jpeg`, `image/png`, and `image/webp`. Planned paths use `{property-id}/{generated-uuid}.{extension}`; original filenames are not stable identifiers. Legacy `properties.image_url` has not been removed or migrated.

### `public_property_catalogue` (view)

The live Supabase project includes this public-safe view, created manually and verified for anonymous SELECT. Its body is now represented in checked-in `supabase/schema.sql` and TypeScript database types; ownership and grants remain documented in [Public Property Catalogue and Booking Enquiries](./PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md) because this SQL file does not track roles, grants or policies.

| Item | Details |
| --- | --- |
| Purpose | The only public read source for the `/booking` catalogue |
| Exposed fields | `id`, `slug`, `public_name`, `public_property_type`, `region`, `area`, `short_location_line`, `tagline`, `short_description`, `promotional_badge`, `bedrooms`, `beds`, `bathrooms`, `max_guests`, `pool_type`, `distance_from_beach`, `starting_price`, `show_price`, `price_note`, `is_featured`, `display_order`, `cover_storage_path`, `cover_alt_text` |
| Row filter | `show_on_website = true`, `status = 'active'`, and `slug is not null`; these are predicates only and are never selected |
| Cover image | One image per property through a lateral join on `property_images`, preferring `is_cover`, then `sort_order`, then `created_at` |
| Reads | Anonymous and authenticated visitors through `grant select`; the view runs with `security_invoker = false`, so it, rather than an RLS policy on `properties`, is the boundary |
| Writes | None; a view is read-only here |

### `public_property_details` (view)

The live Supabase project includes this public-safe view, created manually and verified for the `anon` role. Its body is now represented in checked-in `supabase/schema.sql` and TypeScript database types; ownership and grants remain documented in [Public Property Catalogue and Booking Enquiries](./PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md).

| Item | Details |
| --- | --- |
| Purpose | The only public read source for `/property/[slug]` property content |
| Exposed fields | The catalogue public fields except the catalogue-only `is_featured`, `display_order` and cover columns, plus `public_location_text`, `google_maps_url`, `full_description`, `amenities`, `property_highlights`, `house_rules`, `minimum_nights`, `check_in_time`, `check_out_time`, `booking_enquiry_note`, `accept_booking_requests`, `seo_title`, `seo_description` |
| Row filter | `show_on_website = true`, `status = 'active'`, and `slug is not null`; these are predicates only and are never selected |
| Reads | Anonymous and authenticated visitors through `grant select`; runs with `security_invoker = false` and `security_barrier = true`, so it, rather than an RLS policy on `properties`, is the boundary |
| Writes | None; a view is read-only here |

### `public_property_gallery` (view)

Created manually and verified for the `anon` role alongside the detail view, and likewise represented in checked-in `supabase/schema.sql` and TypeScript database types.

| Item | Details |
| --- | --- |
| Purpose | The only public read source for `/property/[slug]` gallery images |
| Exposed fields | `property_id`, `storage_path`, `alt_text`, `sort_order`, `is_cover`, `created_at` |
| Row filter | Joins `property_images` to `properties` and repeats the same publish predicates, so an unpublished or operationally inactive property never leaks its image paths |
| Ordering | The application orders by `is_cover` descending, `sort_order` ascending, then `created_at` ascending; `created_at` is exposed only as that tie-breaker |
| Reads | Anonymous and authenticated visitors through `grant select`; same `security_invoker = false` and `security_barrier = true` boundary |
| Writes | None; a view is read-only here |

No public-read policy was added to `properties` or `property_images`. Row-level policies filter rows rather than columns, so they would have exposed `address`, `owner_id`, `owner_share` and `cms_share` on published rows. Never grant `anon` select on `properties`.

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

One stored row represents a combined owner-month payout, so `(owner_id, month)` is the required uniqueness key. Application code handles a `23505` concurrent-insert conflict safely, but the production database still requires the manual `owner_payouts_owner_month_unique` index documented in [Payout Logic](./PAYOUT_LOGIC.md). Do not apply that index until the read-only duplicate query returns no rows; do not automatically remove historical duplicates.

### `owner_queries`

| Item | Details |
| --- | --- |
| Purpose | Simple owner queries, including payout-linked queries |
| Key fields | `owner_id`, optional `property_id`, optional `payout_id`, message, status, resolved fields |
| Relationships | References profiles; optional `property_id` references properties with cascade delete; optional `payout_id` references owner payouts with cascade delete |
| Constraints | Status is open/resolved; owner and message are required |
| Reads | Admin reads all; owner reads own queries |
| Writes | Owner creates; admin resolves/deletes |
| Business rules | Resolving a payout query moves a queried payout to resolved; deleting an open linked query through the admin query action restores payout state according to review-window timing. Property deletion cascades linked property and payout queries through database foreign keys |

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
| Constraints | Primary UUID; name and email are required; message is nullable in the table and validated by the public API schemas |
| Reads | No dashboard reader is implemented |
| Writes | Public API routes prefer a validated server-only service-role/secret key; otherwise they use the normal server client subject to RLS |
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

Public catalogue reads go through the `public_property_catalogue`, `public_property_details` and `public_property_gallery` views only. Do not expose private operational fields such as `address`, `owner_id`, share percentages, internal status semantics, or owner-scoped records, and do not widen the view to include them.

## RLS Honesty and Deployment Responsibility

**Verified in repository SQL:** RLS is enabled on all nine tables.

**Verified in application code:** route layouts and server actions check roles; owner queries filter by owner/property IDs; service role is isolated to server modules.

**Not present in repository SQL:** actual `CREATE POLICY` statements. Therefore the repository does not prove which policies are deployed in any Supabase project. Production setup must manually create, review, and test policies matching [Routes and Permissions](./ROUTES_AND_PERMISSIONS.md). Application guards are defense in depth, not a substitute for RLS.

For `contact_submissions`, production should use the validated server-only service-role/secret client for `/api/contact` and `/api/owner-forecast`, enable RLS, and expose no anonymous read/update/delete policy. The application rejects `sb_publishable_` keys and legacy anon JWTs as service-role credentials. If it falls back to the anon server client while RLS has no INSERT policy, lead submission fails closed with the route's existing 500 response.
