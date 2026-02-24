import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';
import { AuditScore } from '../audit/scorer';
import { AuditConfig } from '../audit/runner';

// Register fonts — use local TTF files (woff2 is not supported by @react-pdf/renderer)
Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf'), fontWeight: 700 },
  ],
});

const GOLD = '#C9A84C';
const DARK = '#0A0A0A';
const SURFACE = '#111111';
const SURFACE2 = '#141414';
const BORDER = '#222222';
const BORDER_LIGHT = '#2a2a2a';
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_SECONDARY = '#AAAAAA';
const TEXT_MUTED = '#555555';

// Score band colors
function scoreColor(score: number): string {
  if (score >= 70) return '#4a9e6a';
  if (score >= 45) return '#C9A84C';
  if (score >= 25) return '#cc8833';
  return '#cc4444';
}

function scoreBand(score: number): string {
  if (score >= 70) return 'STRONG';
  if (score >= 45) return 'MODERATE';
  if (score >= 25) return 'WEAK';
  return 'NOT VISIBLE';
}

function scoreBandSubtitle(score: number): string {
  if (score >= 70) return 'Leading your local market in AI';
  if (score >= 45) return 'Solid foundation — room to grow';
  if (score >= 25) return 'Significant improvement needed';
  return 'Immediate action required';
}

function scoreBandContext(score: number): string {
  if (score >= 70) return 'Your business is consistently recommended by AI assistants. You have strong visibility across the platforms that matter most to customers.';
  if (score >= 45) return 'Your business appears in some AI searches, but inconsistently. You are missing a significant share of potential recommendations to competitors.';
  if (score >= 25) return 'Your business has limited AI visibility. Competitors are being recommended in most searches where you should appear. The good news: this is fixable.';
  return 'Your business is not being recommended by AI assistants. Potential customers asking AI for options in your category are not finding you — they are finding your competitors instead.';
}

interface Recommendation {
  priority: 'HIGH' | 'MEDIUM';
  title: string;
  text: string;
}

