-- Supabase Schema for Melt The Machine

create table if not exists public.sightings (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  location text not null,
  description text not null,
  date date not null,
  time time without time zone not null,
  vehicle_details text null,
  verified_count integer not null default 0,
  flagged_count integer not null default 0,
  latitude double precision null,
  longitude double precision null,
  image_url text null,
  image_path text null,
  constraint sightings_pkey primary key (id)
);

alter table public.sightings add column if not exists image_url text null;
alter table public.sightings add column if not exists image_path text null;

create table if not exists public.sighting_votes (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  sighting_id uuid not null references public.sightings (id) on delete cascade,
  client_id text not null,
  vote_type text not null check (vote_type in ('verify', 'flag')),
  ip_address text null,
  constraint sighting_votes_pkey primary key (id),
  constraint sighting_votes_unique_client_vote unique (sighting_id, client_id)
);

create table if not exists public.api_rate_limits (
  key text primary key,
  count integer not null default 0,
  window_started_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_api_rate_limits_updated_at on public.api_rate_limits;
create trigger set_api_rate_limits_updated_at
before update on public.api_rate_limits
for each row
execute function public.set_current_timestamp_updated_at();

-- Set up Row Level Security (RLS)
alter table public.sightings enable row level security;
alter table public.sighting_votes enable row level security;
alter table public.api_rate_limits enable row level security;

-- Allow anonymous inserts
drop policy if exists "Allow anonymous inserts" on public.sightings;
create policy "Allow anonymous inserts"
on public.sightings
for insert
to anon
with check (true);

-- Allow anonymous reads
drop policy if exists "Allow anonymous reads" on public.sightings;
create policy "Allow anonymous reads"
on public.sightings
for select
to anon
using (true);

-- Allow anonymous updates for counters
drop policy if exists "Allow anonymous updates to counters" on public.sightings;
create policy "Allow anonymous updates to counters"
on public.sightings
for update
to anon
using (true)
with check (true);

-- Allow anonymous read access to images in the public bucket
insert into storage.buckets (id, name, public)
values ('sighting-images', 'sighting-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read sighting images" on storage.objects;
create policy "Public can read sighting images"
on storage.objects
for select
to public
using (bucket_id = 'sighting-images');

drop policy if exists "Anon can upload sighting images" on storage.objects;
create policy "Anon can upload sighting images"
on storage.objects
for insert
to anon
with check (bucket_id = 'sighting-images');

drop policy if exists "Anon can delete own session uploaded images by path" on storage.objects;
create policy "Anon can delete own session uploaded images by path"
on storage.objects
for delete
to anon
using (bucket_id = 'sighting-images');
