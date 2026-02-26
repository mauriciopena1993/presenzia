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
    .select('id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const { data: reports } = await supabase
    .from('audit_jobs')
    .select('id, status, overall_score, grade, completed_at, created_at, report_path, platforms_json')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ reports: reports || [] });
}
