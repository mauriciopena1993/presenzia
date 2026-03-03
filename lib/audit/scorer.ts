/**
 * Scoring engine for AI visibility results.
 * Calculates a 0-100 visibility score based on prompt testing results.
 */

export interface PromptResult {
  promptId: string;
  promptText: string;
  platform: string;
  mentioned: boolean;
  position: number | null; // 1 = first mention, null = not mentioned
  competitors: string[];   // Other businesses mentioned in the response
  rawResponse: string;
  weight: number;
}

export interface PlatformScore {
  platform: string;
  score: number;        // 0-100
  promptsTested: number;
  promptsMentioned: number;
  avgPosition: number | null;
  topThreeCount: number; // How many times appeared in top 3
  competitors: string[];
}

export interface AuditScore {
  overall: number;      // 0-100 weighted score
  platforms: PlatformScore[];
  totalPrompts: number;
  mentionedInCount: number;
  topThreePct: number;  // % of prompts where firm appeared in top 3
  topCompetitors: Array<{ name: string; count: number }>;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
}

/** Position multiplier — rewards higher ranking in AI responses */
function getPositionMultiplier(position: number | null): number {
  if (position === null) return 1; // Mentioned but no position data → full credit
  if (position <= 2) return 1;     // Top 2: full credit
  if (position <= 3) return 0.9;   // Position 3: 90%
  if (position <= 5) return 0.7;   // Position 4-5: 70%
  return 0.4;                      // Position 6+: 40%
}

export function calculateScore(results: PromptResult[]): AuditScore {
  const platforms = ['ChatGPT', 'Claude', 'Perplexity', 'Google AI'];
  const platformScores: PlatformScore[] = [];

  // Score each platform — position-weighted scoring
  // Position 1-2: full credit, 3: 90%, 4-5: 70%, 6+: 40%
  for (const platform of platforms) {
    const platformResults = results.filter(r => r.platform === platform);
    if (platformResults.length === 0) continue;

    const totalWeight = platformResults.reduce((sum, r) => sum + r.weight, 0);

    // Position-weighted score: being mentioned matters, but ranking higher matters more
    let positionWeightedScore = 0;
    for (const r of platformResults) {
      if (!r.mentioned) continue;
      const posMultiplier = getPositionMultiplier(r.position);
      positionWeightedScore += r.weight * posMultiplier;
    }

    const score = totalWeight > 0 ? Math.round((positionWeightedScore / totalWeight) * 100) : 0;

    // Calculate average position (lower = better)
    const positions = platformResults
      .filter(r => r.mentioned && r.position !== null)
      .map(r => r.position as number);
    const avgPosition = positions.length > 0
      ? positions.reduce((sum, p) => sum + p, 0) / positions.length
      : null;

    // Count top-3 appearances
    const topThreeCount = platformResults.filter(
      r => r.mentioned && r.position !== null && r.position <= 3
    ).length;

    // Collect competitors
    const competitorCounts: Record<string, number> = {};
    for (const result of platformResults) {
      for (const comp of result.competitors) {
        competitorCounts[comp] = (competitorCounts[comp] || 0) + 1;
      }
    }

    platformScores.push({
      platform,
      score,
      promptsTested: platformResults.length,
      promptsMentioned: platformResults.filter(r => r.mentioned).length,
      avgPosition,
      topThreeCount,
      competitors: Object.entries(competitorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name),
    });
  }

  // Calculate overall score (weighted average of platforms)
  const platformWeights: Record<string, number> = {
    'ChatGPT': 35,     // Highest market share
    'Google AI': 30,   // Google's reach
    'Perplexity': 20,  // Fast growing
    'Claude': 15,      // Growing
  };

  let weightedSum = 0;
  let totalPlatformWeight = 0;

  for (const ps of platformScores) {
    const w = platformWeights[ps.platform] || 10;
    weightedSum += ps.score * w;
    totalPlatformWeight += w;
  }

  const overall = totalPlatformWeight > 0
    ? Math.round(weightedSum / totalPlatformWeight)
    : 0;

  // Total mentions across all platforms
  const mentionedInCount = results.filter(r => r.mentioned).length;

  // Top-3 appearance percentage (across all platforms)
  const totalUniquePrompts = new Set(results.map(r => r.promptId)).size;
  const promptsWithTopThree = new Set(
    results
      .filter(r => r.mentioned && r.position !== null && r.position <= 3)
      .map(r => r.promptId)
  ).size;
  const topThreePct = totalUniquePrompts > 0
    ? Math.round((promptsWithTopThree / totalUniquePrompts) * 100)
    : 0;

  // Top competitors across all platforms
  const allCompetitorCounts: Record<string, number> = {};
  for (const result of results) {
    for (const comp of result.competitors) {
      allCompetitorCounts[comp] = (allCompetitorCounts[comp] || 0) + 1;
    }
  }
  const topCompetitors = Object.entries(allCompetitorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 80) grade = 'A';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 40) grade = 'C';
  else if (overall >= 20) grade = 'D';
  else grade = 'F';

  // Summary
  const summary = generateSummary(overall, grade, platformScores, topCompetitors, topThreePct);

  return {
    overall,
    platforms: platformScores,
    totalPrompts: results.length,
    mentionedInCount,
    topThreePct,
    topCompetitors,
    grade,
    summary,
  };
}

