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
import type { AuditScore, PromptResult } from '../audit/scorer';
import type { AuditConfig } from '../audit/runner';
import type { ReportInsights, CategoryBreakdown, DetailedAction, PromptTestResult } from './insights';

// Register fonts — use local TTF files (woff2 is not supported by @react-pdf/renderer)
Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf'), fontWeight: 700 },
  ],
});

// ── Colours ────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const DARK = '#111111';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F7F5';
const SURFACE2 = '#F0EFE9';
const BORDER = '#E0DDD5';
const BORDER_LIGHT = '#D5D2C8';
const TEXT_PRIMARY = '#111111';
const TEXT_SECONDARY = '#555555';
const TEXT_MUTED = '#888888';
const GREEN = '#4a9e6a';
const ORANGE = '#cc8833';
const RED = '#cc4444';

// ── Helpers ────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 70) return GREEN;
  if (score >= 45) return GOLD;
  if (score >= 25) return ORANGE;
  return RED;
}

function scoreBand(score: number): string {
  if (score >= 70) return 'STRONG';
  if (score >= 45) return 'MODERATE';
  if (score >= 25) return 'WEAK';
  return 'NOT VISIBLE';
}

function scoreBandSubtitle(score: number): string {
  if (score >= 70) return 'Leading your local market in AI';
  if (score >= 45) return 'Solid foundation, room to grow';
  if (score >= 25) return 'Significant improvement needed';
  return 'Immediate action required';
}

function scoreBandContext(score: number): string {
  if (score >= 70) return 'Your business is consistently recommended by AI assistants. You have strong visibility across the platforms that matter most to customers.';
  if (score >= 45) return 'Your business appears in some AI searches, but inconsistently. You are missing a significant share of potential recommendations to competitors.';
  if (score >= 25) return 'Your business has limited AI visibility. Competitors are being recommended in most searches where you should appear. The good news: this is fixable.';
  return 'Your business is not being recommended by AI assistants. Potential customers asking AI for options in your category are not finding you. They are finding your competitors instead.';
}

