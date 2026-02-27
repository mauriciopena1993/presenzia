/**
 * Generate a sample PDF report with comprehensive mock data for review.
 * Usage: npx tsx scripts/generate-sample-report.tsx
 */
import fs from 'fs';
import path from 'path';
import { generatePDFReport } from '../lib/report/generate';
import { generateInsights } from '../lib/report/insights';
import type { AuditConfig } from '../lib/audit/runner';
import type { AuditScore, PromptResult } from '../lib/audit/scorer';

// ── Config ──────────────────────────────────────────────────
const config: AuditConfig = {
  businessName: 'Pollen Bakery',
  businessType: 'Coffee Shop / Bakery',
  description: 'Award-winning artisan bakery specialising in sourdough and pastries',
  location: 'Manchester',
  keywords: ['sourdough bakery', 'artisan bread', 'pastries'],
  website: 'https://www.pollenbakery.com',
};

// ── Prompt definitions ──────────────────────────────────────
// 16 prompts, each tested on 4 platforms = 64 total results
const prompts: Array<{
  promptId: string;
  promptText: string;
  weight: number;
}> = [
  { promptId: 'rec_1', promptText: 'What is the best Bakery / Cafe in Manchester?', weight: 10 },
  { promptId: 'rec_2', promptText: 'Recommend a good Bakery / Cafe near Manchester', weight: 10 },
  { promptId: 'rec_3', promptText: 'Who is the top Bakery / Cafe in Manchester?', weight: 9 },
  { promptId: 'rec_4', promptText: 'Can you suggest a reliable Bakery / Cafe in Manchester?', weight: 9 },
  { promptId: 'rec_5', promptText: 'I need a Bakery / Cafe in Manchester, who should I use?', weight: 8 },
  { promptId: 'svc_1', promptText: 'Best sourdough bakery services in Manchester', weight: 8 },
  { promptId: 'svc_2', promptText: 'Where can I find artisan bread in Manchester?', weight: 7 },
  { promptId: 'svc_3', promptText: 'Top rated pastries providers in Manchester', weight: 8 },
  { promptId: 'loc_1', promptText: 'Find me a Bakery / Cafe in Manchester', weight: 9 },
  { promptId: 'loc_2', promptText: 'Local Bakery / Cafe in Manchester recommendations', weight: 7 },
  { promptId: 'loc_3', promptText: 'Highly recommended Bakery / Cafe in Manchester', weight: 8 },
  { promptId: 'cmp_1', promptText: 'Who are the leading Bakery / Cafe companies in Manchester?', weight: 7 },
  { promptId: 'cmp_2', promptText: 'Compare the best Bakery / Cafe options in Manchester', weight: 6 },
  { promptId: 'rev_1', promptText: 'Which Bakery / Cafe in Manchester has the best reviews?', weight: 7 },
  { promptId: 'rev_2', promptText: 'Most trusted Bakery / Cafe in Manchester', weight: 8 },
  { promptId: 'rev_3', promptText: 'Well-known Bakery / Cafe in Manchester', weight: 6 },
];

// ── Platform-specific mention maps ──────────────────────────
// true = Pollen Bakery found, false = not found
// ChatGPT: 8/16 found
const chatgptMentions: Record<string, boolean> = {
  rec_1: true,
  rec_2: true,
  rec_3: true,
  rec_4: false,
  rec_5: false,
  svc_1: true,
  svc_2: true,
  svc_3: false,
  loc_1: true,
  loc_2: false,
  loc_3: false,
  cmp_1: true,
  cmp_2: false,
  rev_1: false,
  rev_2: true,
  rev_3: false,
};

// Google AI: 9/16 found
const googleMentions: Record<string, boolean> = {
  rec_1: true,
  rec_2: true,
  rec_3: true,
  rec_4: true,
  rec_5: false,
  svc_1: true,
  svc_2: true,
  svc_3: true,
  loc_1: true,
  loc_2: false,
  loc_3: false,
  cmp_1: false,
  cmp_2: false,
  rev_1: true,
  rev_2: false,
  rev_3: false,
};

