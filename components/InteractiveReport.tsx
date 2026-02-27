'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────

interface PlatformScore {
  platform: string;
  score: number;
  promptsTested: number;
  promptsMentioned: number;
  avgPosition: number | null;
  competitors: string[];
}

interface PromptTestResult {
  promptText: string;
  category: string;
  weight: number;
  platforms: { name: string; found: boolean; position: number | null }[];
}

interface CategoryBreakdown {
  category: string;
  label: string;
  totalSearches: number;
  timesFound: number;
  examples: PromptTestResult[];
}

interface ActionStep {
  text: string;
  substeps?: string[];
}

interface DetailedAction {
  priority: 'HIGH' | 'MEDIUM';
  phase: 1 | 2 | 3;
  timeline: string;
  title: string;
  why: string;
  context?: string;
  steps: (string | ActionStep)[];
}

interface ReportInsights {
  categories: CategoryBreakdown[];
  actions: DetailedAction[];
  nextMonthHints: string[];
  totalSearches: number;
  totalFound: number;
}

export interface InteractiveReportJob {
  id: string;
  overall_score: number | null;
  grade: string | null;
  summary: string | null;
  platforms_json: PlatformScore[] | null;
  competitors_json: Array<{ name: string; count: number }> | null;
  report_path: string | null;
  completed_at: string | null;
  created_at: string;
  insights_json: ReportInsights | null;
}

export interface InteractiveReportClient {
  business_name: string | null;
  business_type: string | null;
  location: string | null;
  website: string | null;
  plan: string;
}

