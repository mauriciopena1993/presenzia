import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
  Link,
} from '@react-pdf/renderer';
import type { AuditScore, PromptResult } from '../audit/scorer';
import type { AuditConfig } from '../audit/runner';
import type { ReportInsights, CategoryBreakdown, DetailedAction, PromptTestResult, ActionStep } from './insights';

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
  stripe: { backgroundColor: DARK, borderBottomColor: GOLD, borderBottomWidth: 2, paddingHorizontal: 40, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 12, color: '#F5F0E8', fontWeight: 600 },
  dot: { color: GOLD },
  bizHeaderName: { fontSize: 8.5, color: '#AAAAAA', fontWeight: 400, textAlign: 'right' },
  // pageLabel removed — no subtitle in banner

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
  secTitle: { fontSize: 12, color: TEXT_PRIMARY, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 },
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
  catBlock: { marginBottom: 6 },
  catHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 3, marginBottom: 4 },
  catLabel: { fontSize: 8.5, color: TEXT_PRIMARY, fontWeight: 600 },
  catStat: { fontSize: 7.5, color: TEXT_MUTED },
  promptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2.5, paddingHorizontal: 4 },
  promptRowAlt: { backgroundColor: '#FAFAF8' },
  promptTxt: { flex: 1, fontSize: 8, color: TEXT_SECONDARY },
  platCol: { width: 54, alignItems: 'center', justifyContent: 'center' },
  platColHdr: { fontSize: 7.5, color: TEXT_PRIMARY, fontWeight: 700, letterSpacing: 0.5, textAlign: 'center' },
  dotFound: { fontSize: 8, color: GREEN, textAlign: 'center', fontWeight: 600 },
  dotMissing: { fontSize: 8, color: '#CCCCCC', textAlign: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, paddingVertical: 4, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendDot: { fontSize: 8 },
  legendText: { fontSize: 7, color: TEXT_MUTED },

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
  subStepRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 14 },
  subStepBullet: { width: 8, fontSize: 6.5, color: TEXT_MUTED },
  subStepText: { flex: 1, fontSize: 7, color: TEXT_MUTED, lineHeight: 1.5 },

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
function Header({ businessName, reportDate, showBizName = true }: { businessName?: string; reportDate?: string; showBizName?: boolean }) {
  return (
    <View style={s.stripe} fixed>
      <View>
        <Text style={s.brand}>presenzia<Text style={s.dot}>.ai</Text></Text>
      </View>
      {showBizName && businessName && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.bizHeaderName}>{businessName}</Text>
          {reportDate && <Text style={{ fontSize: 6.5, color: '#777777', letterSpacing: 1, textTransform: 'uppercase' as const, marginTop: 1 }}>{reportDate}</Text>}
        </View>
      )}
    </View>
  );
}

