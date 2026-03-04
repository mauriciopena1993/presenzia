import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ── System prompt for all AI platforms ──
const SYSTEM_PROMPT =
  'You are a UK financial services expert. When asked about financial advisors, wealth managers, or financial planners, always respond with a numbered list of specific, real companies or firms by name. Name at least 5-8 specific firms that actually exist. Include well-known national firms and relevant local/regional firms. Be concrete and specific. Never give generic advice without naming real firms. If you are unsure about a specific area, name the most prominent UK-wide firms you know.';

// ── Prompt templates ──

// Location-based prompts (used for local, multi, regional)
// Uses {specialty} (e.g. "wealth management advisor"), {specialty_broad} (e.g. "wealth manager, private bank, or financial advisor"),
// {specialty_context} (e.g. "managing a large investment portfolio"), and {location}
const LOCATION_PROMPTS = [
  "Who is the best {specialty} in {location}?",
  "Can you recommend a {specialty_broad} near {location}?",
  "I need a financial advisor in {location}. Who do you suggest?",
  "What are the top-rated {specialty} firms in {location}?",
  "What are the best private banks and {specialty} firms in {location}?",
  "I'm looking for help with {specialty_context} in {location}. Any recommendations?",
  "Who should I speak to about {specialty_context} in {location}?",
  "What financial firms are well-regarded in {location} for {specialty_context}?",
  "I need help with {specialty_context}. Which firms in {location} are best?",
  "Which {specialty_broad} firms in {location} would you recommend for someone with significant assets?",
];

// National/online prompts (no location)
const NATIONAL_PROMPTS = [
  "Who is the best {specialty} in the UK?",
  "Can you recommend a {specialty_broad} that works with clients remotely?",
  "What are the top-rated {specialty} firms in the UK?",
  "What are the best private banks and {specialty} firms in the UK?",
  "I'm looking for help with {specialty_context} in the UK. Any recommendations?",
  "Who should I speak to about {specialty_context} in the UK?",
  "What are the best UK financial firms for {specialty_context}?",
  "I need help with {specialty_context}. Which UK firms are best?",
  "Which {specialty_broad} firms in the UK would you recommend?",
  "Which UK wealth managers or private banks offer the best service?",
];

// Target client type prompts
const TARGET_CLIENT_PROMPTS: Record<string, string[]> = {
  'High-net-worth individuals (£250k+)': [
    "Which wealth managers in {location} specialise in high-net-worth clients?",
    "I have a substantial portfolio and need a financial advisor in {location}. Who do you recommend?",
  ],
  'Retirees & pre-retirees': [
    "Who is the best pension transfer specialist in {location}?",
    "I'm approaching retirement and need financial advice in {location}. Any recommendations?",
  ],
  'Business owners & entrepreneurs': [
    "Which financial advisors in {location} work with business owners?",
    "I need corporate financial planning advice in {location}. Who do you suggest?",
  ],
  'Professionals (doctors, lawyers, etc.)': [
    "Which financial advisors in {location} specialise in advising professionals?",
    "I'm a professional looking for financial planning in {location}. Any recommendations?",
  ],
  'Families & estate planning': [
    "Who offers the best estate planning advice in {location}?",
    "I need help with inheritance tax planning in {location}. Which advisors do you recommend?",
  ],
  'Expats & international clients': [
    "Which financial advisors in {location} work with expats and international clients?",
    "I need cross-border financial advice from an advisor based in {location}. Suggestions?",
  ],
};

// National versions of target client prompts
const TARGET_CLIENT_PROMPTS_NATIONAL: Record<string, string[]> = {
  'High-net-worth individuals (£250k+)': [
    "Which UK wealth managers specialise in high-net-worth clients?",
    "I have a substantial portfolio and need a UK financial advisor. Who do you recommend?",
  ],
  'Retirees & pre-retirees': [
    "Who is the best pension transfer specialist in the UK?",
    "I'm approaching retirement in the UK. Which financial advisor do you recommend?",
  ],
  'Business owners & entrepreneurs': [
    "Which UK financial advisors work best with business owners?",
    "I need corporate financial planning advice in the UK. Who do you suggest?",
  ],
  'Professionals (doctors, lawyers, etc.)': [
    "Which UK financial advisors specialise in advising professionals like doctors and lawyers?",
    "I'm a professional looking for UK financial planning. Any recommendations?",
  ],
  'Families & estate planning': [
    "Who offers the best estate planning advice in the UK?",
    "I need help with inheritance tax planning in the UK. Which advisors do you recommend?",
  ],
  'Expats & international clients': [
    "Which UK financial advisors work with expats and international clients?",
    "I need cross-border financial advice from a UK-based advisor. Suggestions?",
  ],
};

