'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Search, Zap, AlertTriangle, TrendingDown, BarChart3, Target, Users, Shield } from 'lucide-react';

// ── PDF-matching palette ──
const W = '#FFFFFF';
const SURFACE = '#F7F7F5';
const SURFACE2 = '#F0EFE9';
const BORDER = '#E0DDD5';
const BORDER_LIGHT = '#D5D2C8';
const TXT = '#111111';
const TXT2 = '#555555';
const TXT3 = '#444444';
const MUTED = '#888888';
const GOLD = '#C9A84C';
const RED = '#cc4444';
const GREEN = '#2E7D32';
const AMBER = '#E6A817';
const DARK = '#111111';

// ── Card content components ──

function ScoreCard() {
  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      {/* Score hero */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          border: `3px solid ${RED}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.1rem', color: RED, lineHeight: 1 }}>34</div>
          <div style={{ fontSize: '0.6rem', color: MUTED, letterSpacing: '0.05em' }}>/100</div>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: TXT, fontWeight: 600 }}>Overall Visibility Score</span>
            <span style={{
              padding: '0.15rem 0.5rem',
              background: `${RED}15`,
              border: `1px solid ${RED}30`,
              color: RED,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}>GRADE F</span>
          </div>
          <p style={{ color: TXT2, fontSize: '0.75rem', lineHeight: 1.6, margin: '0 0 0.6rem' }}>
            Found in only 7 of 120 AI searches across 4 platforms. Your firm is nearly invisible to AI-powered search — most prospective clients asking AI for a financial advisor will never see your name.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={12} style={{ color: RED }} />
            <span style={{ fontSize: '0.68rem', color: RED, fontWeight: 600 }}>62% below industry average (89/100)</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        border: `1px solid ${BORDER}`,
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        {[
          { value: '120', label: 'Searches tested' },
          { value: '7', label: 'Times found', warn: true },
          { value: '4', label: 'Platforms audited' },
          { value: '6', label: 'Competitors ahead', warn: true },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            minWidth: '80px',
            padding: '0.7rem 0.5rem',
            textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${BORDER}` : 'none',
            background: SURFACE,
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.2rem',
              color: stat.warn ? RED : GOLD,
              fontWeight: 600,
              lineHeight: 1,
              marginBottom: '0.15rem',
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.55rem', color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Score breakdown by category */}
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: TXT, marginBottom: '0.6rem' }}>Score Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { label: 'Content Authority', score: 22, desc: 'Your website content isn\'t being cited by AI models' },
          { label: 'Search Presence', score: 45, desc: 'Partially visible on Perplexity, absent on ChatGPT & Claude' },
          { label: 'Competitive Position', score: 18, desc: '6 competitors consistently rank above you' },
          { label: 'Platform Coverage', score: 35, desc: 'Only consistently found on 1 of 4 major platforms' },
        ].map((cat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '110px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.68rem', color: TXT3 }}>{cat.label}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '5px', background: BORDER, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${cat.score}%`,
                  background: cat.score < 30 ? RED : cat.score < 50 ? AMBER : GOLD,
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.62rem', color: cat.score < 30 ? RED : MUTED, fontWeight: 600, minWidth: '28px', textAlign: 'right' }}>{cat.score}/100</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key finding callout */}
      <div style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        background: `${RED}08`,
        border: `1px solid ${RED}20`,
        borderLeft: `3px solid ${RED}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem',
      }}>
        <AlertTriangle size={14} style={{ color: RED, flexShrink: 0, marginTop: '1px' }} />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: RED, marginBottom: '0.2rem' }}>Critical Finding</div>
          <div style={{ fontSize: '0.68rem', color: TXT2, lineHeight: 1.5 }}>
            ChatGPT (35% market share) returns zero mentions of your firm across all 30 search queries. This single platform gap costs you the largest audience segment.
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformCard() {
  const platforms = [
    {
      name: 'ChatGPT',
      score: 0,
      mentions: '0/20',
      found: false,
      weight: '35%',
      status: 'Not mentioned',
      statusColor: RED,
      topCompetitor: 'Sterling Financial Planning appeared in 22/30',
      detail: 'Zero presence. GPT relies on structured web data — your site lacks FinancialService schema markup and structured FAQ content.',
    },
    {
      name: 'Perplexity',
      score: 55,
      mentions: '5/30',
      found: true,
      weight: '20%',
      status: 'Partially visible',
      statusColor: AMBER,
      topCompetitor: 'Sterling Financial Planning appeared in 26/30',
      detail: 'Your VouchedFor listing drives these mentions. But you only appear for brand-name queries, not generic searches like "best IFA in Surrey".',
    },
    {
      name: 'Google AI Overview',
      score: 15,
      mentions: '2/30',
      found: false,
      weight: '30%',
      status: 'Rarely mentioned',
      statusColor: RED,
      topCompetitor: 'Meridian Wealth Advisors appeared in 18/30',
      detail: 'AI Overviews pull from top organic results. You rank page 2+ for most wealth management queries in your area.',
    },
    {
      name: 'Claude',
      score: 0,
      mentions: '0/30',
      found: false,
      weight: '15%',
      status: 'Not mentioned',
      statusColor: RED,
      topCompetitor: 'Meridian Wealth Advisors appeared in 14/30',
      detail: 'Claude prioritises authoritative content. Publishing thought leadership on pension transfers and tax planning would help significantly.',
    },
  ];

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600 }}>Platform-by-Platform Breakdown</div>
        <BarChart3 size={14} style={{ color: GOLD }} />
      </div>
      <div style={{ fontSize: '0.65rem', color: MUTED, marginBottom: '1.25rem' }}>
        Score weighted by each platform&apos;s share of AI search traffic
      </div>
      {platforms.map((platform, idx) => (
        <div key={platform.name} style={{
          marginBottom: idx < platforms.length - 1 ? '1rem' : '0',
          paddingBottom: idx < platforms.length - 1 ? '1rem' : '0',
          borderBottom: idx < platforms.length - 1 ? `1px solid ${BORDER}` : 'none',
        }}>
          {/* Platform header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {platform.found
                ? <CheckCircle size={13} style={{ color: GOLD }} />
                : <XCircle size={13} style={{ color: RED }} />
              }
              <span style={{ fontSize: '0.78rem', color: TXT, fontWeight: 600 }}>{platform.name}</span>
              <span style={{ fontSize: '0.58rem', color: MUTED, fontWeight: 500 }}>({platform.weight} weight)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.58rem',
                fontWeight: 700,
                color: platform.statusColor,
                padding: '0.1rem 0.4rem',
                background: `${platform.statusColor}12`,
                border: `1px solid ${platform.statusColor}25`,
                letterSpacing: '0.03em',
              }}>{platform.status}</span>
              <span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 600 }}>{platform.mentions}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '4px', background: BORDER, borderRadius: '2px', marginBottom: '0.4rem' }}>
            <div style={{
              height: '100%',
              width: `${(platform.score / 100) * 100}%`,
              background: platform.found ? GOLD : platform.score > 0 ? '#BBBBBB' : `${BORDER}`,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
            }} />
          </div>
          {/* Detail text */}
          <div style={{ fontSize: '0.66rem', color: TXT2, lineHeight: 1.5, marginBottom: '0.25rem' }}>
            {platform.detail}
          </div>
          {/* Top competitor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={10} style={{ color: MUTED }} />
            <span style={{ fontSize: '0.6rem', color: MUTED, fontStyle: 'italic' }}>{platform.topCompetitor}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromptsCard() {
  const prompts = [
    { prompt: '\u201CBest financial advisor in Guildford\u201D', found: false, platform: 'ChatGPT', position: '\u2014', competitor: 'Sterling Financial Planning (1st), Meridian Wealth (2nd)', category: 'Direct' },
    { prompt: '\u201CRecommend a pension transfer specialist near GU1\u201D', found: true, platform: 'Perplexity', position: '4th', competitor: 'Sterling Financial Planning (1st)', category: 'Specialty' },
    { prompt: '\u201CWho should I speak to about inheritance tax planning in Surrey?\u201D', found: false, platform: 'Claude', position: '\u2014', competitor: 'Meridian Wealth (1st), Oakwood Financial (2nd)', category: 'Problem' },
    { prompt: '\u201CIFA for high-net-worth individuals in Surrey\u201D', found: true, platform: 'Perplexity', position: '3rd', competitor: 'Sterling Financial Planning (1st)', category: 'Specialty' },
    { prompt: '\u201CWho is the best wealth manager in Guildford?\u201D', found: false, platform: 'Google AI', position: '\u2014', competitor: 'Sterling Financial Planning (1st), Oakwood Financial (2nd)', category: 'Direct' },
    { prompt: '\u201CI\u2019ve inherited \u00A3500k and need financial advice in Surrey\u201D', found: false, platform: 'ChatGPT', position: '\u2014', competitor: 'Oakwood Financial (1st), Meridian Wealth (3rd)', category: 'Problem' },
  ];

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
        <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600 }}>Search Prompts Tested</div>
        <Search size={14} style={{ color: GOLD }} />
      </div>
      <div style={{ fontSize: '0.65rem', color: MUTED, marginBottom: '1rem', lineHeight: 1.5 }}>
        We tested 120 wealth-specific search prompts real clients might use. Here are 6 key results — the full audit includes all 120.
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 70px 50px 1fr',
        gap: '0.5rem',
        padding: '0 0 0.4rem',
        borderBottom: `1px solid ${BORDER}`,
        marginBottom: '0.25rem',
      }}>
        <span style={{ fontSize: '0.58rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Prompt</span>
        <span style={{ fontSize: '0.58rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Platform</span>
        <span style={{ fontSize: '0.58rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Found?</span>
        <span style={{ fontSize: '0.58rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Who appeared instead</span>
      </div>

      {prompts.map((test, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 70px 50px 1fr',
          gap: '0.5rem',
          alignItems: 'center',
          padding: '0.55rem 0',
          borderBottom: i < prompts.length - 1 ? `1px solid ${BORDER}40` : 'none',
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: test.found ? TXT : TXT2, fontStyle: 'italic', lineHeight: 1.35 }}>
              {test.prompt}
            </div>
            <span style={{
              fontSize: '0.52rem',
              color: GOLD,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '0.15rem',
              display: 'inline-block',
            }}>{test.category}</span>
          </div>
          <span style={{ fontSize: '0.66rem', color: MUTED }}>{test.platform}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {test.found
              ? <><CheckCircle size={11} style={{ color: GREEN }} /><span style={{ fontSize: '0.62rem', color: GREEN, fontWeight: 600 }}>{test.position}</span></>
              : <><XCircle size={11} style={{ color: RED }} /><span style={{ fontSize: '0.62rem', color: RED }}>No</span></>
            }
          </div>
          <span style={{ fontSize: '0.62rem', color: TXT2, lineHeight: 1.35 }}>{test.competitor}</span>
        </div>
      ))}

      {/* Summary */}
      <div style={{
        marginTop: '0.85rem',
        padding: '0.65rem 0.85rem',
        background: SURFACE2,
        border: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={12} style={{ color: GOLD }} />
          <span style={{ fontSize: '0.68rem', color: TXT2 }}>
            Showing <span style={{ fontWeight: 700 }}>6</span> of <span style={{ fontWeight: 700 }}>120</span> prompts tested
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: RED, fontWeight: 600 }}>
          91.25% of searches — not found
        </span>
      </div>
    </div>
  );
}

function ActionPlanCard() {
  const phases = [
    {
      number: '1',
      title: 'Quick Wins',
      label: 'START HERE',
      labelColor: RED,
      timeframe: 'Week 1–2',
      items: [
        { title: 'Add FinancialService schema markup to your website', impact: 'High', desc: 'Implement structured data (JSON-LD) using the FinancialService schema type. Include firm name, address, services offered, FCA number, and qualifications. Sterling Financial Planning does this — that\u2019s why they appear in 22/30 ChatGPT searches.' },
        { title: 'Optimise your Google Business Profile', impact: 'High', desc: 'Your profile is missing a detailed description and has only 3 reviews. Add a 200+ word description mentioning "financial advisor Guildford", upload professional team photos, and request reviews from satisfied clients. Aim for 20+ reviews.' },
        { title: 'Ensure consistent listings on VouchedFor, Unbiased & FTAdviser', impact: 'Medium', desc: 'Perplexity cited VouchedFor as a source in 12 of 30 responses. Meridian Wealth has 38 VouchedFor reviews — Claude cited them in 14/30 searches because of review authority.' },
      ],
    },
    {
      number: '2',
      title: 'Content Authority',
      label: 'WEEKS 3–6',
      labelColor: AMBER,
      timeframe: 'Week 3–6',
      items: [
        { title: 'Publish a thought leadership article on pension transfers in Surrey', impact: 'High', desc: 'Sterling Financial Planning were cited by 3 of 4 AI platforms partly because FTAdviser quoted them in a recent article. Getting featured in trade publications can shift your visibility within weeks.' },
        { title: 'Create a comprehensive FAQ page covering common client questions', impact: 'High', desc: 'Claude and Perplexity favour content that directly answers questions. Your site has no FAQ page. Publish detailed answers covering fees, investment philosophy, pension transfer process, and inheritance tax planning.' },
      ],
    },
    {
      number: '3',
      title: 'Ongoing Growth',
      label: 'MONTHLY',
      labelColor: GREEN,
      timeframe: 'Ongoing',
      items: [
        { title: 'Build review presence on VouchedFor and Google', impact: 'Medium', desc: 'You have 3 Google reviews (avg 4.5\u2605). Meridian Wealth has 38 VouchedFor reviews (avg 4.8\u2605). AI platforms weight review volume and recency — aim for 20+ reviews within 3 months. Implement a systematic review request process.' },
        { title: 'Publish monthly thought leadership on your website blog', impact: 'Medium', desc: 'Your last blog post is from 2024. AI models deprioritise stale websites. A 600+ word monthly article on topics like "pension transfer considerations" or "inheritance tax planning strategies" signals ongoing authority.' },
      ],
    },
  ];

  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
        <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600 }}>Your Personalised Action Plan</div>
        <Shield size={14} style={{ color: GOLD }} />
      </div>
      <div style={{ fontSize: '0.65rem', color: MUTED, marginBottom: '1.25rem', lineHeight: 1.5 }}>
        7 prioritised actions across 3 phases, ordered by impact. The full audit includes detailed step-by-step implementation guides for each.
      </div>

      {phases.map((phase, pi) => (
        <div key={phase.number} style={{ marginBottom: pi < phases.length - 1 ? '1.25rem' : '0' }}>
          {/* Phase header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.65rem',
            paddingBottom: '0.4rem',
            borderBottom: `1px solid ${BORDER}`,
          }}>
            <Zap size={12} style={{ color: phase.labelColor }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: phase.labelColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Phase {phase.number}: {phase.label}
            </span>
            <span style={{ fontSize: '0.58rem', color: MUTED, marginLeft: 'auto' }}>{phase.title}</span>
          </div>

          {/* Action items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {phase.items.map((item, ii) => (
              <div key={ii} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                padding: '0.6rem 0.75rem',
                background: pi === 0 && ii === 0 ? SURFACE2 : 'transparent',
                border: pi === 0 && ii === 0 ? `1px solid ${BORDER_LIGHT}` : `1px solid ${BORDER}50`,
                borderLeft: `3px solid ${pi === 0 ? GOLD : pi === 1 ? AMBER : GREEN}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      color: item.impact === 'High' ? GOLD : MUTED,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>{item.impact} IMPACT</span>
                    <span style={{ fontSize: '0.72rem', color: TXT, fontWeight: 600 }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: TXT2, lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Card definitions ──
const CARDS = [
  { label: 'Score & Grade', component: ScoreCard },
  { label: 'Platforms', component: PlatformCard },
  { label: 'Search Prompts', component: PromptsCard },
  { label: 'Action Plan', component: ActionPlanCard },
];

// ── Main component ──
export default function SampleReport() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, direction?: 'left' | 'right') => {
    if (isTransitioning) return;
    const dir = direction || (index > activeIndex ? 'left' : 'right');
    setSlideDirection(dir);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 30);
    }, 200);
  }, [activeIndex, isTransitioning]);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % CARDS.length;
    goTo(next, 'left');
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + CARDS.length) % CARDS.length;
    goTo(prev, 'right');
  }, [activeIndex, goTo]);

  // Auto-advance every 7 seconds (longer — more content to read), pauses on hover
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      goNext();
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, goNext]);

  const ActiveCard = CARDS[activeIndex].component;

  return (
    <section id="sample-report" style={{
      padding: '6rem 2rem',
      background: 'rgba(10,10,10,0.88)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: GOLD, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Sample audit
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: '#F5F0E8',
            fontWeight: 600,
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            See what&apos;s inside your audit
          </h2>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            Selected sections from a real AI Visibility Audit for a UK wealth management firm. Every data point comes from actual AI search queries. Scores are weighted by platform market share.
          </p>
        </div>

        {/* Responsive styles */}
        <style>{`
          .sr-arrow-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 1px solid ${BORDER};
            background: ${W};
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: ${TXT2};
            flex-shrink: 0;
          }
          .sr-arrow-btn:hover {
            background: ${SURFACE2};
            border-color: ${GOLD};
            color: ${GOLD};
          }
          .sr-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
          }
          @media (max-width: 600px) {
            .sr-nav-arrows { display: none !important; }
            .sr-report-card { margin: 0 -0.5rem !important; }
          }
        `}</style>

        {/* Report card container */}
        <div
          className="sr-report-card"
          style={{
            background: W,
            border: `1px solid ${BORDER}`,
            maxWidth: '880px',
            margin: '0 auto',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 2px 12px rgba(0,0,0,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* "Preview of Starter Audit" label */}
          <div style={{
            background: `${GOLD}12`,
            borderBottom: `1px solid ${GOLD}30`,
            padding: '0.45rem 2rem',
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: GOLD,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Preview of AI Visibility Audit
            </span>
          </div>

          {/* Dark header banner */}
          <div style={{
            padding: '1.25rem 2rem 1rem',
            borderBottom: `2px solid ${GOLD}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            background: DARK,
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 600, opacity: 0.8 }}>
              presenzia<span style={{ color: GOLD }}>.ai</span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
              color: '#F5F0E8',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.25,
              marginTop: '0.15rem',
            }}>
              Hartfield Wealth Management
            </div>
            <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
              AI Visibility Audit &middot; February 2026
            </div>
          </div>

          {/* Card tab indicators */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${BORDER}`,
            background: SURFACE,
            overflow: 'hidden',
          }}>
            {CARDS.map((card, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: i === activeIndex ? GOLD : MUTED,
                  background: i === activeIndex ? W : 'transparent',
                  border: 'none',
                  borderBottom: i === activeIndex ? `2px solid ${GOLD}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {card.label}
              </button>
            ))}
          </div>

          {/* Scrollable card viewport — deliberately clips content to imply depth */}
          <div style={{
            maxHeight: '420px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Card content with slide transition */}
            <div
              style={{
                transition: isTransitioning ? 'opacity 0.2s ease, transform 0.2s ease' : 'opacity 0.25s ease, transform 0.25s ease',
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning
                  ? (slideDirection === 'left' ? 'translateX(-20px)' : 'translateX(20px)')
                  : 'translateX(0)',
              }}
            >
              <ActiveCard />
            </div>

            {/* Strong gradient fade at bottom — signals there's much more content below */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: `linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.7) 55%, ${W} 85%)`,
              pointerEvents: 'none',
              zIndex: 2,
            }} />
          </div>

          {/* Navigation: arrows + dots */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '0.85rem 2rem',
            borderTop: `1px solid ${BORDER}`,
            background: SURFACE,
          }}>
            <button
              className="sr-arrow-btn sr-nav-arrows"
              onClick={goPrev}
              aria-label="Previous card"
            >
              <ArrowLeft size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  className="sr-dot"
                  onClick={() => goTo(i)}
                  aria-label={`Go to card ${i + 1}`}
                  style={{
                    background: i === activeIndex ? GOLD : BORDER,
                    transform: i === activeIndex ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <button
              className="sr-arrow-btn sr-nav-arrows"
              onClick={goNext}
              aria-label="Next card"
            >
              <ArrowRight size={15} />
            </button>
          </div>

          {/* CTA bar */}
          <div style={{
            padding: '1.25rem 2rem',
            textAlign: 'center',
            background: W,
            borderTop: `1px solid ${BORDER}`,
          }}>
            <p style={{ fontSize: '0.7rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.6, margin: '0 0 0.6rem' }}>
              You&apos;re viewing selected highlights. The full audit includes all 120 search results, complete competitor analysis, detailed implementation guides, and a priority-ordered roadmap.
            </p>
            <a
              href="/score"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: GOLD,
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'gap 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.75rem'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.5rem'; }}
            >
              Get your free visibility score <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
