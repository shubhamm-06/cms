# Public Property Catalogue and Booking Enquiries

This document is the primary handoff for the planned public property catalogue and booking-enquiry work.

## Source of Truth and Current Boundary

The current repository source and `supabase/schema.sql` remain the checked-in implementation reference. The live Supabase project has also received manual database, Storage, helper-function, and policy changes for the upcoming catalogue work. The checked-in schema representation and TypeScript database types now include the catalogue property fields and `property_images` table; Storage bucket configuration and deployed policies remain documented here rather than represented in SQL.

Codex must not connect to or change Supabase directly for this work. Future Supabase changes should be provided as explicit manual instructions. Repository code and documentation should be updated only after the user confirms each required manual Supabase step.

Before implementation, verify the current application source and live Supabase configuration. `docs/CHANGELOG.md` is historical context, not current product truth.

## Product Scope

The active future work is limited to a public property catalogue and a separate booking-enquiry system.

Planned routes:

```txt
/booking
/property/[slug]
/dashboard/booking-requests
/api/booking-requests
```

The existing operational `properties` table remains the authoritative property source. Public catalogue visibility is controlled separately from operational property status.

Core rule:

Public booking requests and confirmed operational bookings must remain separate until an admin manually converts an enquiry.

A public booking request must never automatically:

- create a confirmed booking;
- block availability;
- affect booking revenue;
- affect occupancy;
- affect expenses;
- affect P&L;
- affect owner payouts;
- appear in owner booking views.

Future manual conversion flow:

```txt
Admin reviews enquiry
-> Admin chooses Create confirmed booking
-> Existing booking form is prefilled
-> Admin verifies availability, pricing, and operational details
-> Admin submits the existing booking workflow
-> Enquiry is marked converted only after successful booking creation
```

## Admin Editability Rule

All configurable public-facing property catalogue content and settings must be editable through the Admin dashboard. Do not hard-code property-specific catalogue content inside public pages.

This includes, where applicable:

- public property name;
- property type;
- region and area;
- public location text;
- descriptions;
- highlights;
- amenities;
- house rules;
- capacity;
- pool information;
- price-display information;
- stay information;
- enquiry settings;
- featured state;
- display order;
- similar-property visibility;
- SEO fields;
- property images;
- cover image;
- image alt text;
- image ordering.

## Existing Operational Property Fields

The original verified `public.properties` table contained:

```txt
id
name
city
address
bedrooms
owner_id
owner_share
cms_share
image_url
status
created_at
updated_at
```

These existing fields remain operational and must not be renamed, removed, or repurposed.

Important meanings:

- `name` remains the internal operational property name.
- `address` remains private.
- `status` remains operational `active` or `inactive`.
- `owner_id` continues to control owner assignment and scoping.
- `owner_share` and `cms_share` remain part of operational financial calculations.
- `image_url` remains legacy data and must be preserved.
- `bedrooms` continues to be reused rather than duplicated.

Public website visibility must not use or replace the operational `status` field.

## Manual Supabase Changes Already Completed

The following changes have already been performed manually in the live Supabase project and are now represented in checked-in `supabase/schema.sql` and `types/database.types.ts`, except for live Storage bucket configuration and deployed policy details.

### New `properties` Fields

Publishing:

```txt
show_on_website boolean not null default false
accept_booking_requests boolean not null default true
```

Public identity:

```txt
slug text
public_name text
public_property_type text
```

Public location:

```txt
region text
area text
short_location_line text
public_location_text text
google_maps_url text
```

Public copy:

```txt
tagline text
short_description text
full_description text
promotional_badge text
```

Capacity and features:

```txt
beds integer
bathrooms numeric(4,1)
max_guests integer
pool_type text
distance_from_beach text
```

The existing `bedrooms` column will be reused.

Editable lists:

```txt
amenities text[] not null default '{}'
property_highlights text[] not null default '{}'
house_rules text[] not null default '{}'
```

Price display:

```txt
starting_price numeric(12,2)
show_price boolean not null default true
price_note text
```

These values are display information only. They must not automatically change confirmed-booking pricing, revenue, P&L, or payout calculations.

Stay and enquiry information:

```txt
minimum_nights integer
check_in_time time
check_out_time time
booking_enquiry_note text
```

Catalogue controls:

```txt
is_featured boolean not null default false
display_order integer not null default 0
show_in_similar_properties boolean not null default true
```

SEO:

```txt
seo_title text
seo_description text
```

### Added Property Constraints

The live Supabase project now includes:

- a case-insensitive unique slug index when `slug` is not null;
- a lowercase URL-safe slug-format constraint;
- a non-negative `beds` constraint;
- a non-negative `bathrooms` constraint;
- a positive `max_guests` constraint;
- a non-negative `starting_price` constraint;
- a positive `minimum_nights` constraint;
- a non-negative `display_order` constraint.

Existing properties remain unpublished because:

```txt
show_on_website = false
```

No public-read policy has been added yet.

## Image System Already Created Manually

### Supabase Storage Bucket

A public Storage bucket has been created:

```txt
property-images
```

Current bucket setup:

```txt
Public read enabled
Maximum file size: 10 MB
Allowed MIME types:
- image/jpeg
- image/png
- image/webp
```

Planned file path structure:

```txt
{property-id}/{generated-uuid}.{extension}
```

Original filenames must not be treated as stable unique identifiers.

### `property_images` Table

The following table exists in live Supabase and is represented in checked-in schema/types:

```txt
public.property_images
```

Columns:

```txt
id uuid primary key default gen_random_uuid()
property_id uuid not null references public.properties(id) on delete cascade
storage_path text not null
alt_text text
sort_order integer not null default 0
is_cover boolean not null default false
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Constraints and indexes:

- storage path cannot be empty;
- storage path is unique;
- sort order cannot be negative;
- index on property, sort order, and creation time;
- maximum one cover image per property through a partial unique index;
- RLS enabled.

Relationship:

```txt
properties
  1
  |
  many
property_images
```

The legacy `properties.image_url` field has not been removed or migrated.

## Authorization Helper and Policies

The following helper exists in the live Supabase project:

```txt
private.is_active_admin()
```

It is:

- a stable SQL function;
- `security definer = true`;
- based on `profiles.id = auth.uid()`;
- restricted to `role = 'admin'`;
- restricted to `status = 'active'`.

The following active-admin policies exist for `public.property_images`:

- SELECT;
- INSERT;
- UPDATE;
- DELETE.

The following active-admin policies exist for `storage.objects` where:

```txt
bucket_id = 'property-images'
```

Policies:

- SELECT/list;
- INSERT/upload;
- UPDATE;
- DELETE.

The bucket is publicly readable for catalogue delivery, but only active admins may upload, edit, or delete files. Owners and anonymous users do not have direct write access.

## Current Implementation Boundary

The live Supabase database is partially ahead of the repository where Storage bucket configuration and deployed policy details are concerned.

At this point:

- database columns exist and are represented in checked-in schema/types;
- image table exists and is represented in checked-in schema/types;
- Storage bucket exists;
- admin policies exist;
- application database types have been synchronized for `properties` and `property_images`;
- Admin -> Properties now manages all public catalogue fields, including publishing controls, public copy, capacity/lists, display pricing, stay/enquiry settings, catalogue controls, SEO, and gallery metadata. Website visibility remains separate from operational status;
- property image management is implemented for existing properties: active admins upload directly to `property-images`, while `property_images` stores generated paths, sort order, cover state, and alt text. Browser-native processing resizes only images above 2400px on their longest side and chooses WebP at approximately 0.85 quality only when smaller; valid originals safely remain the upload fallback. The property save button follows image management. Legacy `image_url` is preserved;
- `/booking` exists and renders the catalogue UI, filters, ordering, card, empty, loading and error states;
- `/booking` reads real published, operationally active properties through the `public_property_catalogue` view; the temporary typed stub has been removed;
- `/property/[slug]` is implemented and reads only the `public_property_details` and `public_property_gallery` views;
- booking enquiries do not yet exist;
- no `booking_requests` table has been created.

## Public Catalogue Read Source

The public-safe view below was created manually in the live Supabase project, and anonymous SELECT access was verified before the application was pointed at it. It is now represented in checked-in `supabase/schema.sql` and `types/database.types.ts`.

The view is the security boundary, so no public-read policy on `properties` is needed and no private column is reachable. A row-level policy on `properties` was rejected, because RLS filters rows rather than columns and would expose `address`, `owner_id`, `owner_share` and `cms_share` on published rows unless column grants were also layered on.

`/booking` reads this view with the ordinary anon server client through `loadPublicCatalogue()` in `src/features/catalogue/public-catalogue-data.ts`, using an explicit column list rather than `*`. It never queries `properties` or `property_images` directly and never uses the service-role client.

```sql
create or replace view public.public_property_catalogue
with (security_invoker = false) as
select
  p.id, p.slug, p.public_name, p.public_property_type,
  p.region, p.area, p.short_location_line,
  p.tagline, p.short_description, p.promotional_badge,
  p.bedrooms, p.beds, p.bathrooms, p.max_guests,
  p.pool_type, p.distance_from_beach,
  p.starting_price, p.show_price, p.price_note,
  p.is_featured, p.display_order,
  cover.storage_path as cover_storage_path,
  cover.alt_text     as cover_alt_text
