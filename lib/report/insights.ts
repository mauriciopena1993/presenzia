/**
 * Insights engine — processes raw audit data into structured, actionable
 * report content for the PDF report generator.
 *
 * Takes the audit config, overall score, and individual prompt results,
 * then produces category breakdowns and detailed, business-specific actions.
 */

import type { PromptResult, AuditScore, PlatformScore } from '../audit/scorer';
import type { AuditConfig } from '../audit/runner';

// ── Exported Types ───────────────────────────────────────────

export interface PromptTestResult {
  promptText: string;
  category: string;
  weight: number;
  platforms: { name: string; found: boolean; position: number | null }[];
}

export interface CategoryBreakdown {
  category: string;
  label: string;
  totalSearches: number;   // platform-level (prompts in category x platforms tested)
  timesFound: number;
  examples: PromptTestResult[];  // Top 3-4 examples by weight
}

export interface DetailedAction {
  priority: 'HIGH' | 'MEDIUM';
  phase: 1 | 2 | 3;        // 1=Immediate, 2=Short-term, 3=Ongoing
  timeline: string;         // e.g. "Start here", "Next steps", "Ongoing"
  title: string;
  why: string;              // One-line explanation
  context?: string;         // Data-driven observation from the audit results
  steps: string[];          // 3-6 specific, actionable bullet points
}

export interface ReportInsights {
  categories: CategoryBreakdown[];
  actions: DetailedAction[];
  totalSearches: number;
  totalFound: number;
}

// ── Constants ────────────────────────────────────────────────

const CATEGORY_PREFIX_MAP: Record<string, string> = {
  rec: 'recommendation',
  cmp: 'comparison',
  loc: 'local',
  svc: 'service',
  rev: 'review',
};

const CATEGORY_LABELS: Record<string, string> = {
  recommendation: 'Direct Recommendations',
  comparison: 'Comparison Queries',
  local: 'Local Search',
  service: 'Service-Specific Queries',
  review: 'Review & Trust Queries',
};

// ── Helpers ──────────────────────────────────────────────────

function categoryFromPromptId(promptId: string): string {
  const prefix = promptId.split('_')[0];
  return CATEGORY_PREFIX_MAP[prefix] || 'other';
}

function businessTypeMatches(businessType: string, keywords: string[]): boolean {
  const bt = businessType.toLowerCase();
  return keywords.some((kw) => bt.includes(kw));
}

function getCategoryFoundRate(results: PromptResult[], prefix: string): { tested: number; found: number; pct: number } {
  const catResults = results.filter(r => r.promptId.startsWith(prefix));
  const tested = catResults.length;
  const found = catResults.filter(r => r.mentioned).length;
  return { tested, found, pct: tested > 0 ? Math.round((found / tested) * 100) : 0 };
}

// ── Category Processing ──────────────────────────────────────

function buildCategories(results: PromptResult[]): CategoryBreakdown[] {
  if (results.length === 0) return [];

  // Group results by promptText (each prompt is tested across multiple platforms)
  const byPrompt = new Map<string, PromptResult[]>();
  for (const r of results) {
    const existing = byPrompt.get(r.promptText) || [];
    existing.push(r);
    byPrompt.set(r.promptText, existing);
  }

  // Build PromptTestResult for each unique prompt
  const promptTests: PromptTestResult[] = [];
  for (const [promptText, promptResults] of byPrompt) {
    const first = promptResults[0];
    const category = categoryFromPromptId(first.promptId);
    promptTests.push({
      promptText,
      category,
      weight: first.weight,
      platforms: promptResults.map((r) => ({
        name: r.platform,
        found: r.mentioned,
        position: r.position,
      })),
    });
  }

  // Group by category
  const byCategory = new Map<string, PromptTestResult[]>();
  for (const pt of promptTests) {
    const existing = byCategory.get(pt.category) || [];
    existing.push(pt);
    byCategory.set(pt.category, existing);
  }

  // Build CategoryBreakdown for each category
  const categories: CategoryBreakdown[] = [];
  const categoryOrder = ['recommendation', 'comparison', 'local', 'service', 'review'];

  for (const cat of categoryOrder) {
    const tests = byCategory.get(cat);
    if (!tests || tests.length === 0) continue;

    // totalSearches = sum of platform entries across all prompts in this category
    let totalSearches = 0;
    let timesFound = 0;
    for (const t of tests) {
      totalSearches += t.platforms.length;
      timesFound += t.platforms.filter((p) => p.found).length;
    }

    // Top 3-4 examples sorted by weight (descending)
    const examples = [...tests]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 4);

    categories.push({
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      totalSearches,
      timesFound,
      examples,
    });
  }

  return categories;
}

