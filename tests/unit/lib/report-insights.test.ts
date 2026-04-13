/**
 * Tests for lib/report/insights.ts — generateInsights function
 */

import { describe, it, expect } from 'vitest';
import { generateInsights } from '@/lib/report/insights';
import type { PromptResult, AuditScore } from '@/lib/audit/scorer';
import type { AuditConfig } from '@/lib/audit/runner';

// ── Fixtures ──────────────────────────────────────────────────

const config: AuditConfig = {
  businessName: 'Alpha Wealth Ltd',
  businessType: 'Independent Financial Advisor (IFA)',
  description: 'Chartered IFA specialising in pension planning',
  location: 'London',
  keywords: ['pension planning', 'retirement planning'],
};

function makeResult(overrides: Partial<PromptResult> = {}): PromptResult {
  return {
    promptId: 'core_best',
    promptText: 'What is the best financial advisor in London?',
    platform: 'ChatGPT',
    mentioned: false,
    position: null,
    competitors: [],
    rawResponse: 'Here are some options...',
    weight: 10,
    ...overrides,
  };
}

function makeScore(overrides: Partial<AuditScore> = {}): AuditScore {
  return {
    overall: 45,
    grade: 'C',
    summary: 'Moderate visibility.',
    platforms: [
      {
        platform: 'ChatGPT',
        score: 50,
        promptsTested: 10,
        promptsMentioned: 5,
        avgPosition: 3,
        topThreeCount: 2,
        competitors: ['Hargreaves Lansdown'],
      },
      {
        platform: 'Claude',
        score: 40,
        promptsTested: 10,
        promptsMentioned: 4,
        avgPosition: 4,
        topThreeCount: 1,
        competitors: ['St. James\'s Place'],
      },
    ],
    totalPrompts: 20,
    mentionedInCount: 9,
    topThreePct: 15,
    topCompetitors: [
      { name: 'Hargreaves Lansdown', count: 5 },
      { name: 'St. James\'s Place', count: 3 },
    ],
    ...overrides,
  };
}

// ── Main tests ────────────────────────────────────────────────

