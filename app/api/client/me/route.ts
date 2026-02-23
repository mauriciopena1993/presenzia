import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: client } = await supabase
    .from('clients')
    .select('id, email, plan, status, business_name, business_type, location, website, keywords, created_at')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Latest completed job
  const { data: latestJob } = await supabase
    .from('audit_jobs')
    .select('id, status, overall_score, grade, summary, platforms_json, competitors_json, report_path, created_at, completed_at')
    .eq('client_id', client.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Latest in-progress job (to show "audit running" state)
  const { data: pendingJob } = await supabase
    .from('audit_jobs')
    .select('id, status, created_at')
    .eq('client_id', client.id)
    .in('status', ['pending', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ client, latestJob: latestJob || null, pendingJob: pendingJob || null });
}