from public.properties p
left join lateral (
  select i.storage_path, i.alt_text
  from public.property_images i
  where i.property_id = p.id
  order by i.is_cover desc, i.sort_order, i.created_at
  limit 1
) cover on true
where p.show_on_website
  and p.status = 'active'
  and p.slug is not null;

alter view public.public_property_catalogue owner to postgres;
revoke all on public.public_property_catalogue from anon, authenticated;
grant select on public.public_property_catalogue to anon, authenticated;
```

`show_on_website` and `status` are predicates only and are never selected. Do not additionally grant `anon` select on `properties`.

The view body is mirrored in `supabase/schema.sql`. Ownership and grants are documented here only, matching that file's existing scope, which does not track roles, grants or policies. Because the read uses the cookie-aware server client, `/booking` is a dynamic route rather than a static one.

Codex/Claude must not run this or any other Supabase statement. Future changes to the view must be applied manually and only then reflected in the repository.

## Public Detail Read Sources

Two further public-safe views were created manually in the live Supabase project and verified for the `anon` role before the application was pointed at them. Both are now represented in checked-in `supabase/schema.sql` and `types/database.types.ts`. They follow the same security model as the catalogue view: the view is the boundary, so no public-read policy on `properties` or `property_images` is needed and no private column is reachable.

`/property/[slug]` reads them with the ordinary anon server client through `loadPublicPropertyDetail()` in `src/features/catalogue/public-property-detail-data.ts`, using explicit column lists rather than `*`. It never queries `properties` or `property_images` directly and never uses the service-role client.

```sql
create or replace view public.public_property_details
with (security_invoker = false, security_barrier = true) as
select
  p.id, p.slug, p.public_name, p.public_property_type,
  p.region, p.area, p.short_location_line,
  p.public_location_text, p.google_maps_url,
  p.tagline, p.short_description, p.full_description, p.promotional_badge,
  p.bedrooms, p.beds, p.bathrooms, p.max_guests,
  p.pool_type, p.distance_from_beach,
  p.amenities, p.property_highlights, p.house_rules,
  p.starting_price, p.show_price, p.price_note,
  p.minimum_nights, p.check_in_time, p.check_out_time,
  p.booking_enquiry_note, p.accept_booking_requests,
  p.seo_title, p.seo_description
from public.properties p
where p.show_on_website
  and p.status = 'active'
  and p.slug is not null;

alter view public.public_property_details owner to postgres;
revoke all on public.public_property_details from anon, authenticated;
grant select on public.public_property_details to anon, authenticated;

create or replace view public.public_property_gallery
with (security_invoker = false, security_barrier = true) as
select
  i.property_id, i.storage_path, i.alt_text,
  i.sort_order, i.is_cover, i.created_at
from public.property_images i
join public.properties p on p.id = i.property_id
where p.show_on_website
  and p.status = 'active'
  and p.slug is not null;