// ── Action Generation ────────────────────────────────────────

function buildActions(
  config: AuditConfig,
  score: AuditScore,
  results: PromptResult[],
): DetailedAction[] {
  const actions: DetailedAction[] = [];
  const { overall, platforms, topCompetitors } = score;
  const bt = config.businessType.toLowerCase();

  // ── Action: Complete Your Google Business Profile ──
  if (overall < 65) {
    const googleAI = platforms.find(p => p.platform === 'Google AI');
    let gbpContext = '';
    if (googleAI) {
      if (googleAI.promptsMentioned === 0) {
        gbpContext = `Google AI did not find your business in any of the ${googleAI.promptsTested} searches we tested. This strongly suggests your Google Business Profile is either unclaimed, incomplete, or not optimised for your category.`;
      } else {
        gbpContext = `Google AI only recommended you in ${googleAI.promptsMentioned} of ${googleAI.promptsTested} searches. Your profile likely needs more detail to compete with the ${topCompetitors.length} competitor${topCompetitors.length !== 1 ? 's' : ''} we found.`;
      }
    }
    actions.push({
      priority: 'HIGH',
      phase: 1,
      timeline: 'Start here',
      title: 'Complete Your Google Business Profile',
      context: gbpContext || undefined,
      why: 'Google Business Profile is the primary data source for Google AI and indirectly feeds all other platforms.',
      steps: [
        `Go to business.google.com and claim or verify your listing for "${config.businessName}".`,
        `Write a detailed business description that naturally includes "${config.businessType} in ${config.location}". Cover your services, specialisms, and history in at least 3-4 sentences.`,
        `Upload at least 10 high-quality photos: exterior, interior, team, and examples of your work or products.`,
        `Select every relevant business category. Both primary and secondary categories matter.`,
        `Ensure your opening hours are accurate and mark any special holiday hours.`,
        `Respond to every existing review (positive and negative) within 48 hours.`,
      ],
    });
  }

  // ── Action: Get Listed on Key Review & Directory Sites ──
  if (overall < 75) {
    const totalResultCount = results.length;
    const totalFoundCount = results.filter(r => r.mentioned).length;
    const overallFoundPct = Math.round((totalFoundCount / Math.max(totalResultCount, 1)) * 100);
    let dirContext = '';
    if (overallFoundPct < 30) {
      dirContext = `Absent from ${100 - overallFoundPct}% of AI searches (${totalFoundCount}/${totalResultCount}). This typically indicates limited presence across directories and review sites that AI relies on.`;
    } else {
      dirContext = `Found in ${overallFoundPct}% of searches (${totalFoundCount}/${totalResultCount}), but gaps remain. Expanding your directory presence would improve consistency across platforms.`;
    }

    const directorySteps: string[] = [
      'List on Google Business Profile at business.google.com (essential, free listing).',
      'List on Yell.com at yell.com/free-listing (free listing available).',
      'List on FreeIndex at freeindex.co.uk (free listing available).',
      'List on Thomson Local at thomsonlocal.com (free listing available).',
    ];

    // Food / hospitality types
    if (businessTypeMatches(bt, ['food', 'restaurant', 'cafe', 'bakery', 'bar', 'pub'])) {
      directorySteps.push(
        'List on TripAdvisor at tripadvisor.com/Owners (essential for hospitality).',
        'List on Yelp UK at biz.yelp.co.uk/signup (free listing available).',
        'List on OpenTable at restaurant.opentable.co.uk (if you take reservations).',
      );
    }

    // Trade types
    if (businessTypeMatches(bt, ['trade', 'plumber', 'plumbing', 'electrician', 'electrical', 'builder', 'building', 'roofing', 'roofer', 'carpenter', 'joiner', 'handyman'])) {
      directorySteps.push(
        'List on Checkatrade at checkatrade.com/trades/apply (high trust with consumers).',
        'List on MyBuilder at mybuilder.com (free to create a profile).',
        'List on Bark at bark.com (connects you directly with local leads).',
      );
    }

    // Professional / legal / accounting types
    if (businessTypeMatches(bt, ['professional', 'legal', 'solicitor', 'lawyer', 'accounting', 'accountant', 'consulting', 'consultant', 'agency'])) {
      directorySteps.push(
        'List on Clutch at clutch.co (B2B reviews and directory).',
        'List on G2 at g2.com (business software and services reviews).',
      );
    }

    // Health / beauty / salon types
    if (businessTypeMatches(bt, ['health', 'beauty', 'salon', 'spa', 'hairdresser', 'barber', 'therapist', 'massage', 'aesthetics', 'clinic'])) {
      directorySteps.push(
        'List on Treatwell at treatwell.co.uk (UK-leading beauty marketplace).',
        'List on Booksy at booksy.com (free online booking and visibility).',
      );
    }

    directorySteps.push(
      'List on Trustpilot at business.trustpilot.com (free business account, high AI authority).',
      'Ensure your business name, address, and phone number (NAP) are identical across every listing.',
    );

    actions.push({
      priority: overall < 50 ? 'HIGH' : 'MEDIUM',
      phase: overall < 50 ? 1 : 2,
      timeline: overall < 50 ? 'This week' : 'Weeks 2–4',
      title: 'Get Listed on Key Review & Directory Sites',
      context: dirContext,
      why: 'AI platforms cross-reference multiple sources. Each new listing strengthens your digital footprint and makes it easier for AI to verify and recommend you.',
      steps: directorySteps,
    });
  }

  // ── Action: Close the Gap on [Top Competitor] ──
  if (topCompetitors.length > 0 && overall < 70) {
    const topComp = topCompetitors[0];
    const compContext = `${topComp.name} was cited ${topComp.count} time${topComp.count !== 1 ? 's' : ''} in searches where you were absent. When customers ask AI for a ${bt} in ${config.location}, they are currently being directed to ${topComp.name} instead of you.`;
    actions.push({
      priority: 'HIGH',
      phase: 1,
      timeline: 'Start here',
      title: `Close the Gap on ${topComp.name}`,
      context: compContext,
      why: `Understanding what makes ${topComp.name} visible to AI will help you replicate and surpass their strategy.`,
      steps: [
        `Search for "${topComp.name}" on Google and note which directories, review sites, and publications they appear on.`,
        `Check their review volume on Google, Trustpilot, and industry-specific sites. Aim to match or exceed their total review count.`,
        `Identify which directories they are listed on that you are not, and create profiles on those platforms.`,
        `Analyse their website content: look for FAQ pages, service pages, and structured data that AI platforms may be citing.`,
        `Monitor their presence over time. Your next Presenzia audit will show whether the gap is closing.`,
      ],
    });
  }

  // ── Action: Build Targeted Review Volume ──
  if (overall < 70) {
    const revStats = getCategoryFoundRate(results, 'rev');
    const revContext = revStats.tested > 0
      ? `You appeared in ${revStats.pct}% of trust and review-based searches (${revStats.found}/${revStats.tested}). AI platforms weight review volume, recency, and specificity heavily.`
      : undefined;
    actions.push({
      priority: overall < 45 ? 'HIGH' : 'MEDIUM',
      phase: 2,
      timeline: 'Next steps',
      title: 'Build Targeted Review Volume',
      context: revContext,
      why: 'Specific, location-rich reviews carry significantly more weight with AI than generic star ratings.',
      steps: [
        `Ask satisfied customers to mention your specific services and "${config.location}" in their reviews, e.g. "the best ${bt} in ${config.location}".`,
        'Send a text or email with a direct review link immediately after a positive interaction, while the experience is fresh.',
        'Set a target of 5-10 new genuine reviews per month across Google, Trustpilot, and relevant directories.',
        'Respond to every review, both positive and negative, within 24 hours. AI systems note active responsiveness.',
        'Never buy or incentivise fake reviews. AI platforms are increasingly able to detect and penalise this.',
      ],
    });
  }

  // ── Action: Add AI-Optimised Content to Your Website ──
  const svcStats = getCategoryFoundRate(results, 'svc');
  const contentContext = svcStats.tested > 0
    ? `You appeared in ${svcStats.pct}% of service-specific searches (${svcStats.found}/${svcStats.tested}). Structured website content directly affects how AI understands and recommends your services.`
    : `AI platforms are not finding your business in service-related searches. Structured, keyword-rich website content would help all platforms identify and recommend you.`;
  actions.push({
    priority: overall < 40 ? 'HIGH' : 'MEDIUM',
    phase: 2,
    timeline: 'Next steps',
    title: 'Add AI-Optimised Content to Your Website',
    context: contentContext,
    why: 'AI platforms cite websites that provide clear, factual, well-structured information.',
    steps: [
      `Create a dedicated About page that clearly states who you are, what you do, and your service area in ${config.location}.`,
      `Add a FAQ page answering common queries like "best ${bt} in ${config.location}" and "how much does a ${bt} cost in ${config.location}".`,
      'Add Schema.org LocalBusiness structured data markup to your homepage. This helps all AI platforms parse your information correctly.',
      'Ensure your address, phone number, and email are in plain text (not embedded in images) on every page.',
      `Publish regular blog content demonstrating your expertise: guides, case studies, and tips related to ${config.businessType}.`,
    ],
  });

  // ── Action: Optimise for [Weakest Platform] ──
  const weakPlatforms = platforms
    .filter((p) => p.score < 35)
    .sort((a, b) => a.score - b.score);

  if (weakPlatforms.length > 0) {
    const weakest = weakPlatforms[0];
    const platformSteps = getPlatformSpecificSteps(weakest, config);
    const platContext = `${weakest.platform} found you in ${weakest.promptsMentioned} of ${weakest.promptsTested} searches (${weakest.score}/100). This is your biggest platform gap.`;
    actions.push({
      priority: 'MEDIUM',
      phase: 3,
      timeline: 'Ongoing',
      title: `Optimise for ${weakest.platform}`,
      context: platContext,
      why: `Improving your ${weakest.platform} presence will increase your overall visibility and reach customers who prefer this platform.`,
      steps: platformSteps,
    });
  }

  // ── Action: Get Featured in Local Publications ──
  if (overall < 60) {
    const publicationSteps = getLocalPublicationSteps(config);
    const pubContext = `At ${overall}/100, you have limited presence in authoritative sources AI platforms trust most. Local press mentions are among the strongest signals for improving recommendations.`;
    actions.push({
      priority: 'MEDIUM',
      phase: 3,
      timeline: 'Ongoing',
      title: 'Get Featured in Local Publications',
      context: pubContext,
      why: 'Local press coverage creates authoritative citations that AI platforms reference when making recommendations.',
      steps: publicationSteps,
    });
  }

  return actions.slice(0, 6);
}