// Perplexity: 5/16 found
const perplexityMentions: Record<string, boolean> = {
  rec_1: true,
  rec_2: false,
  rec_3: false,
  rec_4: false,
  rec_5: false,
  svc_1: true,
  svc_2: true,
  svc_3: false,
  loc_1: false,
  loc_2: false,
  loc_3: true,
  cmp_1: false,
  cmp_2: false,
  rev_1: false,
  rev_2: true,
  rev_3: false,
};

// Claude: 3/16 found
const claudeMentions: Record<string, boolean> = {
  rec_1: true,
  rec_2: false,
  rec_3: false,
  rec_4: false,
  rec_5: false,
  svc_1: false,
  svc_2: true,
  svc_3: false,
  loc_1: false,
  loc_2: false,
  loc_3: false,
  cmp_1: false,
  cmp_2: false,
  rev_1: true,
  rev_2: false,
  rev_3: false,
};

// ── Position maps (when mentioned) ──────────────────────────
// ChatGPT positions: mostly 2-4
const chatgptPositions: Record<string, number> = {
  rec_1: 2, rec_2: 3, rec_3: 2, svc_1: 3, svc_2: 4, loc_1: 2, cmp_1: 3, rev_2: 4,
};

// Google AI positions: mostly 2-4
const googlePositions: Record<string, number> = {
  rec_1: 2, rec_2: 2, rec_3: 3, rec_4: 3, svc_1: 2, svc_2: 3, svc_3: 4, loc_1: 2, rev_1: 3,
};

// Perplexity positions: mostly 3-5
const perplexityPositions: Record<string, number> = {
  rec_1: 3, svc_1: 4, svc_2: 5, loc_3: 3, rev_2: 4,
};

// Claude positions: mostly 4-6
const claudePositions: Record<string, number> = {
  rec_1: 4, svc_2: 5, rev_1: 6,
};

