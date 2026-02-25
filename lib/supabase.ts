import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

// Server-side client using the service role key.
// Bypasses RLS — only use in API routes, never expose to the browser.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Types mirroring the DB schema
export interface Client {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  email: string;
  plan: 'starter' | 'growth' | 'premium';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  keywords: string[] | null;
  website: string | null;
  last_retention_offer_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditJob {
  id: string;
  client_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overall_score: number | null;
  grade: string | null;
  summary: string | null;
  platforms_json: unknown | null;
  competitors_json: unknown | null;
  report_path: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}