function getPlatformSpecificSteps(
  platform: PlatformScore,
  config: AuditConfig,
): string[] {
  const name = platform.platform;

  if (name === 'Perplexity') {
    return [
      'Verify your website in Bing Webmaster Tools at bing.com/webmasters. Perplexity uses Bing\'s index to find businesses.',
      'Ensure your website loads in under 2 seconds. Perplexity favours fast, accessible sites.',
      'Add Schema.org LocalBusiness structured data markup to your homepage.',
      `Make sure your site has a clear, crawlable page for "${config.businessType} in ${config.location}" with plain-text contact details.`,
      'Check that your robots.txt does not block Bing or Perplexity crawlers.',
    ];
  }

  if (name === 'ChatGPT') {
    return [
      'Focus on building authoritative web content. ChatGPT draws from its training data and web browsing.',
      'Aim for mentions in Wikipedia, local press, and industry publications. These carry the most weight.',
      'Build high-authority backlinks from established local sites, chambers of commerce, and industry bodies.',
      `Ensure your business has detailed, factual entries on well-indexed directories such as Yell.com, FreeIndex, and Thomson Local.`,
      'Publish long-form content on your website that positions you as an expert in your field.',
    ];
  }

  if (name === 'Claude') {
    return [
      'Ensure your business is present on established, well-known directories. Claude draws from authoritative web sources.',
      'Maintain consistent NAP (Name, Address, Phone) data across every platform and listing.',
      'Build a comprehensive website with clear service descriptions, an About page, and structured data.',
      `Add detailed content covering your services in ${config.location}. Specificity helps Claude identify relevant businesses.`,
      'Get listed on industry-specific review platforms relevant to your sector.',
    ];
  }

  if (name === 'Google AI') {
    return [
      'Complete your Google Business Profile. This is the primary data source for Google AI responses.',
      'Add Google-specific structured data (Schema.org) to your website, including LocalBusiness, Service, and Review markup.',
      'Ensure your website appears in Google Search Console with no indexing errors.',
      'Build Google reviews. Volume and recency both matter for Google AI recommendations.',
      `Optimise your site content for queries like "best ${config.businessType.toLowerCase()} in ${config.location}".`,
    ];
  }

  // Fallback for any unknown platform
  return [
    'Ensure your business is listed on all major directories with consistent information.',
    'Build review volume across multiple platforms.',
    'Add structured data markup to your website.',
    `Create content that clearly associates your business with "${config.businessType}" and "${config.location}".`,
  ];
}