const SPECIALTY_CONTEXT: Record<string, string> = {
  'Wealth Management': 'managing a large investment portfolio',
  'Financial Planning': 'long-term financial planning',
  'Retirement & Pensions': 'retirement planning and pension transfers',
  'Tax Planning': 'reducing my tax liability',
  'Inheritance & Estate Planning': 'inheritance tax planning',
  'Mortgage & Protection': 'getting a mortgage and life insurance',
  'Investment Management': 'investing a significant sum',
  'Corporate Financial Advisory': 'financial advice for my business',
  'General Financial Advisory': 'financial planning and advice',
};

// Broader labels that include related firm types (private banks, etc.)
const SPECIALTY_BROAD: Record<string, string> = {
  'Wealth Management': 'wealth manager, private bank, or financial advisor',
  'Financial Planning': 'financial planner or financial advisor',
  'Retirement & Pensions': 'pension advisor or retirement planning specialist',
  'Tax Planning': 'tax planning specialist or financial advisor',
  'Inheritance & Estate Planning': 'estate planning advisor or solicitor',
  'Mortgage & Protection': 'mortgage broker or financial advisor',
  'Investment Management': 'investment manager, wealth manager, or private bank',
  'Corporate Financial Advisory': 'corporate financial advisor or business advisor',
  'General Financial Advisory': 'financial advisor or wealth manager',
};

interface PromptItem {
  id: string;
  text: string;
  weight: number;
}

function buildPrompts(
  coverageType: string,
  locations: string[],
  specialties: string[],
  targetClient?: string,
): PromptItem[] {
  const primarySpecialty = specialties[0] || 'Financial Planning';
  const specialtyContext = SPECIALTY_CONTEXT[primarySpecialty] || 'financial planning';
  const specialtyBroad = SPECIALTY_BROAD[primarySpecialty] || 'financial advisor';
  const specialtyLabel = primarySpecialty.toLowerCase().includes('financial')
    ? primarySpecialty.toLowerCase()
    : `${primarySpecialty.toLowerCase()} advisor`;

  const prompts: PromptItem[] = [];
  let promptIndex = 0;

  if (coverageType === 'national') {
    // National/online: use UK-wide prompts
    for (const template of NATIONAL_PROMPTS) {
      prompts.push({
        id: `nat_${promptIndex}`,
        text: template
          .replace(/{specialty}/g, specialtyLabel)
          .replace(/{specialty_broad}/g, specialtyBroad)
          .replace(/{specialty_context}/g, specialtyContext),
        weight: 10 - promptIndex,
      });
      promptIndex++;
    }

    // Add target client prompts (national versions)
    if (targetClient && TARGET_CLIENT_PROMPTS_NATIONAL[targetClient]) {
      for (const template of TARGET_CLIENT_PROMPTS_NATIONAL[targetClient]) {
        prompts.push({
          id: `target_nat_${promptIndex}`,
          text: template,
          weight: 8,
        });
        promptIndex++;
      }
    }
  } else {
    // Local, multi, or regional: use location-based prompts
    // For multi-location: distribute prompts across locations (max 3 locations)
    const testLocations = locations.slice(0, 3);

    if (testLocations.length === 1) {
      // Single location: use all prompts for that location
      const location = testLocations[0];
      for (const template of LOCATION_PROMPTS) {
        prompts.push({
          id: `loc_${promptIndex}`,
          text: template
            .replace(/{location}/g, location)
            .replace(/{specialty}/g, specialtyLabel)
            .replace(/{specialty_broad}/g, specialtyBroad)
            .replace(/{specialty_context}/g, specialtyContext),
          weight: 10 - promptIndex,
        });
        promptIndex++;
      }

      // Target client prompts
      if (targetClient && TARGET_CLIENT_PROMPTS[targetClient]) {
        for (const template of TARGET_CLIENT_PROMPTS[targetClient]) {
          prompts.push({
            id: `target_${promptIndex}`,
            text: template.replace(/{location}/g, location),
            weight: 8,
          });
          promptIndex++;
        }
      }
    } else {
      // Multi-location: split prompts across locations
      const promptsPerLocation = Math.ceil(LOCATION_PROMPTS.length / testLocations.length);

      for (let li = 0; li < testLocations.length; li++) {
        const location = testLocations[li];
        const startIdx = li * promptsPerLocation;
        const endIdx = Math.min(startIdx + promptsPerLocation, LOCATION_PROMPTS.length);
        const locationTemplates = LOCATION_PROMPTS.slice(startIdx, endIdx);

        // Always include the most important prompt for each location
        if (startIdx > 0) {
          prompts.push({
            id: `loc_${promptIndex}`,
            text: LOCATION_PROMPTS[0]
              .replace(/{location}/g, location)
              .replace(/{specialty}/g, specialtyLabel)
              .replace(/{specialty_broad}/g, specialtyBroad)
              .replace(/{specialty_context}/g, specialtyContext),
            weight: 10,
          });
          promptIndex++;
        }

        for (const template of locationTemplates) {
          prompts.push({
            id: `loc_${promptIndex}`,
            text: template
              .replace(/{location}/g, location)
              .replace(/{specialty}/g, specialtyLabel)
              .replace(/{specialty_broad}/g, specialtyBroad)
              .replace(/{specialty_context}/g, specialtyContext),
            weight: 9 - li,
          });
          promptIndex++;
        }
      }

      // Add 1 target client prompt for primary location
      if (targetClient && TARGET_CLIENT_PROMPTS[targetClient]) {
        const template = TARGET_CLIENT_PROMPTS[targetClient][0];
        if (template) {
          prompts.push({
            id: `target_${promptIndex}`,
            text: template.replace(/{location}/g, testLocations[0]),
            weight: 8,
          });
          promptIndex++;
        }
      }
    }

    // If firm has multiple specialties, add a prompt for each additional specialty
    for (let si = 1; si < Math.min(specialties.length, 3); si++) {
      const addlSpecialty = specialties[si];
      const addlLabel = addlSpecialty.toLowerCase().includes('financial')
        ? addlSpecialty.toLowerCase()
        : `${addlSpecialty.toLowerCase()} advisor`;
      const loc = testLocations[0];
      prompts.push({
        id: `spec_${promptIndex}`,
        text: `Who is the best ${addlLabel} in ${loc}?`,
        weight: 7,
      });
      promptIndex++;
    }
  }

  return prompts;
}

