import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { plan, email, business_name, business_type, description, location, website, keywords } = await req.json();

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!business_name || !business_type) {
      return NextResponse.json({ error: 'Firm name and type are required' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as PlanKey];

    // Validate that the Stripe price ID is configured
    if (!selectedPlan.priceId) {
      console.error(`Stripe price ID not configured for plan "${plan}". Check STRIPE_PRICE_${plan.toUpperCase()} env var.`);
      return NextResponse.json(
        { error: 'This plan is not yet available for purchase. Please contact hello@presenzia.ai for assistance.' },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isRecurring = selectedPlan.recurring;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isRecurring ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${appUrl}/onboarding?plan=${plan}`,
      metadata: {
        plan,
        business_name: business_name.trim(),
        business_type: business_type.trim(),
        description: (description || '').trim(),
        location: (location || '').trim(),
        website: website?.trim() || '',
        keywords: keywords?.trim() || '',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    };

    // Only add subscription_data for recurring plans
    if (isRecurring) {
      sessionParams.subscription_data = {
        metadata: { plan },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    // Never expose raw Stripe errors to the user
    return NextResponse.json(
      { error: 'Something went wrong creating your checkout session. Please try again or contact hello@presenzia.ai for help.' },
      { status: 500 }
    );
  }
}
