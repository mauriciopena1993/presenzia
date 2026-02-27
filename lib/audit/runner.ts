/**
 * Audit runner — tests prompts across AI platforms and collects results.
 * Uses OpenAI API to query ChatGPT, and Claude API for Claude.
 * For Perplexity and Google AI, uses their respective APIs.
 */

import { buildPrompts } from './prompts';
import { PromptResult, calculateScore, AuditScore } from './scorer';

export interface AuditConfig {
  businessName: string;
  businessType: string;
  description: string;
  location: string;
  keywords: string[];
  website?: string;
}

export interface AuditJob {
  id: string;
  config: AuditConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  results?: PromptResult[];
  score?: AuditScore;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// Check if a business name appears in an AI response
function checkMention(response: string, businessName: string): {
  mentioned: boolean;
  position: number | null;
} {
  const normalized = response.toLowerCase();
  const nameNormalized = businessName.toLowerCase();

  if (!normalized.includes(nameNormalized)) {
    return { mentioned: false, position: null };
  }

  // Estimate position (1 = mentioned first among all businesses)
  // Simple heuristic: count paragraphs/sections before mention
  const mentionIndex = normalized.indexOf(nameNormalized);
  const textBefore = normalized.substring(0, mentionIndex);
  const numberedItems = (textBefore.match(/\d+\./g) || []).length;
  const position = Math.max(1, numberedItems + 1);

  return { mentioned: true, position };
}

// Extract competitor names from AI response
function extractCompetitors(response: string, businessName: string): string[] {
  const competitors: string[] = [];

  // Look for patterns like "1. Business Name", "**Business Name**", etc.
  const patterns = [
    /\d+\.\s+\*\*(.+?)\*\*/g,    // Numbered with bold: 1. **Business Name**
    /\d+\.\s+([A-Z][^.\n]+)/g,   // Numbered: 1. Business Name
    /\*\*([A-Z][^*]+)\*\*/g,      // Bold: **Business Name**
    /^-\s+([A-Z][^.\n]+)/gm,      // Bullet: - Business Name
  ];

  const found = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      const name = match[1].trim();
      if (
        name.length > 2 &&
        name.length < 100 &&
        name.toLowerCase() !== businessName.toLowerCase() &&
        !name.includes('http') &&
        !name.includes('@')
      ) {
        found.add(name);
      }
    }
  }

  return Array.from(found).slice(0, 10);
}

// Query ChatGPT
async function queryChatGPT(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. When asked about local businesses, provide specific recommendations with business names.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`ChatGPT API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Query Claude
async function queryClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

// Query Perplexity
async function queryPerplexity(prompt: string): Promise<string> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured — platform skipped');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Query Google AI (Gemini)
// Get a free API key at: https://ai.google.dev — add as GOOGLE_AI_API_KEY in Vercel
async function queryGoogleAI(prompt: string): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY not configured — platform skipped');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const PLATFORM_QUERIERS: Record<string, (prompt: string) => Promise<string>> = {
  'ChatGPT': queryChatGPT,
  'Claude': queryClaude,
  'Perplexity': queryPerplexity,
  'Google AI': queryGoogleAI,
};

// Run all prompts for a single platform, with a small delay between calls
async function runPlatformAudit(
  platform: string,
  querier: (prompt: string) => Promise<string>,
  prompts: Array<{ promptId: string; text: string; weight: number }>,
  businessName: string,
): Promise<PromptResult[]> {
  const results: PromptResult[] = [];

  for (const prompt of prompts) {
    try {
      const response = await querier(prompt.text);
      const { mentioned, position } = checkMention(response, businessName);
      const competitors = extractCompetitors(response, businessName);

      results.push({
        promptId: prompt.promptId,
        promptText: prompt.text,
        platform,
        mentioned,
        position,
        competitors,
        rawResponse: response,
        weight: prompt.weight,
      });

      // Small delay between prompts on same platform to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (error) {
      console.error(`Error querying ${platform} with prompt "${prompt.text}":`, error);
      results.push({
        promptId: prompt.promptId,
        promptText: prompt.text,
        platform,
        mentioned: false,
        position: null,
        competitors: [],
        rawResponse: '',
        weight: prompt.weight,
      });
    }
  }

  return results;
}

// Which platforms can we actually query? Skip any with missing API keys.
function getAvailablePlatforms(): string[] {
  const available: string[] = [];
  if (process.env.OPENAI_API_KEY)     available.push('ChatGPT');
  if (process.env.ANTHROPIC_API_KEY)  available.push('Claude');
  if (process.env.PERPLEXITY_API_KEY) available.push('Perplexity');
  if (process.env.GOOGLE_AI_API_KEY)  available.push('Google AI');
  return available;
}

// Main audit runner — platforms run in parallel, prompts within each platform are sequential
export async function runAudit(
  config: AuditConfig,
  onProgress?: (progress: number, status: string) => void
): Promise<{ results: PromptResult[]; score: AuditScore }> {
  const prompts = buildPrompts(config.businessType, config.location, config.keywords, config.description);
  const platforms = getAvailablePlatforms();

  if (platforms.length === 0) {
    throw new Error('No AI platform API keys configured. Set OPENAI_API_KEY and/or ANTHROPIC_API_KEY.');
  }

  // Log which platforms are being skipped (helps with debugging)
  const allPlatforms = Object.keys(PLATFORM_QUERIERS);
  const skipped = allPlatforms.filter(p => !platforms.includes(p));
  if (skipped.length > 0) {
    console.warn(`⚠️  Platforms skipped (no API key): ${skipped.join(', ')}`);
    console.warn('   → Add PERPLEXITY_API_KEY (perplexity.ai/settings/api)');
    console.warn('   → Add GOOGLE_AI_API_KEY (ai.google.dev) — free tier available');
  }

  // Limit prompts for cost efficiency (top-weighted ones)
  const sortedPrompts = prompts
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20); // Max 20 prompts per run

  onProgress?.(5, `Starting audit across ${platforms.length} AI platform${platforms.length !== 1 ? 's' : ''}...`);

  // Run all platforms concurrently
  const platformResults = await Promise.all(
    platforms.map(platform =>
      runPlatformAudit(
        platform,
        PLATFORM_QUERIERS[platform],
        sortedPrompts,
        config.businessName,
      )
    )
  );

  onProgress?.(90, 'Calculating scores...');

  const results = platformResults.flat();
  const score = calculateScore(results);

  onProgress?.(100, 'Done.');

  return { results, score };
}