interface Props {
  job: InteractiveReportJob;
  client: InteractiveReportClient;
  onDownload: (jobId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────

type ReportTab = 'overview' | 'platforms' | 'searches' | 'actions';

const PLATFORM_ORDER = ['ChatGPT', 'Google AI', 'Perplexity', 'Claude'];

const PLATFORM_TIPS: Record<string, string> = {
  'ChatGPT': 'Used by 200M+ daily. When someone asks for a business like yours, this shows how often you appear.',
  'Claude': 'Anthropic\'s AI, growing fast in professional use. A high score means Claude recommends you.',
  'Perplexity': 'AI search engine replacing Google for many. High visibility = high-intent traffic.',
  'Google AI': 'Google\'s AI Overview at the top of search results. Critical for local discovery.',
};

function scoreColor(score: number) {
  if (score >= 70) return '#4a9e6a';
  if (score >= 45) return '#C9A84C';
  if (score >= 25) return '#cc8833';
  return '#cc4444';
}

function scoreBand(score: number) {
  if (score >= 70) return 'Strong';
  if (score >= 45) return 'Moderate';
  if (score >= 25) return 'Weak';
  return 'Not Visible';
}

function scoreBandContext(score: number) {
  if (score >= 70) return 'Your business is consistently recommended by AI assistants. You have strong visibility across the platforms that matter most.';
  if (score >= 45) return 'You appear in some AI searches, but inconsistently. You\'re missing a significant share of potential recommendations to competitors.';
  if (score >= 25) return 'Your business has limited AI visibility. Competitors are being recommended more often. The good news: this is fixable.';
  return 'AI assistants are not currently recommending your business. Customers searching for options in your category are finding your competitors instead.';
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Sub-components ──────────────────────────────────────────────

function BandVisual({ score }: { score: number }) {
  const bands = [
    { label: 'Not Visible', threshold: 20, color: '#cc4444', dim: '#2a1111' },
    { label: 'Weak', threshold: 40, color: '#cc8833', dim: '#2a1f11' },
    { label: 'Moderate', threshold: 60, color: '#C9A84C', dim: '#2a2511' },
    { label: 'Strong', threshold: 80, color: '#4a9e6a', dim: '#112a18' },
    { label: 'Excellent', threshold: 100, color: '#3a8a5a', dim: '#112a18' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, height: 6, marginBottom: 6 }}>
        {bands.map((b, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 3, backgroundColor: score >= b.threshold - 20 ? b.color : b.dim, transition: 'background-color 0.5s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {bands.map(b => (
          <span key={b.label} style={{ fontSize: '0.6rem', color: '#666' }}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 80, padding: '0.875rem 0.5rem', background: '#0D0D0D', border: '1px solid #1a1a1a', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || '#C9A84C', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function ExpandableCard({ title, badge, badgeColor, isHighPriority, children, defaultOpen = false }: {
  title: string;
  badge: string;
  badgeColor: string;
  isHighPriority?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: isHighPriority ? '#0F0D08' : '#0D0D0D',
      border: `1px solid ${isHighPriority ? '#33280d' : '#1a1a1a'}`,
      borderLeft: isHighPriority ? '3px solid #C9A84C' : undefined,
      marginBottom: 8,
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.875rem 1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: badgeColor + '22', color: badgeColor, fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0 }}>
          {badge}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{title}</span>
        <span style={{ color: '#666', fontSize: '0.85rem', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}>›</span>
      </button>
      {open && (
        <div style={{ padding: '0 1rem 1rem', animation: 'fadeIn 0.15s ease' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PlatformTooltip({ platform, children }: { platform: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && PLATFORM_TIPS[platform] && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', border: '1px solid #333', padding: '0.5rem 0.75rem',
          fontSize: '0.75rem', color: '#AAAAAA', lineHeight: 1.5,
          width: 'min(220px, 80vw)', zIndex: 10, pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}>
          {PLATFORM_TIPS[platform]}
        </div>
      )}
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────

function OverviewTab({ job, client, onTabChange }: { job: InteractiveReportJob; client: InteractiveReportClient; onTabChange: (t: ReportTab) => void }) {
  const score = job.overall_score || 0;
  const grade = job.grade || '?';
  const color = scoreColor(score);
  const platforms = job.platforms_json || [];
  const competitors = job.competitors_json || [];
  const insights = job.insights_json;

  const totalPrompts = platforms.reduce((s, p) => s + p.promptsTested, 0);
  const totalMentioned = platforms.reduce((s, p) => s + p.promptsMentioned, 0);

  return (
    <div>
      {/* Score hero */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: '#F5F0E8',
            fontWeight: 600,
            marginBottom: 4,
          }}>
            {client.business_name || 'Your Business'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 8 }}>
            {client.business_type && <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#111', border: '1px solid #222', color: '#888' }}>{client.business_type}</span>}
            {client.location && <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#111', border: '1px solid #222', color: '#888' }}>{client.location}</span>}
            {client.website && <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#111', border: '1px solid #222', color: '#888' }}>{client.website}</span>}
          </div>
          {job.completed_at && <div style={{ fontSize: '0.7rem', color: '#666' }}>Audit date: {fmt(job.completed_at)}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: 'clamp(3rem, 8vw, 4.5rem)',
            color,
            lineHeight: 1,
            fontWeight: 600,
          }}>
            {score}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 2 }}>out of 100</div>
          <div style={{
            display: 'inline-block',
            marginTop: 8,
            padding: '4px 14px',
            background: color + '22',
            border: `1px solid ${color}55`,
            color,
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
          }}>
            {scoreBand(score).toUpperCase()} · Grade {grade}
          </div>
        </div>
      </div>

      <BandVisual score={score} />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginTop: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <StatBox value={totalPrompts} label="Searches tested" />
        <StatBox value={totalMentioned} label="Times you appeared" color={totalMentioned > 0 ? '#C9A84C' : '#555'} />
        <StatBox value={platforms.length} label="Platforms audited" />
        <StatBox value={competitors.length} label="Competitors found" color={competitors.length > 0 ? '#cc6644' : '#C9A84C'} />
      </div>

      {/* What this means */}
      <div style={{ padding: '1rem', background: '#0D0D0D', borderLeft: '3px solid ' + color, border: '1px solid #1a1a1a', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color, marginBottom: 4 }}>
          {scoreBand(score)} · {score >= 70 ? 'Leading your market in AI' : score >= 45 ? 'Solid foundation, room to grow' : score >= 25 ? 'Significant improvement needed' : 'Immediate action required'}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#AAAAAA', lineHeight: 1.65 }}>{scoreBandContext(score)}</div>
      </div>

      {/* Summary */}
      {job.summary && (
        <div style={{ padding: '1rem', background: '#0D0D0D', border: '1px solid #1a1a1a', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Audit Summary</div>
          <div style={{ fontSize: '0.85rem', color: '#AAAAAA', lineHeight: 1.7 }}>{job.summary}</div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 8 }}>
            Found in {totalMentioned} of {totalPrompts} searches across {platforms.length} platforms ({totalPrompts > 0 ? Math.round((totalMentioned / totalPrompts) * 100) : 0}% hit rate).
          </div>
        </div>
      )}

      {/* Priority actions preview */}
      {insights && insights.actions.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Your Priority Actions</div>
          <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: 10 }}>
            Focus on the top 2 first.{' '}
            <button
              onClick={() => onTabChange('actions')}
              style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', textDecoration: 'underline', padding: 0 }}
            >
              View full Action Plan →
            </button>
          </div>
          {insights.actions.slice(0, 5).map((act, i) => {
            const isTop = i < 2;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }} onClick={() => onTabChange('actions')}>
                <div style={{
                  width: 20, height: 20, borderRadius: 2,
                  background: isTop ? '#cc4444' : '#C9A84C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: isTop ? '#F5F0E8' : '#AAAAAA', fontWeight: isTop ? 600 : 400, lineHeight: 1.4 }}>
                  {act.title}
                  {isTop && <span style={{ fontSize: '0.6rem', color: '#cc4444', fontWeight: 700, marginLeft: 6, letterSpacing: '0.03em' }}>DO THIS FIRST</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick platform glance */}
      {platforms.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform Snapshot</div>
            <button
              onClick={() => onTabChange('platforms')}
              style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', textDecoration: 'underline', padding: 0 }}
            >
              See full breakdown →
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {platforms.map(p => {
              const pColor = scoreColor(p.score);
              return (
                <div key={p.platform} style={{ flex: 1, minWidth: 120, padding: '0.75rem', background: '#0D0D0D', border: '1px solid #1a1a1a' }}>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: 4 }}>{p.platform}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: pColor, lineHeight: 1 }}>{p.promptsMentioned}</span>
                    <span style={{ fontSize: '0.7rem', color: '#666' }}>/{p.promptsTested}</span>
                  </div>
                  <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2, marginTop: 6 }}>
                    <div style={{ height: '100%', width: `${p.score}%`, background: pColor, borderRadius: 2, transition: 'width 0.8s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Platforms ─────────────────────────────────────────────

function PlatformsTab({ job }: { job: InteractiveReportJob }) {
  const platforms = job.platforms_json || [];
  const competitors = job.competitors_json || [];
  const maxCompCount = competitors[0]?.count || 1;

  // Platform insight
  const bestPlat = platforms.reduce((a, b) => a.score > b.score ? a : b, platforms[0]);
  const worstPlat = platforms.reduce((a, b) => a.score < b.score ? a : b, platforms[0]);
  const platformsFound = platforms.filter(p => p.promptsMentioned > 0).length;

  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Platform-by-Platform Breakdown</div>
      <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        Your visibility across {platforms.length} AI platforms, weighted by market share: ChatGPT (~35%), Google AI (~30%), Perplexity (~20%), Claude (~15%).
      </div>

      {/* Platform cards */}
      <div className="ir-plat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {platforms.map(p => {
          const pColor = scoreColor(p.score);
          const found = p.score > 0;
          const hitRate = p.promptsTested > 0 ? Math.round((p.promptsMentioned / p.promptsTested) * 100) : 0;
          return (
            <PlatformTooltip key={p.platform} platform={p.platform}>
              <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 500 }}>{p.platform}</span>
                  <span style={{
                    fontSize: '0.6rem', padding: '2px 6px',
                    background: found ? pColor + '18' : '#1a1a1a',
                    border: `1px solid ${found ? pColor + '40' : '#333'}`,
                    color: found ? pColor : '#666',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {found ? 'Visible' : 'Not found'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    fontSize: '2rem', color: found ? pColor : '#444', fontWeight: 600, lineHeight: 1,
                  }}>{p.promptsMentioned}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>/{p.promptsTested}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 2 }}>{hitRate}% hit rate · Score: {p.score}/100</div>
                {p.avgPosition !== null && (
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>Avg. position: #{Math.round(p.avgPosition)}</div>
                )}
                <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2, marginTop: 10 }}>
                  <div style={{ height: '100%', width: `${p.score}%`, background: pColor, borderRadius: 2, transition: 'width 0.8s' }} />
                </div>
              </div>
            </PlatformTooltip>
          );
        })}
      </div>

      {/* Competitors */}
      {competitors.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Competitors Being Recommended Instead</div>
          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 12 }}>
            {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} found.
            {competitors[0] ? ` ${competitors[0].name} appeared ${competitors[0].count} times.` : ''}
          </div>
          <div style={{ background: '#0D0D0D', border: '1px solid #1a1a1a', padding: '1rem' }}>
            {competitors.slice(0, 8).map((comp, i) => (
              <div key={comp.name} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < Math.min(7, competitors.length - 1) ? '1px solid #111' : 'none' }}>
                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 600, width: 24 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: '0.85rem', color: '#CCCCCC' }}>{comp.name}</span>
                <div style={{ width: 80, height: 3, background: '#1a1a1a', borderRadius: 2, marginRight: 12 }}>
                  <div style={{ height: '100%', width: `${Math.round((comp.count / maxCompCount) * 100)}%`, background: 'rgba(204,68,68,0.4)', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#888', width: 60, textAlign: 'right' }}>{comp.count} mention{comp.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform insight */}
      {platforms.length > 0 && bestPlat && worstPlat && (
        <div style={{ padding: '1rem', background: '#0D0D0D', borderLeft: '3px solid #C9A84C', border: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>What this means</div>
          <div style={{ fontSize: '0.82rem', color: '#AAAAAA', lineHeight: 1.65 }}>
            Found on {platformsFound} of {platforms.length} platforms.
            {bestPlat.score > 0 ? ` Strongest: ${bestPlat.platform} (${bestPlat.promptsMentioned}/${bestPlat.promptsTested}).` : ''}
            {worstPlat.platform !== bestPlat.platform ? ` Biggest gap: ${worstPlat.platform} (${worstPlat.promptsMentioned}/${worstPlat.promptsTested}).` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Searches ──────────────────────────────────────────────

function SearchesTab({ job }: { job: InteractiveReportJob }) {
  const insights = job.insights_json;
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!insights) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '1.1rem', color: '#F5F0E8', fontWeight: 600, marginBottom: 8 }}>Search data not available</div>
        <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
          Detailed search results are available in your PDF report. Future audits will display this data here automatically.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Search Prompts Tested</div>
      <div style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.6, marginBottom: '1.25rem' }}>
        We tested {insights.totalSearches} searches across {(job.platforms_json || []).length} AI platforms. You appeared in{' '}
        <span style={{ color: '#C9A84C', fontWeight: 600 }}>{insights.totalFound}</span> ({insights.totalSearches > 0 ? Math.round((insights.totalFound / insights.totalSearches) * 100) : 0}%).
        Click a category to see individual prompts.
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.72rem', color: '#888' }}>
        <span><span style={{ color: '#4a9e6a', fontWeight: 600 }}>#N</span> = Position found</span>
        <span><span style={{ color: '#555' }}>—</span> = Not found</span>
      </div>

      {/* Categories */}
      {insights.categories.map(cat => {
        const pct = cat.totalSearches > 0 ? Math.round((cat.timesFound / cat.totalSearches) * 100) : 0;
        const isExpanded = expandedCat === cat.category;
        const catColor = pct >= 50 ? '#4a9e6a' : pct >= 25 ? '#C9A84C' : '#cc4444';

        return (
          <div key={cat.category} style={{ marginBottom: 4, background: '#0D0D0D', border: '1px solid #1a1a1a' }}>
            {/* Category header — clickable */}
            <button
              onClick={() => setExpandedCat(isExpanded ? null : cat.category)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.75rem 1rem',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#666', fontSize: '0.8rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>›</span>
                <span style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 600 }}>{cat.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#888' }}>{cat.timesFound}/{cat.totalSearches}</span>
                <div style={{ width: 40, height: 3, background: '#1a1a1a', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: catColor, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: catColor, fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{pct}%</span>
              </div>
            </button>

            {/* Expanded: prompt results */}
            {isExpanded && (
              <div style={{ padding: '0 1rem 0.75rem' }}>
                {/* Column headers */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #222', marginBottom: 2 }}>
                  <div style={{ flex: 1, fontSize: '0.68rem', color: '#666' }}>Search prompt</div>
                  {PLATFORM_ORDER.map(p => (
                    <div key={p} style={{ width: 54, textAlign: 'center', fontSize: '0.65rem', color: '#888', fontWeight: 700, letterSpacing: '0.03em' }}>
                      {p === 'Google AI' ? 'Google' : p}
                    </div>
                  ))}
                </div>
                {/* Prompt rows */}
                {cat.examples.map((ex, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', padding: '0.35rem 0',
                    background: i % 2 === 1 ? '#0A0A0A' : 'transparent',
                  }}>
                    <div style={{ flex: 1, fontSize: '0.78rem', color: '#AAAAAA', paddingRight: 8 }}>{ex.promptText}</div>
                    {PLATFORM_ORDER.map(pName => {
                      const p = ex.platforms.find(pl => pl.name === pName);
                      const found = p?.found ?? false;
                      const pos = p?.position;
                      return (
                        <div key={pName} style={{ width: 54, textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: found ? '#4a9e6a' : '#444',
                            fontWeight: found ? 600 : 400,
                          }}>
                            {found ? (pos ? `#${pos}` : '●') : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      {(() => {
        const sorted = [...insights.categories].sort((a, b) => {
          const aPct = a.totalSearches > 0 ? a.timesFound / a.totalSearches : 0;
          const bPct = b.totalSearches > 0 ? b.timesFound / b.totalSearches : 0;
          return bPct - aPct;
        });
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        if (!best || !worst || best.category === worst.category) return null;
        const bestPct = best.totalSearches > 0 ? Math.round((best.timesFound / best.totalSearches) * 100) : 0;
        const worstPct = worst.totalSearches > 0 ? Math.round((worst.timesFound / worst.totalSearches) * 100) : 0;
        return (
          <div style={{ padding: '1rem', background: '#0D0D0D', border: '1px solid #1a1a1a', marginTop: 12 }}>
            <div style={{ fontSize: '0.82rem', color: '#AAAAAA', lineHeight: 1.65 }}>
              Strongest: <span style={{ color: '#F5F0E8', fontWeight: 600 }}>{best.label}</span> ({bestPct}%).
              Weakest: <span style={{ color: '#F5F0E8', fontWeight: 600 }}>{worst.label}</span> ({worstPct}%).
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Tab: Action Plan ──────────────────────────────────────────

function ActionPlanTab({ job }: { job: InteractiveReportJob }) {
  const insights = job.insights_json;

  if (!insights || insights.actions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '1.1rem', color: '#F5F0E8', fontWeight: 600, marginBottom: 8 }}>Action plan not available</div>
        <div style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
          Your personalised action plan is available in the PDF report. Future audits will display actions here automatically.
        </div>
      </div>
    );
  }

  const actions = insights.actions;
  const topActions = actions.slice(0, 2);
  const moreActions = actions.slice(2, 5);

  return (
    <div>
      {/* Top priorities */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: 6, marginBottom: 12 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cc4444', letterSpacing: '0.08em' }}>THIS MONTH&apos;S PRIORITIES</span>
        <span style={{ fontSize: '0.68rem', color: '#666', marginLeft: 'auto' }}>Complete before your next audit</span>
      </div>

      {topActions.map((action, i) => (
        <ExpandableCard
          key={`pri-${i}`}
          title={`${i + 1}. ${action.title}`}
          badge="HIGH PRIORITY"
          badgeColor="#cc4444"
          isHighPriority
          defaultOpen={i === 0}
        >
          {action.context && (
            <div style={{ fontSize: '0.78rem', color: '#F5F0E8', fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>{action.context}</div>
          )}
          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 10, lineHeight: 1.5 }}>{action.why}</div>
          {action.steps.map((step, j) => {
            const stepText = typeof step === 'string' ? step : step.text;
            const substeps = typeof step === 'string' ? undefined : step.substeps;
            return (
              <div key={j}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>›</span>
                  <span style={{ fontSize: '0.78rem', color: '#AAAAAA', lineHeight: 1.6 }}>{stepText}</span>
                </div>
                {substeps && substeps.map((sub, k) => (
                  <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 2, paddingLeft: 16 }}>
                    <span style={{ color: '#666', fontSize: '0.7rem' }}>–</span>
                    <span style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.5 }}>{sub}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </ExpandableCard>
      ))}

      {/* More recommendations */}
      {moreActions.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: 6, marginBottom: 12, marginTop: 20 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em' }}>ALSO RECOMMENDED</span>
            <span style={{ fontSize: '0.68rem', color: '#666', marginLeft: 'auto' }}>Start when you can</span>
          </div>

          {moreActions.map((action, i) => (
            <ExpandableCard
              key={`rec-${i}`}
              title={`${i + 3}. ${action.title}`}
              badge="RECOMMENDED"
              badgeColor="#C9A84C"
            >
              {action.context && (
                <div style={{ fontSize: '0.78rem', color: '#F5F0E8', fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>{action.context}</div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 10, lineHeight: 1.5 }}>{action.why}</div>
              {action.steps.map((step, j) => {
                const stepText = typeof step === 'string' ? step : step.text;
                const substeps = typeof step === 'string' ? undefined : step.substeps;
                return (
                  <div key={j}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.78rem', color: '#AAAAAA', lineHeight: 1.6 }}>{stepText}</span>
                    </div>
                    {substeps && substeps.map((sub, k) => (
                      <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 2, paddingLeft: 16 }}>
                        <span style={{ color: '#666', fontSize: '0.7rem' }}>–</span>
                        <span style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.5 }}>{sub}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </ExpandableCard>
          ))}
        </>
      )}

      {/* Looking Ahead */}
      {insights.nextMonthHints.length > 0 && (
        <div style={{ padding: '1rem', background: '#0D0D0D', borderLeft: '3px solid #C9A84C', border: '1px solid #1a1a1a', marginTop: 16 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F5F0E8', marginBottom: 6 }}>Looking Ahead</div>
          <div style={{ fontSize: '0.78rem', color: '#AAAAAA', lineHeight: 1.65 }}>
            We also identified areas for future focus: {insights.nextMonthHints.join(', ')}. Complete this month&apos;s priorities first, and these will become the focus of your next audit.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function InteractiveReport({ job, client, onDownload }: Props) {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const hasInsights = !!job.insights_json;

  const tabs: { key: ReportTab; label: string; disabled?: boolean }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'platforms', label: 'Platforms' },
    { key: 'searches', label: 'Searches', disabled: !hasInsights },
    { key: 'actions', label: 'Action Plan', disabled: !hasInsights },
  ];

  return (
    <div>
      {/* Header bar: sub-tabs + download button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              style={{
                padding: '0.5rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #C9A84C' : '2px solid transparent',
                color: tab.disabled ? '#444' : activeTab === tab.key ? '#F5F0E8' : '#888',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                cursor: tab.disabled ? 'default' : 'pointer',
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'color 0.2s',
              }}
              title={tab.disabled ? 'Available in your next audit' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {job.report_path && (
          <button
            onClick={() => onDownload(job.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.4rem 1rem',
              background: 'transparent',
              border: '1px solid #333',
              color: '#AAAAAA',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; (e.currentTarget as HTMLElement).style.color = '#C9A84C'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.color = '#AAAAAA'; }}
          >
            ↓ Download PDF
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab job={job} client={client} onTabChange={setActiveTab} />}
      {activeTab === 'platforms' && <PlatformsTab job={job} />}
      {activeTab === 'searches' && <SearchesTab job={job} />}
      {activeTab === 'actions' && <ActionPlanTab job={job} />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) {
          .ir-plat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .ir-plat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
