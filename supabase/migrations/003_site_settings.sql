-- Site-wide key/value settings (e.g. overridden admin password hash)
create table if not exists site_settings (
  key   text primary key,
  value text not null,
  updated_at timestamptz default now()
);
