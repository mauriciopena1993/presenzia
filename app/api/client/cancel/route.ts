import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json();

  const { data: client } = await supabase
    .from('clients')
    .select('id, plan, stripe_subscription_id, stripe_customer_id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (!client.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  try {
    // ── Accept retention offer: 50% off next invoice ──
    if (action === 'accept-offer') {
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
