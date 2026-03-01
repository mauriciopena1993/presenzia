/**
 * Stripe setup script for presenzia.ai IFA vertical.
 * Creates the 3 products and prices:
 *   - AI Visibility Audit (£297 one-off)
 *   - Growth Retainer (£697/month)
 *   - Premium (£1,997/month)
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/setup-stripe.ts
 *
 * Requires STRIPE_SECRET_KEY in your environment:
 *   STRIPE_SECRET_KEY=sk_live_... npx ts-node scripts/setup-stripe.ts
 *
 * After running, copy the printed price IDs into your .env.local
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

interface ProductConfig {
  name: string;
  description: string;
  envKey: string;
  amount: number;
  recurring: boolean;
  interval?: 'month';
  metadata: { plan: string };
}

const PRODUCTS: ProductConfig[] = [
  {
    name: 'AI Visibility Audit',
    description: 'One-off AI visibility audit: 120 wealth-specific prompts across 4 AI platforms. Scored PDF report with action plan.',
    envKey: 'STRIPE_PRICE_AUDIT',
    amount: 29700, // £297.00 in pence
    recurring: false,
    metadata: { plan: 'audit' },
  },
  {
    name: 'Growth Retainer',
    description: 'Monthly AI visibility retainer for IFAs: monthly re-audits, live dashboard with weekly updates, quarterly strategy calls, competitor deep-dive, priority support.',
    envKey: 'STRIPE_PRICE_GROWTH',
    amount: 69700, // £697.00 in pence
    recurring: true,
    interval: 'month',
    metadata: { plan: 'growth' },
  },
  {
    name: 'Premium',
    description: 'Full-service AI visibility for wealth managers: dedicated account manager, monthly 1:1 strategy calls, territory exclusivity, done-for-you content recommendations, daily dashboard updates.',
    envKey: 'STRIPE_PRICE_PREMIUM',
    amount: 199700, // £1,997.00 in pence
    recurring: true,
    interval: 'month',
    metadata: { plan: 'premium' },
  },
];

async function main() {
  console.log('Creating Stripe products and prices for presenzia.ai (IFA vertical)...\n');

  const results: Record<string, string> = {};

  for (const product of PRODUCTS) {
    // Create the product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: product.metadata,
    });

    console.log(`✓ Product created: ${product.name} (${stripeProduct.id})`);

    // Create the price (one-off or recurring)
    const priceParams: Stripe.PriceCreateParams = {
      product: stripeProduct.id,
      currency: 'gbp',
      unit_amount: product.amount,
      metadata: product.metadata,
    };

    if (product.recurring && product.interval) {
      priceParams.recurring = { interval: product.interval };
    }

    const price = await stripe.prices.create(priceParams);

    const priceLabel = product.recurring
      ? `£${(product.amount / 100).toFixed(2)}/month`
      : `£${(product.amount / 100).toFixed(2)} one-off`;
    console.log(`  Price: ${priceLabel} → ${price.id}`);
    results[product.envKey] = price.id;
  }

  console.log('\n-------------------------------------------');
  console.log('Add these to your .env.local:\n');
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}=${value}`);
  }
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
