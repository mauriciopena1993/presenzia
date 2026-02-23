import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

export const PLANS = {
  starter: {
    name: 'Starter',
    price: '£149',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: 'Monthly AI visibility audit',
  },
  growth: {
    name: 'Growth',
    price: '£299',
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    description: 'Weekly AI visibility audits + dashboard',
  },
  premium: {
    name: 'Premium',
    price: '£599',
    priceId: process.env.STRIPE_PRICE_PREMIUM!,
    description: 'Full service + monthly strategy calls',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
