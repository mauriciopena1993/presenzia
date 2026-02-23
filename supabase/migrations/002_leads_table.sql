-- Leads table for funnel tracking
-- Stores users who started onboarding but haven't paid yet

CREATE TABLE IF NOT EXISTS leads (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email           TEXT,
  contact_name    TEXT,
  business_name   TEXT NOT NULL,
  business_type   TEXT NOT NULL,
  location        TEXT,
  website         TEXT,
  keywords        TEXT[],
  plan            TEXT NOT NULL,
  converted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_idx ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_converted_idx ON leads(converted_at) WHERE converted_at IS NULL;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