const PLATFORM_ORDER = ['ChatGPT', 'Google AI', 'Perplexity', 'Claude'];

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { backgroundColor: WHITE, color: TEXT_PRIMARY, fontFamily: 'Inter', fontSize: 10, padding: 0 },

  // Header stripe
  stripe: { backgroundColor: DARK, borderBottomColor: GOLD, borderBottomWidth: 2, paddingHorizontal: 40, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 14, color: '#F5F0E8', fontWeight: 600 },
  dot: { color: GOLD },
  pageLabel: { fontSize: 7.5, color: '#999999', letterSpacing: 1, textTransform: 'uppercase' },

  // Content area
  content: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 64 },

  // Score hero
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottomColor: BORDER, borderBottomWidth: 1 },
  bizBlock: { flex: 1 },
  bizName: { fontSize: 20, color: TEXT_PRIMARY, fontWeight: 700, marginBottom: 4, lineHeight: 1.2 },
  bizMeta: { fontSize: 8.5, color: TEXT_SECONDARY, marginBottom: 2 },
  dateLabel: { fontSize: 7.5, color: TEXT_MUTED, marginTop: 8 },
  scoreBlock: { alignItems: 'flex-end' },
  scoreNum: { fontSize: 68, fontWeight: 700, lineHeight: 1, letterSpacing: -2 },
  scoreOf: { fontSize: 9, color: TEXT_SECONDARY, textAlign: 'right', marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, marginTop: 8, alignSelf: 'flex-end' },
  pillTxt: { fontSize: 10, color: WHITE, fontWeight: 700, letterSpacing: 0.8 },

  // Score band
  bandTrack: { flexDirection: 'row', marginBottom: 5, height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 },
  bandSeg: { flex: 1, height: 6 },
  bandLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  bandLblTxt: { fontSize: 6.5, color: TEXT_MUTED },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: SURFACE, borderColor: BORDER, borderWidth: 1, padding: 11, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 4 },
  statLbl: { fontSize: 6.5, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.7, textAlign: 'center' },

  // Section labels
  secLabel: { fontSize: 7, color: GOLD, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  secSub: { fontSize: 7.5, color: TEXT_MUTED, marginBottom: 10 },

  // Boxes
  goldBox: { backgroundColor: SURFACE2, borderColor: BORDER_LIGHT, borderWidth: 1, borderLeftColor: GOLD, borderLeftWidth: 3, padding: 14, marginBottom: 16 },
  grayBox: { backgroundColor: SURFACE, borderColor: BORDER, borderWidth: 1, padding: 14, marginBottom: 16 },

  summaryBandLbl: { fontSize: 8, fontWeight: 600, marginBottom: 4 },
  bodyText: { fontSize: 9, color: TEXT_SECONDARY, lineHeight: 1.65 },
  bodySmall: { fontSize: 8, color: TEXT_SECONDARY, lineHeight: 1.6 },

  // Priority list
  prioItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  prioBullet: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  prioBulletTxt: { fontSize: 7.5, color: WHITE, fontWeight: 700 },
  prioTitle: { fontSize: 9, color: TEXT_PRIMARY, flex: 1, lineHeight: 1.5 },

  // Platform cards
  platGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  platCard: { width: '48%', backgroundColor: SURFACE, borderColor: BORDER, borderWidth: 1, padding: 12 },
  platHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  platName: { fontSize: 9.5, color: TEXT_SECONDARY, fontWeight: 600 },
  platScore: { fontSize: 30, fontWeight: 700, lineHeight: 1, marginBottom: 5 },
  platOf: { fontSize: 10 },
  platDetail: { fontSize: 7.5, color: TEXT_SECONDARY, marginBottom: 2 },
  barBg: { backgroundColor: BORDER, height: 3, borderRadius: 2, marginTop: 8 },
  barFill: { height: 3, borderRadius: 2 },

  // Competitors
  compRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomColor: BORDER, borderBottomWidth: 1 },
  compRank: { fontSize: 8, color: TEXT_MUTED, width: 18 },
  compName: { fontSize: 9.5, color: TEXT_PRIMARY, flex: 1, paddingLeft: 6 },
  compBarWrap: { width: 60, height: 3, backgroundColor: BORDER, borderRadius: 2, marginRight: 10 },
  compBarFill: { height: 3, borderRadius: 2, backgroundColor: '#BBBBBB' },
  compCount: { fontSize: 8, color: TEXT_MUTED, width: 55, textAlign: 'right' },

  // ── Page 3: Search Results ──────────────────
  catBlock: { marginBottom: 14 },
  catHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 5 },
  catLabel: { fontSize: 7.5, color: TEXT_PRIMARY, fontWeight: 600 },
  catStat: { fontSize: 7, color: TEXT_MUTED },
  promptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2.5, paddingLeft: 4 },
  promptTxt: { flex: 1, fontSize: 7, color: TEXT_SECONDARY },
  platCol: { width: 52, alignItems: 'center' },
  platColHdr: { fontSize: 6, color: TEXT_MUTED, fontWeight: 600, letterSpacing: 0.5 },
  dotFound: { fontSize: 7, color: GREEN },
  dotMissing: { fontSize: 7, color: '#DDDDDD' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: SURFACE, borderColor: BORDER, borderWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { fontSize: 7 },
  legendText: { fontSize: 6.5, color: TEXT_MUTED },

  // ── Page 4: Action plan ─────────────────────
  actCard: { padding: 11, marginBottom: 7, backgroundColor: SURFACE, borderColor: BORDER, borderWidth: 1 },
  actCardHigh: { backgroundColor: '#FFFCF0', borderColor: '#E8DFC0', borderLeftColor: GOLD, borderLeftWidth: 3 },
  actHdr: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 8 },
  actBadge: { paddingHorizontal: 5, paddingVertical: 2 },
  actBadgeTxt: { fontSize: 5.5, fontWeight: 700, letterSpacing: 0.8 },
  actTitle: { fontSize: 9, color: TEXT_PRIMARY, fontWeight: 600, flex: 1, lineHeight: 1.4 },
  actWhy: { fontSize: 7.5, color: TEXT_MUTED, marginBottom: 6, lineHeight: 1.4 },
  stepRow: { flexDirection: 'row', marginBottom: 3, paddingLeft: 2 },
  stepBullet: { width: 10, fontSize: 7.5, color: GOLD, fontWeight: 700 },
  stepText: { flex: 1, fontSize: 7.5, color: TEXT_SECONDARY, lineHeight: 1.5 },

  // ── Page 5: About / Disclaimers ─────────────
  noteRow: { flexDirection: 'row', marginBottom: 5, paddingLeft: 2 },
  noteBullet: { width: 8, fontSize: 7, color: GOLD },
  noteTitle: { fontSize: 7.5, fontWeight: 600, color: TEXT_PRIMARY },
  noteText: { fontSize: 7, color: TEXT_SECONDARY, lineHeight: 1.5 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ctaLabel: { fontSize: 7.5, color: GOLD, fontWeight: 600, width: 55 },
  ctaValue: { fontSize: 7.5, color: TEXT_SECONDARY },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: SURFACE, borderTopColor: BORDER, borderTopWidth: 1, paddingHorizontal: 40, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  footerBrand: { fontSize: 7, color: '#BBBBBB' },
});