// ── AI Platform Queriers ──

async function queryChatGPT(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`ChatGPT error ${response.status}: ${errBody.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function queryClaude(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Claude error ${response.status}: ${errBody.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.content[0]?.text || '';
}

async function queryPerplexity(prompt: string): Promise<string> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
    }),
  });
  if (!response.ok) throw new Error(`Perplexity error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function queryGoogleAI(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
      }),
    }
  );
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Google AI error ${response.status}: ${errBody.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── Mention Detection ──

// Strip common suffixes from firm names to improve matching
function cleanFirmName(name: string): string {
  return name
    .replace(/\.(com|co\.uk|ai|org|net|io)$/i, '')
    .replace(/\b(ltd|limited|llp|plc|group|inc|corp)\b/gi, '')
    .replace(/\s+&\s+co\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract domain name (without TLD) from a website URL
function extractDomainName(website: string): string {
  const domain = website
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();
  // Remove TLD: "coutts.com" → "coutts", "novawm.co.uk" → "novawm"
  return domain.replace(/\.(com|co\.uk|org\.uk|ai|org|net|io|uk)$/i, '').trim();
}

function getPosition(index: number, totalLength: number): 'first' | 'prominent' | 'mentioned' {
  const firstThird = totalLength / 3;
  if (index < firstThird) return 'first';
  if (index < firstThird * 2) return 'prominent';
  return 'mentioned';
}

function checkMention(response: string, firmName: string, website?: string): { mentioned: boolean; position: 'first' | 'prominent' | 'mentioned' | null } {
  const responseLower = response.toLowerCase();
  const cleaned = cleanFirmName(firmName).toLowerCase();

  // 1. Exact match on cleaned firm name
  if (cleaned && responseLower.includes(cleaned)) {
    const index = responseLower.indexOf(cleaned);
    return { mentioned: true, position: getPosition(index, response.length) };
  }

  // 2. Original firm name (in case cleaning removed too much)
  const firmLower = firmName.toLowerCase().trim();
  if (firmLower !== cleaned && responseLower.includes(firmLower)) {
    const index = responseLower.indexOf(firmLower);
    return { mentioned: true, position: getPosition(index, response.length) };
  }

  // 3. Word-boundary match for each significant word (≥ 4 chars) from the cleaned name
  const cleanedWords = cleaned.split(/\s+/).filter(w => w.length >= 4);
  for (const word of cleanedWords) {
    try {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const match = regex.exec(response);
      if (match) {
        return { mentioned: true, position: getPosition(match.index, response.length) };
      }
    } catch {
      // Regex failed — fall through to next check
    }
  }

  // 4. Partial match: 2+ significant words from name found in response
  if (cleanedWords.length >= 2) {
    const matchCount = cleanedWords.filter(w => responseLower.includes(w)).length;
    if (matchCount >= 2) {
      return { mentioned: true, position: 'mentioned' };
    }
  }

  // 5. Domain name (without TLD) word-boundary match
  if (website) {
    const domainName = extractDomainName(website);
    if (domainName && domainName.length >= 3) {
      try {
        const regex = new RegExp(`\\b${domainName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const match = regex.exec(response);
        if (match) {
          return { mentioned: true, position: getPosition(match.index, response.length) };
        }
      } catch {
        // Fallback: simple includes
        if (responseLower.includes(domainName)) {
          return { mentioned: true, position: 'mentioned' };
        }
      }
    }

    // Also check for full domain mention (e.g. "coutts.com")
    const fullDomain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    if (fullDomain && responseLower.includes(fullDomain)) {
      return { mentioned: true, position: 'mentioned' };
    }
  }

  return { mentioned: false, position: null };
}

// Generic industry terms that should NOT be treated as firm names
const GENERIC_TERMS = new Set([
  'wealth management', 'financial planning', 'financial advisory', 'investment management',
  'tax planning', 'estate planning', 'retirement planning', 'pension planning',
  'corporate financial', 'comprehensive financial', 'independent financial',
  'personal financial', 'private wealth', 'global wealth', 'strategic wealth',
  'holistic financial', 'specialist financial', 'professional financial',
  'integrated wealth', 'bespoke wealth', 'discretionary wealth',
  'financial advisors', 'wealth advisors', 'financial partners', 'wealth partners',
  'financial consulting', 'wealth consulting', 'investment advisory',
  'financial associates', 'capital management', 'asset management',
]);

function isGenericTerm(name: string): boolean {
  return GENERIC_TERMS.has(name.toLowerCase().trim());
}

function deduplicateNames(names: string[]): string[] {
  // Sort by length descending so longer names are preferred
  const sorted = [...names].sort((a, b) => b.length - a.length);
  const result: string[] = [];
  for (const name of sorted) {
    const nameLower = name.toLowerCase();
    // Skip if a longer name already in results contains this name
    const isDuplicate = result.some(existing => {
      const existingLower = existing.toLowerCase();
      return existingLower.includes(nameLower) || nameLower.includes(existingLower);
    });
    if (!isDuplicate) {
      result.push(name);
    }
  }
  return result;
}

function extractCompetitors(response: string, firmName: string): string[] {
  const firmPattern = /(?:[A-Z][a-z]+(?:\s+(?:&\s+)?[A-Z][a-z]+)*)\s+(?:Financial|Wealth|Advisory|Planning|Advisors|Partners|Capital|Associates|Consulting|Management)/g;
  const found = new Set<string>();
  let match;
  while ((match = firmPattern.exec(response)) !== null) {
    const name = match[0].trim();
    if (name.toLowerCase() !== firmName.toLowerCase() && name.length > 5 && name.length < 100 && !isGenericTerm(name)) {
      found.add(name);
    }
  }
  const patterns = [
    /\d+\.\s+\*\*(.+?)\*\*/g,
    /\*\*([A-Z][^*]{3,60})\*\*/g,
  ];
  for (const pattern of patterns) {
    while ((match = pattern.exec(response)) !== null) {
      const name = match[1].trim();
      if (name.toLowerCase() !== firmName.toLowerCase() && name.length > 3 && name.length < 80 && !name.includes('http') && !isGenericTerm(name)) {
        found.add(name);
      }
    }
  }
  return deduplicateNames(Array.from(found)).slice(0, 10);
}

function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const firmName = body.firmName;
    const coverageType = body.coverageType || 'local'; // local, multi, regional, national
    const locationsRaw = body.locations || body.city || '';
    const specialties: string[] = body.specialties || (body.specialty ? [body.specialty] : []);
    const targetClient = body.targetClient;
    const website = body.website;
    const firmDescription = body.firmDescription;
    const additionalContext = body.additionalContext;
    const postcode = body.postcode || ''; // backwards compat

    if (!firmName) {
      return NextResponse.json({ error: 'Firm name is required' }, { status: 400 });
    }
    if (specialties.length === 0) {
      return NextResponse.json({ error: 'At least one specialty is required' }, { status: 400 });
    }

    // Parse locations
    let locations: string[] = [];
    let displayCity = '';

    if (coverageType === 'national') {
      displayCity = 'UK-wide';
    } else if (postcode && !locationsRaw) {
      // Backwards compat: postcode → city lookup
      try {
        const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
        if (pcRes.ok) {
          const pcData = await pcRes.json();
          if (pcData.result) {
            const city = pcData.result.admin_district || pcData.result.parliamentary_constituency || postcode;
            locations = [city];
            displayCity = city;
          }
        }
      } catch {
        locations = [postcode];
        displayCity = postcode;
      }
    } else {
      // Parse comma-separated locations
      locations = locationsRaw
        .split(',')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      displayCity = locations.join(', ');
    }

    if (coverageType !== 'national' && locations.length === 0) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Build prompts — pick the top ones by weight for the free score
    const allPrompts = buildPrompts(coverageType, locations, specialties, targetClient);
    const PROMPTS_PER_PLATFORM = 3; // Keep it fast & within rate limits
    const prompts = allPrompts
      .sort((a, b) => b.weight - a.weight)
      .slice(0, PROMPTS_PER_PLATFORM);

    // Run prompts across all available AI platforms
    const platforms: Array<{ name: string; querier: (p: string) => Promise<string>; weight: number }> = [];
    if (process.env.OPENAI_API_KEY)     platforms.push({ name: 'ChatGPT',    querier: queryChatGPT,    weight: 0.35 });
    if (process.env.ANTHROPIC_API_KEY)  platforms.push({ name: 'Claude',      querier: queryClaude,     weight: 0.15 });
    if (process.env.PERPLEXITY_API_KEY) platforms.push({ name: 'Perplexity',  querier: queryPerplexity,  weight: 0.20 });
    if (process.env.GOOGLE_AI_API_KEY)  platforms.push({ name: 'Google AI',   querier: queryGoogleAI,   weight: 0.30 });

    // Dynamic weight rebalancing: redistribute so weights always sum to 1.0
    const totalWeight = platforms.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.01) {
      for (const p of platforms) {
        p.weight = p.weight / totalWeight;
      }
    }

    if (platforms.length === 0) {
      return NextResponse.json({ error: 'AI platforms not configured' }, { status: 500 });
    }

    // Retry helper — only retries transient rate limits, not billing/quota errors
    async function queryWithRetry(querier: (p: string) => Promise<string>, prompt: string, retries = 3): Promise<string> {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          return await querier(prompt);
        } catch (err) {
          const msg = String(err);
          // Don't retry billing/quota/auth errors — these won't resolve with retries
          const isBillingError = msg.includes('insufficient_quota') || msg.includes('credit balance') ||
            msg.includes('quota exceeded') || msg.includes('billing') || msg.includes('limit: 0');
          if (isBillingError) {
            console.error(`Billing/quota error (not retrying): ${msg.slice(0, 200)}`);
            throw err;
          }
          const isRateLimit = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED');
          if (isRateLimit && attempt < retries) {
            const backoff = 3000 * Math.pow(2, attempt); // 3s, 6s, 12s exponential backoff
            console.log(`Rate limited, retry ${attempt + 1}/${retries} after ${backoff}ms`);
            await new Promise(r => setTimeout(r, backoff));
            continue;
          }
          throw err;
        }
      }
      return '';
    }

    interface PromptResultItem {
      platform: string;
      promptId: string;
      promptText: string;
      mentioned: boolean;
      position: 'first' | 'prominent' | 'mentioned' | null;
      competitors: string[];
      response: string;
      failed?: boolean;
    }

    const allResults: PromptResultItem[] = [];

    // Run all platforms in parallel — each platform sends its prompts sequentially
    // with delays to respect per-platform rate limits
    await Promise.all(
      platforms.map(async (platform, platformIdx) => {
        // Stagger platform starts by 500ms each to spread the initial burst
        await new Promise(r => setTimeout(r, platformIdx * 500));

        for (let i = 0; i < prompts.length; i++) {
          const prompt = prompts[i];
          try {
            const response = await queryWithRetry(platform.querier, prompt.text);
            const mention = checkMention(response, firmName, website);
            const competitors = extractCompetitors(response, firmName);
            allResults.push({
              platform: platform.name,
              promptId: prompt.id,
              promptText: prompt.text,
              mentioned: mention.mentioned,
              position: mention.position,
              competitors,
              response,
            });
          } catch (err) {
            console.error(`Score query error (${platform.name}): ${err}`);
            allResults.push({
              platform: platform.name,
              promptId: prompt.id,
              promptText: prompt.text,
              mentioned: false,
              position: null,
              competitors: [],
              response: '',
              failed: true,
            });
          }
          // Wait between requests per platform to respect rate limits
          if (i < prompts.length - 1) {
            const delay = platform.name === 'Google AI' ? 5000 : 2000;
            await new Promise(r => setTimeout(r, delay));
          }
        }
      })
    );

    // Calculate score — use ALL platforms in denominator so failed platforms lower the score
    // (a firm only checked on 1 of 4 platforms should not get an inflated score)
    const successResults = allResults.filter(r => !r.failed);
    let totalPoints = 0;
    let maxPoints = 0;
    const platformWeightMap: Record<string, number> = {};
    for (const p of platforms) platformWeightMap[p.name] = p.weight;

    // Max points = ALL results (including failed), so score reflects incomplete coverage
    for (const result of allResults) {
      const weight = platformWeightMap[result.platform] || 0.25;
      maxPoints += weight * 10;
    }

    // Only successful results can earn points
    for (const result of successResults) {
      const weight = platformWeightMap[result.platform] || 0.25;
      if (result.mentioned) {
        if (result.position === 'first') totalPoints += weight * 10;
        else if (result.position === 'prominent') totalPoints += weight * 7;
        else if (result.position === 'mentioned') totalPoints += weight * 4;
      }
    }

    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    let grade: string;
    if (score >= 80) grade = 'A';
    else if (score >= 65) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 35) grade = 'D';
    else if (score >= 20) grade = 'E';
    else grade = 'F';

    // Extract top competitor
    const competitorCounts: Record<string, number> = {};
    for (const r of allResults) {
      for (const c of r.competitors) {
        competitorCounts[c] = (competitorCounts[c] || 0) + 1;
      }
    }
    const sortedCompetitors = Object.entries(competitorCounts).sort((a, b) => b[1] - a[1]);
    const topCompetitor = sortedCompetitors.length > 0
      ? { name: sortedCompetitors[0][0], count: sortedCompetitors[0][1] }
      : null;

    const mentionsCount = successResults.filter(r => r.mentioned).length;
    const totalPrompts = successResults.length;
    const shareId = generateShareId();

    // Per-platform breakdown — include failed flag so UI can show "Unavailable"
    const platformBreakdown = platforms.map(p => {
      const pResults = allResults.filter(r => r.platform === p.name);
      const pSuccess = pResults.filter(r => !r.failed);
      const pFailed = pResults.some(r => r.failed);
      const pMentions = pSuccess.filter(r => r.mentioned).length;
      return { platform: p.name, tested: pSuccess.length, mentioned: pMentions, failed: pFailed && pSuccess.length === 0 };
    });
    const platformsAvailable = platformBreakdown.filter(p => !p.failed).length;
    const platformsTotal = platforms.length;

    // Store in database
    try {
      await supabase.from('free_scores').insert({
        firm_name: firmName,
        postcode: postcode.trim() || locations[0] || 'national',
        city: displayCity,
        specialty: specialties[0],
        score,
        grade,
        top_competitor_name: topCompetitor?.name || null,
        top_competitor_count: topCompetitor?.count || null,
        share_id: shareId,
        results_json: {
          results: allResults.map(r => ({
            platform: r.platform,
            promptText: r.promptText,
            mentioned: r.mentioned,
            position: r.position,
            competitors: r.competitors,
          })),
          platformBreakdown,
          platformsAvailable,
          platformsTotal,
          mentionsCount,
          totalPrompts,
          coverageType,
          locations,
          specialties,
          targetClient: targetClient || null,
          website: website || null,
          firmDescription: firmDescription || null,
          additionalContext: additionalContext || null,
        },
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      });
    } catch (dbErr) {
      console.error('Failed to store free score:', dbErr);
    }

    return NextResponse.json({
      id: shareId,
      score,
      grade,
      mentionsCount,
      totalPrompts,
      topCompetitor,
      platformBreakdown,
      platformsAvailable,
      platformsTotal,
      city: displayCity,
    });
  } catch (error) {
    console.error('Score API error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}