function getRecommendations(score: AuditScore, config: AuditConfig): Recommendation[] {
  const recs: Recommendation[] = [];
  const topComp = score.topCompetitors[0]?.name;
  const weakPlatforms = score.platforms.filter(p => p.score < 35).map(p => p.platform);
  const strongPlatforms = score.platforms.filter(p => p.score >= 50).map(p => p.platform);

  if (score.overall < 55) {
    recs.push({
      priority: 'HIGH',
      title: 'Complete Your Google Business Profile',
      text: `Fill in every field: business description (mention "${config.businessType} in ${config.location}" naturally), all service categories, opening hours, photos, and respond to all reviews. This is the single highest-impact action — AI platforms draw heavily from verified business data, and an incomplete profile signals a less credible business.`,
    });
  }

  if (topComp && score.overall < 70) {
    recs.push({
      priority: 'HIGH',
      title: `Close the Gap on ${topComp}`,
      text: `${topComp} is currently being recommended instead of your business across ${score.topCompetitors[0].count} AI responses. Search for them online to understand their presence: which directories they appear on, what their reviews say, and what content they publish. Then match and exceed it. Focus especially on the platforms where they are outperforming you.`,
    });
  }

  if (score.overall < 65) {
    recs.push({
      priority: 'HIGH',
      title: 'Collect Specific, Location-Rich Reviews',
      text: `Generic reviews ("great service!") carry little weight with AI. Ask satisfied customers to mention exactly what they hired you for and your location — for example: "The best ${config.businessType.toLowerCase()} in ${config.location} — they resolved our issue in under an hour." Text customers a direct review link immediately after a positive interaction, while the experience is fresh.`,
    });
  }

  recs.push({
    priority: score.overall < 40 ? 'HIGH' : 'MEDIUM',
    title: 'Add AI-Readable Content to Your Website',
    text: `Add a dedicated page or section that clearly states: what you do, who you serve, and exactly where you are. Include a FAQ that answers questions like "best ${config.businessType.toLowerCase()} in ${config.location}". The goal is to give AI systems enough specific, well-sourced content to cite your business with confidence.`,
  });

  if (weakPlatforms.includes('ChatGPT')) {
    recs.push({
      priority: 'MEDIUM',
      title: 'Build Authority for ChatGPT Visibility',
      text: `ChatGPT relies primarily on pre-existing web content: Wikipedia mentions, press coverage, and links from high-authority websites. Focus on: getting mentioned in local news or industry publications, building backlinks from established local sites, and ensuring your business has detailed, factual entries on well-indexed directories such as Yell.com, FreeIndex, and Thomson Local.`,
    });
  }

  if (weakPlatforms.includes('Perplexity')) {
    recs.push({
      priority: 'MEDIUM',
      title: 'Optimise for Perplexity (Live Web Search)',
      text: `Perplexity searches the live web before responding — it is different from ChatGPT. Ensure your website loads quickly (under 2 seconds), add Schema.org LocalBusiness markup to your site code, and verify your business is indexed in Bing Webmaster Tools (Perplexity uses Bing's index). These steps directly affect how often Perplexity finds and cites you.`,
    });
  }

  recs.push({
    priority: 'MEDIUM',
    title: 'Get Listed on Key UK Directories',
    text: `Consistent listings on Yell.com, FreeIndex, Thomson Local${config.businessType.toLowerCase().includes('trade') ? ', Checkatrade' : ''}, and any industry-specific directories multiply the number of sources where AI can find information about you. Crucially: your business name, address, and phone number must be identical across every listing. Inconsistency reduces AI confidence in your data.`,
  });

  if (strongPlatforms.length > 0 && score.overall < 70) {
    recs.push({
      priority: 'MEDIUM',
      title: `Replicate Your ${strongPlatforms[0]} Success on Other Platforms`,
      text: `You are performing relatively well on ${strongPlatforms[0]}. Identify what content and signals are driving that visibility — likely a combination of directory listings, specific review language, and indexed content. Apply the same approach to the platforms where you are underperforming. Each platform weights signals slightly differently, but consistent, accurate web presence helps all of them.`,
    });
  }

  return recs.slice(0, 5);
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: DARK,
    color: TEXT_PRIMARY,
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 0,
  },

  pageStripe: {
    backgroundColor: '#0d0d0d',
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: 600,
  },
  brandDot: { color: GOLD },
  pageLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  content: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 64,
  },

  // Score hero
  scoreHero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
  },
  businessBlock: { flex: 1 },
  businessName: {
    fontSize: 20,
    color: TEXT_PRIMARY,
    fontWeight: 700,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  businessMeta: {
    fontSize: 8.5,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  reportDateLabel: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginTop: 8,
  },
  scoreBlock: { alignItems: 'flex-end' },
  scoreNumber: {
    fontSize: 68,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: -2,
  },
  scoreOutOf: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 2,
  },
  gradePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  gradeText: {
    fontSize: 10,
    color: DARK,
    fontWeight: 700,
    letterSpacing: 0.8,
  },

  // Score band visual
  scoreBandTrack: {
    flexDirection: 'row',
    marginBottom: 5,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  scoreBandSegment: { flex: 1, height: 6 },
  scoreBandLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  scoreBandLabelText: {
    fontSize: 6.5,
    color: TEXT_MUTED,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 11,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 700,
    color: GOLD,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 6.5,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    textAlign: 'center',
  },

  sectionLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Summary boxes
  summaryBox: {
    backgroundColor: SURFACE2,
    borderColor: BORDER_LIGHT,
    borderWidth: 1,
    borderLeftColor: GOLD,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 16,
  },
  summaryBandLabel: {
    fontSize: 8,
    fontWeight: 600,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    lineHeight: 1.65,
  },
  findingBox: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },

  // Priority list (page 1)
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 7,
  },
  priorityBullet: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  priorityBulletText: {
    fontSize: 7.5,
    color: DARK,
    fontWeight: 700,
  },
  priorityTitle: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 1.5,
  },

  // Platform cards
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  platformCard: {
    width: '48%',
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 14,
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  platformName: {
    fontSize: 9.5,
    color: TEXT_SECONDARY,
    fontWeight: 600,
  },
  platformScore: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: 5,
  },
  platformOutOf: {
    fontSize: 10,
  },
  platformDetail: {
    fontSize: 7.5,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  progressBarBg: {
    backgroundColor: BORDER,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
  },
  progressBarFill: {
    height: 3,
    borderRadius: 2,
  },

  // Competitors
  competitorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
  },
  competitorRank: {
    fontSize: 8,
    color: TEXT_MUTED,
    width: 18,
  },
  competitorName: {
    fontSize: 9.5,
    color: TEXT_PRIMARY,
    flex: 1,
    paddingLeft: 6,
  },
  competitorBarWrap: {
    width: 60,
    height: 3,
    backgroundColor: BORDER,
    borderRadius: 2,
    marginRight: 10,
  },
  competitorBarFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#3a3a3a',
  },
  competitorCount: {
    fontSize: 8,
    color: TEXT_MUTED,
    width: 55,
    textAlign: 'right',
  },

  // Recommendations
  recCard: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 13,
    marginBottom: 8,
  },
  recCardHigh: {
    backgroundColor: '#110f07',
    borderColor: '#332a0f',
    borderLeftColor: GOLD,
    borderLeftWidth: 3,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  recBadge: {
    fontSize: 5.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recTitle: {
    fontSize: 9.5,
    color: TEXT_PRIMARY,
    fontWeight: 600,
    flex: 1,
    lineHeight: 1.4,
  },
  recText: {
    fontSize: 8.5,
    color: TEXT_SECONDARY,
    lineHeight: 1.65,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#080808',
    borderTopColor: BORDER,
    borderTopWidth: 1,
    paddingHorizontal: 40,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerBrand: { fontSize: 7, color: '#2a2a2a' },
});

// ── Score Band Visual ────────────────────────────────────────
function ScoreBandVisual({ score }: { score: number }) {
  // 5 equal bands: 0-20, 20-40, 40-60, 60-80, 80-100
  const bands = [
    { low: 0,  high: 20, color: '#cc4444', dimColor: '#2a1010' },
    { low: 20, high: 40, color: '#cc8833', dimColor: '#2a1e0a' },
    { low: 40, high: 60, color: '#C9A84C', dimColor: '#1e1a07' },
    { low: 60, high: 80, color: '#4a9e6a', dimColor: '#0a1e0f' },
    { low: 80, high: 100, color: '#3a8a5a', dimColor: '#0a1e0f' },
  ];

  return (
    <View>
      <View style={styles.scoreBandTrack}>
        {bands.map((band, i) => {
          const isFilled = score >= band.high;
          const isActive = score >= band.low && score < band.high;
          return (
            <View
              key={i}
              style={[
                styles.scoreBandSegment,
                { backgroundColor: isFilled || isActive ? band.color : band.dimColor },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.scoreBandLabels}>
        {['Not Visible', 'Weak', 'Moderate', 'Strong', 'Excellent'].map(label => (
          <Text key={label} style={styles.scoreBandLabelText}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

// ── Main Document ────────────────────────────────────────────
interface ReportData {
  config: AuditConfig;
  score: AuditScore;
  reportDate: string;
}

function AuditReport({ config, score, reportDate }: ReportData) {
  const recommendations = getRecommendations(score, config);
  const highPriority = recommendations.filter(r => r.priority === 'HIGH');
  const mainColor = scoreColor(score.overall);
  const band = scoreBand(score.overall);
  const maxCompCount = score.topCompetitors[0]?.count || 1;

  return (
    <Document>

      {/* ═══════════════════════════════════ PAGE 1: OVERVIEW */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageStripe}>
          <Text style={styles.brandName}>
            presenzia<Text style={styles.brandDot}>.ai</Text>
          </Text>
          <Text style={styles.pageLabel}>AI Visibility Report</Text>
        </View>

        <View style={styles.content}>

          {/* Business + Score */}
          <View style={styles.scoreHero}>
            <View style={styles.businessBlock}>
              <Text style={styles.businessName}>{config.businessName}</Text>
              <Text style={styles.businessMeta}>{config.businessType}</Text>
              {config.location ? <Text style={styles.businessMeta}>{config.location}</Text> : null}
              {config.website ? <Text style={styles.businessMeta}>{config.website}</Text> : null}
              <Text style={styles.reportDateLabel}>Report date: {reportDate}</Text>
            </View>
            <View style={styles.scoreBlock}>
              <Text style={[styles.scoreNumber, { color: mainColor }]}>{score.overall}</Text>
              <Text style={styles.scoreOutOf}>out of 100</Text>
              <View style={[styles.gradePill, { backgroundColor: mainColor }]}>
                <Text style={styles.gradeText}>{band}  ·  Grade {score.grade}</Text>
              </View>
            </View>
          </View>

          {/* Score band */}
          <ScoreBandVisual score={score.overall} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{score.totalPrompts}</Text>
              <Text style={styles.statLabel}>Prompts tested</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: score.mentionedInCount > 0 ? GOLD : '#444' }]}>
                {score.mentionedInCount}
              </Text>
              <Text style={styles.statLabel}>Times you appeared</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{score.platforms.length}</Text>
              <Text style={styles.statLabel}>Platforms audited</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: score.topCompetitors.length > 0 ? '#cc6644' : GOLD }]}>
                {score.topCompetitors.length}
              </Text>
              <Text style={styles.statLabel}>Competitors found</Text>
            </View>
          </View>

          {/* What this score means */}
          <Text style={styles.sectionLabel}>What This Score Means</Text>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryBandLabel, { color: mainColor }]}>
              {band} — {scoreBandSubtitle(score.overall)}
            </Text>
            <Text style={styles.summaryText}>{scoreBandContext(score.overall)}</Text>
          </View>

          {/* Audit finding */}
          <Text style={styles.sectionLabel}>Audit Summary</Text>
          <View style={styles.findingBox}>
            <Text style={styles.summaryText}>{score.summary}</Text>
          </View>

          {/* Priority actions preview */}
          {highPriority.length > 0 && (
            <View>
              <Text style={styles.sectionLabel}>Your Priority Actions (full detail on page 2)</Text>
              {highPriority.map((rec, i) => (
                <View key={i} style={styles.priorityItem}>
                  <View style={[styles.priorityBullet, { backgroundColor: GOLD }]}>
                    <Text style={styles.priorityBulletText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.priorityTitle}>{rec.title}</Text>
                </View>
              ))}
            </View>
          )}

        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Confidential — prepared for {config.businessName} · {reportDate}</Text>
          <Text style={styles.footerBrand}>presenzia.ai · Ketzal LTD (Co. No. 14570156)</Text>
        </View>
      </Page>

      {/* ═══════════════════════════════════ PAGE 2: BREAKDOWN */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageStripe}>
          <Text style={styles.brandName}>
            presenzia<Text style={styles.brandDot}>.ai</Text>
          </Text>
          <Text style={styles.pageLabel}>Platform Breakdown &amp; Action Plan</Text>
        </View>

        <View style={styles.content}>

          {/* Platform breakdown */}
          <Text style={styles.sectionLabel}>Platform-by-Platform Breakdown</Text>
          <View style={styles.platformGrid}>
            {score.platforms.map((platform) => {
              const pColor = scoreColor(platform.score);
              const found = platform.score > 0;
              return (
                <View key={platform.platform} style={styles.platformCard}>
                  <View style={styles.platformHeader}>
                    <Text style={styles.platformName}>{platform.platform}</Text>
                    <Text style={{ fontSize: 6.5, color: found ? pColor : TEXT_MUTED, fontWeight: 600 }}>
                      {found ? '● FOUND' : '○ NOT FOUND'}
                    </Text>
                  </View>
                  <Text style={[styles.platformScore, { color: pColor }]}>
                    {platform.score}
                    <Text style={[styles.platformOutOf, { color: TEXT_MUTED }]}>/100</Text>
                  </Text>
                  <Text style={styles.platformDetail}>
                    Mentioned in {platform.promptsMentioned} of {platform.promptsTested} searches
                  </Text>
                  {platform.avgPosition !== null && (
                    <Text style={styles.platformDetail}>
                      Avg. position when found: #{Math.round(platform.avgPosition)}
                    </Text>
                  )}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${platform.score}%`, backgroundColor: pColor }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Competitors */}
          {score.topCompetitors.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionLabel}>Competitors Being Recommended Instead of You</Text>
              <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginBottom: 8 }}>
                These businesses appeared in AI responses where you were absent. Higher citation counts indicate stronger AI presence.
              </Text>
              {score.topCompetitors.slice(0, 6).map((comp, i) => (
                <View key={comp.name} style={styles.competitorRow}>
                  <Text style={styles.competitorRank}>#{i + 1}</Text>
                  <Text style={styles.competitorName}>{comp.name}</Text>
                  <View style={styles.competitorBarWrap}>
                    <View style={[
                      styles.competitorBarFill,
                      { width: `${Math.round((comp.count / maxCompCount) * 100)}%` },
                    ]} />
                  </View>
                  <Text style={styles.competitorCount}>
                    {comp.count} citation{comp.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Action plan */}
          <Text style={styles.sectionLabel}>Your Action Plan</Text>
          <Text style={{ fontSize: 7.5, color: TEXT_MUTED, marginBottom: 10 }}>
            Ordered by expected impact. Complete high-priority actions first — they have the greatest effect on your score.
          </Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={[styles.recCard, rec.priority === 'HIGH' ? styles.recCardHigh : {}]}>
              <View style={styles.recHeader}>
                <View style={[styles.recBadge, {
                  backgroundColor: rec.priority === 'HIGH' ? GOLD + '22' : BORDER,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                }]}>
                  <Text style={{ fontSize: 5.5, fontWeight: 700, color: rec.priority === 'HIGH' ? GOLD : '#666', letterSpacing: 0.8 }}>
                    {rec.priority === 'HIGH' ? 'HIGH PRIORITY' : 'RECOMMENDED'}
                  </Text>
                </View>
                <Text style={styles.recTitle}>{i + 1}. {rec.title}</Text>
              </View>
              <Text style={styles.recText}>{rec.text}</Text>
            </View>
          ))}

          {/* Next report */}
          <View style={{ marginTop: 12, padding: 12, backgroundColor: SURFACE2, borderColor: BORDER, borderWidth: 1 }}>
            <Text style={{ fontSize: 8, color: TEXT_MUTED, lineHeight: 1.5 }}>
              Questions about this report? Email hello@presenzia.ai — we typically reply within a few hours. Your next report will be generated automatically on your billing cycle.
            </Text>
          </View>

        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2026 presenzia.ai — hello@presenzia.ai</Text>
          <Text style={styles.footerBrand}>Confidential — for {config.businessName} only</Text>
        </View>
      </Page>

    </Document>
  );
}

export async function generatePDFReport(
  config: AuditConfig,
  score: AuditScore,
): Promise<Buffer> {
  const reportDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const doc = <AuditReport config={config} score={score} reportDate={reportDate} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
