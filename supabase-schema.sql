-- ============================================================================
-- MT Web Studio CRM — Supabase schema
-- Run this ENTIRE file once in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. LEADS TABLE — one row per client project request
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  reference_id text unique not null,
  business_name text not null,
  owner_name text not null,
  phone text not null,
  whatsapp text,
  email text not null,
  category text not null,
  district text not null,
  address text,
  social_links text,
  business_description text not null,
  business_goals text[] not null default '{}',
  package text not null,
  domain_status text,
  domain_name text,
  hosting_status text,
  hosting_provider text,
  pages text[] not null default '{}',
  features text[] not null default '{}',
  design_styles text[] not null default '{}',
  color_preferences text,
  reference_urls text,
  content_readiness text,
  available_assets text[] not null default '{}',
  uploaded_files jsonb not null default '[]',
  launch_date text,
  budget_range text,
  additional_notes text,
  status text not null default 'New',
  priority text not null default 'WARM',
  admin_notes jsonb not null default '[]',
  quotation jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PUBLIC STATUS TABLE — privacy-safe mirror clients can read via /track
create table if not exists public_status (
  reference_id text primary key,
  business_name text not null,
  status text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. PER-YEAR COUNTER TABLE — backs the atomic reference-ID generator
create table if not exists ref_counters (
  year int primary key,
  count int not null default 0
);

-- 4. ATOMIC REFERENCE ID GENERATOR
-- "insert ... on conflict ... do update ... returning" is a single atomic
-- statement in Postgres, so two simultaneous submissions can never collide.
create or replace function generate_reference_id()
returns text
language plpgsql
security definer
as $$
declare
  yr int := extract(year from now());
  new_count int;
begin
  insert into ref_counters (year, count) values (yr, 1)
  on conflict (year) do update set count = ref_counters.count + 1
  returning count into new_count;

  return 'MT-' || yr || '-' || lpad(new_count::text, 4, '0');
end;
$$;

grant execute on function generate_reference_id() to anon, authenticated;

-- 5. AUTO-SYNC public_status WHENEVER a lead is created or its status changes
-- (removes the need for the app to manually keep two tables in sync)
create or replace function sync_public_status()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public_status (reference_id, business_name, status, updated_at)
  values (new.reference_id, new.business_name, new.status, now())
  on conflict (reference_id) do update
    set status = excluded.status,
        business_name = excluded.business_name,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sync_public_status on leads;
create trigger trg_sync_public_status
after insert or update of status, business_name on leads
for each row execute function sync_public_status();

-- 6. updated_at auto-touch on leads
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_leads on leads;
create trigger trg_touch_leads
before update on leads
for each row execute function touch_updated_at();

-- 7. ADMIN ALLOWLIST
-- IMPORTANT: keep this list in sync with VITE_ADMIN_EMAILS in your .env.local.
-- The client-side check in AdminDashboard.tsx is a UX convenience only — this
-- function is the real security boundary, enforced by the RLS policies below.
create or replace function is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = any(array[
    'admin@mtwebstudio.com'
  ]);
$$;

-- 8. ROW LEVEL SECURITY
alter table leads enable row level security;
alter table public_status enable row level security;
alter table ref_counters enable row level security;

drop policy if exists "public can submit leads" on leads;
create policy "public can submit leads"
  on leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin can read leads" on leads;
create policy "admin can read leads"
  on leads for select
  to authenticated
  using (is_admin());

drop policy if exists "admin can update leads" on leads;
create policy "admin can update leads"
  on leads for update
  to authenticated
  using (is_admin());

drop policy if exists "admin can delete leads" on leads;
create policy "admin can delete leads"
  on leads for delete
  to authenticated
  using (is_admin());

drop policy if exists "anyone can read status" on public_status;
create policy "anyone can read status"
  on public_status for select
  to anon, authenticated
  using (true);
-- No insert/update/delete policy on public_status for anon/authenticated —
-- it can only be written by the SECURITY DEFINER trigger above.

-- ref_counters has RLS enabled with zero policies, so it's fully locked down;
-- only the SECURITY DEFINER function above can touch it.

-- 9. STORAGE BUCKET for client uploads (logo, photos, menu, other files)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 10485760, array['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf'])
on conflict (id) do update set
  file_size_limit = 10485760,
  allowed_mime_types = array['image/png','image/jpeg','image/jpg','image/webp','image/gif','application/pdf'];

drop policy if exists "public upload to uploads bucket" on storage.objects;
create policy "public upload to uploads bucket"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'uploads');

drop policy if exists "public read uploads bucket" on storage.objects;
create policy "public read uploads bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'uploads');

-- ============================================================================
-- Done. Next steps:
--   1. Authentication → Providers → make sure Email is enabled.
--   2. Authentication → Users → Add user → create your admin login
--      (email + password), using the SAME email as in is_admin() above and
--      VITE_ADMIN_EMAILS in .env.local.
-- ============================================================================
