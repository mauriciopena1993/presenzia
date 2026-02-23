/**
 * One-time Stripe setup script.
 * Creates the 3 subscription products and prices for presenzia.ai.
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

const PRODUCTS = [
  {
    name: 'Presenzia Starter',
    description: 'Monthly AI search audit across 4 platforms. Visibility score + PDF report delivered by email.',
    envKey: 'STRIPE_PRICE_STARTER',
    amount: 14900, // £149.00 in pence
    interval: 'month' as const,
    metadata: { plan: 'starter' },
  },
  {
    name: 'Presenzia Growth',
    description: 'Weekly AI search audits across all 4 platforms. PDF report + client dashboard + competitor analysis.',
    envKey: 'STRIPE_PRICE_GROWTH',
    amount: 29900, // £299.00 in pence
    interval: 'month' as const,
    metadata: { plan: 'growth' },
  },
  {
    name: 'Presenzia Premium',
    description: 'Full service: weekly audits, monthly 1:1 strategy calls, custom action plan, dedicated account manager.',
    envKey: 'STRIPE_PRICE_PREMIUM',
    amount: 59900, // £599.00 in pence
    interval: 'month' as const,
    metadata: { plan: 'premium' },
  },
];

async function main() {
  console.log('Creating Stripe products and prices for presenzia.ai...\n');

  const results: Record<string, string> = {};

  for (const product of PRODUCTS) {
    // Create the product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: product.metadata,
    });

    console.log(`✓ Product created: ${product.name} (${stripeProduct.id})`);

    // Create the recurring price
    const price = await stripe.prices.create({
      product: stripeProduct.id,
      currency: 'gbp',
      unit_amount: product.amount,
      recurring: {
        interval: product.interval,
      },
      metadata: product.metadata,
    });

    console.log(`  Price: £${(product.amount / 100).toFixed(2)}/month → ${price.id}`);
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
