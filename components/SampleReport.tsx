'use client';

import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Search, Clock, Target, Zap } from 'lucide-react';

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

export default function SampleReport() {
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
            Sample report
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            color: '#F5F0E8',
            fontWeight: 600,
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            See what&apos;s inside your report
          </h2>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            Selected sections from a 5-page report. Every insight is backed by real AI search data specific to your business.
          </p>
        </div>

        {/* Mock report card — light theme to match PDF */}
        <style>{`
          @media (max-width: 600px) {
            .sr-two-col { flex-direction: column !important; }
            .sr-two-col > div { border-right: none !important; border-bottom: 1px solid ${BORDER}; }
            .sr-two-col > div:last-child { border-bottom: none !important; }
          }
        `}</style>
        <div style={{
          background: W,
          border: `1px solid ${BORDER}`,
          maxWidth: '820px',
          margin: '0 auto',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        }}>
          {/* Report header bar — dark like PDF */}
          <div style={{
            padding: '1.25rem 2rem',
            borderBottom: `2px solid ${GOLD}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            background: DARK,
          }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#F5F0E8', fontWeight: 600 }}>
                presenzia<span style={{ color: GOLD }}>.ai</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>Smith &amp; Co Solicitors · Manchester · Feb 2026</span>
              <span style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.15rem 0.5rem', border: '1px solid #444' }}>Preview</span>
            </div>
          </div>

          {/* Score hero */}
          <div style={{
            padding: '2rem',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
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
            <div style={{ flex: 1, minWidth: '200px' }}>
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
                Found in only 7 of 80 AI searches across 4 platforms. When customers in Manchester ask AI for solicitor recommendations, your competitors are being recommended instead.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${BORDER}`,
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
                minWidth: '100px',
                padding: '1rem 1.25rem',
                textAlign: 'center',
                borderRight: i < 3 ? `1px solid ${BORDER}` : 'none',
                background: SURFACE,
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.4rem',
                  color: stat.warn ? RED : GOLD,
                  fontWeight: 600,
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}>{stat.value}</div>
                <div style={{ fontSize: '0.6rem', color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Two-column: platforms + competitors */}
          <div className="sr-two-col" style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, flexWrap: 'wrap' }}>
            {/* Platform breakdown */}
            <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem', borderRight: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: '0.7rem', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Platform breakdown</div>
              {[
                { name: 'ChatGPT', score: 0, max: 100, mentions: '0/20', found: false },
                { name: 'Perplexity', score: 55, max: 100, mentions: '5/20', found: true },
                { name: 'Google AI', score: 15, max: 100, mentions: '2/20', found: false },
                { name: 'Claude', score: 0, max: 100, mentions: '0/20', found: false },
              ].map(platform => (
                <div key={platform.name} style={{ marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {platform.found
                        ? <CheckCircle size={12} style={{ color: GOLD }} />
                        : <XCircle size={12} style={{ color: BORDER_LIGHT }} />
                      }
                      <span style={{ fontSize: '0.75rem', color: platform.found ? TXT : TXT2 }}>{platform.name}</span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: MUTED }}>{platform.mentions}</span>
                  </div>
                  <div style={{ height: '3px', background: BORDER, borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${(platform.score / platform.max) * 100}%`, background: platform.found ? GOLD : platform.score > 0 ? '#BBBBBB' : BORDER, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: MUTED, lineHeight: 1.5 }}>
                Mentioned on <span style={{ color: GOLD, fontWeight: 600 }}>1</span> of 4 platforms consistently
              </div>
            </div>

            {/* Competitors */}
            <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem' }}>
              <div style={{ fontSize: '0.7rem', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Who&apos;s appearing instead</div>
              {[
                { name: 'Taylor Rose MW', mentions: 14, platforms: 4 },
                { name: 'JMW Solicitors', mentions: 11, platforms: 3 },
                { name: 'Slater & Gordon', mentions: 9, platforms: 3 },
                { name: 'Pannone Corporate', mentions: 6, platforms: 2 },
              ].map((comp, i) => (
                <div key={comp.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: TXT }}>{comp.name}</div>
                    <div style={{ fontSize: '0.65rem', color: MUTED }}>across {comp.platforms} platform{comp.platforms > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: RED,
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                  }}>
                    {comp.mentions} mentions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompts tested */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '0.7rem', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Sample prompts tested</div>
            {[
              { prompt: '"Best solicitors in Manchester for commercial law"', found: false, platform: 'ChatGPT' },
              { prompt: '"Recommend a reliable law firm in Manchester"', found: true, platform: 'Perplexity' },
              { prompt: '"Top-rated solicitors near Manchester city centre"', found: false, platform: 'Claude' },
              { prompt: '"Who are the best business lawyers in Greater Manchester?"', found: false, platform: 'Google AI' },
            ].map((test, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.6rem 0',
                borderBottom: i < 3 ? `1px solid ${BORDER}` : 'none',
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
                    {test.platform} · {test.found ? 'Your business was mentioned' : 'Not mentioned in response'}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: MUTED, lineHeight: 1.5 }}>
              <Search size={11} style={{ color: MUTED, verticalAlign: 'middle', marginRight: '0.3rem' }} />
              Showing 4 of 80 searches tested · 7 total mentions found across all platforms
            </div>
          </div>

          {/* Key findings */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '0.7rem', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Key findings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: 'critical', text: 'Absent from ChatGPT entirely (0 of 20 searches). This is the most widely used AI assistant and your biggest gap.' },
                { icon: 'warning', text: 'Perplexity is the only platform recommending you consistently (5 of 20 searches), likely from directory listings.' },
                { icon: 'warning', text: 'Taylor Rose MW appeared 14 times where you were absent. They have stronger directory, review, and press signals.' },
              ].map((finding, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <AlertTriangle
                    size={14}
                    style={{
                      color: finding.icon === 'critical' ? RED : GOLD,
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: TXT2, lineHeight: 1.55 }}>
                    {finding.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ ACTION PLAN ═══ */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: '0.7rem', color: MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Your action plan</div>
            <div style={{ fontSize: '0.75rem', color: MUTED, marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Ordered by priority. Complete Phase 1 first for the fastest improvement to your score.
            </div>

            {/* ── PHASE 1: IMMEDIATE ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
                paddingBottom: '0.5rem',
                borderBottom: `1px solid ${BORDER}`,
              }}>
                <Zap size={13} style={{ color: RED }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 1: Immediate</span>
                <span style={{ fontSize: '0.6rem', color: MUTED, marginLeft: 'auto' }}>This week</span>
              </div>

              {/* Action 1 */}
              <div style={{
                background: SURFACE2,
                border: `1px solid ${BORDER_LIGHT}`,
                borderLeft: `3px solid ${GOLD}`,
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>HIGH PRIORITY</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Complete your Google Business Profile</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  Google AI found you in only 2 of 20 searches, and never above position 5. Your profile is likely incomplete or not optimised for AI discovery.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Claim or verify your listing at business.google.com',
                    'Write a detailed description mentioning "solicitors in Manchester"',
                    'Upload 10+ professional photos (office, team, branding)',
                    'Select every relevant business category (primary + secondary)',
                    'Respond to every existing review within 48 hours',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action 2 */}
              <div style={{
                background: SURFACE2,
                border: `1px solid ${BORDER_LIGHT}`,
                borderLeft: `3px solid ${GOLD}`,
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em' }}>HIGH PRIORITY</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Close the gap on Taylor Rose MW</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  Taylor Rose MW was cited 14 times in searches where you were absent. They are currently the business AI recommends most in your category.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Search for "Taylor Rose MW" and note which directories they appear on',
                    'Check their review volume on Google, Trustpilot, and legal directories',
                    'Identify which platforms they\'re listed on that you\'re not',
                    'Analyse their website content for FAQ pages and structured data',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PHASE 2: SHORT TERM ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
                paddingBottom: '0.5rem',
                borderBottom: `1px solid ${BORDER}`,
              }}>
                <Target size={13} style={{ color: GOLD }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 2: Short term</span>
                <span style={{ fontSize: '0.6rem', color: MUTED, marginLeft: 'auto' }}>Weeks 2–4</span>
              </div>

              {/* Action 3 */}
              <div style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: MUTED, letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Get listed on key legal directories</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  You appeared in only 7 of 80 AI searches (9%). Directory presence is a key signal that AI platforms rely on for local recommendations.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Ensure consistent NAP (name, address, phone) across all listings',
                    'List on Solicitors.guru, The Law Society directory, and Trustpilot',
                    'List on Yell.com, FreeIndex, and Thomson Local (all free)',
                    'Target 5–10 new genuine reviews per month across platforms',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action 4 */}
              <div style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: MUTED, letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Add AI-optimised content to your website</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Create a FAQ page answering "best solicitors in Manchester" queries',
                    'Add Schema.org LocalBusiness structured data markup',
                    'Ensure address and phone are in plain text, not images',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PHASE 3: ONGOING ── */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.85rem',
                paddingBottom: '0.5rem',
                borderBottom: `1px solid ${BORDER}`,
              }}>
                <Clock size={13} style={{ color: MUTED }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 3: Ongoing</span>
                <span style={{ fontSize: '0.6rem', color: MUTED, marginLeft: 'auto' }}>Month 2+</span>
              </div>

              <div style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: MUTED, letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Get featured in local publications</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Pitch to Manchester Evening News and Manchester Confidential',
                    'Offer to be quoted as a local legal expert',
                    'Publish expertise-led content (guides, case studies) on your own site',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: MUTED, letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: TXT, fontWeight: 600 }}>Optimise specifically for ChatGPT</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: MUTED, marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  ChatGPT returned 0 mentions across all 20 searches. This platform relies heavily on authoritative backlinks and training data coverage.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Build high-authority backlinks from local institutions and chambers of commerce',
                    'Aim for mentions in established publications and industry bodies',
                    'Publish long-form expert content on your website',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: MUTED, fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: TXT2, lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Report CTA */}
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: SURFACE,
            borderTop: `1px solid ${BORDER}`,
          }}>
            <p style={{ fontSize: '0.7rem', color: MUTED, marginBottom: '0.5rem', lineHeight: 1.6 }}>
              You&apos;re viewing selected sections. The full 5-page report includes complete search results, detailed competitor analysis, and a personalised action plan for your business.
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
                transition: 'gap 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.75rem'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.5rem'; }}
            >
              Get your own report <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
