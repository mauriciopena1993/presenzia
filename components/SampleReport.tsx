'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Search, Zap } from 'lucide-react';

// ── PDF-matching palette ──
const W = '#FFFFFF';
const SURFACE = '#F7F7F5';
const SURFACE2 = '#F0EFE9';
const BORDER = '#E0DDD5';
const BORDER_LIGHT = '#D5D2C8';
const TXT = '#111111';
const TXT2 = '#555555';
const MUTED = '#888888';
const GOLD = '#C9A84C';
const RED = '#cc4444';
const DARK = '#111111';

// ── Carousel card height ──
const CARD_HEIGHT = 340;

// ── Card content components ──

function ScoreCard() {
  return (
    <div style={{ padding: '2rem' }}>
      {/* Score hero */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: `3px solid ${RED}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', color: RED, lineHeight: 1 }}>34</div>
          <div style={{ fontSize: '0.65rem', color: MUTED, letterSpacing: '0.05em' }}>/100</div>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: TXT, fontWeight: 600 }}>Overall Visibility Score</span>
            <span style={{
              padding: '0.2rem 0.6rem',
              background: `${RED}15`,
              border: `1px solid ${RED}30`,
              color: RED,
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}>GRADE F</span>
          </div>
          <p style={{ color: TXT2, fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
            Found in only 7 of 80 AI searches across 4 platforms. Score weighted by platform market share.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        border: `1px solid ${BORDER}`,
        borderRadius: '4px',
        overflow: 'hidden',
        flexWrap: 'wrap',
      }}>
        {[
          { value: '80', label: 'Searches tested' },
          { value: '7', label: 'Times found' },
          { value: '4', label: 'Platforms audited' },
          { value: '6', label: 'Competitors found', warn: true },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            minWidth: '90px',
            padding: '0.85rem 1rem',
            textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${BORDER}` : 'none',
            background: SURFACE,
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.3rem',
              color: stat.warn ? RED : GOLD,
              fontWeight: 600,
              lineHeight: 1,
              marginBottom: '0.2rem',
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.58rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformCard() {
  const platforms = [
    { name: 'ChatGPT', score: 0, max: 100, mentions: '0/20', found: false, weight: '35%' },
    { name: 'Perplexity', score: 55, max: 100, mentions: '5/20', found: true, weight: '20%' },
    { name: 'Google AI', score: 15, max: 100, mentions: '2/20', found: false, weight: '30%' },
    { name: 'Claude', score: 0, max: 100, mentions: '0/20', found: false, weight: '15%' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600, marginBottom: '0.25rem' }}>Platform Breakdown</div>
      <div style={{ fontSize: '0.65rem', color: MUTED, marginBottom: '1rem' }}>Weighted by market share</div>
      {platforms.map(platform => (
        <div key={platform.name} style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {platform.found
                ? <CheckCircle size={13} style={{ color: GOLD }} />
                : <XCircle size={13} style={{ color: BORDER_LIGHT }} />
              }
              <span style={{ fontSize: '0.78rem', color: platform.found ? TXT : TXT2 }}>{platform.name}</span>
              <span style={{ fontSize: '0.6rem', color: MUTED }}>({platform.weight})</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: MUTED, fontWeight: 500 }}>{platform.mentions}</span>
          </div>
          <div style={{ height: '4px', background: BORDER, borderRadius: '2px' }}>
            <div style={{
              height: '100%',
              width: `${(platform.score / platform.max) * 100}%`,
              background: platform.found ? GOLD : platform.score > 0 ? '#BBBBBB' : BORDER,
              borderRadius: '2px',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: MUTED, lineHeight: 1.5 }}>
        Mentioned on <span style={{ color: GOLD, fontWeight: 600 }}>1</span> of 4 platforms consistently
      </div>
    </div>
  );
}

function PromptsCard() {
  const prompts = [
    { prompt: '\u201CBest solicitors in Manchester for commercial law\u201D', found: false, platform: 'ChatGPT' },
    { prompt: '\u201CRecommend a reliable law firm in Manchester\u201D', found: true, platform: 'Perplexity' },
    { prompt: '\u201CTop-rated solicitors near Manchester city centre\u201D', found: false, platform: 'Claude' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600, marginBottom: '0.75rem' }}>Search Prompts Tested</div>
      {prompts.map((test, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.65rem 0',
          borderBottom: i < prompts.length - 1 ? `1px solid ${BORDER}` : 'none',
        }}>
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {test.found
              ? <CheckCircle size={14} style={{ color: GOLD }} />
              : <XCircle size={14} style={{ color: RED }} />
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: test.found ? TXT : TXT2, fontStyle: 'italic', lineHeight: 1.4 }}>
              {test.prompt}
            </div>
            <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: '0.15rem' }}>
              {test.platform} &middot; {test.found ? 'Your business was mentioned' : 'Not mentioned in response'}
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: MUTED, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Search size={11} style={{ color: MUTED, flexShrink: 0 }} />
        Showing 3 of 80 searches tested &middot; 7 total mentions found
      </div>
    </div>
  );
}

