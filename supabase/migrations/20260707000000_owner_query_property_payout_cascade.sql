alter table public.owner_queries
  drop constraint if exists owner_queries_property_id_fkey;

alter table public.owner_queries
  add constraint owner_queries_property_id_fkey
  foreign key (property_id)
  references public.properties(id)
  on delete cascade;

alter table public.owner_queries
  drop constraint if exists owner_queries_payout_id_fkey;

alter table public.owner_queries
  add constraint owner_queries_payout_id_fkey
  foreign key (payout_id)
  references public.owner_payouts(id)
  on delete cascade;
