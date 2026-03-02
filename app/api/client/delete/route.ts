import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

/**
 * POST /api/client/delete
 * Body: { confirm: true }
 *
 * Permanently deletes a client account and all associated data:
 * - Cancels any active Stripe subscription immediately
 * - Deletes report files from Supabase Storage
 * - Deletes report_ratings linked to audit_jobs
 * - Deletes audit_jobs
 * - Deletes campaign_emails
 * - Deletes the client record
 * - Clears the session cookie
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { confirm } = await req.json();
  if (confirm !== true) {
    return NextResponse.json({ error: 'Must confirm deletion' }, { status: 400 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, email, stripe_subscription_id, stripe_customer_id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  try {
    // 1. Cancel Stripe subscription immediately (not at period end)
    if (client.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(client.stripe_subscription_id);
      } catch (e) {
        // Subscription may already be cancelled — continue
        console.warn('Stripe subscription cancel:', e);
      }
    }

    // 2. Get all audit jobs to find report paths and job IDs
    const { data: jobs } = await supabase
      .from('audit_jobs')
      .select('id, report_path')
      .eq('client_id', client.id);

    if (jobs && jobs.length > 0) {
      // 3. Delete report files from storage
      const reportPaths = jobs
        .map(j => j.report_path)
        .filter((p): p is string => !!p);
      if (reportPaths.length > 0) {
        await supabase.storage.from('reports').remove(reportPaths);
      }

      // 4. Delete report_ratings for these audit jobs
      const jobIds = jobs.map(j => j.id);
      await supabase
        .from('report_ratings')
        .delete()
        .in('audit_job_id', jobIds);

      // 5. Delete audit jobs
      await supabase
        .from('audit_jobs')
        .delete()
        .eq('client_id', client.id);
    }

    // 6. Delete campaign emails
    await supabase
      .from('campaign_emails')
      .delete()
      .eq('recipient_email', email);

    // 7. Delete the client record
    await supabase
      .from('clients')
      .delete()
      .eq('id', client.id);

    // 8. Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err: unknown) {
    console.error('Delete account error:', err);
    const message = err instanceof Error ? err.message : 'Deletion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
