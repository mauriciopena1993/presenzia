import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

export const PLANS = {
  audit: {
    name: 'AI Visibility Audit',
    price: '£297',
    priceId: process.env.STRIPE_PRICE_AUDIT || process.env.STRIPE_PRICE_STARTER!,
    description: '120 wealth-specific prompts across 4 AI platforms',
  },
  starter: {
    name: 'Starter',
    price: '£99',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: 'Monthly AI visibility audit (legacy)',
  },
  growth: {
    name: 'Growth Retainer',
    price: '£697',
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    description: 'Monthly re-audits + dashboard + quarterly strategy calls',
  },
  premium: {
    name: 'Premium',
    price: '£1,997',
    priceId: process.env.STRIPE_PRICE_PREMIUM!,
    description: 'Dedicated strategist + territory exclusivity + done-for-you content',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Reverse-lookup: get plan key from a Stripe price ID */
export function planFromPriceId(priceId: string): string | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key;
  }
  return null;
}
