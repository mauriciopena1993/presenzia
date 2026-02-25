create table if not exists public.report_ratings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  audit_job_id uuid not null references public.audit_jobs(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create unique index idx_report_ratings_job on public.report_ratings(audit_job_id);
create index idx_report_ratings_client on public.report_ratings(client_id);

alter table public.report_ratings enable row level security;
