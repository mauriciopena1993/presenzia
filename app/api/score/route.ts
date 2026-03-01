import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Free score prompts — 10 prompts, 2 platforms (ChatGPT + Claude)
const FREE_SCORE_PROMPTS = [
  "Who is the best {specialty} in {city}?",
  "Can you recommend a {specialty} near {city}?",
  "I need a financial advisor in {city}. Who do you suggest?",
  "What are the top-rated {specialty} firms in {city}?",
  "I'm looking for an independent financial advisor in {city} for {specialty_context}. Any recommendations?",
  "Who should I speak to about {specialty_context} in {city}?",
  "Can you recommend a trusted financial planner in {city}?",
  "What financial advisory firms are well-regarded in {city}?",
  "I need help with {specialty_context}. Which advisors in {city} are best?",
  "Recommend a chartered financial planner in {city}",
];

// Additional prompts when target client type is provided
const TARGET_CLIENT_PROMPTS: Record<string, string[]> = {
  'High-net-worth individuals (£250k+)': [
    "Which wealth managers in {city} specialise in high-net-worth clients?",
    "I have a substantial portfolio and need a financial advisor in {city}. Who do you recommend?",
  ],
  'Retirees & pre-retirees': [
    "Who is the best pension transfer specialist in {city}?",
    "I'm approaching retirement and need financial advice in {city}. Any recommendations?",
  ],
  'Business owners & entrepreneurs': [
    "Which financial advisors in {city} work with business owners?",
    "I need corporate financial planning advice in {city}. Who do you suggest?",
  ],
  'Professionals (doctors, lawyers, etc.)': [
    "Which financial advisors in {city} specialise in advising professionals?",
    "I'm a professional looking for financial planning in {city}. Any recommendations?",
  ],
  'Families & estate planning': [
    "Who offers the best estate planning advice in {city}?",
    "I need help with inheritance tax planning in {city}. Which advisors do you recommend?",
  ],
  'Expats & international clients': [
    "Which financial advisors in {city} work with expats and international clients?",
    "I need cross-border financial advice from an advisor based in {city}. Suggestions?",
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
};

function buildFreeScorePrompts(city: string, specialty: string, targetClient?: string): Array<{ id: string; text: string; weight: number }> {
  const specialtyContext = SPECIALTY_CONTEXT[specialty] || 'financial planning';
  const specialtyLabel = specialty.toLowerCase().includes('financial') ? specialty.toLowerCase() : `${specialty.toLowerCase()} advisor`;

  const basePrompts = FREE_SCORE_PROMPTS.map((template, i) => ({
    id: `free_${i}`,
    text: template
      .replace(/{city}/g, city)
      .replace(/{specialty}/g, specialtyLabel)
      .replace(/{specialty_context}/g, specialtyContext),
    weight: 10 - i,
  }));

  // Add target client prompts if provided (up to 2 extra)
  if (targetClient && TARGET_CLIENT_PROMPTS[targetClient]) {
    const extras = TARGET_CLIENT_PROMPTS[targetClient];
    extras.forEach((template, i) => {
      basePrompts.push({
        id: `target_${i}`,
        text: template.replace(/{city}/g, city),
        weight: 8 - i,
      });
    });
  }

  return basePrompts;
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

function checkMention(response: string, firmName: string): { mentioned: boolean; position: 'first' | 'prominent' | 'mentioned' | null } {
  const responseLower = response.toLowerCase();
  const firmLower = firmName.toLowerCase();

  if (!responseLower.includes(firmLower)) {
    // Check partial match (firm name words)
    const firmWords = firmLower.split(' ').filter(w => w.length > 3);
    const matchCount = firmWords.filter(w => responseLower.includes(w)).length;
    if (matchCount >= 2 && firmWords.length >= 2) {
      return { mentioned: true, position: 'mentioned' };
    }
    return { mentioned: false, position: null };
  }

  const index = responseLower.indexOf(firmLower);
  const firstThird = response.length / 3;

  if (index < firstThird) return { mentioned: true, position: 'first' };
  if (index < firstThird * 2) return { mentioned: true, position: 'prominent' };
  return { mentioned: true, position: 'mentioned' };
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
  // Also try numbered/bold patterns
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

    // Support both old (postcode) and new (city) API formats
    const firmName = body.firmName;
    const specialty = body.specialty;
    const targetClient = body.targetClient;
    const website = body.website;

    // Accept city directly, or fall back to postcode lookup for backwards compat
    let city = body.city || '';
    const postcode = body.postcode || '';

    if (!firmName || !specialty) {
      return NextResponse.json({ error: 'Firm name and specialty are required' }, { status: 400 });
    }

    if (!city && !postcode) {
      return NextResponse.json({ error: 'City or location is required' }, { status: 400 });
    }

    // If city not provided but postcode is, look up city from postcode (backwards compat)
    if (!city && postcode) {
      try {
        const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
        if (pcRes.ok) {
          const pcData = await pcRes.json();
          if (pcData.result) {
            city = pcData.result.admin_district || pcData.result.parliamentary_constituency || postcode;
          }
        }
      } catch {
        city = postcode;
      }
    }

    // Build prompts using city directly
    const prompts = buildFreeScorePrompts(city, specialty, targetClient);

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

    // Run each platform's prompts sequentially within platform, platforms in parallel
    await Promise.all(
      platforms.map(async (platform) => {
        for (const prompt of prompts) {
          try {
            const response = await platform.querier(prompt.text);
            const mention = checkMention(response, firmName);
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
          // Rate limit delay
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
        postcode: postcode.trim() || city.trim(), // Use city if no postcode provided
        city,
        specialty,
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
          targetClient: targetClient || null,
          website: website || null,
        },
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
      });
    } catch (dbErr) {
      console.error('Failed to store free score:', dbErr);
      // Don't fail the request — still return results
    }

    return NextResponse.json({
      id: shareId,
      score,
      grade,
      mentionsCount,
      totalPrompts,
      topCompetitor,
      platformBreakdown,
      city,
    });
  } catch (error) {
    console.error('Score API error:', error);
    return NextResponse.json({ error: 'Failed to calculate score' }, { status: 500 });
  }
}
