/**
 * Insights engine — processes raw audit data into structured, actionable
 * report content for the PDF report generator.
 *
 * Takes the audit config, overall score, and individual prompt results,
 * then produces category breakdowns and detailed, business-specific actions.
 */

import type { PromptResult, AuditScore, PlatformScore } from '../audit/scorer';
import type { AuditConfig } from '../audit/runner';

/** Turn "Restaurant / Cafe" → "restaurant" (takes first term before slash) */
function cleanBusinessType(bt: string): string {
  return bt.split('/')[0].trim().toLowerCase();
}

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

export interface ActionStep {
  text: string;
  substeps?: string[];      // Optional nested sub-steps for more granular guidance
}

export interface DetailedAction {
  priority: 'HIGH' | 'MEDIUM';
  phase: 1 | 2 | 3;        // 1=Immediate, 2=Short-term, 3=Ongoing
  timeline: string;         // e.g. "Start here", "Next steps", "Ongoing"
  title: string;
  why: string;              // One-line explanation
  context?: string;         // Data-driven observation from the audit results
  steps: (string | ActionStep)[];  // 3-6 specific, actionable bullet points (string for backward compat)
}

export interface ReportInsights {
  categories: CategoryBreakdown[];
  actions: DetailedAction[];
  nextMonthHints: string[];  // Action titles that didn't make top 5 — teasers for next month
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

    // All examples sorted by weight (descending) — show everything for a complete picture
    const examples = [...tests]
      .sort((a, b) => b.weight - a.weight);

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
  const bt = cleanBusinessType(config.businessType);

