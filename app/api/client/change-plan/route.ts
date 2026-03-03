import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { PLAN_LABELS, PLAN_PRICES, PLAN_FEATURES, PLAN_RANK } from '@/lib/plans';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/client-auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPlanChangeEmail(
  email: string,
  businessName: string,
  newPlan: string,
  isUpgrade: boolean,
  effectiveDate?: string,
) {
  const planLabel = PLAN_LABELS[newPlan] || newPlan;
  const features = PLAN_FEATURES[newPlan] || [];

  const featuresHtml = features
    .map(f => `<tr><td style="padding:4px 0 4px 0;font-size:14px;color:#333333;line-height:1.6;vertical-align:top;">
      <span style="color:#C9A84C;font-weight:700;margin-right:8px;">&#10003;</span> ${f}
    </td></tr>`)
    .join('');

  const featuresList = features.map(f => `  ✓ ${f}`).join('\n');

  const premiumExtra = newPlan === 'premium'
    ? `<p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">Your dedicated account manager will be in touch within 24 hours to introduce themselves and schedule your first strategy call.</p>`
    : '';

  const premiumExtraText = newPlan === 'premium'
    ? '\nYour dedicated account manager will be in touch within 24 hours to introduce themselves and schedule your first strategy call.\n'
    : '';

  const subject = isUpgrade
    ? `Welcome to ${planLabel} — your upgraded dashboard is ready`
    : `Plan change confirmed — switching to ${planLabel}`;

  const headline = isUpgrade ? `Congratulations — you've upgraded!` : `Your plan change is confirmed`;

  const timingNote = isUpgrade
    ? `Your <strong>${planLabel}</strong> plan is now active for <strong>${businessName}</strong>. Everything is set up and ready to go.`
    : `Your plan will switch to <strong>${planLabel}</strong> (${PLAN_PRICES[newPlan]}) for <strong>${businessName}</strong>${effectiveDate ? ` on <strong>${effectiveDate}</strong>` : ' at the end of your current billing cycle'}. You'll keep full access to your current plan until then.`;

  const timingNoteText = isUpgrade
    ? `Your ${planLabel} plan (${PLAN_PRICES[newPlan]}) is now active for ${businessName}. Here's what you now have access to:`
    : `Your plan will switch to ${planLabel} (${PLAN_PRICES[newPlan]}) for ${businessName}${effectiveDate ? ` on ${effectiveDate}` : ' at the end of your current billing cycle'}. You'll keep full access to your current plan until then.\n\nYour ${planLabel} plan includes:`;

  try {
    await resend.emails.send({
      from: 'presenzia.ai <reports@presenzia.ai>',
      replyTo: 'hello@presenzia.ai',
      to: email,
      subject,
      text: `${headline}\n\n${timingNoteText}\n\n${featuresList}\n${premiumExtraText}\nYour dashboard is ready: https://presenzia.ai/dashboard\n\nIf you have any questions, simply reply to this email.\n\npresenzia.ai`,
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;max-width:560px;width:100%;">
  <tr><td style="padding:28px 32px;border-bottom:2px solid #C9A84C;"><span style="font-size:18px;font-weight:700;color:#0A0A0A;">presenzia<span style="color:#C9A84C;">.ai</span></span></td></tr>
  <tr><td style="padding:32px;">
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td style="background:#C9A84C;color:#0A0A0A;font-weight:700;padding:5px 14px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">${isUpgrade ? `${planLabel} Plan Active` : `Switching to ${planLabel}`}</td></tr></table>
    <h1 style="font-size:22px;color:#111111;margin:0 0 8px;font-weight:700;">${headline}</h1>
    <p style="font-size:14px;color:#555555;margin:0 0 24px;line-height:1.7;">${timingNote}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border:1px solid #E8E4DA;margin:0 0 24px;"><tr><td style="padding:20px 24px;">
      <div style="font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;font-weight:600;">${isUpgrade ? 'What you now have access to' : `What's included in ${planLabel}`}</div>
      <table cellpadding="0" cellspacing="0" width="100%">${featuresHtml}</table>
    </td></tr></table>
    ${premiumExtra}
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#0A0A0A;padding:14px 28px;"><a href="https://presenzia.ai/dashboard" style="color:#C9A84C;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.02em;">Go to your dashboard</a></td></tr></table>
    <p style="font-size:13px;color:#888888;margin:0;line-height:1.6;">Questions? Simply reply to this email — we typically respond within a few hours.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#F9F9F9;border-top:1px solid #E0E0E0;"><p style="font-size:12px;color:#999999;margin:0;">presenzia.ai · <a href="mailto:hello@presenzia.ai" style="color:#C9A84C;text-decoration:none;">hello@presenzia.ai</a></p></td></tr>
</table></td></tr></table></body></html>`,
    });
  } catch (err) {
    console.error('Failed to send plan change email:', err);
  }
}

// ── Helper: cancel any existing pending subscription schedule ──
async function cancelPendingSchedule(subscriptionId: string): Promise<void> {
  try {
    const schedules = await stripe.subscriptionSchedules.list({ limit: 10 });
    for (const sch of schedules.data) {
      const schSubId = typeof sch.subscription === 'string'
        ? sch.subscription
        : sch.subscription?.id;
      if (
        schSubId === subscriptionId &&
        (sch.status === 'active' || sch.status === 'not_started')
      ) {
        await stripe.subscriptionSchedules.release(sch.id);
        break;
      }
    }
  } catch (err) {
    console.error('Failed to cancel pending schedule:', err);
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { valid, email } = verifySessionToken(token);
  if (!valid || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetPlan, action } = await req.json();

  // ── Cancel pending downgrade / cancellation ──
  if (action === 'cancel-pending') {
    const { data: client } = await supabase
      .from('clients')
      .select('id, stripe_subscription_id, pending_plan_change')
      .eq('email', email)
      .single();

    if (!client || !client.stripe_subscription_id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // If it was a cancel-pending, undo Stripe cancellation too
    if (client.pending_plan_change === 'cancel') {
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
    } else {
      // Release any subscription schedule (downgrade)
      const sub = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
      if (sub.schedule) {
        const schedId = typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id;
        try { await stripe.subscriptionSchedules.release(schedId); } catch (e) { console.error('Release failed:', e); }
      }
    }

    await supabase
      .from('clients')
      .update({ pending_plan_change: null, pending_change_date: null })
      .eq('id', client.id);

    return NextResponse.json({ success: true });
  }

  // ── Plan change ──
  if (!targetPlan || !PLANS[targetPlan as PlanKey]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, plan, stripe_subscription_id, stripe_customer_id, business_name, pending_plan_change')
    .eq('email', email)
    .single();

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  if (client.plan === targetPlan) {
    return NextResponse.json({ error: 'Already on this plan' }, { status: 400 });
  }
  if (!client.stripe_subscription_id || !client.stripe_customer_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
  }

  const currentRank = PLAN_RANK[client.plan] || 0;
  const targetRank = PLAN_RANK[targetPlan] || 0;
  const isUpgrade = targetRank > currentRank;

  try {
    let subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
    let subscriptionItem = subscription.items.data[0];
    if (!subscriptionItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    // Always release any existing subscription schedule (from previous downgrade)
    if (subscription.schedule) {
      const scheduleId = typeof subscription.schedule === 'string'
        ? subscription.schedule
        : subscription.schedule.id;
      try {
        await stripe.subscriptionSchedules.release(scheduleId);
        // Re-retrieve subscription after releasing schedule
        subscription = await stripe.subscriptions.retrieve(client.stripe_subscription_id);
        subscriptionItem = subscription.items.data[0]!;
      } catch (err) {
        console.error('Failed to release existing schedule:', err);
      }
    }

    // Undo any pending Stripe cancellation
    if (subscription.cancel_at_period_end) {
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
    }

    // Clear pending state in DB
    await supabase
      .from('clients')
      .update({ pending_plan_change: null, pending_change_date: null })
      .eq('id', client.id);

    const plan = PLANS[targetPlan as PlanKey];

    if (isUpgrade) {
      // ── UPGRADE: Checkout session for prorated payment ──
      const prorationDate = Math.floor(Date.now() / 1000);

      const preview = await stripe.invoices.createPreview({
        customer: client.stripe_customer_id,
        subscription: client.stripe_subscription_id,
        subscription_details: {
          items: [{ id: subscriptionItem.id, price: plan.priceId }],
          proration_date: prorationDate,
        },
      });

      const prorationAmount = Math.max(preview.amount_due, 0);

      if (prorationAmount > 0) {
        // Charge required — go through Stripe Checkout
        const session = await stripe.checkout.sessions.create({
          customer: client.stripe_customer_id,
          mode: 'payment',
          payment_intent_data: {
            metadata: {
              type: 'plan_upgrade',
              client_id: client.id,
              from_plan: client.plan,
              to_plan: targetPlan,
              subscription_id: client.stripe_subscription_id,
              subscription_item_id: subscriptionItem.id,
              price_id: plan.priceId,
              email,
              business_name: client.business_name || '',
            },
          },
          line_items: [{
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Upgrade to ${PLAN_LABELS[targetPlan]}`,
                description: `Prorated difference: ${PLAN_LABELS[client.plan]} → ${PLAN_LABELS[targetPlan]}. Covers the remaining days of your current billing period.`,
              },
              unit_amount: prorationAmount,
            },
            quantity: 1,
          }],
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://presenzia.ai'}/dashboard?upgraded=${targetPlan}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://presenzia.ai'}/dashboard`,
          metadata: {
            type: 'plan_upgrade',
            client_id: client.id,
            from_plan: client.plan,
            to_plan: targetPlan,
            subscription_id: client.stripe_subscription_id,
            subscription_item_id: subscriptionItem.id,
            price_id: plan.priceId,
            email,
            business_name: client.business_name || '',
          },
        });

        return NextResponse.json({
          success: true,
          checkoutUrl: session.url,
          prorationAmount,
          formattedAmount: `£${(prorationAmount / 100).toFixed(2)}`,
          immediate: false,
        });
      } else {
        // No extra charge — apply upgrade immediately via Stripe
        // (still goes through Stripe subscription update, not just DB)
        await stripe.subscriptions.update(client.stripe_subscription_id, {
          items: [{ id: subscriptionItem.id, price: plan.priceId }],
          proration_behavior: 'none',
          metadata: { plan: targetPlan },
        });
        // DB update happens via customer.subscription.updated webhook
        // but we also update here to avoid delay for the user
        await supabase
          .from('clients')
          .update({ plan: targetPlan, pending_plan_change: null, pending_change_date: null, status: 'active' })
          .eq('id', client.id);
        sendPlanChangeEmail(email, client.business_name || email, targetPlan, true);
        return NextResponse.json({ success: true, newPlan: targetPlan, immediate: true });
      }
    } else {
      // ── DOWNGRADE: end of billing cycle via Subscription Schedule ──
      const periodStart = subscriptionItem.current_period_start;
      const periodEnd = subscriptionItem.current_period_end;

      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: client.stripe_subscription_id,
      });

      const currentPlan = PLANS[client.plan as PlanKey];
      await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: 'release',
        phases: [
          { items: [{ price: currentPlan.priceId }], start_date: periodStart, end_date: periodEnd },
          { items: [{ price: plan.priceId }], start_date: periodEnd },
        ],
      });

      const effectiveDate = new Date(periodEnd * 1000).toISOString();
      await supabase
        .from('clients')
        .update({ pending_plan_change: targetPlan, pending_change_date: effectiveDate })
        .eq('id', client.id);

      const formattedDate = new Date(periodEnd * 1000)
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      sendPlanChangeEmail(email, client.business_name || email, targetPlan, false, formattedDate);
      return NextResponse.json({ success: true, newPlan: targetPlan, immediate: false, effectiveDate });
    }
  } catch (err: unknown) {
    console.error('Change plan error:', err);
    const message = err instanceof Error ? err.message : 'Plan change failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