function getLocalPublicationSteps(config: AuditConfig): string[] {
  const location = config.location.toLowerCase();
  const steps: string[] = [];

  // City-specific publication suggestions
  if (location.includes('manchester')) {
    steps.push(
      'Pitch your story to Manchester Evening News, Manchester Confidential, and I Love MCR . These are high-authority local sources.',
    );
  } else if (location.includes('london')) {
    steps.push(
      'Pitch your story to TimeOut London, Evening Standard, and Londonist . These are high-authority local sources.',
    );
  } else if (location.includes('birmingham')) {
    steps.push(
      'Pitch your story to Birmingham Mail and I Choose Birmingham . These are high-authority local sources.',
    );
  } else if (location.includes('leeds')) {
    steps.push(
      'Pitch your story to Leeds Live and Yorkshire Evening Post . These are high-authority local sources.',
    );
  } else if (location.includes('liverpool')) {
    steps.push(
      'Pitch your story to Liverpool Echo and The Guide Liverpool . These are high-authority local sources.',
    );
  } else if (location.includes('bristol')) {
    steps.push(
      'Pitch your story to Bristol Post and Bristol24/7 . These are high-authority local sources.',
    );
  } else if (location.includes('edinburgh')) {
    steps.push(
      'Pitch your story to Edinburgh Evening News and The Skinny . These are high-authority local sources.',
    );
  } else if (location.includes('glasgow')) {
    steps.push(
      'Pitch your story to Glasgow Live and The Herald . These are high-authority local sources.',
    );
  } else if (location.includes('cardiff')) {
    steps.push(
      'Pitch your story to Wales Online and Cardiff Times . These are high-authority local sources.',
    );
  } else if (location.includes('newcastle')) {
    steps.push(
      'Pitch your story to Chronicle Live and Newcastle Magazine . These are high-authority local sources.',
    );
  } else if (location.includes('sheffield')) {
    steps.push(
      'Pitch your story to The Star Sheffield and Sheffield Telegraph . These are high-authority local sources.',
    );
  } else if (location.includes('nottingham')) {
    steps.push(
      'Pitch your story to Nottingham Post and LeftLion . These are high-authority local sources.',
    );
  } else {
    steps.push(
      `Contact local publications and news outlets in ${config.location} . Local press coverage is highly trusted by AI platforms.`,
    );
  }

  steps.push(
    `Pitch a story angle: "How ${config.businessName} is [serving/helping/transforming] ${config.location}" . Journalists want a narrative, not an advert.`,
    `Offer to be quoted as a local expert source on topics related to ${config.businessType} . Reporters frequently need expert commentary.`,
    'Create a press/media page on your website with your story, high-resolution photos, and a press contact email.',
    'Share any coverage on your Google Business Profile and social channels to amplify the signal.',
  );

  return steps;
}

// ── Main Export ───────────────────────────────────────────────

export function generateInsights(
  config: AuditConfig,
  score: AuditScore,
  results: PromptResult[],
): ReportInsights {
  const categories = buildCategories(results);
  const actions = buildActions(config, score, results);

  // Compute totals from raw results
  const totalSearches = results.length;
  const totalFound = results.filter((r) => r.mentioned).length;

  return {
    categories,
    actions,
    totalSearches,
    totalFound,
  };
}
