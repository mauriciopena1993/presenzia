-- Add insights_json to audit_jobs (enables interactive Searches + Action Plan tabs)
alter table audit_jobs
  add column if not exists insights_json jsonb;

-- Add business description to clients (collected at onboarding)
alter table clients
  add column if not exists description text;

-- Add pending plan change tracking to clients
alter table clients
  add column if not exists pending_plan_change text;

alter table clients
  add column if not exists pending_change_date timestamptz;
