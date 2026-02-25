'use client';

import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Search, Clock, Target, Zap } from 'lucide-react';

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
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
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
            See exactly what you&apos;ll receive
          </h2>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            Every report is clear, professional, and designed to be understood without any technical knowledge. Here&apos;s what a typical report looks like.
          </p>
        </div>

        {/* Mock report card */}
        <style>{`
          @media (max-width: 600px) {
            .sr-two-col { flex-direction: column !important; }
            .sr-two-col > div { border-right: none !important; border-bottom: 1px solid #222222; }
            .sr-two-col > div:last-child { border-bottom: none !important; }
          }
        `}</style>
        <div style={{
          background: '#111111',
          border: '1px solid #222222',
          maxWidth: '820px',
          margin: '0 auto',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* Report header bar */}
          <div style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #222222',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>presenzia.ai</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: '#F5F0E8' }}>AI Visibility Report</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>Smith &amp; Co Solicitors · Manchester · Feb 2026</div>
          </div>

          {/* Score hero */}
          <div style={{
            padding: '2rem',
            borderBottom: '1px solid #222222',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '3px solid #cc4444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', color: '#F5F0E8', lineHeight: 1 }}>34</div>
              <div style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '0.05em' }}>/100</div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#F5F0E8', fontWeight: 600 }}>Overall Visibility Score</span>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  background: 'rgba(204,68,68,0.15)',
                  border: '1px solid rgba(204,68,68,0.3)',
                  color: '#cc4444',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}>GRADE F</span>
              </div>
              <p style={{ color: '#888', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                Your business was found in only 1 of 4 AI platforms tested. When customers in Manchester ask AI for solicitor recommendations, competitors are being cited significantly more often.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #222222',
            flexWrap: 'wrap',
          }}>
            {[
              { value: '32', label: 'Searches tested' },
              { value: '3', label: 'Times found', highlight: false },
              { value: '4', label: 'Platforms audited' },
              { value: '6', label: 'Competitors found', warn: true },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1,
                minWidth: '100px',
                padding: '1rem 1.25rem',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid #222222' : 'none',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.4rem',
                  color: stat.warn ? '#cc4444' : '#C9A84C',
                  fontWeight: 600,
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}>{stat.value}</div>
                <div style={{ fontSize: '0.6rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Two-column: platforms + competitors */}
          <div className="sr-two-col" style={{ display: 'flex', borderBottom: '1px solid #222222', flexWrap: 'wrap' }}>
            {/* Platform breakdown */}
            <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem', borderRight: '1px solid #222222' }}>
              <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Platform breakdown</div>
              {[
                { name: 'ChatGPT', score: 2, max: 10, found: false },
                { name: 'Claude', score: 4, max: 10, found: false },
                { name: 'Perplexity', score: 8, max: 10, found: true },
                { name: 'Google AI', score: 3, max: 10, found: false },
              ].map(platform => (
                <div key={platform.name} style={{ marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {platform.found
                        ? <CheckCircle size={12} style={{ color: '#C9A84C' }} />
                        : <XCircle size={12} style={{ color: '#555' }} />
                      }
                      <span style={{ fontSize: '0.75rem', color: platform.found ? '#F5F0E8' : '#777' }}>{platform.name}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: platform.found ? '#C9A84C' : '#555', fontFamily: "'Playfair Display', serif" }}>{platform.score}/{platform.max}</span>
                  </div>
                  <div style={{ height: '3px', background: '#222222', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${(platform.score / platform.max) * 100}%`, background: platform.found ? '#C9A84C' : '#444', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
                Found on <span style={{ color: '#C9A84C' }}>1</span> of 4 platforms
              </div>
            </div>

            {/* Competitors */}
            <div style={{ flex: 1, minWidth: '260px', padding: '1.5rem 2rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Who&apos;s appearing instead</div>
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
                  borderBottom: i < 3 ? '1px solid #1a1a1a' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#CCCCCC' }}>{comp.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#555' }}>across {comp.platforms} platform{comp.platforms > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#cc4444',
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
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222222' }}>
            <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Sample prompts tested</div>
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
                borderBottom: i < 3 ? '1px solid #1a1a1a' : 'none',
              }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  {test.found
                    ? <CheckCircle size={14} style={{ color: '#C9A84C' }} />
                    : <XCircle size={14} style={{ color: '#cc4444' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: test.found ? '#F5F0E8' : '#999', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {test.prompt}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '0.15rem' }}>
                    {test.platform} · {test.found ? 'Your business was mentioned' : 'Not mentioned in response'}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
              <Search size={11} style={{ color: '#555', verticalAlign: 'middle', marginRight: '0.3rem' }} />
              32 total prompts tested across all platforms · 3 mentions found
            </div>
          </div>

          {/* Key findings */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222222' }}>
            <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Key findings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: 'critical', text: 'Not mentioned at all on ChatGPT, the most widely used AI assistant. This is your biggest gap.' },
                { icon: 'warning', text: 'Perplexity is the only platform citing your business, likely from directory listings, but position is inconsistent.' },
                { icon: 'warning', text: 'Competitors have stronger signals from Google Business Profile, legal directories, and local press coverage.' },
              ].map((finding, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <AlertTriangle
                    size={14}
                    style={{
                      color: finding.icon === 'critical' ? '#cc4444' : '#C9A84C',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#BBBBBB', lineHeight: 1.55 }}>
                    {finding.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ ACTION PLAN ═══ */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222222' }}>
            <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Your action plan</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '1.25rem', lineHeight: 1.5 }}>
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
                borderBottom: '1px solid #1a1a1a',
              }}>
                <Zap size={13} style={{ color: '#cc4444' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#cc4444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 1: Immediate</span>
                <span style={{ fontSize: '0.6rem', color: '#555', marginLeft: 'auto' }}>This week</span>
              </div>

              {/* Action 1 */}
              <div style={{
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid #1e1e1e',
                borderLeft: '3px solid #C9A84C',
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em' }}>HIGH PRIORITY</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Complete your Google Business Profile</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#777', marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  Google AI did not find your business in any of the 8 searches we tested. This strongly suggests your profile is either unclaimed, incomplete, or not optimised.
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
                      <span style={{ fontSize: '0.65rem', color: '#C9A84C', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action 2 */}
              <div style={{
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid #1e1e1e',
                borderLeft: '3px solid #C9A84C',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em' }}>HIGH PRIORITY</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Close the gap on Taylor Rose MW</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#777', marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
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
                      <span style={{ fontSize: '0.65rem', color: '#C9A84C', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
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
                borderBottom: '1px solid #1a1a1a',
              }}>
                <Target size={13} style={{ color: '#C9A84C' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 2: Short term</span>
                <span style={{ fontSize: '0.6rem', color: '#555', marginLeft: 'auto' }}>Weeks 2–4</span>
              </div>

              {/* Action 3 */}
              <div style={{
                border: '1px solid #1e1e1e',
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Get listed on key legal directories</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#777', marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  Your business was absent from 91% of all AI searches. This level of absence typically indicates limited presence across the directories AI platforms rely on.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Ensure consistent NAP (name, address, phone) across all listings',
                    'List on Solicitors.guru, The Law Society directory, and Trustpilot',
                    'List on Yell.com, FreeIndex, and Thomson Local (all free)',
                    'Target 5–10 new genuine reviews per month across platforms',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action 4 */}
              <div style={{
                border: '1px solid #1e1e1e',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Add AI-optimised content to your website</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Create a FAQ page answering "best solicitors in Manchester" queries',
                    'Add Schema.org LocalBusiness structured data markup',
                    'Ensure address and phone are in plain text, not images',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
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
                borderBottom: '1px solid #1a1a1a',
              }}>
                <Clock size={13} style={{ color: '#888' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Phase 3: Ongoing</span>
                <span style={{ fontSize: '0.6rem', color: '#555', marginLeft: 'auto' }}>Month 2+</span>
              </div>

              <div style={{
                border: '1px solid #1e1e1e',
                padding: '1rem 1.25rem',
                marginBottom: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Get featured in local publications</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Pitch to Manchester Evening News and Manchester Confidential',
                    'Offer to be quoted as a local legal expert',
                    'Publish expertise-led content (guides, case studies) on your own site',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                border: '1px solid #1e1e1e',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', letterSpacing: '0.08em' }}>RECOMMENDED</span>
                  <span style={{ fontSize: '0.82rem', color: '#F5F0E8', fontWeight: 600 }}>Optimise specifically for ChatGPT</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#777', marginBottom: '0.6rem', lineHeight: 1.5, fontStyle: 'italic' }}>
                  ChatGPT found you in 0 of 8 searches. This is your biggest platform gap.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Build high-authority backlinks from local institutions and chambers of commerce',
                    'Aim for mentions in established publications and industry bodies',
                    'Publish long-form expert content on your website',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, marginTop: '1px', flexShrink: 0 }}>›</span>
                      <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.45 }}>{step}</span>
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
            background: '#0D0D0D',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.15rem' }}>
              This is a preview. Your full report includes personalised data, competitor analysis, and a tailored action plan for your business.
            </p>
            <a
              href="/#pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#C9A84C',
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
