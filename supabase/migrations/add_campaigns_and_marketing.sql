-- ═══════════════════════════════════════════════════════════════════════
-- Migration: Add email campaign tracking & marketing suppression
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Add marketing_suppressed column to clients table
-- Used to flag dissatisfied customers (1-3★ ratings) and suppress marketing emails
ALTER TABLE clients ADD COLUMN IF NOT EXISTS marketing_suppressed BOOLEAN DEFAULT false;

-- 2. Create campaign_emails table for tracking sent campaign emails
-- Prevents duplicate sends and enables campaign analytics
CREATE TABLE IF NOT EXISTS campaign_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  campaign_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipient_email, campaign_key)
);

-- Index for fast lookups by recipient
CREATE INDEX IF NOT EXISTS idx_campaign_emails_recipient ON campaign_emails(recipient_email);

-- Index for campaign analytics
CREATE INDEX IF NOT EXISTS idx_campaign_emails_key ON campaign_emails(campaign_key);

-- 3. Enable RLS (Row Level Security) on campaign_emails
-- Only service role should read/write this table
ALTER TABLE campaign_emails ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role full access" ON campaign_emails
  FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION: Run these to confirm everything was created
-- ═══════════════════════════════════════════════════════════════════════
-- SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'marketing_suppressed';
-- SELECT * FROM campaign_emails LIMIT 0;
