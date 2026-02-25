import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

/**
 * GET /api/client/rate?jobId=...
 * Returns the existing rating for the given audit job, if any.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Verify the job belongs to this client
  const { data: job } = await supabase
    .from('audit_jobs')
    .select('id')
    .eq('id', jobId)
    .eq('client_id', client.id)
    .single();

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  const { data: rating } = await supabase
    .from('report_ratings')
    .select('id, rating, comment, created_at')
    .eq('audit_job_id', jobId)
    .single();

  return NextResponse.json({ rating: rating || null });
}

/**
 * POST /api/client/rate
 * Body: { jobId: string, rating: number (1-5), comment?: string }
 * Upserts a rating for the given audit job.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { jobId, rating, comment } = body as {
    jobId?: string;
    rating?: number;
    comment?: string;
  };

  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Verify the job belongs to this client
  const { data: job } = await supabase
    .from('audit_jobs')
    .select('id')
    .eq('id', jobId)
    .eq('client_id', client.id)
    .single();

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  // Upsert: insert or update if a rating already exists for this job
  const { data: upserted, error } = await supabase
    .from('report_ratings')
    .upsert(
      {
        client_id: client.id,
        audit_job_id: jobId,
        rating,
        comment: comment?.trim() || null,
      },
      { onConflict: 'audit_job_id' },
    )
    .select('id, rating, comment, created_at')
    .single();

  if (error) {
    console.error('Rating upsert error:', error);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }

  return NextResponse.json({ rating: upserted });
}
