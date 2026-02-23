-- Presenzia.ai initial schema
-- Run this in your Supabase SQL editor (Database → SQL editor → New query)

-- ============================================================
-- CLIENTS
-- One row per paying customer. Created by the Stripe webhook.
-- ============================================================
create table if not exists clients (
  id                    uuid primary key default gen_random_uuid(),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  email                 text not null,
  plan                  text not null check (plan in ('starter', 'growth', 'premium')),
  status                text not null default 'active'
                          check (status in ('active', 'cancelled', 'past_due', 'trialing')),

  -- Business info collected at onboarding
  business_name         text,
  business_type         text,
  location              text,
  keywords              text[],
  website               text,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ============================================================
-- AUDIT JOBS
-- One row per audit run. Created by the webhook, processed async.
-- ============================================================
create table if not exists audit_jobs (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references clients(id) on delete cascade,

  status          text not null default 'pending'
                    check (status in ('pending', 'running', 'completed', 'failed')),

  -- Results (filled in after completion)
  overall_score   integer,
  grade           text,
  summary         text,
  platforms_json  jsonb,         -- Full PlatformScore[] array
  competitors_json jsonb,        -- Full topCompetitors array
  report_path     text,          -- Storage path for the PDF

  error           text,          -- Error message if failed

  created_at      timestamptz default now(),
  started_at      timestamptz,
  completed_at    timestamptz
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_audit_jobs_client_id on audit_jobs(client_id);
create index if not exists idx_audit_jobs_status on audit_jobs(status);
create index if not exists idx_clients_stripe_customer on clients(stripe_customer_id);
create index if not exists idx_clients_email on clients(email);

-- ============================================================
-- AUTO-UPDATE updated_at on clients
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_updated_at on clients;
create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Enable RLS — service role key bypasses it (used server-side).
-- Clients will only see their own data via the dashboard.
-- ============================================================
alter table clients enable row level security;
alter table audit_jobs enable row level security;

-- Service role has full access (used in API routes)
-- No additional policies needed for server-side usage with service role key.
