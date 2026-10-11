create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  email text unique not null,
  name text,
  phone text,
  role text not null default 'owner' check (role in ('admin', 'owner')),
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  avatar_url text,
  is_protected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  bedrooms int,
  owner_id uuid references public.profiles(id),
  owner_share numeric(5,2) not null default 70,
  cms_share numeric(5,2) not null default 30,
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  show_on_website boolean not null default false,
  accept_booking_requests boolean not null default true,
  slug text,
  public_name text,
  public_property_type text,
  region text,
  area text,
  short_location_line text,
  public_location_text text,
  google_maps_url text,
  tagline text,
  short_description text,
  full_description text,
  promotional_badge text,
  beds integer,
  bathrooms numeric(4,1),
  max_guests integer,
  pool_type text,
  distance_from_beach text,
  amenities text[] not null default '{}',
  property_highlights text[] not null default '{}',
  house_rules text[] not null default '{}',
  starting_price numeric(12,2),
  show_price boolean not null default true,
  price_note text,
  minimum_nights integer,
  check_in_time time,
  check_out_time time,
  booking_enquiry_note text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  show_in_similar_properties boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_cms_share_total check (owner_share + cms_share = 100),
  constraint properties_slug_format check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint properties_beds_nonnegative check (beds is null or beds >= 0),
  constraint properties_bathrooms_nonnegative check (bathrooms is null or bathrooms >= 0),
  constraint properties_max_guests_positive check (max_guests is null or max_guests >= 1),
  constraint properties_starting_price_nonnegative check (starting_price is null or starting_price >= 0),
  constraint properties_minimum_nights_positive check (minimum_nights is null or minimum_nights >= 1),
  constraint properties_display_order_nonnegative check (display_order >= 0)
);

create unique index if not exists properties_slug_lower_unique
  on public.properties (lower(slug))
  where slug is not null;

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_images_storage_path_not_empty check (btrim(storage_path) <> ''),
  constraint property_images_sort_order_nonnegative check (sort_order >= 0)
);

-- Optional room/area grouping for the public photo tour (Living, Bedroom 1, Pool...).
-- Null keeps a photo in the ungrouped, sort-ordered fallback.
alter table public.property_images add column if not exists room_label text;
alter table public.property_images drop constraint if exists property_images_room_label_length;
alter table public.property_images add constraint property_images_room_label_length
  check (room_label is null or (btrim(room_label) <> '' and char_length(room_label) <= 60));

create unique index if not exists property_images_storage_path_unique
  on public.property_images (storage_path);

create index if not exists property_images_property_sort_created_idx
  on public.property_images (property_id, sort_order, created_at);

create unique index if not exists property_images_one_cover_per_property
  on public.property_images (property_id)
  where is_cover;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  guest_name text not null,
  guest_phone text,
  source text,
  check_in date not null,
  check_out date not null,
  nights int,
  guests int,
  nightly_rate numeric(12,2),
  total_amount numeric(12,2) not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'in_house', 'checked_out', 'cancelled', 'blocked')),
  cleaning_schedule text,
  concierge text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_date_check check (check_out >= check_in)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_for text not null check (expense_for in ('property', 'cms')),
  property_id uuid references public.properties(id) on delete cascade,
  date date not null,
  category text not null,
  amount numeric(12,2) not null default 0,
  vendor text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_property_check check (
    (expense_for = 'property' and property_id is not null)
    or
    (expense_for = 'cms' and property_id is null)
  )
);

create table if not exists public.owner_payouts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  owner_id uuid not null references public.profiles(id),
  month text not null,
  revenue_total numeric(12,2) not null default 0,
  expense_total numeric(12,2) not null default 0,
  net_profit numeric(12,2) not null default 0,
  owner_share_amount numeric(12,2) not null default 0,
  cms_share_amount numeric(12,2) not null default 0,
  tds_amount numeric(12,2) not null default 0,
  final_payout_amount numeric(12,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'ready_for_review', 'approved', 'query_raised', 'resolved', 'paid')),
  admin_note text,
  owner_note text,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owner_queries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  property_id uuid references public.properties(id) on delete cascade,
  payout_id uuid references public.owner_payouts(id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text,
  source_page text default 'landing_page',
  created_at timestamptz not null default now()
);

-- Public-safe catalogue source for the /booking page. This view is the security
-- boundary for anonymous catalogue reads: it exposes public columns only and
-- never owner, address, share or internal-status data. Ownership and grants are
-- deliberately not represented here, matching this file's existing scope; see
-- docs/PUBLIC_PROPERTY_CATALOGUE_AND_BOOKING_ENQUIRIES.md for those.
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

-- Public-safe detail source for /property/[slug]. Same security model and same
-- publish predicates as the catalogue view, widened only to the long-form
-- public copy, stay settings and SEO fields the detail page renders. It still
-- carries no owner, address, share, legacy image or internal-status column.
create or replace view public.public_property_details
with (security_invoker = false, security_barrier = true) as
select
  p.id,
  p.slug,
  p.public_name,
  p.public_property_type,
  p.region,
  p.area,
  p.short_location_line,
  p.public_location_text,
  p.google_maps_url,
  p.tagline,
  p.short_description,
  p.full_description,
  p.promotional_badge,
  p.bedrooms,
  p.beds,
  p.bathrooms,
  p.max_guests,
  p.pool_type,
  p.distance_from_beach,
  p.amenities,
  p.property_highlights,
  p.house_rules,
  p.starting_price,
  p.show_price,
  p.price_note,
  p.minimum_nights,
  p.check_in_time,
  p.check_out_time,
  p.booking_enquiry_note,
  p.accept_booking_requests,
  p.seo_title,
  p.seo_description
from public.properties p
where p.show_on_website
  and p.status = 'active'
  and p.slug is not null;

-- Public-safe gallery source for /property/[slug]. The join repeats the publish
-- predicates so an unpublished or operationally inactive property never leaks
-- its image paths. `created_at` is exposed only as the ordering tie-breaker.
create or replace view public.public_property_gallery
with (security_invoker = false, security_barrier = true) as
select
  i.property_id,
  i.storage_path,
  i.alt_text,
  i.sort_order,
  i.is_cover,
  i.created_at,
  i.room_label
from public.property_images i
join public.properties p on p.id = i.property_id
where p.show_on_website
  and p.status = 'active'
  and p.slug is not null;

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.bookings enable row level security;
alter table public.expenses enable row level security;
alter table public.owner_payouts enable row level security;
alter table public.owner_queries enable row level security;
alter table public.settings enable row level security;
alter table public.contact_submissions enable row level security;
