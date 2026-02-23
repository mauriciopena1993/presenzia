'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

const BUSINESS_TYPES = [
  'Restaurant / Café / Food & Drink',
  'Retail / Shop',
  'Professional Services (Legal, Financial, Accounting)',
  'Healthcare / Medical / Dental',
  'Beauty / Wellness / Spa',
  'Home Services (Plumbing, Electrical, Cleaning)',
  'Hotel / Accommodation / Hospitality',
  'Gym / Fitness / Sports',
  'Education / Training / Coaching',
  'Technology / Software / IT',
  'Consulting / Agency',
  'Construction / Architecture',
  'Estate Agent / Property',
  'Automotive',
  'Other',
];

function OnboardingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'starter';

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    location: '',
    website: '',
    keywords: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!sessionId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
      }}>
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '2rem', color: '#F5F0E8', marginBottom: '1rem' }}>
          Invalid link
        </h1>
        <p style={{ color: '#AAAAAA', marginBottom: '2rem' }}>
          This page requires a valid session. If you&apos;ve just purchased, please check your email or{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C' }}>contact us</a>.
        </p>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          business_name: form.businessName,
          business_type: form.businessType,
          location: form.location,
          website: form.website,
          keywords: form.keywords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // Redirect to a confirmation page
      router.push(`/onboarding/confirm?plan=${plan}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#111111',
    border: '1px solid #2A2A2A',
    color: '#F5F0E8',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-inter, Inter, sans-serif)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888888',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <div style={{ fontSize: '0.8rem', color: '#555', letterSpacing: '0.05em' }}>Step 2 of 2</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Almost there
          </div>
          <h1 style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: '#F5F0E8',
            fontWeight: 600,
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Tell us about your business
          </h1>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto' }}>
            We need a few details to run your AI visibility audit. This takes about 30 seconds to fill in.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Business Name */}
            <div>
              <label style={labelStyle}>
                Business name <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. The Oak Brasserie"
                required
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Business Type */}
            <div>
              <label style={labelStyle}>
                Business type <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <select
                required
                value={form.businessType}
                onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="" disabled>Select your business type...</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={labelStyle}>
                City / Location <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. London, Manchester, Edinburgh"
                required
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.4rem' }}>
                The city or area your business primarily serves
              </div>
            </div>

            {/* Website */}
            <div>
              <label style={labelStyle}>Website <span style={{ color: '#555' }}>(optional)</span></label>
              <input
                type="url"
                placeholder="e.g. https://www.yourbusiness.co.uk"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Keywords */}
            <div>
              <label style={labelStyle}>Keywords <span style={{ color: '#555' }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Italian restaurant, private dining, wine bar"
                value={form.keywords}
                onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.4rem' }}>
                Terms you want AI to associate with your business, comma-separated
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '1rem 2rem',
                background: submitting ? '#8a7030' : '#C9A84C',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
                letterSpacing: '0.02em',
                transition: 'background 0.2s',
                width: '100%',
              }}
            >
              {submitting ? 'Starting your audit...' : 'Start my audit →'}
            </button>

          </div>
        </form>

        <p style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', marginTop: '2rem' }}>
          Questions? Email{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#666', textDecoration: 'none' }}>hello@presenzia.ai</a>
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C' }}>Loading...</div>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
