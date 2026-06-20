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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_cms_share_total check (owner_share + cms_share = 100)
);

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
  property_id uuid references public.properties(id),
  payout_id uuid references public.owner_payouts(id),
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

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.bookings enable row level security;
alter table public.expenses enable row level security;
alter table public.owner_payouts enable row level security;
alter table public.owner_queries enable row level security;
alter table public.settings enable row level security;
alter table public.contact_submissions enable row level security;
