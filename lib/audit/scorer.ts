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
  competitors: string[];
}

export interface AuditScore {
  overall: number;      // 0-100 weighted score
  platforms: PlatformScore[];
  totalPrompts: number;
  mentionedInCount: number;
  topCompetitors: Array<{ name: string; count: number }>;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
}

export function calculateScore(results: PromptResult[]): AuditScore {
  const platforms = ['ChatGPT', 'Claude', 'Perplexity', 'Google AI'];
  const platformScores: PlatformScore[] = [];

  // Score each platform
  for (const platform of platforms) {
    const platformResults = results.filter(r => r.platform === platform);
    if (platformResults.length === 0) continue;

    const totalWeight = platformResults.reduce((sum, r) => sum + r.weight, 0);
    const mentionedWeight = platformResults
      .filter(r => r.mentioned)
      .reduce((sum, r) => sum + r.weight, 0);

    const score = totalWeight > 0 ? Math.round((mentionedWeight / totalWeight) * 100) : 0;

    // Calculate average position (lower = better)
    const positions = platformResults
      .filter(r => r.mentioned && r.position !== null)
      .map(r => r.position as number);
    const avgPosition = positions.length > 0
      ? positions.reduce((sum, p) => sum + p, 0) / positions.length
      : null;

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
  const summary = generateSummary(overall, grade, platformScores, topCompetitors);

  return {
    overall,
    platforms: platformScores,
    totalPrompts: results.length,
    mentionedInCount,
    topCompetitors,
    grade,
    summary,
  };
}

function generateSummary(
  score: number,
  grade: string,
  platforms: PlatformScore[],
  competitors: Array<{ name: string; count: number }>
): string {
  const bestPlatform = platforms.reduce((best, p) =>
    p.score > (best?.score ?? -1) ? p : best, platforms[0]);
  const worstPlatform = platforms.reduce((worst, p) =>
    p.score < (worst?.score ?? 101) ? p : worst, platforms[0]);

  if (score < 20) {
    return `Your firm has very low AI visibility (${score}/100). You are essentially invisible to AI search. ${competitors[0] ? `Competitors like ${competitors[0].name} are being recommended instead of you.` : ''} Immediate action is needed.`;
  } else if (score < 40) {
    return `Your AI visibility score of ${score}/100 indicates significant gaps. You appear on ${bestPlatform?.platform} (${bestPlatform?.score}%) but are largely missing from ${worstPlatform?.platform} (${worstPlatform?.score}%). There is substantial room for improvement.`;
  } else if (score < 60) {
    return `A score of ${score}/100 shows moderate AI visibility. You have a presence on some platforms but inconsistently. Strengthening your content and directory strategy could significantly improve your score.`;
  } else if (score < 80) {
    return `Good AI visibility at ${score}/100. Your firm is being recommended across most platforms. Focus on improving your ${worstPlatform?.platform} presence (${worstPlatform?.score}%) to reach the top tier.`;
  } else {
    return `Excellent AI visibility at ${score}/100. Your firm is consistently being recommended across AI platforms. Continue your content strategy to maintain this position.`;
  }
}
