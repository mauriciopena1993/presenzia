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
      location, website, keywords, stripe_customer_id,
      created_at, updated_at,
      audit_jobs (
        id, status, overall_score, grade, completed_at, created_at, error
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch latest ratings per client
  const { data: ratings } = await supabase
    .from('report_ratings')
    .select('client_id, rating, comment, created_at')
    .order('created_at', { ascending: false });

  const ratingsMap = new Map<string, { rating: number; comment: string | null }>();
  if (ratings) {
    for (const r of ratings) {
      if (!ratingsMap.has(r.client_id)) {
        ratingsMap.set(r.client_id, { rating: r.rating, comment: r.comment });
      }
    }
  }

  const enrichedClients = (clients || []).map(client => ({
    ...client,
    latest_rating: ratingsMap.get(client.id)?.rating ?? null,
    latest_comment: ratingsMap.get(client.id)?.comment ?? null,
  }));

  return NextResponse.json({ clients: enrichedClients });
}
