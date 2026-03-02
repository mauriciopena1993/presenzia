import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';
import {
  FROM_EMAIL,
  adminDissatisfiedAlert,
} from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

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
 *
 * Side effects:
 * - 1-3★: Flags client as dissatisfied, suppresses marketing, sends personal outreach email
 * - 4-5★: Ensures marketing is NOT suppressed (in case they were previously flagged)
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
    .select('id, business_name')
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

  // ── Post-rating actions ──────────────────────────────────────────────
  const businessName = client.business_name || '';

  if (rating <= 3) {
    // DISSATISFIED: Suppress marketing + send personal outreach + alert admin
    // Update client to suppress marketing (gracefully handle missing column)
    await supabase
      .from('clients')
      .update({ marketing_suppressed: true, updated_at: new Date().toISOString() })
      .eq('id', client.id)
      .then(({ error: updateErr }) => {
        if (updateErr) {
          console.warn('Could not set marketing_suppressed (column may not exist):', updateErr.message);
        }
      });

    // Outreach email to the client is sent 24h later by the campaign cron
    // Alert admin immediately so they can follow up
    if (process.env.RESEND_API_KEY) {
      const adminAlert = adminDissatisfiedAlert(email, businessName, rating, comment?.trim() || null);
      resend.emails.send({
        from: FROM_EMAIL,
        to: 'hello@presenzia.ai',
        subject: adminAlert.subject,
        html: adminAlert.html,
      }).catch(err => console.error('Failed to send admin dissatisfied alert:', err));
    }

    console.log(`⚠️ Dissatisfied client flagged: ${businessName || email} (${rating}★) — marketing suppressed`);

  } else if (rating >= 4) {
    // HAPPY: Ensure marketing is NOT suppressed
    await supabase
      .from('clients')
      .update({ marketing_suppressed: false, updated_at: new Date().toISOString() })
      .eq('id', client.id)
      .then(({ error: updateErr }) => {
        if (updateErr) {
          // Column may not exist yet — that's OK
          console.warn('Could not clear marketing_suppressed:', updateErr.message);
        }
      });
  }

  return NextResponse.json({ rating: upserted });
}