alter view public.public_property_gallery owner to postgres;
revoke all on public.public_property_gallery from anon, authenticated;
grant select on public.public_property_gallery to anon, authenticated;
```

`show_on_website` and `status` are predicates only and are never selected. The gallery join repeats those predicates so an unpublished or operationally inactive property never leaks its image paths. `created_at` is exposed only as the ordering tie-breaker after `is_cover` and `sort_order`. Do not additionally grant `anon` select on `properties` or `property_images`.

Codex/Claude must not run these or any other Supabase statement.

## Planned Implementation Order

### Phase 1: Documentation Synchronization

Record the agreed scope, live manual Supabase state, and implementation order.

### Phase 2: Repository Schema and Type Synchronization

Completed for checked-in `properties` fields, `property_images`, constraints, indexes, and TypeScript database types. No UI work was included. Storage bucket configuration and deployed policies remain documented rather than represented in repository SQL because `supabase/schema.sql` does not currently track Storage or policy definitions.

### Phase 3: Admin Property Form

Completed for non-image catalogue fields:

- Admin -> Properties has a show-on-website toggle with conditional listing sections;
- public property fields are editable through the form rather than hard-coded;
- publish-readiness validation applies only when website visibility is enabled;
- the admin table shows website Published/Hidden separately from operational Active/Inactive;
- slug suggestions are editable and duplicate slugs return a clear admin-facing message.

Image upload remains deferred to the next phase.

### Phase 4: Admin Image Management

Completed:

- existing properties can upload multiple JPEG, PNG, or WebP images up to 10 MB directly to the authenticated `property-images` Storage bucket;
- generated `{property-id}/{uuid}.{extension}` paths are stored in `property_images`, never full public URLs;
- browser-native processing keeps aspect ratio, resizes only above a 2400px longest side, and uses a WebP result at about 0.85 quality only when it is smaller than the original;
- the gallery supports cover selection, editable alt text, move-up/move-down ordering, and confirmed deletion with Storage cleanup;
- add mode deliberately requires the property to be saved first; the single property save control follows the gallery; legacy `image_url` remains untouched.

### Phase 5: Public Property Catalogue

`/booking` is built:

- one server component loads the catalogue and one client component filters the already-loaded array by region, area, property type, guests, bedrooms and pool;
- client-side filtering is deliberate because inventory is intentionally small, so there is no filter API, URL-state library or search service;
- ordering is featured first, then `display_order`, then `public_name`;
- cards show only admin-editable public content from Admin -> Properties, prefer the `property_images` cover, fall back to a branded placeholder, and link to `/property/[slug]`;
- price is display-only, shown only when `show_price` is true and `starting_price` exists, and is never connected to booking, P&L or payout calculations;
- the page checks no availability and creates no booking requests, and its wording avoids confirming any.

The public-safe read source is live and wired in: `/booking` loads real published, operationally active properties from `public_property_catalogue`, ordered in the query by `is_featured` descending, `display_order` ascending, then `public_name` ascending. A failed query returns the catalogue error state and logs only the Supabase error code and message; a successful query with zero rows keeps the normal empty state, so the two remain distinguishable.

`/property/[slug]` completes this phase:

- one server route resolves the slug, loads the property and its gallery through the public-safe detail/gallery views, and renders a server component; there is no new API route, no client-side data fetching and no service-role access;
- the layout follows the `Curate My Stay — Property Detail Page` screen in `reference/booking.html`: back link, title block, gallery (a snap-scrolling carousel below `lg`, the 1 + 4 grid from `lg`), then a two-column body with a sticky 384px stay card from `lg`; below `lg` the card comes last in the content and a sticky enquiry bar offers WhatsApp and Call. Long content opens in a shared show-more dialog, and `Where you'll be` shows an area-only map searched by area and region, never `google_maps_url`;
- all property content comes from Admin -> Properties. Only generic section headings and company-level copy (the `Managed by Curate My Stay` card and the enquiry policy line) are hard-coded, and empty optional fields hide their whole section;
- gallery images use `property_images` data through the existing `getPropertyImageUrl()` helper with the cover first; legacy `image_url` is not used. Photos open a full-screen photo tour and lightbox (Radix Dialog, URL-synced with `?photos=1` and `?photo=N`) grouped into room sections inferred from `alt_text` and `sort_order` only, with no schema change; see AI Project Context for the room rules;
- missing, unpublished and operationally inactive slugs are all absent from the views, so they produce the same `notFound()` result and the page never reveals that a private property exists. A real query failure returns a separate public error state and logs only the Supabase error code and message;
- the stay card is display-only: price behind `show_price`, price note, minimum stay, check-in/check-out, the admin enquiry note, and a WhatsApp CTA built from the shared helper. When `accept_booking_requests` is false the CTA is replaced by a paused message. Selected dates and guests only shape the WhatsApp message; no totals, taxes, availability check or enquiry submission exist on this page.

Still outstanding for the wider feature: the separate booking-request system in Phase 6.

### Phase 6: Separate Booking Enquiries

Create a dedicated future `booking_requests` table and API. Do not insert public requests into `bookings`.

### Phase 7: Admin Enquiry Management and Manual Conversion

Build admin review and prefill the existing booking form. Do not bypass existing confirmed-booking validation or creation logic.

## Explicit Non-goals

Do not introduce:

- real-time availability;
- OTA synchronization;
- booking holds;
- automatic booking confirmation;
- payments;
- checkout;
- dynamic pricing;
- guest accounts;
- owner access to booking enquiries;
- booking-request effects on payouts;
- direct anonymous inserts into `bookings`;
- hard-coded property catalogue content.
