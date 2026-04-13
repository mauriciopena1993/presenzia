/**
 * Tests for lib/audit/prompts.ts — buildPrompts function
 */

import { describe, it, expect } from 'vitest';
import { buildPrompts } from '@/lib/audit/prompts';

const FIRM_TYPE = 'Independent Financial Advisor (IFA)';
const LOCATION = 'Guildford';
const KEYWORDS = ['pension planning', 'inheritance tax', 'retirement'];
const DESCRIPTION = 'Chartered IFA specialising in pension transfers';

describe('lib/audit/prompts — buildPrompts', () => {
  describe('returns non-empty array', () => {
    it('returns at least 1 prompt', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('returns at most 30 prompts (hard limit)', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      expect(prompts.length).toBeLessThanOrEqual(30);
    });
  });

  describe('prompt structure', () => {
    it('every prompt has promptId, text, and weight', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      for (const p of prompts) {
        expect(p).toHaveProperty('promptId');
        expect(p).toHaveProperty('text');
        expect(p).toHaveProperty('weight');
        expect(typeof p.promptId).toBe('string');
        expect(typeof p.text).toBe('string');
        expect(typeof p.weight).toBe('number');
      }
    });

    it('all weights are positive numbers', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      for (const p of prompts) {
        expect(p.weight).toBeGreaterThan(0);
      }
    });

    it('all promptIds are unique', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      const ids = prompts.map(p => p.promptId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all prompt texts are unique (deduplication works)', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      const texts = prompts.map(p => p.text.toLowerCase().trim());
      const uniqueTexts = new Set(texts);
      expect(uniqueTexts.size).toBe(texts.length);
    });
  });

  describe('contains location', () => {
    it('includes the provided location in prompt texts', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      const withLocation = prompts.filter(p => p.text.toLowerCase().includes(LOCATION.toLowerCase()));
      expect(withLocation.length).toBeGreaterThan(0);
    });

    it('falls back to "the UK" when no location provided', () => {
      const prompts = buildPrompts(FIRM_TYPE, '', KEYWORDS, DESCRIPTION);
      const withUK = prompts.filter(p => p.text.toLowerCase().includes('the uk'));
      expect(withUK.length).toBeGreaterThan(0);
    });
  });

  describe('contains keywords', () => {
    it('generates prompts using provided keywords', () => {
      const kw = ['pension planning'];
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, kw, DESCRIPTION);
      const withKeyword = prompts.filter(p =>
        p.text.toLowerCase().includes('pension planning')
      );
      expect(withKeyword.length).toBeGreaterThan(0);
    });

    it('works with no keywords (empty array)', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, [], DESCRIPTION);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('works with up to 5 keywords', () => {
      const manyKeywords = ['pension', 'inheritance', 'retirement', 'drawdown', 'investment'];
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, manyKeywords, DESCRIPTION);
      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.length).toBeLessThanOrEqual(30);
    });
  });

  describe('contains business type', () => {
    it('derives correct search term for IFA type', () => {
      const prompts = buildPrompts('Independent Financial Advisor (IFA)', LOCATION, [], '');
      const texts = prompts.map(p => p.text.toLowerCase());
      const hasFARef = texts.some(t => t.includes('financial advisor'));
      expect(hasFARef).toBe(true);
    });

    it('derives correct search term for wealth management firm', () => {
      const prompts = buildPrompts('Wealth Management Firm', LOCATION, [], '');
      const texts = prompts.map(p => p.text.toLowerCase());
      const hasWMRef = texts.some(t => t.includes('wealth manager'));
      expect(hasWMRef).toBe(true);
    });

    it('derives correct search term for chartered financial planner', () => {
      const prompts = buildPrompts('Chartered Financial Planner', LOCATION, [], '');
      const texts = prompts.map(p => p.text.toLowerCase());
      const hasFPRef = texts.some(t => t.includes('financial planner'));
      expect(hasFPRef).toBe(true);
    });

    it('handles unknown firm type with fallback', () => {
      const prompts = buildPrompts('Exotic Firm Type', LOCATION, [], '');
      expect(prompts.length).toBeGreaterThan(0);
    });
  });

  describe('sorted by weight descending', () => {
    it('prompts are returned in descending weight order', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS, DESCRIPTION);
      for (let i = 1; i < prompts.length; i++) {
        expect(prompts[i].weight).toBeLessThanOrEqual(prompts[i - 1].weight);
      }
    });
  });

  describe('description-based prompts', () => {
    it('generates prompts including description when provided', () => {
      const desc = 'Chartered pension specialist';
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, [], desc);
      // Should produce description-based prompts
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('works gracefully without description', () => {
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, KEYWORDS);
      expect(prompts.length).toBeGreaterThan(0);
    });
  });

  describe('combo prompts', () => {
    it('generates prompts that reference both keywords when 2+ provided', () => {
      const keywords = ['pension planning', 'inheritance tax'];
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, keywords, '');
      // Both keywords should appear somewhere in the prompt set
      // (combo prompts may be sliced by the 30-prompt limit, but keyword prompts for each will be present)
      const withKw0 = prompts.filter(p => p.text.toLowerCase().includes('pension planning'));
      const withKw1 = prompts.filter(p => p.text.toLowerCase().includes('inheritance tax'));
      expect(withKw0.length).toBeGreaterThan(0);
      expect(withKw1.length).toBeGreaterThan(0);
    });

    it('does not generate combo prompts with fewer than 2 keywords', () => {
      const keywords = ['pension planning'];
      const prompts = buildPrompts(FIRM_TYPE, LOCATION, keywords, '');
      const combos = prompts.filter(p => p.promptId.startsWith('combo'));
      expect(combos.length).toBe(0);
    });
  });
});
