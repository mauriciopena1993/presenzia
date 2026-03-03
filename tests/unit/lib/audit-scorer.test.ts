import { describe, it, expect } from 'vitest';
import { calculateScore, type PromptResult } from '@/lib/audit/scorer';

function makeResult(overrides: Partial<PromptResult> = {}): PromptResult {
  return {
    promptId: 'p1',
    promptText: 'Test prompt',
    platform: 'ChatGPT',
    mentioned: false,
    position: null,
    competitors: [],
    rawResponse: 'Some response',
    weight: 1,
    ...overrides,
  };
}

describe('lib/audit/scorer — calculateScore', () => {
  describe('grade boundaries', () => {
    it('score 0 → grade F', () => {
      const results = [makeResult({ platform: 'ChatGPT', mentioned: false })];
      const score = calculateScore(results);
      expect(score.overall).toBe(0);
      expect(score.grade).toBe('F');
    });

    it('low score → grade F', () => {
      // Position 1 = full credit, so 19% mentioned weight = 19%
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 19 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 81 }),
      ];
      const score = calculateScore(results);
      expect(score.grade).toBe('F');
    });

    it('score 20 → grade D', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 20 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 80 }),
      ];
      const score = calculateScore(results);
      expect(score.grade).toBe('D');
    });

    it('score 40 → grade C', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 40 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 60 }),
      ];
      const score = calculateScore(results);
      expect(score.grade).toBe('C');
    });

    it('score 60 → grade B', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 60 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 40 }),
      ];
      const score = calculateScore(results);
      expect(score.grade).toBe('B');
    });

    it('score 80+ → grade A', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 80 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 20 }),
      ];
      const score = calculateScore(results);
      expect(score.grade).toBe('A');
    });
  });

  describe('position weighting', () => {
    it('position 1-2 gets full credit', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 100 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(100);
    });

    it('position 3 gets 90% credit', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 3, weight: 100 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(90);
    });

    it('position 4-5 gets 70% credit', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 4, weight: 100 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(70);
    });

    it('position 6+ gets 40% credit', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 8, weight: 100 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(40);
    });

    it('null position (mentioned but no rank data) gets full credit', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: null, weight: 100 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(100);
    });
  });

  describe('platform weighting', () => {
    it('ChatGPT has highest weight (35)', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(100);
    });

    it('weighs multiple platforms correctly', () => {
      const results = [
        // ChatGPT: 100% at position 1 (weight 35)
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        // Claude: 0% (weight 15)
        makeResult({ platform: 'Claude', mentioned: false }),
        // Perplexity: 100% at position 2 (weight 20) — position 2 = full credit
        makeResult({ platform: 'Perplexity', mentioned: true, position: 2 }),
        // Google AI: 0% (weight 30)
        makeResult({ platform: 'Google AI', mentioned: false }),
      ];
      const score = calculateScore(results);
      // (100*35 + 0*15 + 100*20 + 0*30) / (35+15+20+30) = 5500/100 = 55
      expect(score.overall).toBe(55);
    });
  });

  describe('competitor tracking', () => {
    it('collects competitors across all prompts', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: false, competitors: ['Firm A', 'Firm B'] }),
        makeResult({ platform: 'Claude', mentioned: false, competitors: ['Firm A', 'Firm C'] }),
      ];
      const score = calculateScore(results);
      expect(score.topCompetitors.length).toBeGreaterThan(0);
      expect(score.topCompetitors[0].name).toBe('Firm A');
      expect(score.topCompetitors[0].count).toBe(2);
    });

    it('limits to top 10 competitors', () => {
      const competitors = Array.from({ length: 15 }, (_, i) => `Firm ${i}`);
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: false, competitors }),
      ];
      const score = calculateScore(results);
      expect(score.topCompetitors.length).toBeLessThanOrEqual(10);
    });
  });

  describe('mention counting', () => {
    it('counts mentions correctly', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'ChatGPT', mentioned: false }),
        makeResult({ platform: 'Claude', mentioned: true, position: 3 }),
        makeResult({ platform: 'Perplexity', mentioned: false }),
      ];
      const score = calculateScore(results);
      expect(score.mentionedInCount).toBe(2);
      expect(score.totalPrompts).toBe(4);
    });
  });

  describe('platform scores', () => {
    it('calculates per-platform scores with position weighting', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'ChatGPT', mentioned: false }),
        makeResult({ platform: 'Claude', mentioned: true, position: 2 }),
      ];
      const score = calculateScore(results);
      const chatgpt = score.platforms.find(p => p.platform === 'ChatGPT');
      const claude = score.platforms.find(p => p.platform === 'Claude');

      expect(chatgpt?.promptsTested).toBe(2);
      expect(chatgpt?.promptsMentioned).toBe(1);
      expect(chatgpt?.score).toBe(50); // position 1 = full credit: 1/2 = 50%

      expect(claude?.promptsTested).toBe(1);
      expect(claude?.promptsMentioned).toBe(1);
      expect(claude?.score).toBe(100); // position 2 = full credit
    });

    it('calculates average position', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 3 }),
      ];
      const score = calculateScore(results);
      const chatgpt = score.platforms.find(p => p.platform === 'ChatGPT');
      expect(chatgpt?.avgPosition).toBe(2);
    });

    it('avg position is null when no mentions', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: false }),
      ];
      const score = calculateScore(results);
      const chatgpt = score.platforms.find(p => p.platform === 'ChatGPT');
      expect(chatgpt?.avgPosition).toBeNull();
    });

    it('tracks top-3 count per platform', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 3 }),
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 5 }),
        makeResult({ platform: 'ChatGPT', mentioned: false }),
      ];
      const score = calculateScore(results);
      const chatgpt = score.platforms.find(p => p.platform === 'ChatGPT');
      expect(chatgpt?.topThreeCount).toBe(2); // positions 1 and 3
    });
  });

  describe('top-3 percentage', () => {
    it('calculates topThreePct across all platforms', () => {
      const results = [
        makeResult({ promptId: 'p1', platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ promptId: 'p1', platform: 'Claude', mentioned: true, position: 5 }),
        makeResult({ promptId: 'p2', platform: 'ChatGPT', mentioned: true, position: 4 }),
        makeResult({ promptId: 'p2', platform: 'Claude', mentioned: false }),
      ];
      const score = calculateScore(results);
      // p1 has top-3 on ChatGPT, p2 does not → 1/2 = 50%
      expect(score.topThreePct).toBe(50);
    });

    it('topThreePct is 0 when no top-3 appearances', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 6 }),
        makeResult({ platform: 'ChatGPT', mentioned: false }),
      ];
      const score = calculateScore(results);
      expect(score.topThreePct).toBe(0);
    });

    it('topThreePct is 100 when all in top 3', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'Claude', mentioned: true, position: 2 }),
      ];
      const score = calculateScore(results);
      expect(score.topThreePct).toBe(100);
    });
  });

  describe('summary generation', () => {
    it('generates a non-empty summary', () => {
      const results = [makeResult({ platform: 'ChatGPT', mentioned: false })];
      const score = calculateScore(results);
      expect(score.summary).toBeTruthy();
      expect(typeof score.summary).toBe('string');
    });

    it('summary mentions score value', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1, weight: 50 }),
        makeResult({ platform: 'ChatGPT', mentioned: false, weight: 50 }),
      ];
      const score = calculateScore(results);
      expect(score.summary).toContain('50');
    });
  });

  describe('edge cases', () => {
    it('handles empty results', () => {
      const score = calculateScore([]);
      expect(score.overall).toBe(0);
      expect(score.grade).toBe('F');
      expect(score.totalPrompts).toBe(0);
      expect(score.mentionedInCount).toBe(0);
    });

    it('handles all platforms at 100%', () => {
      const results = [
        makeResult({ platform: 'ChatGPT', mentioned: true, position: 1 }),
        makeResult({ platform: 'Claude', mentioned: true, position: 1 }),
        makeResult({ platform: 'Perplexity', mentioned: true, position: 1 }),
        makeResult({ platform: 'Google AI', mentioned: true, position: 1 }),
      ];
      const score = calculateScore(results);
      expect(score.overall).toBe(100);
      expect(score.grade).toBe('A');
    });

    it('handles unknown platforms with fallback weight', () => {
      const results = [
        makeResult({ platform: 'NewAI', mentioned: true, position: 1 }),
      ];
      const score = calculateScore(results);
      // calculateScore only processes known platforms; NewAI is skipped
      expect(score.platforms.length).toBe(0);
      expect(score.totalPrompts).toBe(1);
      expect(score.mentionedInCount).toBe(1);
    });
  });
});