// ── Page Footer (reusable) ───────────────────────────────────
function Footer({ left }: { left: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{left}</Text>
      <Text style={s.footerBrand} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

// ── Prompt Result Row ────────────────────────────────────────
function PromptResultRow({ prompt, isAlt }: { prompt: PromptTestResult; isAlt?: boolean }) {
  return (
    <View style={[s.promptRow, isAlt ? s.promptRowAlt : {}]}>
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

// ── Clickable link helper for action steps ───────────────────
function StepWithLinks({ text }: { text: string }) {
  const urlRegex = /\b((?:https?:\/\/)?(?:[\w-]+\.)+(?:com|co\.uk|org|io|ai|net)(?:\/[\w\-./]*)?)/g;
  const parts: Array<{ type: 'text' | 'link'; value: string; href?: string }> = [];
  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    const url = match[1];
    parts.push({ type: 'link', value: url, href: url.startsWith('http') ? url : `https://${url}` });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
  if (parts.every(p => p.type === 'text')) return <Text style={s.stepText}>{text}</Text>;
  return (
    <Text style={s.stepText}>
      {parts.map((p, i) =>
        p.type === 'link'
          ? <Link key={i} src={p.href!}><Text style={{ color: GOLD, textDecoration: 'underline' }}>{p.value}</Text></Link>
          : p.value
      )}
    </Text>
  );
}

// ── Action Card with Steps + Substeps ────────────────────────
function ActionCard({ action, index }: { action: DetailedAction; index: number }) {
  const isHigh = action.priority === 'HIGH';
  // Always allow wrapping — header section has its own wrap={false} to prevent orphan titles
  return (
    <View style={[s.actCard, isHigh ? s.actCardHigh : {}]}>
      {/* Header area: keep together so the title+context never get orphaned from steps */}
      <View wrap={false}>
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
      </View>
      {action.steps.map((step, i) => {
        const stepText = typeof step === 'string' ? step : step.text;
        const substeps = typeof step === 'string' ? undefined : step.substeps;
        return (
          <View key={i}>
            <View style={s.stepRow}>
              <Text style={s.stepBullet}>›</Text>
              <StepWithLinks text={stepText} />
            </View>
            {substeps && substeps.map((sub, j) => (
              <View key={j} style={s.subStepRow}>
                <Text style={s.subStepBullet}>–</Text>
                <Text style={s.subStepText}>{sub}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

// ── Fallback recommendations (when insights not provided) ────
function getFallbackActions(score: AuditScore, config: AuditConfig): DetailedAction[] {
  const actions: DetailedAction[] = [];
  if (score.overall < 55) {
    actions.push({
      priority: 'HIGH', phase: 1, timeline: 'Start here',
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
      priority: 'HIGH', phase: 2, timeline: 'Next steps',
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
    phase: 2, timeline: 'Next steps',
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
  jobId?: string;
}

function AuditReport({ config, score, insights, reportDate, jobId }: ReportData) {
  const actions = insights?.actions ?? getFallbackActions(score, config);
  const topPriorities = actions.slice(0, 2); // Always show first 2 as priorities
  const mainColor = scoreColor(score.overall);
  const band = scoreBand(score.overall);
  const maxCompCount = score.topCompetitors[0]?.count || 1;
  const hasInsights = !!insights;
  const actionPageNum = hasInsights ? 4 : 3;

  return (
    <Document>

      {/* ═══════════════════════ PAGE 1: YOUR AI VISIBILITY SCORE */}
      <Page size="A4" style={s.page}>
        <Header businessName={config.businessName} reportDate={reportDate} showBizName={false} />
        <View style={s.content}>

          {/* Business + Score */}
          <View style={s.heroRow}>
            <View style={s.bizBlock}>
              <Text style={s.bizName}>{config.businessName}</Text>
              <Text style={s.bizMeta}>{config.businessType}</Text>
              {config.location ? <Text style={s.bizMeta}>{config.location}</Text> : null}
              {config.website ? <Text style={s.bizMeta}>{config.website}</Text> : null}
              <Text style={s.dateLabel}>Audit date: {reportDate}</Text>
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
          <Text style={s.secTitle}>What This Score Means</Text>
          <Text style={[s.secSub, { marginBottom: 6 }]}>Your score is weighted by platform market share: ChatGPT (35%), Google AI (30%), Perplexity (20%), Claude (15%).</Text>
          <View style={s.goldBox}>
            <Text style={[s.summaryBandLbl, { color: mainColor }]}>
              {band}  ·  {scoreBandSubtitle(score.overall)}
            </Text>
            <Text style={s.bodyText}>{scoreBandContext(score.overall)}</Text>
          </View>

          {/* Audit summary */}
          <Text style={s.secTitle}>Audit Summary</Text>
          <View style={s.grayBox}>
            <Text style={s.bodyText}>{score.summary}</Text>
            <Text style={[s.bodySmall, { marginTop: 6, color: TEXT_MUTED }]}>
              Found in {score.mentionedInCount} of {score.totalPrompts} searches across {score.platforms.length} platforms ({Math.round((score.mentionedInCount / Math.max(score.totalPrompts, 1)) * 100)}% hit rate).
            </Text>
          </View>

          {/* Priority actions preview */}
          {topPriorities.length > 0 && (
            <View>
              <Text style={s.secTitle}>Your Priority Actions</Text>
              <Text style={[s.secSub, { marginBottom: 6 }]}>Full details in your Action Plan on page {actionPageNum}.</Text>
              {topPriorities.map((act, i) => (
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
        <Footer left="presenzia.ai · hello@presenzia.ai" />
      </Page>

      {/* ═══════════════════════ PAGE 2: PLATFORM BREAKDOWN */}
      <Page size="A4" style={s.page}>
        <Header businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          <Text style={s.secTitle}>Platform-by-Platform Breakdown</Text>
          <Text style={s.secSub}>
            Your visibility across {score.platforms.length} AI platforms, based on {score.totalPrompts} real search queries. Each platform has a different market share and sources information differently, so results vary. Your overall score is weighted accordingly: ChatGPT (~35% of AI search traffic), Google AI (~30%), Perplexity (~20%), and Claude (~15%).
          </Text>

          <View style={s.platGrid}>
            {score.platforms.map(platform => {
              const pColor = scoreColor(platform.score);
              const found = platform.score > 0;
              const hitRate = platform.promptsTested > 0 ? Math.round((platform.promptsMentioned / platform.promptsTested) * 100) : 0;
              return (
                <View key={platform.platform} style={s.platCard}>
                  <View style={s.platHdr}>
                    <Text style={s.platName}>{platform.platform}</Text>
                    <Text style={{ fontSize: 6.5, color: found ? pColor : TEXT_MUTED, fontWeight: 600 }}>
                      {found ? '● FOUND' : '○ NOT FOUND'}
                    </Text>
                  </View>
                  <Text style={[s.platScore, { color: pColor }]}>
                    {platform.promptsMentioned}<Text style={[s.platOf, { color: TEXT_MUTED }]}>/{platform.promptsTested}</Text>
                  </Text>
                  <Text style={s.platDetail}>
                    {hitRate}% hit rate  ·  Score: {platform.score}/100
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
              <Text style={s.secTitle}>Competitors Being Recommended Instead</Text>
              <Text style={s.secSub}>
                We found {score.topCompetitors.length} competitor{score.topCompetitors.length !== 1 ? 's' : ''} being recommended where you were absent. {score.topCompetitors[0] ? `${score.topCompetitors[0].name} appeared ${score.topCompetitors[0].count} times, the most of any competitor.` : ''}
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
                Note: Competitor data is sourced directly from AI responses. Some businesses shown may have changed status or closed. This audit reflects what AI currently tells potential customers, not verified trading status.
              </Text>
            </View>
          )}

          {/* Platform insight box */}
          {(() => {
            const bestPlat = score.platforms.reduce((a, b) => a.score > b.score ? a : b, score.platforms[0]);
            const worstPlat = score.platforms.reduce((a, b) => a.score < b.score ? a : b, score.platforms[0]);
            const platformsFound = score.platforms.filter(p => p.promptsMentioned > 0).length;
            return (
              <View style={s.goldBox}>
                <Text style={{ fontSize: 8, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 4 }}>What this means for you</Text>
                <Text style={s.bodySmall}>
                  You were found on {platformsFound} of {score.platforms.length} platforms. {bestPlat.score > 0 ? `Your strongest platform is ${bestPlat.platform} (${bestPlat.promptsMentioned}/${bestPlat.promptsTested} searches). ` : ''}{worstPlat.platform !== bestPlat.platform ? `Your biggest gap is ${worstPlat.platform} (${worstPlat.promptsMentioned}/${worstPlat.promptsTested}). ` : ''}Platform-specific actions to address your gaps are in your Action Plan.
                </Text>
              </View>
            );
          })()}

        </View>
        <Footer left="presenzia.ai · hello@presenzia.ai" />
      </Page>

      {/* ═══════════════════════ PAGE 3: WHAT WE SEARCHED (only with insights) */}
      {hasInsights && (
        <Page size="A4" style={s.page}>
          <Header businessName={config.businessName} reportDate={reportDate} />
          <View style={s.content}>

            <Text style={s.secTitle}>Search Prompts Tested</Text>
            <Text style={s.secSub}>
              We tested {insights!.totalSearches} searches across {score.platforms.length} AI platforms, simulating how real customers look for {config.businessType.toLowerCase()} businesses in {config.location}. You appeared in {insights!.totalFound} of these ({Math.round((insights!.totalFound / Math.max(insights!.totalSearches, 1)) * 100)}%).
            </Text>

            {/* Table header row — aligned with data rows */}
            <View style={[s.promptRow, { paddingVertical: 5, borderBottomColor: DARK, borderBottomWidth: 1, marginBottom: 2, backgroundColor: SURFACE }]}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={s.legendItem}>
                  <Text style={[s.legendDot, { color: GREEN }]}>#N</Text>
                  <Text style={s.legendText}>= Position</Text>
                </View>
                <View style={s.legendItem}>
                  <Text style={[s.legendDot, { color: '#CCCCCC' }]}>—</Text>
                  <Text style={s.legendText}>= Not found</Text>
                </View>
              </View>
              {PLATFORM_ORDER.map(p => (
                <View key={p} style={[s.platCol, { justifyContent: 'center' }]}>
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
                    <PromptResultRow key={i} prompt={ex} isAlt={i % 2 === 1} />
                  ))}
                </View>
              );
            })}

            {/* Summary */}
            {(() => {
              const sorted = [...insights!.categories].sort((a, b) => {
                const aPct = a.totalSearches > 0 ? a.timesFound / a.totalSearches : 0;
                const bPct = b.totalSearches > 0 ? b.timesFound / b.totalSearches : 0;
                return bPct - aPct;
              });
              const best = sorted[0];
              const worst = sorted[sorted.length - 1];
              const bestPct = best && best.totalSearches > 0 ? Math.round((best.timesFound / best.totalSearches) * 100) : 0;
              const worstPct = worst && worst.totalSearches > 0 ? Math.round((worst.timesFound / worst.totalSearches) * 100) : 0;
              return (
                <View style={[s.grayBox, { marginTop: 4 }]}>
                  <Text style={s.bodySmall}>
                    {best && worst && best.category !== worst.category
                      ? `Your strongest category is ${best.label} (${bestPct}% found). Your weakest is ${worst.label} (${worstPct}%). Prioritised actions to address your weakest areas are in your Action Plan (page ${hasInsights ? 4 : 3}).`
                      : `You appeared in ${insights!.totalFound} of ${insights!.totalSearches} total searches (${Math.round((insights!.totalFound / Math.max(insights!.totalSearches, 1)) * 100)}%). Specific steps to improve are detailed in your Action Plan (page ${hasInsights ? 4 : 3}).`
                    }
                  </Text>
                </View>
              );
            })()}

          </View>
          <Footer left="presenzia.ai · hello@presenzia.ai" />
        </Page>
      )}

      {/* ═══════════════════════ PAGE 4: ACTION PLAN — TOP 2 PRIORITIES */}
      <Page size="A4" style={s.page}>
        <Header businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          <Text style={s.secTitle}>Your Action Plan</Text>
          <Text style={s.secSub}>
            5 key recommendations ordered by impact. Focus on the priorities first — complete as many as you can before your next audit, and you will see measurable improvement.
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: RED, letterSpacing: 1 }}>THIS MONTH&apos;S PRIORITIES</Text>
            <Text style={{ fontSize: 7, color: TEXT_MUTED, marginLeft: 'auto' }}>Complete before your next audit</Text>
          </View>

          {actions.slice(0, 2).map((action, i) => (
            <ActionCard key={`pri-${i}`} action={{ ...action, priority: 'HIGH' }} index={i} />
          ))}

        </View>
        <Footer left="presenzia.ai · hello@presenzia.ai" />
      </Page>

      {/* ═══════════════════════ PAGE 5: ACTION PLAN — 3 MORE + TRAILER */}
      <Page size="A4" style={s.page}>
        <Header businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: BORDER, borderBottomWidth: 1, paddingBottom: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>ALSO RECOMMENDED</Text>
            <Text style={{ fontSize: 7, color: TEXT_MUTED, marginLeft: 'auto' }}>Start when you can</Text>
          </View>

          {actions.slice(2, 5).map((action, i) => (
            <ActionCard key={`rec-${i}`} action={{ ...action, priority: 'MEDIUM' }} index={i + 2} />
          ))}

        </View>
        <Footer left="presenzia.ai · hello@presenzia.ai" />
      </Page>

      {/* ═══════════════════════ FINAL PAGE: ABOUT · DISCLAIMERS (static content) */}
      <Page size="A4" style={s.page}>
        <Header businessName={config.businessName} reportDate={reportDate} />
        <View style={s.content}>

          {/* Looking Ahead — trailer with next-month hints */}
          {(() => {
            const hints = insights?.nextMonthHints ?? [];
            const hintText = hints.length > 0
              ? ` We also identified additional areas to work on: ${hints.join(', ')}. Once you complete this month's priorities, those will become the focus.`
              : ' The more you complete now, the more your next report can shift from foundational fixes to growth tactics.';
            return (
              <View style={[s.goldBox, { marginBottom: 16 }]}>
                <Text style={{ fontSize: 8.5, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 3 }}>Looking Ahead</Text>
                <Text style={s.bodySmall}>
                  Your next audit will measure the impact of these changes.{hintText} Complete as much as you can this month, and watch your score climb.
                </Text>
              </View>
            );
          })()}

          {/* Methodology */}
          <Text style={s.secTitle}>How We Test</Text>
          <View style={s.goldBox}>
            <Text style={s.bodySmall}>
              We queried {score.platforms.length} AI platforms with {Math.round(score.totalPrompts / score.platforms.length)} prompts each ({score.totalPrompts} total), simulating how real customers search for a {config.businessType.toLowerCase()} in {config.location}. All tests ran in fresh sessions with no browsing history or prior context, representing a neutral baseline. Your score is weighted by each platform&apos;s approximate market share.
            </Text>
          </View>

          {/* Disclaimers */}
          <Text style={s.secTitle}>Important Notes</Text>
          <View style={[s.grayBox, { marginBottom: 12 }]}>
            <Text style={s.bodySmall}>
              <Text style={{ fontWeight: 600 }}>Results vary by user</Text> — AI responses differ based on search history, location, and context. This audit represents a neutral baseline.{'\n'}
              <Text style={{ fontWeight: 600 }}>AI data may not be fully current</Text> — AI platforms draw from training data and web sources that may not reflect very recent changes.{'\n'}
              <Text style={{ fontWeight: 600 }}>No guaranteed outcomes</Text> — these recommendations are expected to improve visibility over time, but specific results cannot be guaranteed.{'\n'}
              <Text style={{ fontWeight: 600 }}>Point-in-time snapshot</Text> — each subsequent audit tracks your progress so you can measure impact.
            </Text>
          </View>

          {/* Dashboard */}
          <View style={[s.goldBox, { marginBottom: 12 }]}>
            <Text style={{ fontSize: 8.5, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 3 }}>Your Online Dashboard</Text>
            <Text style={s.bodySmall}>
              Log in at presenzia.ai/dashboard to check and download all your previous reports, see the exact date your next audit will be generated, and track your score over time.
            </Text>
            <Link src="https://presenzia.ai/dashboard">
              <View style={{ backgroundColor: GOLD, paddingVertical: 4, paddingHorizontal: 14, alignSelf: 'flex-start', marginTop: 5 }}>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: DARK }}>Log in to your dashboard</Text>
              </View>
            </Link>
          </View>

          {/* Upsell */}
          <View style={{ padding: 12, backgroundColor: DARK, borderColor: GOLD, borderWidth: 1, marginBottom: 12 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: GOLD, marginBottom: 4 }}>Don&apos;t want to wait another month?</Text>
            <Text style={{ fontSize: 7.5, color: '#CCCCCC', lineHeight: 1.6, marginBottom: 4 }}>
              Upgrade to Growth for weekly audits, an online dashboard with trend analysis, competitor monitoring, and priority support. Still within your first 30 days? You only pay the difference.
            </Text>
            <Text style={{ fontSize: 7.5, color: GOLD, fontWeight: 600 }}>
              Upgrade at{' '}
              <Link src="https://presenzia.ai/dashboard"><Text style={{ color: GOLD, textDecoration: 'underline' }}>presenzia.ai/dashboard</Text></Link>
              {' '}or email{' '}
              <Link src="mailto:hello@presenzia.ai"><Text style={{ color: GOLD, textDecoration: 'underline' }}>hello@presenzia.ai</Text></Link>
            </Text>
          </View>

          {/* Rating */}
          <View style={[s.grayBox, { marginBottom: 12 }]}>
            <Text style={{ fontSize: 8.5, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 3 }}>Rate this audit</Text>
            <Text style={{ fontSize: 7.5, color: TEXT_MUTED, lineHeight: 1.5, marginBottom: 5 }}>
              Your feedback helps us improve. Rate your experience and let us know how we can do better.
            </Text>
            <Link src={`https://presenzia.ai/dashboard/rate${jobId ? `?jobId=${jobId}` : ''}`}>
              <View style={{ backgroundColor: GOLD, paddingVertical: 5, paddingHorizontal: 14, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: DARK }}>Leave your rating</Text>
              </View>
            </Link>
          </View>

          {/* Contact — vertically centred in remaining space */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Text style={{ fontSize: 7.5, color: TEXT_MUTED }}>Questions?</Text>
              <Link src="mailto:hello@presenzia.ai"><Text style={{ fontSize: 7.5, color: GOLD, textDecoration: 'underline' }}>hello@presenzia.ai</Text></Link>
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
  jobId?: string,
): Promise<Buffer> {
  const reportDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const doc = <AuditReport config={config} score={score} insights={insights} reportDate={reportDate} jobId={jobId} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
