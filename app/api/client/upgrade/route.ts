import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';

const PLAN_RANK: Record<string, number> = { starter: 1, growth: 2, premium: 3 };

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetPlan } = await req.json();
  if (!targetPlan || !PLANS[targetPlan as PlanKey]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, plan, stripe_subscription_id, stripe_customer_id')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  // Ensure it's actually an upgrade
  const currentRank = PLAN_RANK[client.plan] || 0;
  const targetRank = PLAN_RANK[targetPlan] || 0;
  if (targetRank <= currentRank) {
    return NextResponse.json({ error: 'Can only upgrade to a higher plan' }, { status: 400 });
  }

  if (!client.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  try {
    // Get the current subscription to find the item to update
    const subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
    const subscriptionItem = subscription.items.data[0];
    if (!subscriptionItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    // Update the subscription to the new plan (proration enabled by default)
    const plan = PLANS[targetPlan as PlanKey];
    await stripe.subscriptions.update(client.stripe_subscription_id, {
      items: [{
        id: subscriptionItem.id,
        price: plan.priceId,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update local plan record immediately
    await supabase
      .from('clients')
      .update({ plan: targetPlan })
      .eq('id', client.id);

    return NextResponse.json({ success: true, newPlan: targetPlan });
  } catch (err: unknown) {
    console.error('Upgrade error:', err);
    const message = err instanceof Error ? err.message : 'Upgrade failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
