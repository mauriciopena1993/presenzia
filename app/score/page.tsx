'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const SPECIALTIES = [
  'Wealth Management',
  'Financial Planning',
  'Retirement & Pensions',
  'Tax Planning',
  'Inheritance & Estate Planning',
  'Mortgage & Protection',
  'Investment Management',
  'Corporate Financial Advisory',
];

const TARGET_CLIENTS = [
  'High-net-worth individuals (£250k+)',
  'Retirees & pre-retirees',
  'Business owners & entrepreneurs',
  'Professionals (doctors, lawyers, etc.)',
  'Families & estate planning',
  'Expats & international clients',
  'General / all client types',
];

interface ScoreResult {
  id: string;
  score: number;
  grade: string;
  mentionsCount: number;
  totalPrompts: number;
  topCompetitor: { name: string; count: number } | null;
  platformBreakdown: Array<{ platform: string; tested: number; mentioned: number }>;
  city: string;
}

type Step = 'form' | 'loading' | 'email' | 'results';

function scoreColor(score: number): string {
  if (score <= 20) return '#E74C3C';
  if (score <= 40) return '#E67E22';
  if (score <= 60) return '#F39C12';
  if (score <= 80) return '#27AE60';
  return '#2ECC71';
}

function getActionItems(score: number, specialty: string): Array<{ title: string; priority: string }> {
  const items: Array<{ title: string; priority: string }> = [];

  if (score < 50) {
    items.push({ title: 'Add FinancialService schema markup to your website', priority: 'Critical' });
    items.push({ title: 'Optimise Google Business Profile with detailed service descriptions', priority: 'Critical' });
  }
  items.push({ title: `Publish thought leadership content on ${specialty.toLowerCase()}`, priority: 'High' });
  items.push({ title: 'Build citation authority across VouchedFor, Unbiased & FTAdviser', priority: 'High' });
  items.push({ title: 'Create comprehensive FAQ page answering common client questions', priority: 'Medium' });
  items.push({ title: 'Implement systematic review generation strategy', priority: 'Medium' });

  return items.slice(0, 6);
}