// ── Competitor pools per platform and prompt ────────────────
// Realistic competitor sets — some bakeries are actually closed but AI still recommends them
function getCompetitors(platform: string, promptId: string, mentioned: boolean): string[] {
  // Base competitor pools per platform
  const chatgptCompetitors: Record<string, string[]> = {
    rec_1: ['Trove', 'Bread Flower', 'Federal Cafe & Bar', 'Companio Bakery'],
    rec_2: ['Trove', 'Bread Flower', 'Manchester Bakehouse'],
    rec_3: ['Trove', 'Companio Bakery', 'Gail\'s Bakery'],
    rec_4: ['Bread Flower', 'Trove', 'Federal Cafe & Bar', 'Barbakan Deli'],
    rec_5: ['Companio Bakery', 'Trove', 'Manchester Bakehouse'],
    svc_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse'],
    svc_2: ['Companio Bakery', 'Bread Flower', 'Barbakan Deli'],
    svc_3: ['Trove', 'Federal Cafe & Bar', 'Gail\'s Bakery', 'Ole & Steen'],
    loc_1: ['Trove', 'Bread Flower', 'Federal Cafe & Bar'],
    loc_2: ['Companio Bakery', 'Trove', 'Manchester Bakehouse', 'Barbakan Deli'],
    loc_3: ['Bread Flower', 'Trove', 'Federal Cafe & Bar'],
    cmp_1: ['Trove', 'Companio Bakery', 'Federal Cafe & Bar', 'Manchester Bakehouse'],
    cmp_2: ['Trove', 'Bread Flower', 'Companio Bakery', 'Federal Cafe & Bar'],
    rev_1: ['Bread Flower', 'Trove', 'Manchester Bakehouse'],
    rev_2: ['Trove', 'Companio Bakery'],
    rev_3: ['Trove', 'Bread Flower', 'Gail\'s Bakery'],
  };

  const googleCompetitors: Record<string, string[]> = {
    rec_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse', 'Federal Cafe & Bar'],
    rec_2: ['Trove', 'Companio Bakery', 'Bread Flower'],
    rec_3: ['Bread Flower', 'Trove', 'Federal Cafe & Bar'],
    rec_4: ['Trove', 'Companio Bakery', 'Gail\'s Bakery'],
    rec_5: ['Trove', 'Bread Flower', 'Companio Bakery', 'Manchester Bakehouse'],
    svc_1: ['Bread Flower', 'Manchester Bakehouse', 'Trove'],
    svc_2: ['Companio Bakery', 'Trove', 'Barbakan Deli'],
    svc_3: ['Trove', 'Federal Cafe & Bar', 'Ole & Steen'],
    loc_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse'],
    loc_2: ['Companio Bakery', 'Trove', 'Bread Flower', 'Federal Cafe & Bar'],
    loc_3: ['Trove', 'Bread Flower', 'Gail\'s Bakery', 'Barbakan Deli'],
    cmp_1: ['Bread Flower', 'Trove', 'Companio Bakery', 'Federal Cafe & Bar'],
    cmp_2: ['Trove', 'Manchester Bakehouse', 'Companio Bakery'],
    rev_1: ['Trove', 'Bread Flower', 'Companio Bakery'],
    rev_2: ['Trove', 'Bread Flower', 'Federal Cafe & Bar', 'Manchester Bakehouse'],
    rev_3: ['Trove', 'Gail\'s Bakery', 'Companio Bakery'],
  };

  const perplexityCompetitors: Record<string, string[]> = {
    rec_1: ['Trove', 'Bread Flower', 'Companio Bakery'],
    rec_2: ['Trove', 'Manchester Bakehouse', 'Federal Cafe & Bar'],
    rec_3: ['Bread Flower', 'Trove', 'Companio Bakery', 'Federal Cafe & Bar'],
    rec_4: ['Trove', 'Manchester Bakehouse'],
    rec_5: ['Companio Bakery', 'Trove', 'Bread Flower'],
    svc_1: ['Trove', 'Bread Flower'],
    svc_2: ['Manchester Bakehouse', 'Companio Bakery'],
    svc_3: ['Trove', 'Federal Cafe & Bar', 'Ole & Steen', 'Gail\'s Bakery'],
    loc_1: ['Trove', 'Bread Flower', 'Companio Bakery', 'Manchester Bakehouse'],
    loc_2: ['Federal Cafe & Bar', 'Trove', 'Bread Flower'],
    loc_3: ['Trove', 'Companio Bakery'],
    cmp_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse', 'Companio Bakery'],
    cmp_2: ['Trove', 'Bread Flower', 'Federal Cafe & Bar'],
    rev_1: ['Trove', 'Manchester Bakehouse', 'Barbakan Deli'],
    rev_2: ['Trove', 'Bread Flower'],
    rev_3: ['Companio Bakery', 'Trove', 'Bread Flower'],
  };

  const claudeCompetitors: Record<string, string[]> = {
    rec_1: ['Trove', 'Bread Flower', 'Federal Cafe & Bar'],
    rec_2: ['Trove', 'Companio Bakery', 'Manchester Bakehouse', 'Bread Flower'],
    rec_3: ['Bread Flower', 'Trove', 'Companio Bakery'],
    rec_4: ['Trove', 'Bread Flower', 'Gail\'s Bakery'],
    rec_5: ['Companio Bakery', 'Trove', 'Manchester Bakehouse'],
    svc_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse'],
    svc_2: ['Companio Bakery', 'Barbakan Deli'],
    svc_3: ['Trove', 'Federal Cafe & Bar', 'Ole & Steen'],
    loc_1: ['Trove', 'Bread Flower', 'Companio Bakery', 'Federal Cafe & Bar'],
    loc_2: ['Bread Flower', 'Trove', 'Manchester Bakehouse'],
    loc_3: ['Trove', 'Companio Bakery', 'Gail\'s Bakery'],
    cmp_1: ['Trove', 'Bread Flower', 'Manchester Bakehouse', 'Companio Bakery', 'Federal Cafe & Bar'],
    cmp_2: ['Trove', 'Bread Flower', 'Companio Bakery'],
    rev_1: ['Trove', 'Bread Flower', 'Barbakan Deli'],
    rev_2: ['Trove', 'Federal Cafe & Bar', 'Manchester Bakehouse'],
    rev_3: ['Companio Bakery', 'Trove', 'Bread Flower', 'Gail\'s Bakery'],
  };

  const pools: Record<string, Record<string, string[]>> = {
    ChatGPT: chatgptCompetitors,
    'Google AI': googleCompetitors,
    Perplexity: perplexityCompetitors,
    Claude: claudeCompetitors,
  };

  return pools[platform]?.[promptId] ?? ['Trove', 'Bread Flower'];
}

