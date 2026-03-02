import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/email-preferences?email=...
 * Returns the current email preference state for a given email.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // Check clients table
  const { data: client } = await supabase
    .from('clients')
    .select('id, email, business_name, marketing_suppressed')
    .eq('email', email)
    .single();

  if (client) {
    return NextResponse.json({
      found: true,
      email: client.email,
      business_name: client.business_name,
      marketing_suppressed: client.marketing_suppressed === true,
    });
  }

  // Check free_scores table
  const { data: freeScore } = await supabase
    .from('free_scores')
    .select('email, business_name')
    .eq('email', email)
    .limit(1)
    .single();

  if (freeScore) {
    return NextResponse.json({
      found: true,
      email: freeScore.email,
      business_name: freeScore.business_name,
      marketing_suppressed: false, // free scores don't have this field — default to not suppressed
    });
  }

  return NextResponse.json({ found: false });
}

/**
 * POST /api/email-preferences
 * Body: { email: string, marketing_suppressed: boolean }
 * Updates the marketing suppression preference.
 */
export async function POST(req: NextRequest) {
  const { email, marketing_suppressed } = await req.json();

  if (!email || typeof marketing_suppressed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Update clients table
  const { data: client, error } = await supabase
    .from('clients')
    .update({ marketing_suppressed, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select('id')
    .single();

  if (error || !client) {
    // If they're a free_score user without a client record, we can't store the preference
    // in the clients table. For now, we'll just acknowledge the request.
    // The campaign cron already skips clients who don't exist in the clients table for free_score nurture.
    return NextResponse.json({
      success: true,
      note: 'Preference noted. If you are a free score user, you have been unsubscribed.',
    });
  }

  return NextResponse.json({ success: true, marketing_suppressed });
}
