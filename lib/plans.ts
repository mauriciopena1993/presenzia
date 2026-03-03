/**
 * SINGLE SOURCE OF TRUTH for all plan data.
 *
 * Every UI component, API route, email template, and test imports from here.
 * To change a price or plan name, edit ONLY this file.
 */

export interface PlanConfig {
  /** Display name shown in UI, emails, admin notifications */
  name: string;
  /** Short key used internally (audit, starter, growth, premium) */
  key: string;
  /** Price in pounds as a number */
  price: number;
  /** Price in pence for Stripe verification */
  pricePence: number;
  /** Formatted price string e.g. "£297" */
  priceDisplay: string;
  /** Price with billing period e.g. "£697/month" or "£297 one-off" */
  priceWithPeriod: string;
  /** Billing period label or null for one-off */
  period: string | null;
  /** Period suffix for UI e.g. "/month" or "one-off" */
  periodLabel: string;
  /** Whether this is a recurring subscription */
  recurring: boolean;
  /** Stripe price ID from env vars */
  priceId: string;
  /** Short description for Stripe/API */
  description: string;
  /** CTA button text */
  cta: string;
  /** Whether to highlight this plan in UI */
  highlighted: boolean;
  /** Badge text (e.g. "Most popular") or null */
  badge: string | null;
  /** Marketing description shown on pricing cards */
  marketingDescription: string;
  /** Features shown on pricing cards */
  cardFeatures: string[];
  /** Features shown in plan change emails and dashboard */
  detailFeatures: string[];
  /** Rank for upgrade/downgrade logic (higher = better) */
  rank: number;
}

export const PLANS: Record<string, PlanConfig> = {
  audit: {
    name: 'Full AI Audit & Action Plan',
    key: 'audit',
    price: 297,
    pricePence: 29700,
    priceDisplay: '£297',
    priceWithPeriod: '£297 one-off',
    period: null,
    periodLabel: 'one-off',
    recurring: false,
    priceId: process.env.STRIPE_PRICE_AUDIT || '',
    description: '120 wealth-specific prompts across 4 AI platforms',
    cta: 'Get my audit',
    highlighted: false,
    badge: null,
    marketingDescription: 'See exactly where your firm stands, and what to fix.',
    cardFeatures: [
      'Complete AI visibility audit across all 4 platforms',
      'Personalised action plan with prioritised recommendations',
      'Full competitor analysis & positioning insights',
      'Online dashboard + downloadable PDF report',
      '120+ wealth-specific prompts tested',
    ],
    detailFeatures: [
      'Complete AI visibility audit (4 platforms)',
      'Personalised action plan with recommendations',
      'Competitor analysis & positioning insights',
      'Online dashboard + PDF report',
    ],
    rank: 1,
  },
  starter: {
    name: 'Starter',
    key: 'starter',
    price: 99,
    pricePence: 9900,
    priceDisplay: '£99',
    priceWithPeriod: '£99/month',
    period: 'month',
    periodLabel: '/month',
    recurring: true,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    description: 'Monthly AI visibility audit (legacy)',
    cta: 'Get started',
    highlighted: false,
    badge: null,
    marketingDescription: 'Monthly AI visibility monitoring.',
    cardFeatures: [
      'Monthly AI visibility audit',
      'Delivered by email (PDF report)',
    ],
    detailFeatures: [
      'Monthly AI visibility audit',
      'Delivered by email (PDF report)',
    ],
    rank: 1,
  },
  growth: {
    name: 'Growth Retainer',
    key: 'growth',
    price: 697,
    pricePence: 69700,
    priceDisplay: '£697',
    priceWithPeriod: '£697/month',
    period: 'month',
    periodLabel: '/month',
    recurring: true,
    priceId: process.env.STRIPE_PRICE_GROWTH || '',
    description: 'Weekly re-audits + dashboard + AI audit assistant',
    cta: 'Start growing',
    highlighted: true,
    badge: 'Most popular',
    marketingDescription: 'Ongoing monitoring, recommendations, and measurable improvement.',
    cardFeatures: [
      'Everything in the Audit, plus:',
      'Weekly re-audits with score tracking & trends',
      'AI audit assistant — ask anything about your results',
      'Competitor deep-dive with real-time alerts',
      'Priority email support',
    ],
    detailFeatures: [
      'Weekly re-audits with score tracking & trends',
      'AI audit assistant — ask anything about your results',
      'Competitor deep-dive with real-time alerts',
      'Priority email support',
    ],
    rank: 2,
  },
  premium: {
    name: 'Premium',
    key: 'premium',
    price: 1997,
    pricePence: 199700,
    priceDisplay: '£1,997',
    priceWithPeriod: '£1,997/month',
    period: 'month',
    periodLabel: '/month',
    recurring: true,
    priceId: process.env.STRIPE_PRICE_PREMIUM || '',
    description: 'Dedicated strategist + territory exclusivity + done-for-you content',
    cta: 'Book a discovery call',
    highlighted: false,
    badge: null,
    marketingDescription: 'We do the work. You get the clients.',
    cardFeatures: [
      'Everything in Growth, plus:',
      'Daily re-audits (vs weekly in Growth)',
      'Dedicated account strategist',
      'Monthly 60-minute strategy call',
      'Exclusive territory protection (one firm per area)',
      '4 AI-optimised articles written & published monthly',
    ],
    detailFeatures: [
      'Daily re-audits with score tracking & trends',
      'Dedicated account strategist',
      'Monthly 60-minute strategy call',
      'Exclusive territory protection (one firm per area)',
      '4 AI-optimised articles written & published monthly',
      'Custom prompt testing & industry benchmarking',
    ],
    rank: 3,
  },
};

