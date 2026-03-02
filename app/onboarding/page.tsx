'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect, useRef } from 'react';

const SCORE_STORAGE_KEY = 'presenzia_score_state';

const FIRM_TYPES = [
  'Independent Financial Advisor (IFA)',
  'Chartered Financial Planner',
  'Wealth Management Firm',
  'Discretionary Fund Manager',
  'Financial Planning Practice',
  'Multi-Advisor IFA Network',
  'Restricted Financial Advisor',
  'Retirement Specialist',
  'Estate & Inheritance Planning',
  'Corporate Financial Advisor',
  'Other',
];

const planNames: Record<string, string> = {
  audit: 'Full AI Audit & Action Plan',
  starter: 'Starter', // legacy fallback
  growth: 'Growth Retainer',
  premium: 'Premium',
};

interface ScoreState {
  firmName?: string;
  website?: string;
  locations?: string;
  coverageType?: string;
  specialties?: string[];
  email?: string;
  name?: string;
  firmDescription?: string;
  additionalContext?: string;
  targetClient?: string;
}

function loadScoreState(): ScoreState | null {
  try {
    const raw = sessionStorage.getItem(SCORE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function OnboardingForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'audit';
  const scoreState = useRef<ScoreState | null>(null);
  const autoSubmitted = useRef(false);

  // Load score state on mount (client-side only)
  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    email: '',
    contactName: '',
    businessName: '',
    firmType: '',
    description: '',
    location: '',
    website: '',
    keywords: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // On mount: read sessionStorage and pre-fill / auto-submit
  useEffect(() => {
    const saved = loadScoreState();
    scoreState.current = saved;

    if (saved) {
      const keywords = (saved.specialties || []).join(', ');
      // Infer firm type from specialties if possible
      let inferredFirmType = 'Other';
      const specs = saved.specialties || [];
      if (specs.includes('Wealth Management')) inferredFirmType = 'Wealth Management Firm';
      else if (specs.includes('Financial Planning')) inferredFirmType = 'Chartered Financial Planner';
      else if (specs.includes('Retirement & Pensions')) inferredFirmType = 'Retirement Specialist';
      else if (specs.includes('Inheritance & Estate Planning')) inferredFirmType = 'Estate & Inheritance Planning';
      else if (specs.includes('Investment Management')) inferredFirmType = 'Discretionary Fund Manager';
      else if (specs.includes('Corporate Financial Advisory')) inferredFirmType = 'Corporate Financial Advisor';

      const preFilled = {
        email: saved.email || '',
        contactName: saved.name || '',
        businessName: saved.firmName || '',
        firmType: inferredFirmType,
        description: saved.firmDescription || '',
        location: saved.locations || '',
        website: saved.website || '',
        keywords,
      };
      setForm(preFilled);

      // Check if we have enough to auto-submit
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const canAutoSubmit =
        preFilled.businessName &&
        preFilled.email &&
        preFilled.location &&
        keywordList.length >= 2;

      if (canAutoSubmit && !autoSubmitted.current) {
        autoSubmitted.current = true;
        setSubmitting(true);
        // Auto-submit after a brief render so user sees "Redirecting..."
        setTimeout(() => doSubmit(preFilled), 100);
        return;
      }
    }

    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSubmit = async (formData: typeof form) => {
    setSubmitting(true);
    setError('');

    try {
      const keywordList = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
      if (keywordList.length < 2) {
        setError('Please add at least 2 keywords separated by commas. This is essential for an accurate audit.');
        setSubmitting(false);
        setLoaded(true);
        return;
      }

      const fullWebsite = formData.website.trim() ? `https://${formData.website.trim()}` : '';

      // Save lead for funnel tracking (fire-and-forget, never blocks checkout)
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: formData.email,
          contact_name: formData.contactName || null,
          business_name: formData.businessName,
          business_type: formData.firmType,
          description: formData.description,
          location: formData.location || null,
          website: fullWebsite,
          keywords: formData.keywords,
        }),
      }).catch(() => {});

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: formData.email,
          business_name: formData.businessName,
          business_type: formData.firmType,
          description: formData.description,
          location: formData.location,
          website: fullWebsite,
          keywords: formData.keywords,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again or email hello@presenzia.ai');
        setSubmitting(false);
        setLoaded(true);
      }
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
      setLoaded(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSubmit(form);
  };

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
          <Link href="/pricing" style={{ color: '#C9A84C' }}>pricing page</Link>.
        </p>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Back to home</Link>
      </div>
    );
  }

  // Show redirecting screen while auto-submitting
  if (submitting && !loaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Nav */}
        <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid #1A1A1A',
              borderTopColor: '#C9A84C',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem',
            }} />
            <h2 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.5rem',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              Redirecting to payment...
            </h2>
            <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We already have your firm details from your free score. Taking you straight to checkout.
            </p>
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', fontSize: '0.875rem', marginTop: '1rem' }}>
                {error}
              </div>
            )}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
            Tell us about your firm
          </h1>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto' }}>
            We need a few details to run your AI visibility audit. Takes about 30 seconds, then you&apos;ll proceed to payment.
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
                placeholder="e.g. jane@yourfirm.co.uk"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
              <div style={hintStyle}>We&apos;ll send your audit here</div>
            </div>

            {/* Firm Name */}
            <div>
              <label style={labelStyle}>
                Firm name <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hartfield Wealth Management"
                required
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                style={inputStyle}
              />
            </div>

            {/* Firm Type */}
            <div>
              <label style={labelStyle}>
                Firm type <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <select
                required
                value={form.firmType}
                onChange={e => setForm(f => ({ ...f, firmType: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="" disabled>Select your firm type...</option>
                {FIRM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>
                What does your firm specialise in? <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Retirement planning and pension transfers for clients with £250k+"
                required
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={inputStyle}
                maxLength={200}
              />
              <div style={hintStyle}>
                One sentence. This helps us match you against the right competitors
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label style={labelStyle}>
                Specialties / Keywords <span style={{ color: '#C9A84C' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. pension transfer, inheritance tax, wealth management"
                value={form.keywords}
                onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                style={inputStyle}
              />
              <div style={hintStyle}>
                What would a prospective client search for to find your firm? Add at least 2, comma-separated
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
                The city or area your clients are in
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
                  placeholder="www.yourfirm.co.uk"
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
              <div style={hintStyle}>Leave blank if your firm doesn&apos;t have a website</div>
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