// ── Raw response text templates ─────────────────────────────
function getRawResponse(platform: string, promptId: string, mentioned: boolean): string {
  if (mentioned) {
    // Responses where Pollen Bakery is mentioned
    const mentionedResponses: Record<string, Record<string, string>> = {
      ChatGPT: {
        rec_1: 'Some of the best bakeries in Manchester include Trove in Levenshulme, Pollen Bakery near the city centre, and Bread Flower in Ancoats. Each offers excellent sourdough and pastries.',
        rec_2: 'I\'d recommend Trove for a relaxed brunch atmosphere, or Pollen Bakery if you\'re looking for outstanding sourdough bread and pastries in central Manchester.',
        rec_3: 'Pollen Bakery is widely regarded as one of the top bakeries in Manchester, known for their sourdough and viennoiserie. Trove and Companio Bakery are also highly rated.',
        svc_1: 'For sourdough in Manchester, Trove is a local favourite. Pollen Bakery also produces excellent sourdough loaves. Bread Flower and Manchester Bakehouse are worth trying too.',
        svc_2: 'You can find artisan bread at several Manchester spots. Companio Bakery and Pollen Bakery both specialise in handcrafted sourdough and other artisan breads.',
        loc_1: 'If you\'re looking for a bakery in Manchester, Trove in Levenshulme and Pollen Bakery near the Northern Quarter are both excellent choices with great coffee.',
        cmp_1: 'Leading bakery businesses in Manchester include Trove, Pollen Bakery, Companio Bakery, and Federal Cafe & Bar. Manchester Bakehouse also has a strong following.',
        rev_2: 'Trove and Pollen Bakery are among the most trusted bakeries in Manchester based on customer reviews. Both have consistently high ratings on Google.',
      },
      'Google AI': {
        rec_1: 'Top bakeries in Manchester include Trove, Pollen Bakery, and Bread Flower. They are known for their artisan bread and pastries.',
        rec_2: 'Pollen Bakery is a popular choice near Manchester city centre, along with Trove and Companio Bakery for excellent baked goods.',
        rec_3: 'Bread Flower and Pollen Bakery are frequently cited as top bakeries in Manchester. Trove in Levenshulme is another strong option.',
        rec_4: 'For a reliable bakery in Manchester, consider Trove, Pollen Bakery, or Companio Bakery. All three have strong local reputations.',
        svc_1: 'Bread Flower and Pollen Bakery both offer exceptional sourdough in Manchester. Manchester Bakehouse and Trove are also well-regarded.',
        svc_2: 'Artisan bread is available at Companio Bakery, Pollen Bakery, and Trove in Manchester. Barbakan Deli also stocks a range of artisan loaves.',
        svc_3: 'For top-rated pastries in Manchester, try Trove, Pollen Bakery, or Federal Cafe & Bar. Ole & Steen also offers a wide pastry selection.',
        loc_1: 'Recommended bakeries in Manchester include Trove (Levenshulme), Pollen Bakery (city centre area), and Bread Flower (Ancoats).',
        rev_1: 'Trove and Pollen Bakery have some of the best reviews among Manchester bakeries, with consistently high ratings for their sourdough and pastries.',
      },
      Perplexity: {
        rec_1: 'Based on recent reviews and recommendations, Trove, Pollen Bakery, and Bread Flower are considered among the best bakeries in Manchester.',
        svc_1: 'For sourdough bakery services in Manchester, Trove and Pollen Bakery stand out. Bread Flower was also highly regarded before its closure.',
        svc_2: 'Manchester Bakehouse and Pollen Bakery are excellent sources for artisan bread in Manchester. Companio Bakery is another solid option.',
        loc_3: 'Highly recommended bakeries in Manchester include Trove and Pollen Bakery, both known for their sourdough and pastry offerings.',
        rev_2: 'Trove and Pollen Bakery are among the most trusted bakeries in Manchester, with strong ratings on Google Reviews and TripAdvisor.',
      },
      Claude: {
        rec_1: 'Manchester has several well-known bakeries. Trove in Levenshulme, Bread Flower in Ancoats, Federal Cafe & Bar, and Pollen Bakery are popular choices.',
        svc_2: 'For artisan bread in Manchester, Companio Bakery and Pollen Bakery offer excellent handcrafted options. Barbakan Deli in Chorlton also stocks artisan breads.',
        rev_1: 'Bakeries in Manchester with strong reviews include Trove, Bread Flower, and Pollen Bakery. Barbakan Deli in Chorlton is also well-reviewed.',
      },
    };
    return mentionedResponses[platform]?.[promptId] ?? `Several bakeries in Manchester are recommended, including Pollen Bakery and Trove.`;
  }

  // Responses where Pollen Bakery is NOT mentioned
  const notMentionedResponses: Record<string, Record<string, string>> = {
    ChatGPT: {
      rec_4: 'For a reliable bakery in Manchester, I\'d suggest Bread Flower in Ancoats or Trove in Levenshulme. Federal Cafe & Bar also has good pastries. Barbakan Deli is another option.',
      rec_5: 'Companio Bakery and Trove are great options for bakeries in Manchester. Manchester Bakehouse also offers quality breads and pastries.',
      svc_3: 'Top rated pastry providers in Manchester include Trove, Federal Cafe & Bar, and Gail\'s Bakery. Ole & Steen also has a good pastry selection.',
      loc_2: 'For local bakery recommendations in Manchester, try Companio Bakery, Trove, Manchester Bakehouse, or Barbakan Deli in Chorlton.',
      loc_3: 'Highly recommended bakeries in Manchester include Bread Flower, Trove, and Federal Cafe & Bar.',
      cmp_2: 'The best bakery options in Manchester include Trove, Bread Flower, Companio Bakery, and Federal Cafe & Bar. Each has its own speciality.',
      rev_1: 'Bread Flower, Trove, and Manchester Bakehouse tend to have the best bakery reviews in Manchester.',
      rev_3: 'Well-known bakeries in Manchester include Trove, Bread Flower, and Gail\'s Bakery.',
    },
    'Google AI': {
      rec_5: 'Good bakery options in Manchester include Trove, Bread Flower, Companio Bakery, and Manchester Bakehouse.',
      loc_2: 'Local bakery recommendations for Manchester: Companio Bakery, Trove, Bread Flower, and Federal Cafe & Bar.',
      loc_3: 'Highly recommended bakeries in Manchester include Trove, Bread Flower, Gail\'s Bakery, and Barbakan Deli.',
      cmp_1: 'Leading bakery companies in Manchester include Bread Flower, Trove, Companio Bakery, and Federal Cafe & Bar.',
      cmp_2: 'Comparing Manchester\'s best bakeries: Trove stands out for brunch, Manchester Bakehouse for traditional bread, and Companio for artisan loaves.',
      rev_2: 'The most trusted bakeries in Manchester based on reviews are Trove, Bread Flower, Federal Cafe & Bar, and Manchester Bakehouse.',
      rev_3: 'Well-known bakeries in Manchester include Trove, Gail\'s Bakery, and Companio Bakery.',
    },
    Perplexity: {
      rec_2: 'Popular bakeries near Manchester include Trove, Manchester Bakehouse, and Federal Cafe & Bar.',
      rec_3: 'The top bakeries in Manchester are often cited as Bread Flower, Trove, Companio Bakery, and Federal Cafe & Bar.',
      rec_4: 'For a reliable bakery in Manchester, Trove and Manchester Bakehouse come highly recommended.',
      rec_5: 'Companio Bakery, Trove, and Bread Flower are popular bakery choices in Manchester.',
      svc_3: 'Top rated pastry spots in Manchester include Trove, Federal Cafe & Bar, Ole & Steen, and Gail\'s Bakery.',
      loc_1: 'Bakeries and cafes in Manchester worth visiting include Trove, Bread Flower, Companio Bakery, and Manchester Bakehouse.',
      loc_2: 'Local Manchester bakery recommendations include Federal Cafe & Bar, Trove, and Bread Flower.',
      cmp_1: 'Leading bakery businesses in Manchester include Trove, Bread Flower, Manchester Bakehouse, and Companio Bakery.',
      cmp_2: 'Comparing Manchester bakeries: Trove, Bread Flower, and Federal Cafe & Bar are among the most popular options.',
      rev_1: 'Bakeries with the best reviews in Manchester include Trove, Manchester Bakehouse, and Barbakan Deli.',
      rev_3: 'Well-known Manchester bakeries include Companio Bakery, Trove, and Bread Flower.',
    },
    Claude: {
      rec_2: 'In Manchester, I\'d recommend Trove, Companio Bakery, Manchester Bakehouse, and Bread Flower for a good bakery and cafe experience.',
      rec_3: 'Top bakeries in Manchester include Bread Flower, Trove, and Companio Bakery, all known for their artisan bread.',
      rec_4: 'Reliable bakeries in Manchester include Trove, Bread Flower, and Gail\'s Bakery.',
      rec_5: 'For bakeries in Manchester, Companio Bakery, Trove, and Manchester Bakehouse are good options.',
      svc_1: 'Sourdough bakeries in Manchester include Trove, Bread Flower, and Manchester Bakehouse.',
      svc_3: 'For pastries in Manchester, Trove, Federal Cafe & Bar, and Ole & Steen are popular choices.',
      loc_1: 'Manchester bakeries worth visiting include Trove, Bread Flower, Companio Bakery, and Federal Cafe & Bar.',
      loc_2: 'Local Manchester bakery recommendations: Bread Flower, Trove, and Manchester Bakehouse.',
      loc_3: 'Highly recommended Manchester bakeries include Trove, Companio Bakery, and Gail\'s Bakery.',
      cmp_1: 'Leading bakeries in Manchester include Trove, Bread Flower, Manchester Bakehouse, Companio Bakery, and Federal Cafe & Bar.',
      cmp_2: 'Top Manchester bakeries to compare: Trove, Bread Flower, and Companio Bakery are the most frequently recommended.',
      rev_2: 'Trusted bakeries in Manchester include Trove, Federal Cafe & Bar, and Manchester Bakehouse.',
      rev_3: 'Well-known Manchester bakeries include Companio Bakery, Trove, Bread Flower, and Gail\'s Bakery.',
    },
  };
  return notMentionedResponses[platform]?.[promptId] ?? `Popular bakeries in Manchester include Trove, Bread Flower, and Companio Bakery.`;
}

