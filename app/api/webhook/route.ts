import { NextRequest, NextResponse } from 'next/server';
import { stripe, planFromPriceId } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { PLAN_LABELS } from '@/lib/plans';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

import { FROM_EMAIL, REPLY_TO } from '@/lib/email/templates';

const ADMIN_EMAIL = 'hello@presenzia.ai';

async function notifyAdmin(subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping admin notification');
    return;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject, html });
    console.log(`📧 Admin notified: ${subject}`);
  } catch (err) {
    console.error('Failed to send admin email:', err);
  }
}

function adminCard(rows: [string, string][], accentColor = '#C9A84C') {
  const rowsHtml = rows
    .map(([label, value]) => `<tr>
      <td style="color:#999;font-size:12px;padding:6px 0;width:130px;">${label}</td>
      <td style="color:#F5F0E8;font-size:13px;">${value}</td>
    </tr>`)
    .join('');
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0A;color:#F5F0E8;padding:40px;">
    <div style="font-size:18px;font-weight:600;margin-bottom:4px;border-bottom:2px solid ${accentColor};padding-bottom:12px;margin-bottom:24px;">
      presenzia<span style="color:${accentColor};">.ai</span> <span style="color:#888;font-size:12px;font-weight:400;">Admin notification</span>
    </div>
    <div style="background:#111;border:1px solid #222;padding:20px;">
      <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
    </div>
  </div>`;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ─── NEW CLIENT SIGNED UP ────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};

        // ── Handle plan upgrade payments ──
        if (metadata.type === 'plan_upgrade') {
          const { client_id, to_plan, subscription_id, subscription_item_id, price_id, email: clientEmail, business_name } = metadata;

          if (subscription_id && subscription_item_id && price_id && to_plan) {
            try {
              // Update the Stripe subscription to the new plan (no proration — already paid via checkout)
              await stripe.subscriptions.update(subscription_id, {
                items: [{ id: subscription_item_id, price: price_id }],
                proration_behavior: 'none',
                metadata: { plan: to_plan },
              });

              // Update DB
              await supabase
                .from('clients')
                .update({
                  plan: to_plan,
                  status: 'active',
                  pending_plan_change: null,
                  pending_change_date: null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', client_id);

              console.log(`✅ Upgrade completed: ${clientEmail} → ${to_plan}`);

              // Send confirmation email
              const { sendPlanChangeEmail } = await import('../client/change-plan/route');
              sendPlanChangeEmail(clientEmail || '', business_name || '', to_plan, true);

              // Notify admin
              await notifyAdmin(
                `⬆️ Upgrade: ${business_name || clientEmail} → ${PLAN_LABELS[to_plan] || to_plan}`,
                adminCard([
                  ['Client', business_name || '—'],
                  ['Email', clientEmail || '—'],
                  ['New plan', `<span style="color:#C9A84C;font-weight:600;">${PLAN_LABELS[to_plan] || to_plan}</span>`],
                  ['Payment', `£${((session.amount_total || 0) / 100).toFixed(2)} (prorated)`],
                ], '#4a9e6a')
              );
            } catch (err) {
              console.error('Failed to process upgrade checkout:', err);
            }
          }
          break;
        }

        // ── Handle new client signup ──
        const plan = metadata.plan as 'audit' | 'starter' | 'growth' | 'premium';
        const email = session.customer_email || session.customer_details?.email || '';

        if (!email || !plan) {
          console.error('Missing email or plan in checkout.session.completed', { email, plan });
          break;
        }

        const businessName = metadata.business_name || '';
        const businessType = metadata.business_type || '';
        const description = metadata.description || '';
        const location = metadata.location || '';
        const website = metadata.website || null;
        const keywordsRaw = metadata.keywords || '';
        const keywords = keywordsRaw
          ? keywordsRaw.split(',').map((k: string) => k.trim()).filter(Boolean)
          : null;

        // Upsert client record
        const clientRecord: Record<string, unknown> = {
          email,
          plan,
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          business_name: businessName || null,
          business_type: businessType || null,
          description: description || null,
          location: location || null,
          website,
          keywords,
          updated_at: new Date().toISOString(),
        };

        let client: { id: string } | null = null;

        const { data: c1, error: e1 } = await supabase
          .from('clients')
          .upsert(clientRecord, { onConflict: 'stripe_customer_id' })
          .select('id')
          .single();

        if (e1 || !c1) {
          // Fallback: description column might not exist yet
          console.warn('Client upsert failed, retrying without description:', e1?.message);
          delete clientRecord.description;
          const { data: c2, error: e2 } = await supabase
            .from('clients')
            .upsert(clientRecord, { onConflict: 'stripe_customer_id' })
            .select('id')
            .single();
          if (e2 || !c2) {
            console.error('Failed to upsert client:', e2);
            break;
          }
          client = c2;
        } else {
          client = c1;
        }

        if (!client) break;

        console.log(`Client created/updated: ${email} (${plan}) - ${businessName} in ${location} -> ${client.id}`);

        // Create initial audit job
        const { data: job, error: jobError } = await supabase
          .from('audit_jobs')
          .insert({ client_id: client.id, status: 'pending' })
          .select('id')
          .single();

        if (jobError || !job) {
          console.error('Failed to create audit job:', jobError);
          break;
        }

        console.log(`Audit job queued: ${job.id}`);

        // Mark any matching lead as converted
        await supabase
          .from('leads')
          .update({ converted_at: new Date().toISOString() })
          .eq('email', email)
          .is('converted_at', null);

        // ✉️ Notify admin
        await notifyAdmin(
          `🆕 New client: ${businessName} (${PLAN_LABELS[plan] || plan})`,
          adminCard([
            ['Business', businessName],
            ['Type', businessType],
            ['Location', location],
            ['Email', email],
            ['Plan', `<span style="color:#C9A84C;font-weight:600;">${PLAN_LABELS[plan] || plan}</span>`],
            ...(website ? [['Website', website] as [string, string]] : []),
            ['Audit job', job.id],
          ])
        );

        // ✉️ Welcome email to client
        if (process.env.RESEND_API_KEY) {
          const isPremium = plan === 'premium';
          const isGrowth = plan === 'growth';
          const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://presenzia.ai'}/dashboard/login`;
          const planName = PLAN_LABELS[plan] || plan;

          const welcomeHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:560px;width:100%;">
  <tr><td style="padding:28px 32px;border-bottom:2px solid #C9A84C;">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:#C9A84C;">.ai</span></span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h1 style="font-size:22px;color:#111111;margin:0 0 8px;font-weight:700;">Welcome to presenzia.ai</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Hi${businessName ? ` ${businessName}` : ''},</p>
    <p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Thank you for choosing <strong style="color:#111;">${planName}</strong>. Your AI visibility audit is running right now across ChatGPT, Claude, Perplexity, and Google AI.</p>
    <p style="font-size:14px;color:#555555;margin:0 0 8px;line-height:1.7;"><strong style="color:#111;">What happens next:</strong></p>
    <ol style="font-size:14px;color:#555555;margin:0 0 20px;padding-left:20px;line-height:1.9;">
      <li>Your audit tests <strong>120+ wealth-specific prompts</strong> across 4 AI platforms</li>
      <li>Results are typically ready within <strong>10-15 minutes</strong></li>
      <li>You'll receive your scored report by email with a PDF attachment</li>
      <li>Your interactive dashboard will be available at the link below</li>
    </ol>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#0A0A0A;padding:12px 24px;">
        <a href="${dashboardUrl}" style="color:#C9A84C;text-decoration:none;font-size:13px;font-weight:700;">Open your dashboard &rarr;</a>
      </td></tr>
    </table>
    ${isGrowth || isPremium ? `<div style="background:#F7F7F5;border:1px solid #E0E0E0;padding:16px 20px;margin:0 0 20px;">
      <p style="font-size:13px;color:#111;font-weight:700;margin:0 0 6px;">Your ${planName} includes:</p>
      <ul style="font-size:13px;color:#555;margin:0;padding-left:18px;line-height:1.8;">
        ${isGrowth ? `<li>Weekly re-audits with score tracking and trends</li>
        <li>AI audit assistant to ask anything about your results</li>
        <li>Competitor deep-dive with real-time alerts</li>
        <li>Priority email support</li>` : ''}
        ${isPremium ? `<li>Daily re-audits with trend tracking</li>
        <li>Dedicated account strategist</li>
        <li>Monthly 1-hour strategy call</li>
        <li>Exclusive territory protection (one firm per area)</li>
        <li>4 AI-optimised articles written and published monthly</li>` : ''}
      </ul>
    </div>` : ''}
    ${isPremium ? `<p style="font-size:14px;color:#555555;margin:0 0 16px;line-height:1.7;">Your dedicated account strategist will be in touch within 24 hours to introduce themselves and schedule your first strategy call.</p>` : ''}
    <p style="font-size:14px;color:#555555;margin:0 0 4px;line-height:1.7;">Questions? Reply to this email or reach us at <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a>.</p>
    <p style="font-size:14px;color:#555555;margin:0;line-height:1.7;">We're looking forward to helping you get found by AI.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai &middot; Ketzal LTD (Co. No. 14570156) &middot; <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              replyTo: REPLY_TO,
              to: email,
              subject: `Welcome to presenzia.ai: your AI visibility audit is running`,
              html: welcomeHtml,
            });
            console.log(`📧 Welcome email sent to ${email}`);
          } catch (err) {
            console.error('Failed to send welcome email:', err);
          }
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
        }).catch(err => console.error('Failed to trigger audit processor:', err));

        break;
      }

      // ─── SUBSCRIPTION UPGRADED / DOWNGRADED / STATUS CHANGED ─────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const newStatus = subscription.status;

        // Derive plan from the subscription's current price (most reliable)
        // Falls back to metadata if price lookup fails
        const currentPriceId = subscription.items.data[0]?.price?.id || '';
        const derivedPlan = planFromPriceId(currentPriceId);
        const metadataPlan = (subscription.metadata?.plan as string) || '';
        const newPlan = derivedPlan || metadataPlan || '';

        const dbStatus = newStatus === 'active' ? 'active'
          : newStatus === 'past_due' ? 'past_due'
          : newStatus === 'canceled' ? 'cancelled'
          : 'active';

        // Look up the client so we have their email and pending state
        const { data: client } = await supabase
          .from('clients')
          .select('email, business_name, plan, status, pending_plan_change, pending_change_date')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        // Build update payload
        const updateData: Record<string, unknown> = {
          status: dbStatus,
          updated_at: new Date().toISOString(),
        };

        if (newPlan) {
          updateData.plan = newPlan;

          // If the new plan matches a pending change, the change has been applied — clear pending fields
          if (client?.pending_plan_change && client.pending_plan_change === newPlan) {
            updateData.pending_plan_change = null;
            updateData.pending_change_date = null;
            console.log(`✅ Pending plan change applied: ${client.plan} → ${newPlan}`);
          }
        }

        const { error } = await supabase
          .from('clients')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update subscription:', error);
        } else {
          console.log(`Subscription updated: ${subscription.id} -> ${dbStatus}${newPlan ? ` (plan: ${newPlan})` : ''}`);

          // Update Stripe subscription metadata to keep plan in sync
          if (derivedPlan && derivedPlan !== metadataPlan) {
            stripe.subscriptions.update(subscription.id, { metadata: { plan: derivedPlan } })
              .catch(err => console.error('Failed to sync subscription metadata:', err));
          }

          if (client) {
            const prevPlan = client.plan;
            const planChanged = newPlan && newPlan !== prevPlan;
            const statusChanged = dbStatus !== client.status;

            let subject = `🔄 Subscription updated: ${client.business_name || client.email}`;
            if (planChanged) subject = `⬆️ Plan change: ${client.business_name || client.email} (${PLAN_LABELS[prevPlan] || prevPlan} → ${PLAN_LABELS[newPlan] || newPlan})`;
            else if (dbStatus === 'past_due') subject = `⚠️ Subscription past due: ${client.business_name || client.email}`;
            else if (dbStatus === 'cancelled') subject = `❌ Subscription cancelled: ${client.business_name || client.email}`;

            if (planChanged || statusChanged) {
              await notifyAdmin(
                subject,
                adminCard(
                  [
                    ['Client', client.business_name || '—'],
                    ['Email', client.email],
                    ['Old plan', PLAN_LABELS[prevPlan] || prevPlan || '—'],
                    ['New plan', PLAN_LABELS[newPlan] || newPlan || '—'],
                    ['Old status', client.status],
                    ['New status', `<span style="color:${dbStatus === 'active' ? '#4a9e6a' : '#cc4444'};font-weight:600;">${dbStatus}</span>`],
                  ],
                  dbStatus === 'active' ? '#4a9e6a' : '#cc8833'
                )
              );
            }
          }
        }
        break;
      }

      // ─── SUBSCRIPTION CANCELLED ───────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Look up client before cancelling
        const { data: client } = await supabase
          .from('clients')
          .select('email, business_name, plan, created_at')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        const { error } = await supabase
          .from('clients')
          .update({
            status: 'cancelled',
            pending_plan_change: null,
            pending_change_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to cancel subscription:', error);
        } else {
          console.log(`Subscription cancelled: ${subscription.id}`);

          if (client) {
            const joinDate = client.created_at
              ? new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—';

            await notifyAdmin(
              `❌ Cancelled: ${client.business_name || client.email} (${PLAN_LABELS[client.plan] || client.plan})`,
              adminCard(
                [
                  ['Client', client.business_name || '—'],
                  ['Email', client.email],
                  ['Plan', PLAN_LABELS[client.plan] || client.plan],
                  ['Joined', joinDate],
                  ['Status', '<span style="color:#cc4444;font-weight:600;">Cancelled</span>'],
                ],
                '#cc4444'
              )
            );
          }
        }
        break;
      }

      // ─── PAYMENT FAILED ───────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Look up client
        const { data: client } = await supabase
          .from('clients')
          .select('email, business_name, plan')
          .eq('stripe_customer_id', customerId)
          .single();

        const { error } = await supabase
          .from('clients')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Failed to update payment status:', error);
        } else {
          console.log(`Payment failed for customer: ${customerId}`);

          if (client) {
            const amount = invoice.amount_due
              ? `£${(invoice.amount_due / 100).toFixed(2)}`
              : '—';

            await notifyAdmin(
              `💳 Payment failed: ${client.business_name || client.email}`,
              adminCard(
                [
                  ['Client', client.business_name || '—'],
                  ['Email', client.email],
                  ['Plan', PLAN_LABELS[client.plan] || client.plan],
                  ['Amount', amount],
                  ['Attempt', String(invoice.attempt_count || 1)],
                  ['Status', '<span style="color:#cc4444;font-weight:600;">Payment failed</span>'],
                ],
                '#cc4444'
              )
            );
          }
        }
        break;
      }

      // ─── RECURRING PAYMENT SUCCEEDED (new audit cycle) ───────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: client } = await supabase
            .from('clients')
            .select('id, email, business_name, plan')
            .eq('stripe_customer_id', customerId)
            .single();

          if (client) {
            const { data: job } = await supabase
              .from('audit_jobs')
              .insert({ client_id: client.id, status: 'pending' })
              .select('id')
              .single();

            if (job) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              fetch(`${appUrl}/api/process-audit`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
                },
                body: JSON.stringify({ jobId: job.id }),
              }).catch(err => console.error('Failed to trigger recurring audit:', err));

              console.log(`Recurring audit queued for client ${client.id}`);

              const amount = invoice.amount_paid
                ? `£${(invoice.amount_paid / 100).toFixed(2)}`
                : '—';

              // ✉️ Notify admin of recurring payment + new audit
              await notifyAdmin(
                `🔁 Renewal: ${client.business_name || client.email} (${PLAN_LABELS[client.plan] || client.plan})`,
                adminCard(
                  [
                    ['Client', client.business_name || '—'],
                    ['Email', client.email],
                    ['Plan', PLAN_LABELS[client.plan] || client.plan],
                    ['Amount paid', amount],
                    ['New audit job', job.id],
                  ],
                  '#4a9e6a'
                )
              );
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
