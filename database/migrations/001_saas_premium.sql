create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_monthly numeric(10,2) not null default 0,
  price_yearly numeric(10,2),
  max_team_members integer not null default 1,
  max_whatsapp_instances integer not null default 1,
  max_ai_analyses_per_month integer,
  max_campaign_messages_per_month integer,
  features jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  provider text default 'manual',
  provider_subscription_id text,
  status text not null default 'trialing',
  billing_cycle text not null default 'monthly',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  slug text not null unique,
  brand_name text,
  primary_color text default '#7c3aed',
  logo_url text,
  support_email text,
  app_domain text,
  custom_domain text,
  locale text default 'pt-BR',
  currency_code text default 'BRL',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  provider text not null default 'evolution',
  instance_name text not null,
  base_url text not null,
  webhook_secret text,
  status text not null default 'inactive',
  connected_phone text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  constraint whatsapp_instance_unique unique (store_id, provider, instance_name)
);

create table if not exists public.tenant_usage_daily (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  usage_date date not null,
  ai_analyses integer not null default 0,
  outbound_messages integer not null default 0,
  inbound_messages integer not null default 0,
  campaign_launches integer not null default 0,
  active_customers integer not null default 0,
  unique (store_id, usage_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.store_invitations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  email text not null,
  role text not null default 'manager',
  invite_token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (store_id, email)
);

create index if not exists idx_whatsapp_instances_store_id on public.whatsapp_instances(store_id);
create index if not exists idx_tenant_usage_daily_store_date on public.tenant_usage_daily(store_id, usage_date desc);
create index if not exists idx_audit_logs_store_created_at on public.audit_logs(store_id, created_at desc);

create or replace function public.touch_updated_at_generic()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at_generic();

drop trigger if exists trg_tenant_settings_updated_at on public.tenant_settings;
create trigger trg_tenant_settings_updated_at
before update on public.tenant_settings
for each row execute function public.touch_updated_at_generic();

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_settings enable row level security;
alter table public.whatsapp_instances enable row level security;
alter table public.tenant_usage_daily enable row level security;
alter table public.audit_logs enable row level security;
alter table public.store_invitations enable row level security;

create policy if not exists plans_read_authenticated on public.plans
for select to authenticated using (active = true);

create policy if not exists subscriptions_store_isolation on public.subscriptions
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists tenant_settings_store_isolation on public.tenant_settings
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists whatsapp_instances_store_isolation on public.whatsapp_instances
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists tenant_usage_daily_store_isolation on public.tenant_usage_daily
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists audit_logs_store_isolation on public.audit_logs
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());

create policy if not exists store_invitations_store_isolation on public.store_invitations
for all to authenticated
using (store_id = public.current_store_id())
with check (store_id = public.current_store_id());