export default function ScorePage() {
  const [step, setStep] = useState<Step>('form');
  const [firmName, setFirmName] = useState('');
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [targetClient, setTargetClient] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const resultReady = useRef(false);
  const minTimeReached = useRef(false);

  const loadingStages = [
    { label: 'Connecting to ChatGPT...', status: 'in_progress' },
    { label: 'Testing ChatGPT prompts...', status: 'queued' },
    { label: 'Connecting to Claude...', status: 'queued' },
    { label: 'Analysing competitors...', status: 'queued' },
    { label: 'Calculating your score...', status: 'queued' },
  ];

  useEffect(() => {
    if (step !== 'loading') return;

    // Progress through stages with timing
    const timings = [0, 2000, 4000, 6000, 7500];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setLoadingStage(i), delay)
    );

    // Progress bar
    const interval = setInterval(() => {
      setLoadingPercent(prev => {
        if (prev >= 95 && !resultReady.current) return 95;
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 80);

    // Minimum display time: 8 seconds
    const minTimer = setTimeout(() => {
      minTimeReached.current = true;
      if (resultReady.current) {
        setLoadingPercent(100);
        setTimeout(() => setStep('email'), 400);
      }
    }, 8000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
      clearTimeout(minTimer);
    };
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    resultReady.current = false;
    minTimeReached.current = false;
    setLoadingStage(0);
    setLoadingPercent(0);
    setStep('loading');

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName,
          city,
          specialty,
          targetClient,
          website: website.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to calculate score');
      }

      const data = await res.json();
      setResult(data);
      resultReady.current = true;

      if (minTimeReached.current) {
        setLoadingPercent(100);
        setTimeout(() => setStep('email'), 400);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('form');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?.id) return;

    try {
      await fetch(`/api/score/${result.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
    } catch {
      // Non-blocking — still show results
    }

    setStep('results');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    background: '#111',
    border: '1px solid #2A2A2A',
    color: '#F5F0E8',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-inter, Inter, sans-serif)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#999',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.35rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      color: '#F5F0E8',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'none' }}>Back to home</Link>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Free AI Visibility Score
              </div>
              <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 600, lineHeight: 1.2, marginBottom: '1rem' }}>
                How visible is your firm to AI?
              </h1>
              <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7 }}>
                We test real AI search prompts across ChatGPT and Claude to see if your firm gets recommended. Takes about 60 seconds.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Firm Name */}
                <div>
                  <label style={labelStyle}>Firm name <span style={{ color: '#C9A84C' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Hartfield Wealth Management"
                    required
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={hintStyle}>Your firm name exactly as it appears on your website</div>
                </div>

                {/* City / Area */}
                <div>
                  <label style={labelStyle}>City or area you serve <span style={{ color: '#C9A84C' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. London, Manchester, Surrey"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={hintStyle}>The main area your clients are in — we&apos;ll test AI searches for this location</div>
                </div>

                {/* Specialty */}
                <div>
                  <label style={labelStyle}>Primary specialty <span style={{ color: '#C9A84C' }}>*</span></label>
                  <select
                    required
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="" disabled>Select your focus area</option>
                    {SPECIALTIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Target Client */}
                <div>
                  <label style={labelStyle}>Target client type <span style={{ color: '#C9A84C' }}>*</span></label>
                  <select
                    required
                    value={targetClient}
                    onChange={e => setTargetClient(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="" disabled>Who do you primarily work with?</option>
                    {TARGET_CLIENTS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div style={hintStyle}>This helps us test the prompts your ideal clients would actually search</div>
                </div>

                {/* Website */}
                <div>
                  <label style={labelStyle}>Website <span style={{ color: '#888' }}>(recommended)</span></label>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div style={{
                      padding: '0.85rem 0.75rem',
                      background: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRight: 'none',
                      color: '#666',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-inter, Inter, sans-serif)',
                      display: 'flex',
                      alignItems: 'center',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}>https://</div>
                    <input
                      type="text"
                      placeholder="www.yourfirm.co.uk"
                      value={website}
                      onChange={e => {
                        let v = e.target.value;
                        v = v.replace(/^https?:\/\//, '');
                        setWebsite(v);
                      }}
                      style={{ ...inputStyle, borderLeft: 'none' }}
                    />
                  </div>
                  <div style={hintStyle}>Helps us check if AI models reference your website content</div>
                </div>

                {error && (
                  <div style={{ color: '#E74C3C', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#C9A84C',
                    color: '#0A0A0A',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    marginTop: '0.5rem',
                  }}
                >
                  Get my score →
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', fontSize: '0.8rem', color: '#666' }}>
              <span>✓ Free</span>
              <span>✓ 60 seconds</span>
              <span>✓ No credit card</span>
            </div>
          </div>
        )}

        {/* STEP 2: LOADING */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>
              Analysing your AI visibility...
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', marginBottom: '2rem' }}>
              {loadingStages.map((stage, i) => {
                let status = 'queued';
                if (i < loadingStage) status = 'complete';
                else if (i === loadingStage) status = 'in_progress';

                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <span style={{
                      width: '20px',
                      textAlign: 'center',
                      color: status === 'complete' ? '#27AE60' : status === 'in_progress' ? '#C9A84C' : '#444',
                    }}>
                      {status === 'complete' ? '✓' : status === 'in_progress' ? '⟳' : '○'}
                    </span>
                    <span style={{ color: status === 'queued' ? '#555' : '#F5F0E8' }}>
                      {stage.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#666' }}>
                      {status === 'complete' ? 'complete' : status === 'in_progress' ? 'in progress' : 'queued'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: '#1A1A1A', width: '100%', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: '#C9A84C',
                width: `${loadingPercent}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              {loadingPercent}%
            </div>
          </div>
        )}

        {/* STEP 3: EMAIL GATE */}
        {step === 'email' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              border: '1px solid rgba(201,168,76,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.5rem',
            }}>
              ✓
            </div>
            <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Your score is ready.
            </h2>
            <p style={{ color: '#AAAAAA', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Enter your email to see your results:
            </p>

            <form onSubmit={handleEmailSubmit} style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Email <span style={{ color: '#C9A84C' }}>*</span></label>
                  <input
                    type="email"
                    placeholder="you@yourfirm.co.uk"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Name <span style={{ color: '#888' }}>(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#C9A84C',
                    color: '#0A0A0A',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  Show my results →
                </button>
              </div>
            </form>
            <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '1rem' }}>
              We&apos;ll also email you a copy. No spam, ever.
            </p>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 'results' && result && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Your AI Visibility Score
              </div>

              {/* Score circle */}
              <div style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: `4px solid ${scoreColor(result.score)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: scoreColor(result.score), lineHeight: 1 }}>
                  {result.score}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>/ 100</div>
              </div>

              <div style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: `${scoreColor(result.score)}22`,
                border: `1px solid ${scoreColor(result.score)}44`,
                color: scoreColor(result.score),
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}>
                Grade: {result.grade}
              </div>

              <p style={{ color: '#AAAAAA', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Your firm was found in <strong style={{ color: '#F5F0E8' }}>{result.mentionsCount} of {result.totalPrompts}</strong> AI searches
                {result.city ? ` for ${result.city}` : ''}.
              </p>
            </div>

            {/* Competitor callout */}
            {result.topCompetitor && (
              <div style={{
                padding: '1.25rem',
                background: 'rgba(231,76,60,0.08)',
                border: '1px solid rgba(231,76,60,0.2)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E74C3C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Your Top Competitor
                </div>
                <p style={{ color: '#F5F0E8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                  <strong>&quot;{result.topCompetitor.name}&quot;</strong> appeared in{' '}
                  <strong>{result.topCompetitor.count} of {result.totalPrompts / 2}</strong> searches.
                  They are being recommended where you are not.
                </p>
              </div>
            )}

            {/* Platform breakdown */}
            <div style={{
              padding: '1.25rem',
              background: '#111',
              border: '1px solid #1A1A1A',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Platform Breakdown
              </div>
              {result.platformBreakdown.map(p => (
                <div key={p.platform} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
                  <span style={{ color: '#F5F0E8', fontSize: '0.9rem' }}>{p.platform}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '80px', height: '4px', background: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(p.mentioned / p.tested) * 100}%`,
                        background: p.mentioned > 0 ? '#27AE60' : '#E74C3C',
                        borderRadius: '2px',
                      }} />
                    </div>
                    <span style={{ color: p.mentioned > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>
                      {p.mentioned}/{p.tested} found
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced blurred preview — rich content with real data */}
            <div style={{
              position: 'relative',
              background: '#111',
              border: '1px solid #1A1A1A',
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}>
              {/* Visible header for competitor section */}
              <div style={{ padding: '1.25rem 1.5rem 0' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E74C3C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Full Competitor Analysis
                </div>
                {result.topCompetitor && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
                    <span style={{ color: '#F5F0E8', fontSize: '0.85rem' }}>1. {result.topCompetitor.name}</span>
                    <span style={{ color: '#E74C3C', fontSize: '0.8rem', fontWeight: 600 }}>{result.topCompetitor.count} mentions</span>
                  </div>
                )}
              </div>

              {/* Blurred competitor rows */}
              <div style={{ padding: '0 1.5rem', filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                {['Another Financial Planning Co.', 'Regional Wealth Partners', 'City Investment Advisors'].map((name, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
                    <span style={{ color: '#F5F0E8', fontSize: '0.85rem' }}>{i + 2}. {name}</span>
                    <span style={{ color: '#E67E22', fontSize: '0.8rem', fontWeight: 600 }}>{Math.max(1, (result.topCompetitor?.count || 5) - (i + 1) * 2)} mentions</span>
                  </div>
                ))}
              </div>

              {/* Action plan section - visible headings, blurred descriptions */}
              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Personalised Action Plan
                </div>
              </div>

              <div style={{ padding: '0 1.5rem' }}>
                {getActionItems(result.score, specialty).map((item, i) => (
                  <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        color: item.priority === 'Critical' ? '#E74C3C' : item.priority === 'High' ? '#C9A84C' : '#888',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>{item.priority}</span>
                      <span style={{ color: '#F5F0E8', fontSize: '0.8rem', fontWeight: 500 }}>{item.title}</span>
                    </div>
                    <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                      <div style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5 }}>
                        Detailed step-by-step implementation guide with specific recommendations for your firm based on analysis of your current web presence and competitor strategies...
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Platform deep-dive - visible platform names, blurred details */}
              <div style={{ padding: '1rem 1.5rem 0' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Platform Deep-Dive
                </div>
              </div>
              <div style={{ padding: '0 1.5rem 1rem' }}>
                {result.platformBreakdown.map((p, i) => (
                  <div key={i} style={{ padding: '0.4rem 0', borderBottom: '1px solid #1A1A1A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#F5F0E8', fontSize: '0.8rem' }}>{p.platform}</span>
                      <span style={{ color: p.mentioned > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.mentioned}/{p.tested}
                      </span>
                    </div>
                    <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                      <div style={{ height: '6px', background: '#1A1A1A', borderRadius: '3px', marginBottom: '0.25rem', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(p.mentioned / p.tested) * 100 || 5}%`, background: p.mentioned > 0 ? '#27AE60' : '#E74C3C', borderRadius: '3px' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>
                        3 specific recommendations for improving your {p.platform} visibility
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay CTA */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.97) 100%)',
                padding: '4rem 1.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <p style={{ color: '#F5F0E8', fontSize: '0.95rem', textAlign: 'center', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  Your full audit unlocks everything above
                </p>
                <p style={{ color: '#999', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.25rem', lineHeight: 1.5 }}>
                  Competitor deep-dive, actionable step-by-step plan, platform-specific recommendations, and priority roadmap
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/onboarding?plan=audit"
              style={{
                display: 'block',
                width: '100%',
                padding: '1rem',
                background: '#C9A84C',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                textDecoration: 'none',
                textAlign: 'center',
                letterSpacing: '0.02em',
                marginBottom: '0.75rem',
                boxSizing: 'border-box',
              }}
            >
              Get my full audit — £297 →
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Link href="/pricing" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}>
                Or see all plans →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `AI Visibility Score: ${result.score}/100`, url: `${window.location.origin}/score/${result.id}` });
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/score/${result.id}`);
                  }
                }}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid #2A2A2A',
                  color: '#AAAAAA',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                }}
              >
                Share this score
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
