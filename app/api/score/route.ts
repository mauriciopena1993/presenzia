import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ── Prompt templates ──

// Location-based prompts (used for local, multi, regional)
const LOCATION_PROMPTS = [
  "Who is the best {specialty} in {location}?",
  "Can you recommend a {specialty} near {location}?",
  "I need a financial advisor in {location}. Who do you suggest?",
  "What are the top-rated {specialty} firms in {location}?",
  "I'm looking for an independent financial advisor in {location} for {specialty_context}. Any recommendations?",
  "Who should I speak to about {specialty_context} in {location}?",
  "Can you recommend a trusted financial planner in {location}?",
  "What financial advisory firms are well-regarded in {location}?",
  "I need help with {specialty_context}. Which advisors in {location} are best?",
  "Recommend a chartered financial planner in {location}",
];

// National/online prompts (no location)
const NATIONAL_PROMPTS = [
  "Who is the best {specialty} in the UK?",
  "Can you recommend a {specialty} that works with clients remotely?",
  "What are the top-rated online {specialty} firms in the UK?",
  "I'm looking for an independent financial advisor for {specialty_context}. Any recommendations?",
  "Who should I speak to about {specialty_context} in the UK?",
  "Can you recommend a trusted UK financial planner that works online?",
  "What are the best UK financial advisory firms for {specialty_context}?",
  "I need help with {specialty_context}. Which UK advisors are best?",
  "Recommend a chartered financial planner in the UK",
  "Which UK wealth managers offer the best online service?",
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

// Query ChatGPT
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
        { role: 'system', content: 'You are a helpful assistant. When asked about financial advisors or wealth managers, provide specific recommendations with firm names if you know any.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    }),
  });
  if (!response.ok) throw new Error(`ChatGPT error: ${response.statusText}`);
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Query Claude
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
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude error: ${response.statusText}`);
  const data = await response.json();
  return data.content[0]?.text || '';
}

function checkMention(response: string, firmName: string, website?: string): { mentioned: boolean; position: 'first' | 'prominent' | 'mentioned' | null } {
  const responseLower = response.toLowerCase();
  const firmLower = firmName.toLowerCase();

  // Check for firm name match
  if (responseLower.includes(firmLower)) {
    const index = responseLower.indexOf(firmLower);
    const firstThird = response.length / 3;
    if (index < firstThird) return { mentioned: true, position: 'first' };
    if (index < firstThird * 2) return { mentioned: true, position: 'prominent' };
    return { mentioned: true, position: 'mentioned' };
  }

  // Check partial match (firm name words)
  const firmWords = firmLower.split(' ').filter(w => w.length > 3);
  const matchCount = firmWords.filter(w => responseLower.includes(w)).length;
  if (matchCount >= 2 && firmWords.length >= 2) {
    return { mentioned: true, position: 'mentioned' };
  }

  // Check for website domain mention
  if (website) {
    const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    if (domain && responseLower.includes(domain)) {
      return { mentioned: true, position: 'mentioned' };
    }
  }

  return { mentioned: false, position: null };
}

function extractCompetitors(response: string, firmName: string): string[] {
  const firmPattern = /(?:[A-Z][a-z]+(?:\s+(?:&\s+)?[A-Z][a-z]+)*)\s+(?:Financial|Wealth|Advisory|Planning|Advisors|Partners|Capital|Associates|Consulting|Management)/g;
  const found = new Set<string>();
  let match;
  while ((match = firmPattern.exec(response)) !== null) {
    const name = match[0].trim();
    if (name.toLowerCase() !== firmName.toLowerCase() && name.length > 5 && name.length < 100) {
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
      if (name.toLowerCase() !== firmName.toLowerCase() && name.length > 3 && name.length < 80 && !name.includes('http')) {
        found.add(name);
      }
    }
  }
  return Array.from(found).slice(0, 10);
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

    // Build prompts
    const prompts = buildPrompts(coverageType, locations, specialties, targetClient);

    // Run prompts across ChatGPT + Claude in parallel
    const platforms: Array<{ name: string; querier: (p: string) => Promise<string>; weight: number }> = [];
    if (process.env.OPENAI_API_KEY) platforms.push({ name: 'ChatGPT', querier: queryChatGPT, weight: 0.6 });
    if (process.env.ANTHROPIC_API_KEY) platforms.push({ name: 'Claude', querier: queryClaude, weight: 0.4 });

    if (platforms.length === 0) {
      return NextResponse.json({ error: 'AI platforms not configured' }, { status: 500 });
    }

    interface PromptResultItem {
      platform: string;
      promptId: string;
      promptText: string;
      mentioned: boolean;
      position: 'first' | 'prominent' | 'mentioned' | null;
      competitors: string[];
      response: string;
    }

    const allResults: PromptResultItem[] = [];

    await Promise.all(
      platforms.map(async (platform) => {
        for (const prompt of prompts) {
          try {
            const response = await platform.querier(prompt.text);
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
            });
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })
    );

    // Calculate score
    let totalPoints = 0;
    let maxPoints = 0;
    const platformWeights: Record<string, number> = { ChatGPT: 0.6, Claude: 0.4 };

    for (const result of allResults) {
      const weight = platformWeights[result.platform] || 0.5;
      maxPoints += weight * 10;

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

    const mentionsCount = allResults.filter(r => r.mentioned).length;
    const totalPrompts = allResults.length;
    const shareId = generateShareId();

    // Per-platform breakdown
    const platformBreakdown = platforms.map(p => {
      const pResults = allResults.filter(r => r.platform === p.name);
      const pMentions = pResults.filter(r => r.mentioned).length;
      return { platform: p.name, tested: pResults.length, mentioned: pMentions };
    });

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
      city: displayCity,
    });
  } catch (error) {
    console.error('Score API error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}