// ── Score Band Visual ────────────────────────────────────────
function ScoreBandVisual({ score }: { score: number }) {
  const bands = [
    { low: 0,  high: 20, color: RED,   dim: '#F0E0E0' },
    { low: 20, high: 40, color: ORANGE, dim: '#F0E8DD' },
    { low: 40, high: 60, color: GOLD,   dim: '#F0EBD8' },
    { low: 60, high: 80, color: GREEN,  dim: '#DEF0E4' },
    { low: 80, high: 100, color: '#3a8a5a', dim: '#DEF0E4' },
  ];
  return (
    <View>
      <View style={s.bandTrack}>
        {bands.map((b, i) => (
          <View key={i} style={[s.bandSeg, { backgroundColor: score >= b.low ? b.color : b.dim }]} />
        ))}
      </View>
      <View style={s.bandLabels}>
        {['Not Visible', 'Weak', 'Moderate', 'Strong', 'Excellent'].map(l => (
          <Text key={l} style={s.bandLblTxt}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

// ── Page Header (reusable) ───────────────────────────────────
function Header({ label, businessName, reportDate }: { label: string; businessName?: string; reportDate?: string }) {
  return (
    <View style={s.stripe} fixed>
      <View>
        <Text style={s.brand}>presenzia<Text style={s.dot}>.ai</Text></Text>
        {businessName && (
          <Text style={{ fontSize: 6.5, color: '#888888', marginTop: 2 }}>
            {businessName}{reportDate ? `  ·  ${reportDate}` : ''}
          </Text>
        )}
      </View>
      <Text style={s.pageLabel}>{label}</Text>
    </View>
  );
}

// ── Page Footer (reusable) ───────────────────────────────────
function Footer({ left }: { left: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{left}</Text>
      <Text style={s.footerBrand} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}  ·  presenzia.ai`} />
    </View>
  );
}

// ── Prompt Result Row ────────────────────────────────────────
function PromptResultRow({ prompt }: { prompt: PromptTestResult }) {
  return (
    <View style={s.promptRow}>
      <Text style={s.promptTxt}>{prompt.promptText}</Text>
      {PLATFORM_ORDER.map(pName => {
        const p = prompt.platforms.find(pl => pl.name === pName);
        const found = p?.found ?? false;
        const pos = p?.position;
        return (
          <View key={pName} style={s.platCol}>
            <Text style={found ? s.dotFound : s.dotMissing}>
              {found ? (pos ? `#${pos}` : '●') : '—'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Action Card with Steps ───────────────────────────────────
function ActionCard({ action, index }: { action: DetailedAction; index: number }) {
  const isHigh = action.priority === 'HIGH';
  return (
    <View wrap={false} style={[s.actCard, isHigh ? s.actCardHigh : {}]}>
      <View style={s.actHdr}>
        <View style={[s.actBadge, { backgroundColor: isHigh ? GOLD + '22' : BORDER }]}>
          <Text style={[s.actBadgeTxt, { color: isHigh ? GOLD : '#888' }]}>
            {isHigh ? 'HIGH PRIORITY' : 'RECOMMENDED'}
          </Text>
        </View>
        <Text style={s.actTitle}>{index + 1}. {action.title}</Text>
      </View>
      {action.context && (
        <Text style={{ fontSize: 7.5, color: TEXT_PRIMARY, marginBottom: 4, lineHeight: 1.5, fontWeight: 600 }}>{action.context}</Text>
      )}
      <Text style={s.actWhy}>{action.why}</Text>
      {action.steps.map((step, i) => (
        <View key={i} style={s.stepRow}>
          <Text style={s.stepBullet}>›</Text>
          <Text style={s.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Fallback recommendations (when insights not provided) ────
function getFallbackActions(score: AuditScore, config: AuditConfig): DetailedAction[] {
  const actions: DetailedAction[] = [];
  if (score.overall < 55) {
    actions.push({
      priority: 'HIGH', phase: 1, timeline: 'This week',
      title: 'Complete Your Google Business Profile',
      why: 'Google Business Profile data directly feeds into Google AI and influences all platforms.',
      steps: [
        `Verify or claim your listing at business.google.com`,
        `Add a detailed business description mentioning "${config.businessType} in ${config.location}"`,
        'Upload 10+ high-quality photos of your products and storefront',
        'Set accurate opening hours for all 7 days',
        'Respond to every existing Google review within 48 hours',
      ],
    });
  }
  if (score.overall < 65) {
    actions.push({
      priority: 'HIGH', phase: 2, timeline: 'Weeks 2–4',
      title: 'Build Targeted Review Volume',
      why: 'Specific, location-rich reviews carry significantly more weight with AI than generic ratings.',
      steps: [
        `Ask satisfied customers to mention "${config.businessType.toLowerCase()} in ${config.location}" in reviews`,
        'Text or email a direct Google review link immediately after a positive interaction',
        'Aim for 5-10 new reviews per month across Google and key review sites',
        'Respond to every review. This signals active business presence to AI.',
      ],
    });
  }
  actions.push({
    priority: score.overall < 40 ? 'HIGH' : 'MEDIUM',
    phase: 2, timeline: 'Weeks 2–4',
    title: 'Add AI-Optimised Content to Your Website',
    why: 'AI platforms cite websites that provide clear, factual, well-structured information.',
    steps: [
      'Add a dedicated About page stating what you do, where you are, and who you serve',
      `Create a FAQ answering queries like "best ${config.businessType.toLowerCase()} in ${config.location}"`,
      'Add Schema.org LocalBusiness structured data markup (JSON-LD)',
      'Ensure your address and phone are in plain text, not images',
    ],
  });
  return actions.slice(0, 5);
}

// ── Main Document ────────────────────────────────────────────
interface ReportData {
  config: AuditConfig;
  score: AuditScore;
  insights?: ReportInsights;
  reportDate: string;
}

function AuditReport({ config, score, insights, reportDate }: ReportData) {
  const actions = insights?.actions ?? getFallbackActions(score, config);
  const highPriority = actions.filter(a => a.priority === 'HIGH');
  const mainColor = scoreColor(score.overall);
  const band = scoreBand(score.overall);
  const maxCompCount = score.topCompetitors[0]?.count || 1;
  const hasInsights = !!insights;
  const actionPageNum = hasInsights ? 4 : 3;

  return (
    <Document>

      {/* ═══════════════════════ PAGE 1: YOUR AI VISIBILITY SCORE */}
      <Page size="A4" style={s.page}>
        <Header label="AI Visibility Report" businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          {/* Business + Score */}
          <View style={s.heroRow}>
            <View style={s.bizBlock}>
              <Text style={s.bizName}>{config.businessName}</Text>
              <Text style={s.bizMeta}>{config.businessType}</Text>
              {config.location ? <Text style={s.bizMeta}>{config.location}</Text> : null}
              {config.website ? <Text style={s.bizMeta}>{config.website}</Text> : null}
              <Text style={s.dateLabel}>Report date: {reportDate}</Text>
            </View>
            <View style={s.scoreBlock}>
              <Text style={[s.scoreNum, { color: mainColor }]}>{score.overall}</Text>
              <Text style={s.scoreOf}>out of 100</Text>
              <View style={[s.pill, { backgroundColor: mainColor }]}>
                <Text style={s.pillTxt}>{band}  ·  Grade {score.grade}</Text>
              </View>
            </View>
          </View>

          <ScoreBandVisual score={score.overall} />

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statNum}>{score.totalPrompts}</Text>
              <Text style={s.statLbl}>Searches tested</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: score.mentionedInCount > 0 ? GOLD : '#CCCCCC' }]}>
                {score.mentionedInCount}
              </Text>
              <Text style={s.statLbl}>Times you appeared</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statNum}>{score.platforms.length}</Text>
              <Text style={s.statLbl}>Platforms audited</Text>
            </View>
            <View style={s.stat}>
              <Text style={[s.statNum, { color: score.topCompetitors.length > 0 ? '#cc6644' : GOLD }]}>
                {score.topCompetitors.length}
              </Text>
              <Text style={s.statLbl}>Competitors found</Text>
            </View>
          </View>

          {/* What this score means */}
          <Text style={s.secLabel}>What This Score Means</Text>
          <View style={s.goldBox}>
            <Text style={[s.summaryBandLbl, { color: mainColor }]}>
              {band}  ·  {scoreBandSubtitle(score.overall)}
            </Text>
            <Text style={s.bodyText}>{scoreBandContext(score.overall)}</Text>
          </View>

          {/* Audit summary */}
          <Text style={s.secLabel}>Audit Summary</Text>
          <View style={s.grayBox}>
            <Text style={s.bodyText}>{score.summary}</Text>
          </View>

          {/* Priority actions preview */}
          {highPriority.length > 0 && (
            <View>
              <Text style={s.secLabel}>Your Priority Actions (detail on page {actionPageNum})</Text>
              {highPriority.slice(0, 4).map((act, i) => (
                <View key={i} style={s.prioItem}>
                  <View style={[s.prioBullet, { backgroundColor: GOLD }]}>
                    <Text style={s.prioBulletTxt}>{i + 1}</Text>
                  </View>
                  <Text style={s.prioTitle}>{act.title}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
        <Footer left="Ketzal LTD (Co. No. 14570156)" />
      </Page>

      {/* ═══════════════════════ PAGE 2: PLATFORM BREAKDOWN */}
      <Page size="A4" style={s.page}>
        <Header label="Platform Breakdown" businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          <Text style={s.secLabel}>Platform-by-Platform Breakdown</Text>
          <Text style={s.secSub}>
            How your business performs on each major AI search platform. Scores are based on mention frequency and ranking position.
          </Text>

          <View style={s.platGrid}>
            {score.platforms.map(platform => {
              const pColor = scoreColor(platform.score);
              const found = platform.score > 0;
              return (
                <View key={platform.platform} style={s.platCard}>
                  <View style={s.platHdr}>
                    <Text style={s.platName}>{platform.platform}</Text>
                    <Text style={{ fontSize: 6.5, color: found ? pColor : TEXT_MUTED, fontWeight: 600 }}>
                      {found ? '● FOUND' : '○ NOT FOUND'}
                    </Text>
                  </View>
                  <Text style={[s.platScore, { color: pColor }]}>
                    {platform.score}<Text style={[s.platOf, { color: TEXT_MUTED }]}>/100</Text>
                  </Text>
                  <Text style={s.platDetail}>
                    Mentioned in {platform.promptsMentioned} of {platform.promptsTested} searches
                  </Text>
                  {platform.avgPosition !== null && (
                    <Text style={s.platDetail}>
                      Avg. position when found: #{Math.round(platform.avgPosition)}
                    </Text>
                  )}
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${platform.score}%`, backgroundColor: pColor }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Competitors */}
          {score.topCompetitors.length > 0 && (
            <View style={{ marginBottom: 14 }}>
              <Text style={s.secLabel}>Competitors Being Recommended Instead of You</Text>
              <Text style={s.secSub}>
                These businesses appeared in AI responses where you were absent. Higher counts indicate stronger AI presence.
              </Text>
              {score.topCompetitors.slice(0, 8).map((comp, i) => (
                <View key={comp.name} style={s.compRow}>
                  <Text style={s.compRank}>#{i + 1}</Text>
                  <Text style={s.compName}>{comp.name}</Text>
                  <View style={s.compBarWrap}>
                    <View style={[s.compBarFill, { width: `${Math.round((comp.count / maxCompCount) * 100)}%` }]} />
                  </View>
                  <Text style={s.compCount}>{comp.count} citation{comp.count !== 1 ? 's' : ''}</Text>
                </View>
              ))}
              <Text style={{ fontSize: 6.5, color: TEXT_MUTED, marginTop: 6, lineHeight: 1.5 }}>
                Note: Competitor data is sourced directly from AI responses. Some businesses shown may have changed status or closed. This report reflects what AI currently tells potential customers, not verified trading status.
              </Text>
            </View>
          )}

          {/* Platform insight box */}
          <View style={s.goldBox}>
            <Text style={{ fontSize: 8, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>Why platform differences matter</Text>
            <Text style={s.bodySmall}>
              Each AI platform sources information differently. ChatGPT uses training data and web browsing; Perplexity searches the live web; Google AI draws from Google's index; Claude uses training knowledge. A consistent presence across all four means you get recommended regardless of which AI a customer uses.
            </Text>
          </View>

        </View>
        <Footer left="Ketzal LTD (Co. No. 14570156)" />
      </Page>

      {/* ═══════════════════════ PAGE 3: WHAT WE SEARCHED (only with insights) */}
      {hasInsights && (
        <Page size="A4" style={s.page}>
          <Header label="What We Searched" businessName={config.businessName} reportDate={reportDate} />
          <View style={s.content}>

            <Text style={s.secLabel}>Search Prompts Tested</Text>
            <Text style={s.secSub}>
              We tested {insights!.totalSearches} searches across {score.platforms.length} AI platforms, simulating how real customers look for {config.businessType.toLowerCase()} businesses in {config.location}. You appeared in {insights!.totalFound} of these ({Math.round((insights!.totalFound / Math.max(insights!.totalSearches, 1)) * 100)}%).
            </Text>

            {/* Legend */}
            <View style={s.legendRow}>
              <View style={s.legendItem}>
                <Text style={[s.legendDot, { color: GREEN }]}>#N</Text>
                <Text style={s.legendText}>= Found at position N</Text>
              </View>
              <View style={s.legendItem}>
                <Text style={[s.legendDot, { color: '#DDDDDD' }]}>—</Text>
                <Text style={s.legendText}>= Not found</Text>
              </View>
              <View style={{ flex: 1 }} />
              {PLATFORM_ORDER.map(p => (
                <View key={p} style={s.platCol}>
                  <Text style={s.platColHdr}>{p === 'Google AI' ? 'Google' : p}</Text>
                </View>
              ))}
            </View>

            {/* Category breakdowns */}
            {insights!.categories.map(cat => {
              const pct = cat.totalSearches > 0 ? Math.round((cat.timesFound / cat.totalSearches) * 100) : 0;
              return (
                <View key={cat.category} style={s.catBlock}>
                  <View style={s.catHdr}>
                    <Text style={s.catLabel}>{cat.label}</Text>
                    <Text style={s.catStat}>Found in {cat.timesFound} of {cat.totalSearches} ({pct}%)</Text>
                  </View>
                  {cat.examples.map((ex, i) => (
                    <PromptResultRow key={i} prompt={ex} />
                  ))}
                </View>
              );
            })}

            {/* Summary */}
            <View style={[s.grayBox, { marginTop: 4 }]}>
              <Text style={s.bodySmall}>
                Your strongest category is where you appear most frequently. Focus your efforts on the categories and platforms where you are currently absent to maximise improvement.
              </Text>
            </View>

          </View>
          <Footer left="Ketzal LTD (Co. No. 14570156)" />
        </Page>
      )}

      {/* ═══════════════════════ PAGE 4+: YOUR ACTION PLAN (auto-overflows) */}
      <Page size="A4" style={s.page}>
        <Header label="Your Action Plan" businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          <Text style={s.secLabel}>Your Action Plan</Text>
          <Text style={s.secSub}>
            Ordered by priority. Complete Phase 1 first for the fastest improvement to your score.
          </Text>

          {/* Phase 1: Immediate */}
          {actions.filter(a => a.phase === 1).length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: RED, letterSpacing: 1 }}>PHASE 1: IMMEDIATE</Text>
                <Text style={{ fontSize: 7, color: TEXT_MUTED, marginLeft: 'auto' }}>This week</Text>
              </View>
              {actions.filter(a => a.phase === 1).map((action, i) => (
                <ActionCard key={`p1-${i}`} action={action} index={i} />
              ))}
            </View>
          )}

          {/* Phase 2: Short-term */}
          {actions.filter(a => a.phase === 2).length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>PHASE 2: SHORT TERM</Text>
                <Text style={{ fontSize: 7, color: TEXT_MUTED, marginLeft: 'auto' }}>Weeks 2–4</Text>
              </View>
              {actions.filter(a => a.phase === 2).map((action, i) => (
                <ActionCard key={`p2-${i}`} action={action} index={i} />
              ))}
            </View>
          )}

          {/* Phase 3: Ongoing */}
          {actions.filter(a => a.phase === 3).length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: TEXT_MUTED, letterSpacing: 1 }}>PHASE 3: ONGOING</Text>
                <Text style={{ fontSize: 7, color: TEXT_MUTED, marginLeft: 'auto' }}>Month 2+</Text>
              </View>
              {actions.filter(a => a.phase === 3).map((action, i) => (
                <ActionCard key={`p3-${i}`} action={action} index={i} />
              ))}
            </View>
          )}

        </View>
        <Footer left="Ketzal LTD (Co. No. 14570156)" />
      </Page>

      {/* ═══════════════════════ FINAL PAGE: ABOUT · DISCLAIMERS · NEXT STEPS */}
      <Page size="A4" style={s.page}>
        <Header label="About This Report" businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          {/* Methodology */}
          <Text style={s.secLabel}>How We Test</Text>
          <View style={s.goldBox}>
            <Text style={s.bodySmall}>
              This report was generated by querying {score.platforms.length} major AI platforms (ChatGPT, Google AI, Perplexity, and Claude) with {Math.round(score.totalPrompts / score.platforms.length)} realistic search prompts, the same questions real customers ask when looking for a {config.businessType.toLowerCase()} in {config.location}. All tests were conducted in fresh sessions with no browsing history, preferences, or prior context, representing a neutral baseline.
            </Text>
          </View>

          {/* Disclaimers */}
          <Text style={s.secLabel}>Important Notes</Text>
          <View style={{ marginBottom: 14 }}>
            <View style={s.noteRow}>
              <Text style={s.noteBullet}>›</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>Results vary by user</Text>
                <Text style={s.noteText}>
                  Every person gets slightly different AI responses depending on their search history, location, and conversation context. This report represents a neutral baseline tested without any personalisation. Your customers may see different results.
                </Text>
              </View>
            </View>
            <View style={s.noteRow}>
              <Text style={s.noteBullet}>›</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>AI data may not be fully current</Text>
                <Text style={s.noteText}>
                  AI platforms draw from training data and web sources that may not reflect very recent changes. Competitors and details shown are what AI currently recommends. Some businesses may have changed status, moved, or closed since AI last indexed them. This is valuable because it shows you exactly what potential customers are being told right now.
                </Text>
              </View>
            </View>
            <View style={s.noteRow}>
              <Text style={s.noteBullet}>›</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>No guaranteed outcomes</Text>
                <Text style={s.noteText}>
                  Implementing these recommendations is expected to improve your visibility over time, but specific results cannot be guaranteed. AI ranking factors are complex and constantly evolving.
                </Text>
              </View>
            </View>
            <View style={s.noteRow}>
              <Text style={s.noteBullet}>›</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.noteTitle}>Point-in-time snapshot</Text>
                <Text style={s.noteText}>
                  This captures your visibility at the time of testing. Your monthly reports track changes over time so you can measure the impact of your actions.
                </Text>
              </View>
            </View>
          </View>

          {/* Next Report */}
          <View style={s.goldBox}>
            <Text style={{ fontSize: 8.5, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>Your Next Report</Text>
            <Text style={s.bodySmall}>
              Your next AI visibility report will be generated automatically on your billing cycle. Continue implementing the actions above and track your improvement month over month. Each report compares your progress so you can see exactly what is working.
            </Text>
          </View>

          {/* Upsell */}
          <View style={{ marginTop: 4, padding: 14, backgroundColor: DARK, borderColor: GOLD, borderWidth: 1 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: GOLD, marginBottom: 5 }}>Don't want to wait another month for your next report?</Text>
            <Text style={{ fontSize: 8, color: '#CCCCCC', lineHeight: 1.6, marginBottom: 6 }}>
              Upgrade to Growth and get weekly reports instead of monthly, so you can see the impact of every change in near real time. Plus a live dashboard with trend analysis, competitor monitoring, and priority email support.
            </Text>
            <Text style={{ fontSize: 7.5, color: '#AAAAAA', lineHeight: 1.5, marginBottom: 8 }}>
              Still within your first 30 days? You only pay the difference. No double-charging.
            </Text>
            <Text style={{ fontSize: 7.5, color: GOLD, fontWeight: 600 }}>
              Upgrade at presenzia.ai/dashboard, or reply to your report email and we will set it up for you.
            </Text>
          </View>

          {/* CTA */}
          <View style={[s.grayBox, { marginTop: 6 }]}>
            <Text style={{ fontSize: 8.5, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 6 }}>Found this report valuable?</Text>
            <View style={s.ctaRow}>
              <Text style={s.ctaLabel}>Review us</Text>
              <Text style={s.ctaValue}>trustpilot.com/review/presenzia.ai</Text>
            </View>
            <View style={s.ctaRow}>
              <Text style={s.ctaLabel}>Follow us</Text>
              <Text style={s.ctaValue}>linkedin.com/company/presenzia</Text>
            </View>
            <View style={s.ctaRow}>
              <Text style={s.ctaLabel}>Questions?</Text>
              <Text style={s.ctaValue}>hello@presenzia.ai (we typically reply within a few hours)</Text>
            </View>
          </View>

        </View>
        <Footer left="© 2026 presenzia.ai · hello@presenzia.ai" />
      </Page>

    </Document>
  );
}

// ── Export ────────────────────────────────────────────────────
export async function generatePDFReport(
  config: AuditConfig,
  score: AuditScore,
  results?: PromptResult[],
  insights?: ReportInsights,
): Promise<Buffer> {
  const reportDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const doc = <AuditReport config={config} score={score} insights={insights} reportDate={reportDate} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
