import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid } = verifySessionToken(token);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

  // Reset job to pending so the processor can pick it up
  const { error } = await supabase
    .from('audit_jobs')
    .update({ status: 'pending', error: null, started_at: null })
    .eq('id', jobId);

  if (error) {
    return NextResponse.json({ error: 'Failed to reset job' }, { status: 500 });
  }

  // Fire-and-forget the audit processor
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://presenzia.ai';
  fetch(`${baseUrl}/api/process-audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
    },
    body: JSON.stringify({ jobId }),
  }).catch(err => console.error('Failed to trigger retry:', err));

  return NextResponse.json({ ok: true });
}
