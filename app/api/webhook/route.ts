import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const plan = metadata.plan as 'starter' | 'growth' | 'premium';
        const email = session.customer_email || session.customer_details?.email || '';

        if (!email || !plan) {
          console.error('Missing email or plan in checkout.session.completed', { email, plan });
          break;
        }

        // Extract business details from metadata (collected before payment)
        const businessName = metadata.business_name || '';
        const businessType = metadata.business_type || '';
        const location = metadata.location || '';
        const website = metadata.website || null;
        const keywordsRaw = metadata.keywords || '';
        const keywords = keywordsRaw
          ? keywordsRaw.split(',').map((k: string) => k.trim()).filter(Boolean)
          : null;

        // Upsert client record with business details
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
          }, {
            onConflict: 'stripe_customer_id',
          })
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
          .insert({
            client_id: client.id,
            status: 'pending',
          })
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

        // Notify owner
        if (process.env.RESEND_API_KEY) {
          const planLabels: Record<string, string> = { starter: 'Starter', growth: 'Growth', premium: 'Premium' };
          resend.emails.send({
            from: 'presenzia.ai <reports@presenzia.ai>',
            to: 'hello@presenzia.ai',
            subject: `New client: ${businessName} (${planLabels[plan] || plan})`,
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">presenzia<span style="color: #C9A84C;">.ai</span></div>
                <div style="color: #555; font-size: 12px; margin-bottom: 32px;">Admin notification</div>
                <h2 style="font-size: 20px; color: #F5F0E8; margin-bottom: 4px;">New client signed up</h2>
                <div style="background: #111; border: 1px solid #222; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #666; font-size: 12px; padding: 6px 0; width: 130px;">Business</td><td style="color: #F5F0E8; font-size: 13px;">${businessName}</td></tr>
                    <tr><td style="color: #666; font-size: 12px; padding: 6px 0;">Type</td><td style="color: #F5F0E8; font-size: 13px;">${businessType}</td></tr>
                    <tr><td style="color: #666; font-size: 12px; padding: 6px 0;">Location</td><td style="color: #F5F0E8; font-size: 13px;">${location}</td></tr>
                    <tr><td style="color: #666; font-size: 12px; padding: 6px 0;">Email</td><td style="color: #F5F0E8; font-size: 13px;">${email}</td></tr>
                    <tr><td style="color: #666; font-size: 12px; padding: 6px 0;">Plan</td><td style="color: #C9A84C; font-size: 13px; font-weight: 600;">${planLabels[plan] || plan}</td></tr>
                    ${website ? `<tr><td style="color: #666; font-size: 12px; padding: 6px 0;">Website</td><td style="color: #F5F0E8; font-size: 13px;">${website}</td></tr>` : ''}
                  </table>
                </div>
                <p style="color: #555; font-size: 11px;">Audit job ${job.id} has been queued and will run automatically.</p>
              </div>
            `,
          }).catch(err => console.error('Failed to send owner notification:', err));
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

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const plan = subscription.metadata?.plan as string;
        const status = subscription.status;

        const dbStatus = status === 'active' ? 'active'
          : status === 'past_due' ? 'past_due'
          : status === 'canceled' ? 'cancelled'
          : 'active';

        const { error } = await supabase
          .from('clients')
          .update({ status: dbStatus, plan: plan || undefined, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id);

        if (error) console.error('Failed to update subscription:', error);
        else console.log(`Subscription updated: ${subscription.id} -> ${dbStatus}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('clients')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscription.id);

        if (error) console.error('Failed to cancel subscription:', error);
        else console.log(`Subscription cancelled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error } = await supabase
          .from('clients')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId);

        if (error) console.error('Failed to update payment status:', error);
        else console.log(`Payment failed for customer: ${customerId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Queue a new audit on recurring billing cycles
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: client } = await supabase
            .from('clients')
            .select('id, plan')
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