/** The plans shown on the public pricing page (excludes legacy starter) */
export const PRICING_PLANS = [PLANS.audit, PLANS.growth, PLANS.premium];

/** Plans displayed as pricing cards on the pricing page */
export type PlanKey = keyof typeof PLANS;

/** Reverse-lookup: get plan key from a Stripe price ID */
export function planFromPriceId(priceId: string): string | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) return key;
  }
  return null;
}

/** Get display name for a plan key, with fallback */
export function planLabel(key: string): string {
  return PLANS[key]?.name || key;
}

/** Get formatted price with period for a plan key */
export function planPriceWithPeriod(key: string): string {
  return PLANS[key]?.priceWithPeriod || key;
}

/** Get formatted display price for a plan key */
export function planPrice(key: string): string {
  return PLANS[key]?.priceDisplay || key;
}

/** Plan name lookup record (for components that need a simple Record) */
export const PLAN_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PLANS).map(([key, plan]) => [key, plan.name])
);

/** Plan prices with period as a simple record */
export const PLAN_PRICES: Record<string, string> = Object.fromEntries(
  Object.entries(PLANS).map(([key, plan]) => [key, plan.priceWithPeriod])
);

/** Plan rank lookup for upgrade/downgrade logic */
export const PLAN_RANK: Record<string, number> = Object.fromEntries(
  Object.entries(PLANS).map(([key, plan]) => [key, plan.rank])
);

/** Plan detail features lookup */
export const PLAN_FEATURES: Record<string, string[]> = Object.fromEntries(
  Object.entries(PLANS).map(([key, plan]) => [key, plan.detailFeatures])
);

/** Comparison table data for the pricing page — differentiators first */
export const COMPARISON_ROWS = [
  // Key differentiators
  { feature: 'Audit frequency',                            audit: 'One-off' as boolean | string, growth: 'Weekly' as boolean | string, premium: 'Daily' as boolean | string },
  { feature: 'Dashboard updates',                          audit: 'One-off',  growth: 'Weekly',    premium: 'Daily' },
  { feature: 'AI audit assistant',                         audit: false,       growth: true,        premium: true },
  { feature: 'Strategy calls',                             audit: false,       growth: false,       premium: 'Monthly 60m' },
  { feature: 'Dedicated account strategist',               audit: false,       growth: false,       premium: true },
  { feature: 'Territory exclusivity',                      audit: false,       growth: false,       premium: true },
  { feature: 'AI-optimised articles written for you',      audit: false,       growth: false,       premium: '4/month' },
  { feature: 'Competitor analysis',                        audit: true,        growth: 'Deep-dive + alerts', premium: 'Deep-dive + alerts' },
  { feature: 'Priority email support',                     audit: false,       growth: true,        premium: true },
  // Included in all plans
  { feature: 'Full AI audit (4 platforms, 120+ prompts)',  audit: true,        growth: true,        premium: true },
  { feature: 'Personalised action plan',                   audit: true,        growth: true,        premium: true },
  { feature: 'Downloadable PDF report',                    audit: true,        growth: true,        premium: true },
];
