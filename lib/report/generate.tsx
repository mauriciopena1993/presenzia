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

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

const GOLD = '#C9A84C';
const DARK = '#0A0A0A';
const SURFACE = '#111111';
const BORDER = '#222222';
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_SECONDARY = '#AAAAAA';

const styles = StyleSheet.create({
  page: {
    backgroundColor: DARK,
    color: TEXT_PRIMARY,
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
  },
  brandName: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: 600,
  },
  brandDot: {
    color: GOLD,
  },
  reportTitle: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  reportMeta: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreNumber: {
    fontSize: 48,
    color: GOLD,
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  gradeContainer: {
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  gradeText: {
    fontSize: 14,
    color: DARK,
    fontWeight: 700,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: 600,
    marginBottom: 8,
  },

  // Summary box
  summaryBox: {
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
  },

  // Platform grid
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  platformCard: {
    width: '48%',
    backgroundColor: SURFACE,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 14,
  },
  platformName: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    fontWeight: 600,
    marginBottom: 6,
  },
  platformScore: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6,
  },
  platformMeta: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginBottom: 4,
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
  foundBadge: {
    fontSize: 7,
    color: GOLD,
    letterSpacing: 0.5,
  },
  notFoundBadge: {
    fontSize: 7,
    color: '#555555',
    letterSpacing: 0.5,
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
  competitorName: {
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  competitorCount: {
    fontSize: 9,
    color: TEXT_SECONDARY,
  },

  // Recommendations
  recBox: {
    backgroundColor: '#111107',
    borderColor: '#3a2e0f',
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    fontWeight: 600,
  },
  recText: {
    fontSize: 9.5,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopColor: BORDER,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 8,
    color: '#444444',
  },
});

function getRecommendations(score: AuditScore, config: AuditConfig): string[] {
  const recs: string[] = [];

  if (score.overall < 30) {
    recs.push(
      `Create a dedicated page on your website for "${config.businessType} in ${config.location}" with clear, descriptive content that AI systems can easily parse and cite.`
    );
    recs.push(
      `Add a FAQ section answering "best ${config.businessType} in ${config.location}" — this is the primary prompt pattern where AI systems look for citations.`
    );
    recs.push(
      'Claim and fully complete your Google Business Profile, Yelp, and any relevant industry directories. AI systems use these as data sources.'
    );
  }

  if (score.overall < 60) {
    recs.push(
      `Your competitors (${score.topCompetitors.slice(0, 2).map(c => c.name).join(', ')}) are being cited more frequently. Analyse their web presence to understand why AI systems prefer them.`
    );
    recs.push(
      'Publish regular content (blog posts, case studies, testimonials) that uses natural language around your target keywords — AI systems favour frequently cited sources.'
    );
  }

  // Platform-specific recommendations
  const weakPlatforms = score.platforms
    .filter(p => p.score < 30)
    .map(p => p.platform);

  if (weakPlatforms.includes('ChatGPT')) {
    recs.push(
      'To improve ChatGPT visibility: focus on Wikipedia mentions, press coverage, and high-authority backlinks. ChatGPT relies heavily on pre-training data from these sources.'
    );
  }

  if (weakPlatforms.includes('Perplexity')) {
    recs.push(
      'To improve Perplexity visibility: Perplexity cites live web sources. Ensure your website loads quickly, has clear structured data (Schema.org), and is indexed by Bing.'
    );
  }

  if (recs.length === 0) {
    recs.push(
      'Maintain your content strategy. Continue publishing locally-focused content and keep your business listings up to date across all major directories.'
    );
    recs.push(
      'Monitor your competitors\' AI presence monthly to stay ahead of any changes in the AI visibility landscape.'
    );
  }

  return recs.slice(0, 4);
}

interface ReportData {
  config: AuditConfig;
  score: AuditScore;
  reportDate: string;
}

function AuditReport({ config, score, reportDate }: ReportData) {
  const recommendations = getRecommendations(score, config);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>
              presenzia<Text style={styles.brandDot}>.ai</Text>
            </Text>
            <Text style={styles.reportTitle}>AI Visibility Report</Text>
            <Text style={styles.reportMeta}>{config.businessName} · {reportDate}</Text>
            <Text style={styles.reportMeta}>{config.location} · {config.businessType}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>{score.overall}</Text>
            <Text style={styles.scoreLabel}>/ 100 VISIBILITY SCORE</Text>
            <View style={styles.gradeContainer}>
              <Text style={styles.gradeText}>Grade {score.grade}</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Executive Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{score.summary}</Text>
          </View>
        </View>

        {/* Platform Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Platform Breakdown</Text>
          <View style={styles.platformGrid}>
            {score.platforms.map((platform) => (
              <View key={platform.platform} style={styles.platformCard}>
                <Text style={styles.platformName}>{platform.platform}</Text>
                <Text style={[styles.platformScore, { color: platform.score > 40 ? GOLD : '#666666' }]}>
                  {platform.score}%
                </Text>
                <Text style={platform.score > 0 ? styles.foundBadge : styles.notFoundBadge}>
                  {platform.score > 0 ? '● FOUND' : '○ NOT FOUND'}
                </Text>
                <Text style={styles.platformMeta}>
                  {platform.promptsMentioned}/{platform.promptsTested} prompts matched
                </Text>
                <View style={styles.progressBarBg}>
                  <View style={[
                    styles.progressBarFill,
                    {
                      width: `${platform.score}%`,
                      backgroundColor: platform.score > 40 ? GOLD : '#333333',
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Competitors */}
        {score.topCompetitors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Competitors Being Cited Instead of You</Text>
            {score.topCompetitors.slice(0, 5).map((comp, i) => (
              <View key={comp.name} style={styles.competitorRow}>
                <Text style={styles.competitorName}>{i + 1}. {comp.name}</Text>
                <Text style={styles.competitorCount}>Cited {comp.count} times</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recommendations</Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={styles.recBox}>
              <Text style={styles.recTitle}>Action {i + 1}</Text>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© 2026 presenzia.ai — Ketzal LTD (Co. No. 14570156)</Text>
          <Text style={styles.footerText}>Confidential — prepared for {config.businessName}</Text>
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
