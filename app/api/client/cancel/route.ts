import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

const RETENTION_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000; // ~3 months in ms

function isRetentionOfferEligible(lastOfferAt: string | null): boolean {
  if (!lastOfferAt) return true; // never used
  const elapsed = Date.now() - new Date(lastOfferAt).getTime();
  return elapsed >= RETENTION_COOLDOWN_MS;
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json();

  const { data: client } = await supabase
    .from('clients')
    .select('id, plan, stripe_subscription_id, stripe_customer_id, last_retention_offer_at')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (!client.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  try {
    // ── Check retention eligibility (used by dashboard to show/hide the offer) ──
    if (action === 'check-retention') {
      const eligible = isRetentionOfferEligible(client.last_retention_offer_at);
      return NextResponse.json({ eligible });
    }

    // ── Accept retention offer: 50% off next invoice ──
    if (action === 'accept-offer') {
      // Enforce 3-month cooldown
      if (!isRetentionOfferEligible(client.last_retention_offer_at)) {
        return NextResponse.json({
          error: 'The 50% discount was already used recently. It can be used once every 3 months.',
        }, { status: 400 });
      }

      // Create a one-time 50% coupon for next invoice
      const coupon = await stripe.coupons.create({
        percent_off: 50,
        duration: 'once',
        name: 'Retention offer: 50% off next month',
        max_redemptions: 1,
      });

      // Apply the coupon to the subscription and undo any pending cancellation
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        discounts: [{ coupon: coupon.id }],
        cancel_at_period_end: false,
      });

      // Record when this offer was used
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

      return NextResponse.json({ success: true, action: 'cancellation-scheduled' });
    }

    // ── Check cancellation status ──
    if (action === 'status') {
      const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
      return NextResponse.json({
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        status: subscription.status,
      });
    }

    // ── Undo cancellation ──
    if (action === 'undo-cancel') {
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      return NextResponse.json({ success: true, action: 'cancellation-reversed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Cancel error:', err);
    const message = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
