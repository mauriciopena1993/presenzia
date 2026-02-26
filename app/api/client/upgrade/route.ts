import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const PLAN_RANK: Record<string, number> = { starter: 1, growth: 2, premium: 3 };

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  premium: 'Premium',
};

const PLAN_PRICES: Record<string, string> = {
  starter: '£99/month',
  growth: '£199/month',
  premium: '£599/month',
};

const PLAN_FEATURES: Record<string, string[]> = {
  growth: [
    'Online client dashboard with weekly updates',
    'AI audit assistant — ask anything about your results',
    'Competitor deep-dive analysis',
    'Priority email support',
  ],
  premium: [
    'Online client dashboard with daily updates',
    'AI audit assistant — ask anything about your results',
    'Dedicated account manager',
    'Monthly 1:1 strategy call',
    'Custom prompt testing & benchmarking',
    'Competitor deep-dive analysis',
  ],
};

async function sendUpgradeEmail(
  email: string,
  businessName: string,
  newPlan: string,
) {
  const planLabel = PLAN_LABELS[newPlan] || newPlan;
  const features = PLAN_FEATURES[newPlan] || [];

  const featuresHtml = features
    .map(f => `<tr><td style="padding:4px 0 4px 0;font-size:14px;color:#333333;line-height:1.6;vertical-align:top;">
      <span style="color:#C9A84C;font-weight:700;margin-right:8px;">✓</span> ${f}
    </td></tr>`)
    .join('');

  const featuresList = features.map(f => `  ✓ ${f}`).join('\n');

  const premiumExtra = newPlan === 'premium'
    ? `<p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Your dedicated account manager will be in touch within 24 hours to introduce themselves and schedule your first strategy call.</p>`
    : '';

  const premiumExtraText = newPlan === 'premium'
    ? '\nYour dedicated account manager will be in touch within 24 hours to introduce themselves and schedule your first strategy call.\n'
    : '';

  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      replyTo: 'hello@presenzia.ai',
      to: email,
      subject: `Welcome to ${planLabel} — your upgraded dashboard is ready`,
      text: `Congratulations — you've upgraded to ${planLabel}!\n\nYour ${planLabel} plan (${PLAN_PRICES[newPlan]}) is now active for ${businessName}. Here's what you now have access to:\n\n${featuresList}\n${premiumExtraText}\nYour dashboard is ready: https://presenzia.ai/dashboard\n\nIf you have any questions, simply reply to this email.\n\npresenzia.ai | Ketzal LTD (Co. No. 14570156)`,
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:560px;width:100%;">

  <!-- Header -->
  <tr><td style="padding:28px 32px;border-bottom:2px solid #C9A84C;">
    <span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:#C9A84C;">.ai</span></span>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:32px;">

    <!-- Badge -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr><td style="background:#C9A84C;color:#0A0A0A;font-weight:700;padding:5px 14px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">
        ${planLabel} Plan Active
      </td></tr>
    </table>

    <h1 style="font-size:22px;color:#111111;margin:0 0 8px;font-weight:700;">
      Congratulations — you've upgraded!
    </h1>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">
      Your <strong>${planLabel}</strong> plan is now active for <strong>${businessName}</strong>. Everything is set up and ready to go.
    </p>

    <!-- Features box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border:1px solid #E8E4DA;margin:0 0 24px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;font-weight:600;">What you now have access to</div>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${featuresHtml}
        </table>
      </td></tr>
    </table>

    ${premiumExtra}

    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">
      Your dashboard is ready — log in to explore your new features.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#0A0A0A;padding:14px 28px;">
        <a href="https://presenzia.ai/dashboard" style="color:#C9A84C;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.02em;">Go to your dashboard →</a>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">
      Questions about your new plan? Simply reply to this email — we typically respond within a few hours.
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;">
    <p style="font-size:12px;color:#999999;margin:0;">presenzia.ai · Ketzal LTD (Co. No. 14570156) · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`,
    });

    console.log(`📧 Upgrade email sent to ${email} (${newPlan})`);
  } catch (err) {
    console.error('Failed to send upgrade email:', err);
    // Non-blocking — don't fail the upgrade if email fails
  }
}

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
    .select('id, plan, stripe_subscription_id, stripe_customer_id, business_name')
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

    // Send congratulations email (non-blocking)
    sendUpgradeEmail(email, client.business_name || email, targetPlan);

    return NextResponse.json({ success: true, newPlan: targetPlan });
  } catch (err: unknown) {
    console.error('Upgrade error:', err);
    const message = err instanceof Error ? err.message : 'Upgrade failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