describe('lib/report/insights — generateInsights', () => {
  describe('valid output structure', () => {
    it('returns a ReportInsights object with all required fields', () => {
      const results = [
        makeResult({ mentioned: true, position: 1 }),
        makeResult({ mentioned: false }),
      ];
      const insights = generateInsights(config, makeScore(), results);

      expect(insights).toHaveProperty('categories');
      expect(insights).toHaveProperty('actions');
      expect(insights).toHaveProperty('nextMonthHints');
      expect(insights).toHaveProperty('totalSearches');
      expect(insights).toHaveProperty('totalFound');
    });

    it('categories is an array', () => {
      const results = [makeResult()];
      const insights = generateInsights(config, makeScore(), results);
      expect(Array.isArray(insights.categories)).toBe(true);
    });

    it('actions is an array', () => {
      const results = [makeResult()];
      const insights = generateInsights(config, makeScore(), results);
      expect(Array.isArray(insights.actions)).toBe(true);
    });

    it('actions has at most 5 items (top 5)', () => {
      const results = Array.from({ length: 20 }, (_, i) =>
        makeResult({ promptId: `p${i}`, platform: 'ChatGPT', mentioned: i < 5 })
      );
      const insights = generateInsights(config, makeScore(), results);
      expect(insights.actions.length).toBeLessThanOrEqual(5);
    });

    it('nextMonthHints is an array of strings', () => {
      const results = [makeResult()];
      const insights = generateInsights(config, makeScore(), results);
      expect(Array.isArray(insights.nextMonthHints)).toBe(true);
      for (const hint of insights.nextMonthHints) {
        expect(typeof hint).toBe('string');
      }
    });

    it('totalSearches matches results.length', () => {
      const results = [makeResult(), makeResult({ promptId: 'p2' }), makeResult({ promptId: 'p3' })];
      const insights = generateInsights(config, makeScore(), results);
      expect(insights.totalSearches).toBe(3);
    });

    it('totalFound matches mentioned results count', () => {
      const results = [
        makeResult({ mentioned: true }),
        makeResult({ promptId: 'p2', mentioned: false }),
        makeResult({ promptId: 'p3', mentioned: true }),
      ];
      const insights = generateInsights(config, makeScore(), results);
      expect(insights.totalFound).toBe(2);
    });
  });

  describe('zero score / all misses (no crashes)', () => {
    it('handles empty results without crashing', () => {
      const score = makeScore({ overall: 0, grade: 'F', mentionedInCount: 0, topThreePct: 0, topCompetitors: [], platforms: [] });
      expect(() => generateInsights(config, score, [])).not.toThrow();
    });

    it('returns valid output with zero score', () => {
      const score = makeScore({ overall: 0, grade: 'F', mentionedInCount: 0, topThreePct: 0, topCompetitors: [] });
      const results = [
        makeResult({ mentioned: false }),
        makeResult({ promptId: 'p2', mentioned: false }),
      ];
      const insights = generateInsights(config, score, results);
      expect(insights.totalFound).toBe(0);
      expect(insights.totalSearches).toBe(2);
      expect(insights.actions.length).toBeGreaterThanOrEqual(0);
    });

    it('returns valid CategoryBreakdown with zero-score (no crashes, no absurd text)', () => {
      const score = makeScore({ overall: 0, grade: 'F' });
      const results = [makeResult({ mentioned: false })];
      const insights = generateInsights(config, score, results);
      for (const cat of insights.categories) {
        expect(cat.category).toBeTruthy();
        expect(cat.label).toBeTruthy();
        expect(typeof cat.totalSearches).toBe('number');
        expect(typeof cat.timesFound).toBe('number');
        expect(cat.timesFound).toBeGreaterThanOrEqual(0);
        expect(cat.timesFound).toBeLessThanOrEqual(cat.totalSearches);
      }
    });

    it('does not contain NaN or Infinity in output', () => {
      const score = makeScore({ overall: 0, grade: 'F' });
      const results = [makeResult({ mentioned: false })];
      const insights = generateInsights(config, score, results);
      const json = JSON.stringify(insights);
      expect(json).not.toContain('NaN');
      expect(json).not.toContain('Infinity');
    });
  });

  describe('perfect score', () => {
    it('handles 100% score without crashing', () => {
      const score = makeScore({
        overall: 100,
        grade: 'A',
        mentionedInCount: 20,
        topThreePct: 100,
      });
      const results = Array.from({ length: 20 }, (_, i) =>
        makeResult({ promptId: `p${i}`, mentioned: true, position: 1 })
      );
      expect(() => generateInsights(config, score, results)).not.toThrow();
    });

    it('returns valid structure with perfect score', () => {
      const score = makeScore({ overall: 100, grade: 'A' });
      const results = [makeResult({ mentioned: true, position: 1 })];
      const insights = generateInsights(config, score, results);
      expect(insights.totalFound).toBe(1);
      expect(Array.isArray(insights.actions)).toBe(true);
    });
  });

  describe('category breakdown', () => {
    it('category timesFound does not exceed totalSearches', () => {
      const results = [
        makeResult({ promptId: 'core_best', mentioned: true }),
        makeResult({ promptId: 'core_rec', mentioned: false }),
        makeResult({ promptId: 'loc_find', mentioned: true, platform: 'Claude' }),
      ];
      const insights = generateInsights(config, makeScore(), results);
      for (const cat of insights.categories) {
        expect(cat.timesFound).toBeLessThanOrEqual(cat.totalSearches);
      }
    });

    it('categories have valid labels', () => {
      const results = [makeResult({ promptId: 'core_best', mentioned: true })];
      const insights = generateInsights(config, makeScore(), results);
      for (const cat of insights.categories) {
        expect(cat.label).toBeTruthy();
        expect(cat.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('with previous audit data', () => {
    const previousAudit = {
      overallScore: 35,
      grade: 'D',
      platforms: [
        { platform: 'ChatGPT', score: 40, promptsMentioned: 4, promptsTested: 10 },
      ],
      actionTitles: ['Complete Your Google Business Profile'],
      completedAt: '2026-03-01T12:00:00Z',
    };

    it('returns progress object when previousAudit is provided', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore({ overall: 45 }), results, previousAudit);
      expect(insights.progress).toBeDefined();
      expect(insights.progress?.previousScore).toBe(35);
      expect(insights.progress?.currentScore).toBe(45);
      expect(insights.progress?.scoreDelta).toBe(10);
    });

    it('progress does not crash with empty previousAudit actionTitles', () => {
      const results = [makeResult({ mentioned: true })];
      const prevAudit = { ...previousAudit, actionTitles: [] };
      expect(() => generateInsights(config, makeScore(), results, prevAudit)).not.toThrow();
    });

    it('has no progress when no previousAudit provided', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore(), results);
      expect(insights.progress).toBeUndefined();
    });
  });

  describe('scoreProjection', () => {
    it('returns scoreProjection with current score', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore({ overall: 45 }), results);
      expect(insights.scoreProjection).toBeDefined();
      expect(insights.scoreProjection?.currentScore).toBe(45);
    });

    it('projectedMin is >= currentScore', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore({ overall: 45 }), results);
      expect(insights.scoreProjection?.projectedMin).toBeGreaterThanOrEqual(45);
    });

    it('projectedMax is >= projectedMin', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore({ overall: 45 }), results);
      const proj = insights.scoreProjection;
      if (proj) {
        expect(proj.projectedMax).toBeGreaterThanOrEqual(proj.projectedMin);
      }
    });

    it('projectedMax does not exceed 100', () => {
      const results = [makeResult({ mentioned: true })];
      const insights = generateInsights(config, makeScore({ overall: 90 }), results);
      if (insights.scoreProjection) {
        expect(insights.scoreProjection.projectedMax).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('action structure', () => {
    it('every action has required fields', () => {
      const results = [makeResult({ mentioned: false })];
      const insights = generateInsights(config, makeScore({ overall: 20 }), results);
      for (const action of insights.actions) {
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('phase');
        expect(action).toHaveProperty('timeline');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('why');
        expect(action).toHaveProperty('steps');
        expect(action).toHaveProperty('estimatedImpact');
        expect(action).toHaveProperty('estimatedEffort');
        expect(action).toHaveProperty('estimatedTime');
        expect(['HIGH', 'MEDIUM']).toContain(action.priority);
        expect([1, 2, 3]).toContain(action.phase);
        expect(Array.isArray(action.steps)).toBe(true);
        expect(action.steps.length).toBeGreaterThan(0);
      }
    });

    it('action estimatedEffort is one of low/medium/high', () => {
      const results = [makeResult({ mentioned: false })];
      const insights = generateInsights(config, makeScore({ overall: 20 }), results);
      for (const action of insights.actions) {
        expect(['low', 'medium', 'high']).toContain(action.estimatedEffort);
      }
    });
  });
});
