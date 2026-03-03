import { describe, it, expect } from 'vitest';
import {
  PLANS,
  PRICING_PLANS,
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_RANK,
  PLAN_FEATURES,
  COMPARISON_ROWS,
  planFromPriceId,
  planLabel,
  planPrice,
  planPriceWithPeriod,
} from '@/lib/plans';

describe('lib/plans — Single Source of Truth', () => {
  const allPlanKeys = ['audit', 'starter', 'growth', 'premium'];

  describe('PLANS config completeness', () => {
    it('contains all expected plan keys', () => {
      for (const key of allPlanKeys) {
        expect(PLANS[key]).toBeDefined();
      }
    });

    it('every plan has all required fields', () => {
      for (const key of allPlanKeys) {
        const plan = PLANS[key];
        expect(plan.name).toBeTruthy();
        expect(plan.key).toBe(key);
        expect(typeof plan.price).toBe('number');
        expect(plan.price).toBeGreaterThan(0);
        expect(plan.pricePence).toBe(plan.price * 100);
        expect(plan.priceDisplay).toMatch(/^£/);
        expect(plan.priceWithPeriod).toBeTruthy();
        expect(typeof plan.recurring).toBe('boolean');
        expect(plan.description).toBeTruthy();
        expect(plan.cta).toBeTruthy();
        expect(plan.marketingDescription).toBeTruthy();
        expect(plan.cardFeatures.length).toBeGreaterThan(0);
        expect(plan.detailFeatures.length).toBeGreaterThan(0);
        expect(typeof plan.rank).toBe('number');
      }
    });

    it('pricePence equals price * 100 for every plan', () => {
      for (const key of allPlanKeys) {
        expect(PLANS[key].pricePence).toBe(PLANS[key].price * 100);
      }
    });

    it('priceDisplay matches price value', () => {
      expect(PLANS.audit.priceDisplay).toBe('£99');
      expect(PLANS.starter.priceDisplay).toBe('£99');
      expect(PLANS.growth.priceDisplay).toBe('£249');
      expect(PLANS.premium.priceDisplay).toBe('£599');
    });

    it('recurring plans have month period', () => {
      expect(PLANS.audit.recurring).toBe(false);
      expect(PLANS.audit.period).toBeNull();
      expect(PLANS.growth.recurring).toBe(true);
      expect(PLANS.growth.period).toBe('month');
      expect(PLANS.premium.recurring).toBe(true);
      expect(PLANS.premium.period).toBe('month');
    });

    it('priceWithPeriod includes both price and period', () => {
      expect(PLANS.audit.priceWithPeriod).toBe('£99 one-off');
      expect(PLANS.growth.priceWithPeriod).toBe('£249/month');
      expect(PLANS.premium.priceWithPeriod).toBe('£599/month');
    });
  });

  describe('PRICING_PLANS (public pricing page)', () => {
    it('includes audit, growth, premium (no legacy starter)', () => {
      const keys = PRICING_PLANS.map(p => p.key);
      expect(keys).toEqual(['audit', 'growth', 'premium']);
    });

    it('growth is highlighted', () => {
      const growth = PRICING_PLANS.find(p => p.key === 'growth');
      expect(growth?.highlighted).toBe(true);
      expect(growth?.badge).toBe('Most popular');
    });
  });

  describe('derived lookups', () => {
    it('PLAN_LABELS maps keys to display names', () => {
      expect(PLAN_LABELS.audit).toBe('Full AI Audit & Action Plan');
      expect(PLAN_LABELS.growth).toBe('Growth Retainer');
      expect(PLAN_LABELS.premium).toBe('Premium');
      expect(PLAN_LABELS.starter).toBe('Starter');
    });

    it('PLAN_PRICES maps keys to priceWithPeriod', () => {
      expect(PLAN_PRICES.audit).toBe('£99 one-off');
      expect(PLAN_PRICES.growth).toBe('£249/month');
      expect(PLAN_PRICES.premium).toBe('£599/month');
    });

    it('PLAN_RANK orders plans correctly', () => {
      expect(PLAN_RANK.audit).toBeLessThan(PLAN_RANK.growth);
      expect(PLAN_RANK.growth).toBeLessThan(PLAN_RANK.premium);
      expect(PLAN_RANK.starter).toBe(PLAN_RANK.audit);
    });

    it('PLAN_FEATURES has features for every plan', () => {
      for (const key of allPlanKeys) {
        expect(PLAN_FEATURES[key].length).toBeGreaterThan(0);
      }
    });
  });

  describe('helper functions', () => {
    it('planLabel returns name for known keys', () => {
      expect(planLabel('audit')).toBe('Full AI Audit & Action Plan');
      expect(planLabel('growth')).toBe('Growth Retainer');
    });

    it('planLabel returns key for unknown keys', () => {
      expect(planLabel('unknown')).toBe('unknown');
    });

    it('planPrice returns formatted price', () => {
      expect(planPrice('audit')).toBe('£99');
      expect(planPrice('premium')).toBe('£599');
    });

    it('planPriceWithPeriod returns price with period', () => {
      expect(planPriceWithPeriod('audit')).toBe('£99 one-off');
      expect(planPriceWithPeriod('growth')).toBe('£249/month');
    });

    it('planFromPriceId returns null for unknown price IDs', () => {
      expect(planFromPriceId('price_unknown_123')).toBeNull();
    });

    it('planFromPriceId returns plan key for matching price ID', () => {
      // priceIds come from env vars which are empty in test
      // but this tests the lookup logic works when IDs match
      const testPriceId = 'price_test_audit_123';
      // Manually set to test
      const originalPriceId = PLANS.audit.priceId;
      (PLANS.audit as { priceId: string }).priceId = testPriceId;
      expect(planFromPriceId(testPriceId)).toBe('audit');
      (PLANS.audit as { priceId: string }).priceId = originalPriceId;
    });
  });

  describe('COMPARISON_ROWS', () => {
    it('has 10 comparison features', () => {
      expect(COMPARISON_ROWS.length).toBe(10);
    });

    it('every row has audit, growth, premium values', () => {
      for (const row of COMPARISON_ROWS) {
        expect(row.feature).toBeTruthy();
        expect(row.audit !== undefined).toBe(true);
        expect(row.growth !== undefined).toBe(true);
        expect(row.premium !== undefined).toBe(true);
      }
    });
  });
});