function generateSummary(
  score: number,
  grade: string,
  platforms: PlatformScore[],
  competitors: Array<{ name: string; count: number }>,
  topThreePct: number,
): string {
  if (platforms.length === 0) {
    return `No platform data available. Score: ${score}/100.`;
  }

  const bestPlatform = platforms.reduce((best, p) =>
    p.score > (best?.score ?? -1) ? p : best, platforms[0]);
  const worstPlatform = platforms.reduce((worst, p) =>
    p.score < (worst?.score ?? 101) ? p : worst, platforms[0]);
  const platformsFound = platforms.filter(p => p.promptsMentioned > 0).length;

  // Competitor context
  const compLine = competitors[0]
    ? ` ${competitors[0].name} was the most recommended competitor, cited ${competitors[0].count} time${competitors[0].count !== 1 ? 's' : ''}.`
    : '';

  // Top-3 context
  const topThreeLine = topThreePct > 0
    ? ` You appeared in the top 3 recommendations in ${topThreePct}% of searches.`
    : ' You did not appear in the top 3 recommendations for any search.';

  // Platform spread
  const spreadLine = platforms.length > 1 && bestPlatform.platform !== worstPlatform.platform
    ? ` Strongest on ${bestPlatform.platform} (${bestPlatform.score}%), weakest on ${worstPlatform.platform} (${worstPlatform.score}%).`
    : '';

  if (score < 20) {
    return `Your firm has very low AI visibility (${score}/100, Grade ${grade}). You are essentially invisible across ${platforms.length} AI platforms — found on ${platformsFound} of them.${compLine} When prospective clients ask AI for recommendations, they are being directed to your competitors.${topThreeLine} Immediate action is needed to establish your digital footprint.`;
  } else if (score < 40) {
    return `Your AI visibility score of ${score}/100 (Grade ${grade}) reveals significant gaps.${spreadLine}${compLine}${topThreeLine} Your firm is missing from the majority of AI-powered searches in your category. Targeted improvements to your online presence could meaningfully shift these results.`;
  } else if (score < 60) {
    return `A score of ${score}/100 (Grade ${grade}) shows moderate AI visibility. You were found on ${platformsFound} of ${platforms.length} platforms, but inconsistently.${spreadLine}${topThreeLine}${compLine} Strengthening your content, reviews, and directory strategy could significantly improve your ranking.`;
  } else if (score < 80) {
    return `Good AI visibility at ${score}/100 (Grade ${grade}). Your firm is being recommended across ${platformsFound} of ${platforms.length} platforms.${spreadLine}${topThreeLine}${compLine} Focus on closing gaps on your weakest platform and building top-3 positioning to reach the top tier.`;
  } else {
    return `Excellent AI visibility at ${score}/100 (Grade ${grade}). Your firm is consistently being recommended across ${platformsFound} of ${platforms.length} AI platforms.${topThreeLine}${compLine} Continue your content strategy and monitor competitor movements to maintain this position.`;
  }
}
