/**
 * Vercel Cron: Scheduled Re-audits
 *
 * Runs daily at 06:00 UTC.
 * - Premium clients: triggers a new audit every day
 * - Growth clients: triggers a new audit every 7 days
 *
 * Protected by CRON_SECRET (Vercel sets this automatically for cron jobs).
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret — Vercel sends this header for cron invocations
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const results: { client_id: string; plan: string; job_id?: string; error?: string }[] = [];

  try {
    // Fetch all active Growth and Premium clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, email, business_name, plan, status')
      .in('plan', ['growth', 'premium'])
      .eq('status', 'active');

    if (error || !clients) {
      console.error('Cron: Failed to fetch clients:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    for (const client of clients) {
      // Check the last completed audit for this client
      const { data: lastAudit } = await supabase
        .from('audit_jobs')
        .select('id, completed_at, created_at')
        .eq('client_id', client.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      // Also check if there's already a pending/running audit
      const { data: pendingAudit } = await supabase
        .from('audit_jobs')
        .select('id')
        .eq('client_id', client.id)
        .in('status', ['pending', 'running'])
        .limit(1)
        .single();

      if (pendingAudit) {
        // Already has a pending audit — skip
        results.push({ client_id: client.id, plan: client.plan, error: 'already_pending' });
        continue;
      }

      if (!lastAudit?.completed_at) {
        // No completed audit yet — skip (initial audit is triggered by webhook)
        results.push({ client_id: client.id, plan: client.plan, error: 'no_completed_audit' });
        continue;
      }

      const lastDate = new Date(lastAudit.completed_at);
      const hoursSinceLast = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);

      // Determine if re-audit is due
      let isDue = false;
      if (client.plan === 'premium' && hoursSinceLast >= 20) {
        // Premium: daily — trigger if >20h since last (with some buffer)
        isDue = true;
      } else if (client.plan === 'growth' && hoursSinceLast >= 6.5 * 24) {
        // Growth: weekly — trigger if >6.5 days since last (with some buffer)
        isDue = true;
      }

      if (!isDue) {
        results.push({ client_id: client.id, plan: client.plan, error: 'not_due' });
        continue;
      }

      // Create a new audit job
      const { data: job, error: jobError } = await supabase
        .from('audit_jobs')
        .insert({ client_id: client.id, status: 'pending' })
        .select('id')
        .single();

      if (jobError || !job) {
        console.error(`Cron: Failed to create audit job for ${client.id}:`, jobError);
        results.push({ client_id: client.id, plan: client.plan, error: 'job_create_failed' });
        continue;
      }

      // Fire-and-forget: trigger the audit processor
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/process-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(err => console.error(`Cron: Failed to trigger audit for ${client.id}:`, err));

      console.log(`🔄 Cron re-audit triggered: ${client.business_name || client.email} (${client.plan}) — job ${job.id}`);
      results.push({ client_id: client.id, plan: client.plan, job_id: job.id });
    }

    const triggered = results.filter(r => r.job_id).length;
    console.log(`✅ Cron complete: ${triggered} re-audits triggered out of ${clients.length} clients`);

    return NextResponse.json({
      success: true,
      triggered,
      total: clients.length,
      results,
    });
  } catch (err) {
    console.error('Cron: Unexpected error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