  // ── Action: Complete Your Google Business Profile ──
  if (overall < 65) {
    const googleAI = platforms.find(p => p.platform === 'Google AI');
    let gbpContext = '';
    if (googleAI) {
      if (googleAI.promptsMentioned === 0) {
        gbpContext = `Google AI did not find your firm in any of the ${googleAI.promptsTested} searches we tested. This strongly suggests your Google Business Profile is either unclaimed, incomplete, or not optimised for your category.`;
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
        {
          text: `Go to business.google.com and claim or verify your listing for "${config.businessName}".`,
          substeps: [
            'Sign in with your firm Google account (or create one)',
            'Search for your firm name — if it appears, click "Claim this business"',
            'If not listed, click "Add your firm" and follow the verification steps',
            'Google will send a verification postcard or offer phone/email verification',
          ],
        },
        {
          text: `Write a detailed business description (750 characters) that naturally includes "${bt}in ${config.location}".`,
          substeps: [
            'Cover: what you do, who you serve, your specialisms, and how long you have been operating',
            `Use natural phrasing like "We are a ${bt} based in ${config.location}, specialising in..."`,
            'Avoid keyword stuffing — write for humans, AI will pick it up naturally',
          ],
        },
        `Upload at least 10 high-quality photos: exterior signage, interior, your team at work, and examples of your products or services. AI platforms reference image metadata.`,
        `Select every relevant business category — both primary and secondary categories matter. Your primary should be "${bt}" or the closest match available.`,
        `Ensure your opening hours are set for all 7 days, including any special holiday hours.`,
        `Respond to every existing review (positive and negative) within 48 hours. AI systems note active, responsive businesses.`,
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

    const directorySteps: (string | ActionStep)[] = [
      {
        text: 'Claim or verify these essential free directory listings:',
        substeps: [
          'Google Business Profile -business.google.com (most important — do this first)',
          'Yell.com -yell.com/free-listing (free, high UK authority)',
          'FreeIndex -freeindex.co.uk (free, feeds multiple AI sources)',
          'Thomson Local -thomsonlocal.com (free, long-standing UK directory)',
        ],
      },
    ];

    // Food / hospitality types
    if (businessTypeMatches(bt, ['food', 'restaurant', 'cafe', 'bakery', 'bar', 'pub'])) {
      directorySteps.push({
        text: 'Claim these hospitality-specific directories (essential for your industry):',
        substeps: [
          'TripAdvisor -tripadvisor.com/Owners (free owner listing, high AI authority for food/hospitality)',
          'Yelp UK -biz.yelp.co.uk/signup (free listing, frequently cited by ChatGPT)',
          'OpenTable -restaurant.opentable.co.uk (if you take reservations — boosts discoverability)',
        ],
      });
    }

    // Trade types
    if (businessTypeMatches(bt, ['trade', 'plumber', 'plumbing', 'electrician', 'electrical', 'builder', 'building', 'roofing', 'roofer', 'carpenter', 'joiner', 'handyman'])) {
      directorySteps.push({
        text: 'Claim these trade-specific directories (high consumer trust in your sector):',
        substeps: [
          'Checkatrade -checkatrade.com/trades/apply (top trust signal for UK trades)',
          'MyBuilder -mybuilder.com (free profile, connects with local jobs)',
          'Bark -bark.com (direct local leads and visibility)',
        ],
      });
    }

    // Financial advisory / IFA / wealth management types
    if (businessTypeMatches(bt, ['financial', 'ifa', 'wealth', 'investment', 'planner', 'advisor', 'adviser', 'chartered', 'pension', 'retirement'])) {
      directorySteps.push({
        text: 'Claim these critical financial advisory directories:',
        substeps: [
          'VouchedFor -vouchedfor.co.uk (top trust signal for UK IFAs — heavily cited by AI)',
          'Unbiased -unbiased.co.uk (leading financial advisor directory — frequently referenced by ChatGPT)',
          'FTAdviser -ftadviser.com (trade publication presence signals authority)',
          'FCA Register -register.fca.org.uk (ensure your listing is complete and current)',
          'PFS Directory -thepfs.org (Personal Finance Society membership listing)',
        ],
      });
    }

    // Professional / legal / accounting types
    if (businessTypeMatches(bt, ['professional', 'legal', 'solicitor', 'lawyer', 'accounting', 'accountant', 'consulting', 'consultant', 'agency'])) {
      directorySteps.push({
        text: 'Claim these professional services directories:',
        substeps: [
          'Clutch -clutch.co (B2B reviews — cited by AI for professional services)',
          'G2 -g2.com (if you offer software/SaaS — major AI citation source)',
        ],
      });
    }

    // Health / beauty / salon types
    if (businessTypeMatches(bt, ['health', 'beauty', 'salon', 'spa', 'hairdresser', 'barber', 'therapist', 'massage', 'aesthetics', 'clinic'])) {
      directorySteps.push({
        text: 'Claim these health & beauty directories:',
        substeps: [
          'Treatwell -treatwell.co.uk (UK-leading beauty marketplace, frequently cited by AI)',
          'Booksy -booksy.com (free online booking profile, growing AI authority)',
        ],
      });
    }

    directorySteps.push(
      'Claim your free Trustpilot firm account at business.trustpilot.com — Trustpilot is one of the highest-authority review sources for AI platforms.',
      {
        text: 'Ensure your NAP (Name, Address, Phone) is identical across every single listing.',
        substeps: [
          'Use the exact same firm name spelling, including "Ltd" or "Limited"',
          'Use the same phone number format everywhere (e.g. 0161 xxx xxxx, not +44 161)',
          'Use the same address format — AI cross-references these to verify your firm',
        ],
      },
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
    const runner = topCompetitors.length > 1 ? topCompetitors[1] : null;
    const compContext = `${topComp.name} was cited ${topComp.count} time${topComp.count !== 1 ? 's' : ''} in searches where you were absent.${runner ? ` ${runner.name} appeared ${runner.count} time${runner.count !== 1 ? 's' : ''}.` : ''} When clients ask AI for a ${bt} in ${config.location}, they are currently being directed to your competitors instead of you.`;
    actions.push({
      priority: 'HIGH',
      phase: 1,
      timeline: 'Start here',
      title: `Close the Gap on ${topComp.name}`,
      context: compContext,
      why: `Understanding what makes ${topComp.name} visible to AI will help you replicate and surpass their strategy.`,
      steps: [
        {
          text: `Research ${topComp.name}'s online presence to understand why AI recommends them:`,
          substeps: [
            `Google "${topComp.name} ${config.location}" and note every directory, review site, and article they appear on`,
            `Check their Google Business Profile: note their review count, photo count, and how detailed their description is`,
            `Visit their website: check for FAQ pages, blog content, and structured data (view source -search for "schema.org")`,
            `Check Trustpilot, Yelp, and any industry-specific review sites for their presence`,
          ],
        },
        {
          text: `Match their directory presence — create profiles on every platform where they appear and you don't.`,
          substeps: [
            'Focus first on the platforms cited most often by AI: Google, Yelp, TripAdvisor, Trustpilot',
            'Use the exact same NAP format across all new listings for consistency',
          ],
        },
        `Aim to match or exceed their Google review count. If ${topComp.name} has 50+ reviews and you have fewer than 20, this is likely a primary reason for the gap.`,
        `Check if ${topComp.name} has been featured in local press or publications — if so, pitch your own story to those same outlets (see "Get Featured in Local Publications" below).`,
        `Your next Presenzia audit will show whether the gap is closing. Track your progress over time.`,
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
        {
          text: `Ask satisfied clients to write detailed reviews that mention your specific services and "${config.location}".`,
          substeps: [
            `Suggest phrasing like: "the best ${bt} in ${config.location}" or "highly recommend for [specific service] in ${config.location}"`,
            'Reviews that mention specific services and your location carry 3-5x more weight with AI than generic "great service" reviews',
          ],
        },
        {
          text: 'Send a direct Google review link within 1 hour of a positive interaction.',
          substeps: [
            'Go to your Google Business Profile -Share review form -copy the short link',
            'Send this link via text or email immediately after a positive customer interaction',
            'The shorter the delay, the more likely the customer is to leave a review',
          ],
        },
        'Set a target of 5-10 new genuine reviews per month across Google, Trustpilot, and relevant directories.',
        'Respond to every review (positive and negative) within 24 hours. AI systems note active, responsive businesses.',
        'Never buy or incentivise fake reviews. AI platforms are increasingly able to detect and penalise this.',
      ],
    });
  }

  // ── Action: Add AI-Optimised Content to Your Website ──
  const svcStats = getCategoryFoundRate(results, 'svc');
  const contentContext = svcStats.tested > 0
    ? `You appeared in ${svcStats.pct}% of service-specific searches (${svcStats.found}/${svcStats.tested}). Structured website content directly affects how AI understands and recommends your services.`
    : `AI platforms are not finding your firm in service-related searches. Structured, keyword-rich website content would help all platforms identify and recommend you.`;
  actions.push({
    priority: overall < 40 ? 'HIGH' : 'MEDIUM',
    phase: 2,
    timeline: 'Next steps',
    title: 'Add AI-Optimised Content to Your Website',
    context: contentContext,
    why: 'AI platforms cite websites that provide clear, factual, well-structured information.',
    steps: [
      `Create or update your About page: clearly state who you are, what you do, and your service area. Include "${config.businessName} is a ${bt} based in ${config.location}" as an opening line.`,
      {
        text: `Add a FAQ page answering the exact questions clients ask AI.`,
        substeps: [
          `"What is the best ${bt} in ${config.location}?" — answer with what makes you stand out`,
          `"How much does a ${bt} cost in ${config.location}?" — provide price ranges or starting prices`,
        ],
      },
      `Add Schema.org FinancialService structured data (JSON-LD) to your homepage — include your firm name, FCA number, services offered, and areas covered`,
      `Ensure your address, phone, and email appear as selectable plain text on every page — not embedded in images.`,
      `Publish at least 1-2 blog posts per month demonstrating expertise: guides, case studies, and tips related to ${bt}in ${config.location}.`,
    ],
  });

  // ── Action: Optimise for [Weakest Platform] ──
  const weakPlatforms = platforms
    .filter((p) => p.score <= 40)
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
      why: `Improving your ${weakest.platform} presence will increase your overall visibility and reach clients who prefer this platform.`,
      steps: platformSteps,
    });

    // Add second weak platform if available
    if (weakPlatforms.length > 1) {
      const second = weakPlatforms[1];
      const secondSteps = getPlatformSpecificSteps(second, config);
      const secondContext = `${second.platform} found you in ${second.promptsMentioned} of ${second.promptsTested} searches (${second.score}/100).`;
      actions.push({
        priority: 'MEDIUM',
        phase: 3,
        timeline: 'Ongoing',
        title: `Improve ${second.platform} Visibility`,
        context: secondContext,
        why: `${second.platform} is another platform where your visibility is below average. Targeted improvements here will lift your overall score.`,
        steps: secondSteps,
      });
    }
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

  return actions;
}

function getPlatformSpecificSteps(
  platform: PlatformScore,
  config: AuditConfig,
): (string | ActionStep)[] {
  const name = platform.platform;

  if (name === 'Perplexity') {
    return [
      {
        text: 'Submit your website to Bing Webmaster Tools at bing.com/webmasters — Perplexity primarily uses Bing\'s index.',
        substeps: [
          'Create a free account, add your site URL, and verify ownership',
          'Submit your sitemap.xml for faster indexing',
          'Check for any crawl errors and fix them',
        ],
      },
      'Ensure your website loads in under 2 seconds. Perplexity favours fast, accessible sites.',
      'Add Schema.org FinancialService structured data markup to your homepage.',
      `Make sure your site has a clear, crawlable page for "${cleanBusinessType(config.businessType)} in ${config.location}" with plain-text contact details.`,
      'Check your robots.txt file — make sure it does not block PerplexityBot or Bingbot.',
    ];
  }

  if (name === 'ChatGPT') {
    return [
      'Focus on building authoritative web content. ChatGPT draws from its training data and live web browsing.',
      {
        text: 'Aim for mentions in high-authority sources that ChatGPT frequently cites:',
        substeps: [
          'Local press (Manchester Evening News, TimeOut, etc.) — pitch a story about your firm',
          'Industry publications and trade bodies relevant to your sector',
          'Wikipedia (if notable enough) — or ensure existing Wikipedia references to your area mention you',
        ],
      },
      `Build high-authority backlinks from chambers of commerce, local business associations, and industry directories.`,
      `Ensure detailed, factual entries on well-indexed directories: Yell.com, FreeIndex, Thomson Local, Trustpilot.`,
      `Publish long-form expert content (1,000+ words) on your website — guides, case studies, and thought leadership.`,
    ];
  }

  if (name === 'Claude') {
    return [
      'Ensure your firm is present on established, well-known directories — Claude prioritises authoritative web sources.',
      'Maintain consistent NAP (Name, Address, Phone) data across every platform and listing.',
      'Build a comprehensive website with clear service descriptions, an About page, and structured data.',
      `Add detailed content covering your services in ${config.location}. Specificity helps Claude identify relevant businesses.`,
      'Get listed on industry-specific review platforms relevant to your sector.',
    ];
  }

  if (name === 'Google AI') {
    return [
      {
        text: 'Complete your Google Business Profile — this is the #1 data source for Google AI responses.',
        substeps: [
          'Verify ownership at business.google.com',
          'Fill out every single field: description, categories, services, attributes',
          'Add 10+ photos and update them monthly',
        ],
      },
      'Add Schema.org structured data to your website: FinancialService, Service, and Review markup.',
      'Verify your site in Google Search Console (search.google.com/search-console) — fix any indexing errors.',
      'Build Google review volume. Both the number of reviews and how recent they are matter for Google AI.',
      `Optimise your site content for queries like "best ${cleanBusinessType(config.businessType)} in ${config.location}".`,
    ];
  }

  // Fallback for any unknown platform
  return [
    'Ensure your firm is listed on all major directories with consistent information.',
    'Build review volume across multiple platforms.',
    'Add structured data markup to your website.',
    `Create content that clearly associates your firm with "${cleanBusinessType(config.businessType)}" and "${config.location}".`,
  ];
}

function getLocalPublicationSteps(config: AuditConfig): (string | ActionStep)[] {
  const location = config.location.toLowerCase();
  const steps: (string | ActionStep)[] = [];

  // City-specific publication suggestions
  const publicationMap: Record<string, string[]> = {
    manchester: ['Manchester Evening News (manchestereveningnews.co.uk)', 'Manchester Confidential (confidentials.com)', 'I Love MCR (ilovemanchester.com)'],
    london: ['TimeOut London (timeout.com/london)', 'Evening Standard (standard.co.uk)', 'Londonist (londonist.com)'],
    birmingham: ['Birmingham Mail (birminghammail.co.uk)', 'I Choose Birmingham (ichoosebirmingham.com)'],
    leeds: ['Leeds Live (leeds-live.co.uk)', 'Yorkshire Evening Post (yorkshireeveningpost.co.uk)'],
    liverpool: ['Liverpool Echo (liverpoolecho.co.uk)', 'The Guide Liverpool (theguideliverpool.com)'],
    bristol: ['Bristol Post (bristolpost.co.uk)', 'Bristol24/7 (bristol247.com)'],
    edinburgh: ['Edinburgh Evening News (edinburghnews.scotsman.com)', 'The Skinny (theskinny.co.uk)'],
    glasgow: ['Glasgow Live (glasgowlive.co.uk)', 'The Herald (heraldscotland.com)'],
    cardiff: ['Wales Online (walesonline.co.uk)', 'Cardiff Times (cardifftimes.co.uk)'],
    newcastle: ['Chronicle Live (chroniclelive.co.uk)', 'Newcastle Magazine (newcastlemagazine.co.uk)'],
    sheffield: ['The Star Sheffield (thestar.co.uk)', 'Sheffield Telegraph (sheffieldtelegraph.co.uk)'],
    nottingham: ['Nottingham Post (nottinghampost.com)', 'LeftLion (leftlion.co.uk)'],
  };

  const matchedCity = Object.keys(publicationMap).find(city => location.includes(city));
  if (matchedCity) {
    steps.push({
      text: `Pitch your story to these high-authority local publications in ${config.location}:`,
      substeps: [
        ...publicationMap[matchedCity].map(pub => `${pub} — email their editorial/features desk`),
        'Look for a "Contact us" or "Submit a story" page on each site',
      ],
    });
  } else {
    steps.push({
      text: `Contact local publications and news outlets in ${config.location} — local press coverage is highly trusted by AI.`,
      substeps: [
        'Search Google for "[your city] news" and "[your city] magazine" to find local outlets',
        'Look for their editorial contact or "Submit a story" page',
      ],
    });
  }

  steps.push(
    {
      text: `Pitch a story angle — journalists want a narrative, not an advert.`,
      substeps: [
        `Try: "How ${config.businessName} is [serving/helping/transforming] ${config.location}"`,
        `Or: "The rise of [your niche] in ${config.location} — a local business perspective"`,
        'Keep your email pitch under 150 words with a clear subject line',
      ],
    },
    `Offer to be quoted as a local expert on topics related to ${cleanBusinessType(config.businessType)}. Reporters frequently need expert commentary.`,
    'Create a press/media page on your website with your story, high-resolution photos, and a press contact email.',
    'Share any coverage on your Google Business Profile, social channels, and directory listings to amplify the signal.',
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
  const allActions = buildActions(config, score, results);
  const actions = allActions.slice(0, 5);
  const nextMonthHints = allActions.slice(5).map(a => a.title);

  // Compute totals from raw results
  const totalSearches = results.length;
  const totalFound = results.filter((r) => r.mentioned).length;

  return {
    categories,
    actions,
    nextMonthHints,
    totalSearches,
    totalFound,
  };
}
