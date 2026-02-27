'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

const BUSINESS_TYPES = [
  'Restaurant / Cafe',
  'Bar / Pub / Nightclub',
  'Coffee Shop / Bakery',
  'Beauty Salon / Barbershop',
  'Gym / Fitness Studio',
  'Yoga / Pilates Studio',
  'Spa / Wellness Centre',
  'Dental Practice',
  'Doctor / Medical Practice',
  'Physiotherapy / Chiropractic',
  'Therapist / Counsellor',
  'Solicitor / Law Firm',
  'Accountant / Bookkeeper',
  'Financial Adviser',
  'Estate Agent',
  'Hotel / B&B / Guesthouse',
  'Retail / Shop / Boutique',
  'Veterinary Practice',
  'Plumber / Electrician / Tradesperson',
  'Cleaning Company',
  'Private Tutor / Education Centre',
  'Wedding Venue / Events',
  'Photographer / Videographer',
  'Marketing / Design Agency',
  'IT / Software / Tech',
  'Other',
];

const planNames: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  premium: 'Premium',
};

function OnboardingForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';

  const [form, setForm] = useState({
    email: '',
    contactName: '',
    businessName: '',
    businessType: '',
    description: '',
    location: '',
    website: '',
    keywords: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!plan || !planNames[plan]) {
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
          Invalid plan
        </h1>
        <p style={{ color: '#AAAAAA', marginBottom: '2rem' }}>
          Please select a plan from our{' '}
          <Link href="/#pricing" style={{ color: '#C9A84C' }}>pricing page</Link>.
        </p>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Back to home</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate keywords have at least 2 comma-separated terms
      const keywordList = form.keywords.split(',').map(k => k.trim()).filter(Boolean);
      if (keywordList.length < 2) {
        setError('Please add at least 2 keywords separated by commas — this is essential for an accurate audit.');
        setSubmitting(false);
        return;
      }

      const fullWebsite = form.website.trim() ? `https://${form.website.trim()}` : '';

      // Save lead for funnel tracking (fire-and-forget, never blocks checkout)
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: form.email,
          contact_name: form.contactName || null,
          business_name: form.businessName,
          business_type: form.businessType,
          description: form.description,
          location: form.location || null,
          website: fullWebsite,
          keywords: form.keywords,
        }),
      }).catch(() => {});

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: form.email,
          business_name: form.businessName,
          business_type: form.businessType,
          description: form.description,
          location: form.location,
          website: fullWebsite,
          keywords: form.keywords,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again or email hello@presenzia.ai');
        setSubmitting(false);
      }
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

  const hintStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.4rem',
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
        <div style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.05em' }}>Step 1 of 2</div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem clamp(1rem, 3vw, 2rem) 4rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {planNames[plan]} plan
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
            We need a few details to run your AI visibility audit. Takes about 30 seconds, then you'll proceed to payment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Email */}
            <div>
              <label style={labelStyle}>
                Your email <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. jane@yourbusiness.co.uk"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
              <div style={hintStyle}>We'll send your audit here</div>
            </div>

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

            {/* Description */}
            <div>
              <label style={labelStyle}>
                What does your business do? <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Family-run Italian restaurant specialising in homemade pasta"
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={inputStyle}
                maxLength={200}
              />
              <div style={hintStyle}>
                One sentence — this helps us match you against the right competitors
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label style={labelStyle}>
                Keywords <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Italian restaurant, private dining, wine bar"
                value={form.keywords}
                onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                style={inputStyle}
              />
              <div style={hintStyle}>
                What would a customer search for to find you? Add at least 2, comma-separated
              </div>
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
              <div style={hintStyle}>
                The city or area your customers are in
              </div>
            </div>

            {/* Website */}
            <div>
              <label style={labelStyle}>Website <span style={{ color: '#888' }}>(optional)</span></label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{
                  padding: '0.75rem 0.75rem',
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRight: 'none',
                  color: '#666',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}>https://</div>
                <input
                  type="text"
                  placeholder="www.yourbusiness.co.uk"
                  value={form.website}
                  onChange={e => {
                    let v = e.target.value;
                    // Strip protocol if user pastes a full URL
                    v = v.replace(/^https?:\/\//, '');
                    setForm(f => ({ ...f, website: v }));
                  }}
                  style={{ ...inputStyle, borderLeft: 'none' }}
                />
              </div>
              <div style={hintStyle}>Leave blank if your business doesn't have a website</div>
            </div>

            {/* Contact Name */}
            <div>
              <label style={labelStyle}>Your name <span style={{ color: '#888' }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                style={inputStyle}
              />
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
              {submitting ? 'Redirecting to payment...' : 'Continue to payment →'}
            </button>

            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', margin: 0 }}>
              You won't be charged until the next step
            </p>

          </div>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '2rem' }}>
          Questions? Email{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#999', textDecoration: 'none' }}>hello@presenzia.ai</a>
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
