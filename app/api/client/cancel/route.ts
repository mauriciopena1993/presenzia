import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';

const RETENTION_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // ~3 months in ms
const resend = new Resend(process.env.RESEND_API_KEY);

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', growth: 'Growth', premium: 'Premium' };

function isRetentionOfferEligible(lastOfferAt: string | null): boolean {
  if (!lastOfferAt) return true;
  const elapsed = Date.now() - new Date(lastOfferAt).getTime();
  return elapsed >= RETENTION_COOLDOWN_MS;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, feedback } = await req.json();

  const { data: client } = await supabase
    .from('clients')
    .select('id, plan, business_name, stripe_subscription_id, stripe_customer_id, last_retention_offer_at')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (!client.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  try {
    // ── Check retention eligibility ──
    if (action === 'check-retention') {
      const eligible = isRetentionOfferEligible(client.last_retention_offer_at);
      return NextResponse.json({ eligible });
    }

    // ── Accept retention offer: 50% off next invoice ──
    if (action === 'accept-offer') {
      if (!isRetentionOfferEligible(client.last_retention_offer_at)) {
        return NextResponse.json({
          error: 'The 50% discount was already used recently.',
        }, { status: 400 });
      }

      const coupon = await stripe.coupons.create({
        percent_off: 50,
        duration: 'once',
        name: 'Retention offer: 50% off next month',
        max_redemptions: 1,
      });

      const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
      const existingDiscounts = (subscription.discounts || [])
        .map((d) => (typeof d === 'string' ? null : d.id ? { discount: d.id } : null))
        .filter((d): d is { discount: string } => d !== null);

      await stripe.subscriptions.update(client.stripe_subscription_id, {
        discounts: [...existingDiscounts, { coupon: coupon.id }],
        cancel_at_period_end: false,
      });

      await supabase
        .from('clients')
        .update({ last_retention_offer_at: new Date().toISOString() })
        .eq('id', client.id);

      return NextResponse.json({ success: true, action: 'discount-applied' });
    }

    // ── Confirm cancellation: cancel at end of billing period ──
    if (action === 'confirm-cancel') {
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // Get period end date to tell client when it ends
      const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
      const subscriptionItem = subscription.items.data[0];
      const periodEnd = subscriptionItem?.current_period_end || 0;
      const endDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

      // Store cancellation state: pending_plan_change='cancel' + end date
      await supabase
        .from('clients')
        .update({
          pending_plan_change: 'cancel',
          pending_change_date: endDate,
        })
        .eq('id', client.id);

      const formattedEndDate = periodEnd
        ? new Date(periodEnd * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

      return NextResponse.json({
        success: true,
        action: 'cancellation-scheduled',
        endDate,
        formattedEndDate,
      });
    }

    // ── Submit cancellation feedback ──
    if (action === 'submit-feedback') {
      if (feedback && typeof feedback === 'string' && feedback.trim()) {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'presenzia.ai <reports@presenzia.ai>',
            to: 'hello@presenzia.ai',
            subject: `📝 Cancellation feedback: ${client.business_name || email}`,
            html: `<div style="font-family:Inter,sans-serif;max-width:560px;background:#0A0A0A;color:#F5F0E8;padding:40px;">
              <div style="font-size:18px;font-weight:600;border-bottom:2px solid #cc4444;padding-bottom:12px;margin-bottom:24px;">
                presenzia<span style="color:#C9A84C;">.ai</span> <span style="color:#888;font-size:12px;">Cancellation feedback</span>
              </div>
              <div style="background:#111;border:1px solid #222;padding:20px;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="color:#999;font-size:12px;padding:6px 0;width:100px;">Client</td><td style="color:#F5F0E8;font-size:13px;">${client.business_name || '—'}</td></tr>
                  <tr><td style="color:#999;font-size:12px;padding:6px 0;">Email</td><td style="color:#F5F0E8;font-size:13px;">${email}</td></tr>
                  <tr><td style="color:#999;font-size:12px;padding:6px 0;">Plan</td><td style="color:#F5F0E8;font-size:13px;">${PLAN_LABELS[client.plan] || client.plan}</td></tr>
                </table>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid #222;">
                  <div style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Feedback</div>
                  <p style="color:#F5F0E8;font-size:14px;line-height:1.7;margin:0;">${feedback.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                </div>
              </div>
            </div>`,
          }).catch(err => console.error('Failed to send feedback email:', err));
        }
      }
      return NextResponse.json({ success: true });
    }

    // ── Undo cancellation ──
    if (action === 'undo-cancel') {
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      await supabase
        .from('clients')
        .update({ pending_plan_change: null, pending_change_date: null })
        .eq('id', client.id);
      return NextResponse.json({ success: true, action: 'cancellation-reversed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Cancel error:', err);
    const message = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