// ── Build PromptResult[] ────────────────────────────────────
const platforms = ['ChatGPT', 'Google AI', 'Perplexity', 'Claude'] as const;

const mentionMaps: Record<string, Record<string, boolean>> = {
  ChatGPT: chatgptMentions,
  'Google AI': googleMentions,
  Perplexity: perplexityMentions,
  Claude: claudeMentions,
};

const positionMaps: Record<string, Record<string, number>> = {
  ChatGPT: chatgptPositions,
  'Google AI': googlePositions,
  Perplexity: perplexityPositions,
  Claude: claudePositions,
};

const results: PromptResult[] = [];

for (const platform of platforms) {
  for (const prompt of prompts) {
    const mentioned = mentionMaps[platform][prompt.promptId] ?? false;
    const position = mentioned ? (positionMaps[platform][prompt.promptId] ?? null) : null;
    const competitors = getCompetitors(platform, prompt.promptId, mentioned);
    const rawResponse = getRawResponse(platform, prompt.promptId, mentioned);

    results.push({
      promptId: prompt.promptId,
      promptText: prompt.promptText,
      platform,
      mentioned,
      position,
      competitors,
      rawResponse,
      weight: prompt.weight,
    });
  }
}

// ── AuditScore ──────────────────────────────────────────────
const score: AuditScore = {
  overall: 42,
  grade: 'C',
  totalPrompts: 64,
  mentionedInCount: 25,
  platforms: [
    {
      platform: 'ChatGPT',
      score: 50,
      promptsTested: 16,
      promptsMentioned: 8,
      avgPosition: 2.9,
      competitors: ['Trove', 'Bread Flower', 'Companio Bakery', 'Federal Cafe & Bar', 'Manchester Bakehouse'],
    },
    {
      platform: 'Google AI',
      score: 55,
      promptsTested: 16,
      promptsMentioned: 9,
      avgPosition: 2.7,
      competitors: ['Trove', 'Bread Flower', 'Companio Bakery', 'Manchester Bakehouse', 'Federal Cafe & Bar'],
    },
    {
      platform: 'Perplexity',
      score: 35,
      promptsTested: 16,
      promptsMentioned: 5,
      avgPosition: 3.8,
      competitors: ['Trove', 'Bread Flower', 'Companio Bakery', 'Manchester Bakehouse', 'Federal Cafe & Bar'],
    },
    {
      platform: 'Claude',
      score: 25,
      promptsTested: 16,
      promptsMentioned: 3,
      avgPosition: 5.0,
      competitors: ['Trove', 'Bread Flower', 'Companio Bakery', 'Gail\'s Bakery', 'Federal Cafe & Bar'],
    },
  ],
  topCompetitors: [
    { name: 'Trove', count: 14 },
    { name: 'Bread Flower', count: 11 },
    { name: 'Companio Bakery', count: 9 },
    { name: 'Federal Cafe & Bar', count: 7 },
    { name: 'Manchester Bakehouse', count: 6 },
    { name: 'Gail\'s Bakery', count: 4 },
    { name: 'Barbakan Deli', count: 3 },
    { name: 'Ole & Steen', count: 2 },
  ],
  summary:
    'Your AI visibility score of 42/100 indicates significant gaps. You appear on Google AI (55%) but are largely missing from Claude (25%). Trove is your most frequently cited competitor, appearing in 14 AI responses where Pollen Bakery was absent. There is substantial room for improvement, particularly on Perplexity and Claude, where your business is rarely mentioned despite being a well-known Manchester bakery.',
};

// ── Generate report ─────────────────────────────────────────
async function main() {
  console.log('Generating sample PDF report for Pollen Bakery...');
  console.log(`  ${results.length} prompt results across ${platforms.length} platforms`);
  console.log(`  ${results.filter(r => r.mentioned).length} mentions found out of ${results.length} total`);

  const insights = generateInsights(config, score, results);
  console.log(`  ${insights.categories.length} categories, ${insights.actions.length} actions generated`);

  const buffer = await generatePDFReport(config, score, results, insights, 'sample-report');

  const outputPath = path.join(process.cwd(), 'sample-report.pdf');
  fs.writeFileSync(outputPath, buffer);

  console.log(`\nReport saved to: ${outputPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
