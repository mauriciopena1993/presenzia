import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'hello@presenzia.ai';
const FROM_EMAIL = 'presenzia.ai <reports@presenzia.ai>';
const PLAN_LABELS: Record<string, string> = { starter: 'Starter', growth: 'Growth', premium: 'Premium' };

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
        const plan = metadata.plan as 'starter' | 'growth' | 'premium';
        const email = session.customer_email || session.customer_details?.email || '';

        if (!email || !plan) {
          console.error('Missing email or plan in checkout.session.completed', { email, plan });
          break;
        }

        const businessName = metadata.business_name || '';
        const businessType = metadata.business_type || '';
        const location = metadata.location || '';
        const website = metadata.website || null;
        const keywordsRaw = metadata.keywords || '';
        const keywords = keywordsRaw
          ? keywordsRaw.split(',').map((k: string) => k.trim()).filter(Boolean)
          : null;

        // Upsert client record
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .upsert({
            email,
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            business_name: businessName || null,
            business_type: businessType || null,
            location: location || null,
            website,
            keywords,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_customer_id' })
          .select('id')
          .single();

        if (clientError || !client) {
          console.error('Failed to upsert client:', clientError);
          break;
        }

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
        const newPlan = (subscription.metadata?.plan as string) || '';
        const newStatus = subscription.status;

        const dbStatus = newStatus === 'active' ? 'active'
          : newStatus === 'past_due' ? 'past_due'
          : newStatus === 'canceled' ? 'cancelled'
          : 'active';

        // Look up the client so we have their email
        const { data: client } = await supabase
          .from('clients')
          .select('email, business_name, plan, status')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        const { error } = await supabase
          .from('clients')
          .update({ status: dbStatus, plan: newPlan || undefined, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update subscription:', error);
        } else {
          console.log(`Subscription updated: ${subscription.id} -> ${dbStatus}`);

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
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
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