function ActionPlanCard() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ fontSize: '0.85rem', color: TXT, fontWeight: 600, marginBottom: '0.25rem' }}>Your Action Plan</div>
      <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '1rem', lineHeight: 1.5 }}>
        Ordered by impact. Complete Phase 1 first for the fastest improvement.
      </div>

      {/* Phase 1 header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.85rem',
        paddingBottom: '0.5rem',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <Zap size={13} style={{ color: RED }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 1: Start Here</span>
        <span style={{ fontSize: '0.6rem', color: MUTED, marginLeft: 'auto' }}>Highest impact</span>
      </div>

      {/* Action card preview */}
      <div style={{
        background: SURFACE2,
        border: `1px solid ${BORDER_LIGHT}`,
        borderLeft: `3px solid ${GOLD}`,
        padding: '1rem 1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>HIGH PRIORITY</span>
          <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Complete your Google Business Profile</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
          Google AI found you in only 2 of 20 searches. Your profile is likely incomplete or not optimised for AI discovery.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            'Claim or verify your listing at business.google.com',
            'Write a detailed description mentioning \u201Csolicitors in Manchester\u201D',
            'Upload 10+ professional photos (office, team, branding)',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>&rsaquo;</span>
              <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
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

  // Auto-advance every 5 seconds, pauses on hover
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      goNext();
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, goNext]);

  const ActiveCard = CARDS[activeIndex].component;

  return (
    <section id="sample-report" style={{
      padding: '6rem 2rem',
      borderTop: '1px solid #222222',
      borderBottom: '1px solid #222222',
      background: '#080808',
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
            Selected sections from a 5-page AI Visibility Audit. Every insight is backed by real search data specific to your business. Scores are weighted by platform market share.
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
          .sr-card-enter-left {
            opacity: 0;
            transform: translateX(30px);
          }
          .sr-card-enter-right {
            opacity: 0;
            transform: translateX(-30px);
          }
          .sr-card-active {
            opacity: 1;
            transform: translateX(0);
          }
          .sr-card-exit-left {
            opacity: 0;
            transform: translateX(-30px);
          }
          .sr-card-exit-right {
            opacity: 0;
            transform: translateX(30px);
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
            maxWidth: '820px',
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
              Preview of Starter Audit
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
              Smith &amp; Co Solicitors
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

          {/* Carousel viewport */}
          <div style={{
            height: `${CARD_HEIGHT}px`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Card content with slide transition */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transition: isTransitioning ? 'opacity 0.2s ease, transform 0.2s ease' : 'opacity 0.25s ease, transform 0.25s ease',
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning
                  ? (slideDirection === 'left' ? 'translateX(-20px)' : 'translateX(20px)')
                  : 'translateX(0)',
              }}
            >
              <ActiveCard />
            </div>

            {/* Gradient fade at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: `linear-gradient(to bottom, transparent, ${W})`,
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
              You&apos;re viewing selected sections. The full 5-page audit includes complete search results, competitor analysis, and a personalised action plan.
            </p>
            <a
              href="/#pricing"
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
              Get your AI Visibility Audit <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
