create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_number text,
  niche text,
  brand_tone text default 'premium',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  source_channel text default 'whatsapp',
  style_profile text,
  budget_range text,
  notes text,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  constraint customers_store_phone_unique unique (store_id, phone)
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  selfie_url text,
  undertone text,
  depth text,
  contrast_level text,
  season text,
  best_colors text[] default '{}',
  avoid_colors text[] default '{}',
  metals text[] default '{}',
  hair_suggestions text[] default '{}',
  style_notes text,
  confidence_score numeric(5,2),
  raw_report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_preferences (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  favorite_colors text[] default '{}',
  avoided_colors text[] default '{}',
  preferred_styles text[] default '{}',
  favorite_fabrics text[] default '{}',
  preferred_occasions text[] default '{}',
  price_min numeric(10,2),
  price_max numeric(10,2),
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  sku text,
  name text not null,
  description text,
  color_name text,
  color_hex text,
  dominant_season text[] default '{}',
  undertone_match text[] default '{}',
  style_tags text[] default '{}',
  fabric text,
  occasion_tags text[] default '{}',
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint products_store_sku_unique unique (store_id, sku)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  title text not null,
  message_template text not null,
  target_seasons text[] default '{}',
  target_styles text[] default '{}',
  status text not null default 'draft',
  launched_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  phone text,
  delivery_status text not null default 'queued',
  sent_at timestamptz,
  response_payload jsonb not null default '{}'::jsonb,
  constraint campaign_customer_unique unique (campaign_id, customer_id)
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null default 'whatsapp',
  direction text not null,
  provider text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select store_id from public.profiles where id = auth.uid();
$$;

create or replace function public.touch_customer_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_customer_preferences_updated_at
before update on public.customer_preferences
for each row execute function public.touch_customer_preferences_updated_at();

create or replace function public.match_products_for_customer(p_customer_id uuid)
returns table (
  product_id uuid,
  product_name text,
  color_name text,
  price numeric,
  image_url text,
  score integer
)
language sql
security definer
set search_path = public
as $$
with customer_context as (
  select c.id, c.store_id, a.season, a.undertone, cp.preferred_styles
  from public.customers c
  left join lateral (
    select season, undertone
    from public.analyses a
    where a.customer_id = c.id
    order by a.created_at desc
    limit 1
  ) a on true
  left join public.customer_preferences cp on cp.customer_id = c.id
  where c.id = p_customer_id
    and c.store_id = public.current_store_id()
)
select
  p.id as product_id,
  p.name as product_name,
  p.color_name,
  p.price,
  p.image_url,
  (
    case when cc.season is not null and cc.season = any(p.dominant_season) then 50 else 0 end +
    case when cc.undertone is not null and cc.undertone = any(p.undertone_match) then 20 else 0 end +
    coalesce((
      select count(*)::int * 5
      from unnest(coalesce(cc.preferred_styles, '{}')) pref
      where pref = any(p.style_tags)
    ), 0) +
    case when p.stock > 0 and p.active then 10 else -100 end
  )::int as score
from customer_context cc
join public.products p on p.store_id = cc.store_id
where p.active = true
order by score desc, p.created_at desc
limit 12;
$$;

create or replace view public.v_customer_latest_analysis as
select distinct on (a.customer_id)
  a.customer_id,
  a.store_id,
  a.season,
  a.undertone,
  a.depth,
  a.contrast_level,
  a.best_colors,
  a.created_at
from public.analyses a
order by a.customer_id, a.created_at desc;

alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.analyses enable row level security;
alter table public.customer_preferences enable row level security;
alter table public.products enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;
alter table public.message_logs enable row level security;

create policy if not exists stores_select_own on public.stores
for select using (id = public.current_store_id());
create policy if not exists stores_update_own on public.stores
for update using (id = public.current_store_id());
create policy if not exists stores_insert_authenticated on public.stores
for insert to authenticated with check (true);

create policy if not exists profiles_select_own on public.profiles
for select using (id = auth.uid());
create policy if not exists profiles_insert_own on public.profiles
for insert to authenticated with check (id = auth.uid());
create policy if not exists profiles_update_own on public.profiles
for update using (id = auth.uid());

create policy if not exists customers_store_isolation on public.customers
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists analyses_store_isolation on public.analyses
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists customer_preferences_store_isolation on public.customer_preferences
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists products_store_isolation on public.products
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists campaigns_store_isolation on public.campaigns
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists campaign_recipients_store_isolation on public.campaign_recipients
for all to authenticated
using (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and c.store_id = public.current_store_id()
  )
)
with check (
  exists (
    select 1 from public.campaigns c
    where c.id = campaign_id
      and c.store_id = public.current_store_id()
  )
);

create policy if not exists message_logs_store_isolation on public.message_logs
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

grant usage on schema public to anon, authenticated;
grant select on public.v_customer_latest_analysis to authenticated;
grant execute on function public.current_store_id() to authenticated;
grant execute on function public.match_products_for_customer(uuid) to authenticated;
