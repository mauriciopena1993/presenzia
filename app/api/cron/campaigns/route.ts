/**
 * Vercel Cron: Email Campaign Runner
 *
 * Runs daily at 08:00 UTC (9am UK time).
 * Processes all email campaigns:
 *
 * 1. Free Score → Full Audit nurture (3 emails over 7 days)
 * 2. Post-Audit → Rating request (1 email, 48h after report)
 * 2b. Audit → Growth/Premium upsell (2 emails, days 3+7 after one-off audit)
 * 3. Happy Customer → Review, Referral, Social (3 emails over 7 days)
 * 4. Dissatisfied Customer → Company outreach (24h after negative rating)
 * 5. Win-back → Cancelled clients (2 emails: 7 days, 30 days)
 * 6. Renewal Reminder → Active subscribers (1 email, 7 days before billing)
 * 7. Re-audit Report Reminder → Monitoring clients (monthly gentle nudge)
 *
 * Uses Hormozi "Money Models" framework:
 * - Value-first messaging
 * - Dream outcome focus
 * - Perceived likelihood of achievement
 * - Minimal effort/sacrifice positioning
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { PLAN_LABELS } from '@/lib/plans';
import { Resend } from 'resend';
import {
  FROM_EMAIL,
  REPLY_TO,
  freeScoreNurture1,
  freeScoreNurture2,
  freeScoreNurture3,
  ratingRequest,
  auditUpsell1,
  auditUpsell2,
  happyReviewRequest,
  happyReferralRequest,
  happySocialFollow,
  dissatisfiedOutreach,
  winBack1,
  winBack2,
  renewalReminder,
  reauditReportReminder,
} from '@/lib/email/templates';

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: hours since a date
function hoursSince(date: string): number {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
}

// Helper: days since a date
function daysSince(date: string): number {
  return hoursSince(date) / 24;
}

// Helper: check if a campaign email was already sent
async function wasSent(recipientEmail: string, campaignKey: string): Promise<boolean> {
  const { data } = await supabase
    .from('campaign_emails')
    .select('id')
    .eq('recipient_email', recipientEmail)
    .eq('campaign_key', campaignKey)
    .limit(1)
    .single();
  return !!data;
}

// Helper: record that a campaign email was sent
async function recordSent(recipientEmail: string, campaignKey: string): Promise<void> {
  await supabase
    .from('campaign_emails')
    .insert({ recipient_email: recipientEmail, campaign_key: campaignKey, sent_at: new Date().toISOString() });
}

// Helper: check if marketing is suppressed for a client
async function isMarketingSuppressed(clientId: string): Promise<boolean> {
  const { data } = await supabase
    .from('clients')
    .select('marketing_suppressed')
    .eq('id', clientId)
    .single();
  return data?.marketing_suppressed === true;
}

// Helper: send an email and record it
async function sendCampaignEmail(
  to: string,
  campaignKey: string,
  emailContent: { subject: string; html: string; text?: string },
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Campaign] Skipping ${campaignKey} → ${to} (no RESEND_API_KEY)`);
    return false;
  }

  // Check if already sent
  const sent = await wasSent(to, campaignKey);
  if (sent) return false;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: [{ name: 'campaign', value: campaignKey }],
    });
    await recordSent(to, campaignKey);
    console.log(`📧 [Campaign] Sent ${campaignKey} → ${to}`);
    return true;
  } catch (err) {
    console.error(`[Campaign] Failed to send ${campaignKey} → ${to}:`, err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = { sent: 0, skipped: 0, errors: 0 };

  try {
    // ─── CAMPAIGN 1: Free Score → Full Audit Nurture ───────────────────────
    const { data: freeScores } = await supabase
      .from('free_scores')
      .select('email, business_name, overall_score, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (freeScores) {
      for (const score of freeScores) {
        if (!score.email || !score.business_name) continue;
        const days = daysSince(score.created_at);

        // Check if this lead already converted to a client
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('email', score.email)
          .limit(1)
          .single();
        if (client) continue; // Already a client — skip

        // Email 1: After 24 hours
        if (days >= 1 && days < 3) {
          const email = freeScoreNurture1(score.business_name, score.overall_score || 0, score.email);
          const sent = await sendCampaignEmail(score.email, 'free_score_nurture_1', email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Email 2: After 3 days
        else if (days >= 3 && days < 7) {
          const email = freeScoreNurture2(score.business_name, score.overall_score || 0, score.email);
          const sent = await sendCampaignEmail(score.email, 'free_score_nurture_2', email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Email 3: After 7 days (last chance)
        else if (days >= 7 && days < 14) {
          const email = freeScoreNurture3(score.business_name, score.email);
          const sent = await sendCampaignEmail(score.email, 'free_score_nurture_3', email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 2: Post-Audit → Rating Request ──────────────────────────
    const { data: recentAudits } = await supabase
      .from('audit_jobs')
      .select('id, client_id, overall_score, completed_at, clients!inner(email, business_name, marketing_suppressed)')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(200);

    if (recentAudits) {
      for (const audit of recentAudits) {
        if (!audit.completed_at || !audit.clients) continue;
        const clientData = audit.clients as unknown as { email: string; business_name: string; marketing_suppressed: boolean };
        if (clientData.marketing_suppressed) continue;

        const days = daysSince(audit.completed_at);

        // Check if they already rated this audit
        const { data: existingRating } = await supabase
          .from('report_ratings')
          .select('id')
          .eq('audit_job_id', audit.id)
          .limit(1)
          .single();
        if (existingRating) continue; // Already rated

        // Send 48h after audit completion
        if (days >= 2 && days < 7) {
          const email = ratingRequest(
            clientData.business_name,
            audit.id,
            audit.overall_score || 0,
            clientData.email,
          );
          const sent = await sendCampaignEmail(clientData.email, `rating_request_${audit.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 2b: Audit → Growth/Premium Upsell ───────────────────────
    // Target: one-off audit customers who haven't upgraded to a subscription
    const { data: auditClients } = await supabase
      .from('clients')
      .select('id, email, business_name, plan, marketing_suppressed')
      .eq('plan', 'audit')
      .limit(200);

    if (auditClients) {
      for (const client of auditClients) {
        if (!client.email || client.marketing_suppressed) continue;

        // Find their completed audit
        const { data: completedAudit } = await supabase
          .from('audit_jobs')
          .select('id, overall_score, completed_at')
          .eq('client_id', client.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (!completedAudit?.completed_at) continue;
        const days = daysSince(completedAudit.completed_at);

        // Upsell 1: 3 days after audit
        if (days >= 3 && days < 7) {
          const email = auditUpsell1(client.business_name || '', completedAudit.overall_score || 0, client.email);
          const sent = await sendCampaignEmail(client.email, `audit_upsell_1_${client.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Upsell 2: 7 days after audit
        else if (days >= 7 && days < 14) {
          const email = auditUpsell2(client.business_name || '', client.email);
          const sent = await sendCampaignEmail(client.email, `audit_upsell_2_${client.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 3: Happy Customer → Review, Referral, Social ────────────
    const { data: happyRatings } = await supabase
      .from('report_ratings')
      .select('id, client_id, rating, created_at, clients!inner(email, business_name, marketing_suppressed)')
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(200);

    if (happyRatings) {
      for (const r of happyRatings) {
        if (!r.clients) continue;
        const clientData = r.clients as unknown as { email: string; business_name: string; marketing_suppressed: boolean };
        if (clientData.marketing_suppressed) continue;

        const days = daysSince(r.created_at);

        // Email 1: Trustpilot review request (immediate / next day)
        if (days >= 0.5 && days < 3) {
          const email = happyReviewRequest(clientData.business_name, clientData.email);
          const sent = await sendCampaignEmail(clientData.email, `happy_review_${r.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Email 2: Referral request (3 days after rating)
        else if (days >= 3 && days < 7) {
          const email = happyReferralRequest(clientData.business_name, clientData.email);
          const sent = await sendCampaignEmail(clientData.email, `happy_referral_${r.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Email 3: Social follow (7 days after rating)
        else if (days >= 7 && days < 14) {
          const email = happySocialFollow(clientData.business_name, clientData.email);
          const sent = await sendCampaignEmail(clientData.email, `happy_social_${r.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 4: Dissatisfied Customer → Company outreach (24h delay) ──
    const { data: dissatisfiedRatings } = await supabase
      .from('report_ratings')
      .select('id, client_id, rating, comment, created_at, clients!inner(email, business_name, marketing_suppressed)')
      .lte('rating', 3)
      .order('created_at', { ascending: false })
      .limit(200);

    if (dissatisfiedRatings) {
      for (const r of dissatisfiedRatings) {
        if (!r.clients) continue;
        const clientData = r.clients as unknown as { email: string; business_name: string; marketing_suppressed: boolean };
        if (!clientData.email) continue;

        const days = daysSince(r.created_at);

        // Send 24h after the negative rating
        if (days >= 1 && days < 7) {
          const email = dissatisfiedOutreach(clientData.business_name, r.rating, clientData.email);
          const sent = await sendCampaignEmail(clientData.email, `dissatisfied_outreach_${r.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 5: Win-back for Cancelled Clients ───────────────────────
    const { data: cancelledClients } = await supabase
      .from('clients')
      .select('id, email, business_name, status, updated_at, marketing_suppressed')
      .eq('status', 'cancelled')
      .limit(200);

    if (cancelledClients) {
      for (const client of cancelledClients) {
        if (!client.email || client.marketing_suppressed) continue;
        const days = daysSince(client.updated_at);

        // Email 1: 7 days after cancellation
        if (days >= 7 && days < 14) {
          const email = winBack1(client.business_name || '', client.email);
          const sent = await sendCampaignEmail(client.email, `winback_1_${client.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
        // Email 2: 30 days after cancellation
        else if (days >= 30 && days < 45) {
          const email = winBack2(client.business_name || '', client.email);
          const sent = await sendCampaignEmail(client.email, `winback_2_${client.id}`, email);
          sent ? stats.sent++ : stats.skipped++;
        }
      }
    }

    // ─── CAMPAIGN 6: Renewal Reminder (7 days before billing) ─────────
    const { data: activeSubscribers } = await supabase
      .from('clients')
      .select('id, email, business_name, plan, stripe_customer_id, marketing_suppressed')
      .in('plan', ['growth', 'premium', 'starter'])
      .eq('status', 'active')
      .limit(200);

    if (activeSubscribers) {
      for (const client of activeSubscribers) {
        if (!client.email || !client.stripe_customer_id || client.marketing_suppressed) continue;

        // Use a per-month campaign key so we only remind once per billing cycle
        const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const campaignKey = `renewal_reminder_${client.id}_${monthKey}`;
        const alreadySent = await wasSent(client.email, campaignKey);
        if (alreadySent) { stats.skipped++; continue; }

        try {
          // Retrieve upcoming invoice to get next payment date and amount
          const upcomingInvoice = await stripe.invoices.createPreview({
            customer: client.stripe_customer_id,
          });

          if (!upcomingInvoice.next_payment_attempt) continue;

          const renewalDate = new Date(upcomingInvoice.next_payment_attempt * 1000);
          const daysUntilRenewal = (renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

          // Send reminder 5-8 days before renewal
          if (daysUntilRenewal >= 5 && daysUntilRenewal <= 8) {
            const planName = PLAN_LABELS[client.plan] || client.plan;
            const amount = upcomingInvoice.amount_due
              ? `£${(upcomingInvoice.amount_due / 100).toFixed(0)}`
              : '';
            const formattedDate = renewalDate.toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            });

            const emailContent = renewalReminder(
              client.business_name || '',
              planName,
              amount,
              formattedDate,
              client.email,
            );
            const sent = await sendCampaignEmail(client.email, campaignKey, emailContent);
            sent ? stats.sent++ : stats.skipped++;
          }
        } catch {
          // Stripe lookup failed — skip silently (subscription may not exist anymore)
          stats.errors++;
        }
      }
    }

    // ─── CAMPAIGN 7: Monthly Re-audit Report Reminder ─────────────────
    // Gentle nudge for Growth/Premium clients whose latest report they haven't
    // received by email (because the full PDF email is throttled to ~monthly).
    const { data: monitoringClients } = await supabase
      .from('clients')
      .select('id, email, business_name, plan, marketing_suppressed')
      .in('plan', ['growth', 'premium'])
      .eq('status', 'active')
      .limit(200);

    if (monitoringClients) {
      for (const client of monitoringClients) {
        if (!client.email || client.marketing_suppressed) continue;

        // Get latest completed audit
        const { data: latestAudit } = await supabase
          .from('audit_jobs')
          .select('id, overall_score, grade, completed_at')
          .eq('client_id', client.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (!latestAudit?.completed_at) continue;

        const daysSinceAudit = daysSince(latestAudit.completed_at);
        // Only remind about audits completed in the last 7 days (recent enough to be relevant)
        if (daysSinceAudit > 7) continue;

        // Use monthly key so we only send once per month
        const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const campaignKey = `reaudit_reminder_${client.id}_${monthKey}`;
        const alreadySent = await wasSent(client.email, campaignKey);
        if (alreadySent) { stats.skipped++; continue; }

        // Get previous audit score for trend comparison
        const { data: prevAudit } = await supabase
          .from('audit_jobs')
          .select('overall_score')
          .eq('client_id', client.id)
          .eq('status', 'completed')
          .neq('id', latestAudit.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        const emailContent = reauditReportReminder(
          client.business_name || '',
          latestAudit.overall_score || 0,
          latestAudit.grade || 'N/A',
          prevAudit?.overall_score ?? null,
          client.email,
        );
        const sent = await sendCampaignEmail(client.email, campaignKey, emailContent);
        sent ? stats.sent++ : stats.skipped++;
      }
    }

    console.log(`✅ Campaign cron complete: ${stats.sent} sent, ${stats.skipped} skipped`);
    return NextResponse.json({ success: true, stats });

  } catch (err) {
    console.error('Campaign cron error:', err);
    return NextResponse.json({ error: 'Campaign cron failed' }, { status: 500 });
  }
}
