-- Fix: add 'audit' to the allowed plan values
-- The original constraint only allowed ('starter', 'growth', 'premium')
-- but the one-off Audit plan uses key 'audit'

-- Drop the old check constraint and add the updated one
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_check;
ALTER TABLE clients ADD CONSTRAINT clients_plan_check
  CHECK (plan IN ('audit', 'starter', 'growth', 'premium'));

-- Add unique constraint on email for upsert support
-- (allows email-based upsert as fallback when stripe_customer_id is null)
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique ON clients(email);
