import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

// Re-export plan data from the single source of truth
export { PLANS, planFromPriceId } from '@/lib/plans';
export type { PlanKey } from '@/lib/plans';
