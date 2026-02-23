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
    price: '£99',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: 'Monthly PDF report',
  },
  growth: {
    name: 'Growth',
    price: '£199',
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    description: 'Client dashboard + weekly updates',
  },
  premium: {
    name: 'Premium',
    price: '£599',
    priceId: process.env.STRIPE_PRICE_PREMIUM!,
    description: 'Daily updates + account manager + monthly call',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
