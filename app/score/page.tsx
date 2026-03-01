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

export default function ScorePage() {
  const [step, setStep] = useState<Step>('form');
  const [firmName, setFirmName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [specialty, setSpecialty] = useState('');
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
        body: JSON.stringify({ firmName, postcode, specialty }),
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
        <Link href="/" style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* ── STEP 1: FORM ── */}
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
                Get your free AI visibility score in 60 seconds. No signup required.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                </div>

                <div>
                  <label style={labelStyle}>Postcode <span style={{ color: '#C9A84C' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. GU1 4QR"
                    required
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    style={inputStyle}
                    maxLength={8}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Specialty <span style={{ color: '#C9A84C' }}>*</span></label>
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

        {/* ── STEP 2: LOADING ── */}
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

        {/* ── STEP 3: EMAIL GATE ── */}
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

        {/* ── STEP 4: RESULTS ── */}
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
                Your firm was found in <strong style={{ color: '#F5F0E8' }}>{result.mentionsCount} of {result.totalPrompts}</strong> AI searches.
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
                  ⚠ Your Top Competitor
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
                  <span style={{ color: p.mentioned > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.9rem', fontWeight: 600 }}>
                    {p.mentioned}/{p.tested} prompts
                  </span>
                </div>
              ))}
            </div>

            {/* Blurred preview */}
            <div style={{
              position: 'relative',
              padding: '1.5rem',
              background: '#111',
              border: '1px solid #1A1A1A',
              marginBottom: '1.5rem',
              overflow: 'hidden',
            }}>
              <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>FULL PLATFORM BREAKDOWN</div>
                <div style={{ height: '8px', background: '#1A1A1A', width: '80%', marginBottom: '0.5rem' }} />
                <div style={{ height: '8px', background: '#1A1A1A', width: '65%', marginBottom: '0.5rem' }} />
                <div style={{ height: '8px', background: '#1A1A1A', width: '90%', marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>COMPETITOR ANALYSIS</div>
                <div style={{ height: '8px', background: '#1A1A1A', width: '70%', marginBottom: '0.5rem' }} />
                <div style={{ height: '8px', background: '#1A1A1A', width: '55%', marginBottom: '0.5rem' }} />
                <div style={{ height: '8px', background: '#1A1A1A', width: '85%', marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>PERSONALISED ACTION PLAN</div>
                <div style={{ height: '8px', background: '#1A1A1A', width: '75%', marginBottom: '0.5rem' }} />
                <div style={{ height: '8px', background: '#1A1A1A', width: '60%', marginBottom: '0.5rem' }} />
              </div>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10,10,10,0.6)',
                backdropFilter: 'blur(2px)',
              }}>
                <p style={{ color: '#AAAAAA', fontSize: '0.85rem', textAlign: 'center', maxWidth: '280px', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                  Full platform breakdown, competitor analysis, and personalised action plan available in your full AI Visibility Audit.
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
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            >
              Get my full audit — £297 →
            </Link>

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
