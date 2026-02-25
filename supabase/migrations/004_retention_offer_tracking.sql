-- Track when a client last accepted a retention discount offer.
-- Used to enforce a 3-month cooldown before offering again.
alter table clients
  add column if not exists last_retention_offer_at timestamptz;
