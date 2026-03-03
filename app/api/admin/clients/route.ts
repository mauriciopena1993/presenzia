import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token).valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id, email, plan, status, business_name, business_type,
      location, website, keywords, description, stripe_customer_id,
      stripe_subscription_id,
      pending_plan_change, pending_change_date, marketing_suppressed,
      last_retention_offer_at,
      created_at, updated_at,
      audit_jobs (
        id, status, overall_score, grade, summary,
        platforms_json, competitors_json, insights_json,
        completed_at, created_at, error, report_path
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch ALL ratings per client (not just latest)
  const { data: ratings } = await supabase
    .from('report_ratings')
    .select('client_id, audit_job_id, rating, comment, created_at')
    .order('created_at', { ascending: false });

  const allRatingsMap = new Map<string, Array<{ rating: number; comment: string | null; created_at: string; audit_job_id: string }>>();
  const latestRatingsMap = new Map<string, { rating: number; comment: string | null }>();
  if (ratings) {
    for (const r of ratings) {
      if (!allRatingsMap.has(r.client_id)) allRatingsMap.set(r.client_id, []);
      allRatingsMap.get(r.client_id)!.push({ rating: r.rating, comment: r.comment, created_at: r.created_at, audit_job_id: r.audit_job_id });
      if (!latestRatingsMap.has(r.client_id)) {
        latestRatingsMap.set(r.client_id, { rating: r.rating, comment: r.comment });
      }
    }
  }

  // Fetch campaign emails sent to each client
  const { data: campaignEmails } = await supabase
    .from('campaign_emails')
    .select('recipient_email, campaign_key, sent_at')
    .order('sent_at', { ascending: false });

  const campaignMap = new Map<string, Array<{ campaign_key: string; sent_at: string }>>();
  if (campaignEmails) {
    for (const ce of campaignEmails) {
      if (!campaignMap.has(ce.recipient_email)) campaignMap.set(ce.recipient_email, []);
      campaignMap.get(ce.recipient_email)!.push({ campaign_key: ce.campaign_key, sent_at: ce.sent_at });
    }
  }

  const enrichedClients = (clients || []).map(client => ({
    ...client,
    latest_rating: latestRatingsMap.get(client.id)?.rating ?? null,
    latest_comment: latestRatingsMap.get(client.id)?.comment ?? null,
    all_ratings: allRatingsMap.get(client.id) ?? [],
    campaign_emails: campaignMap.get(client.email) ?? [],
  }));

  return NextResponse.json({ clients: enrichedClients });
}
