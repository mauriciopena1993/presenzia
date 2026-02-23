'use client';

import { useState } from 'react';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '£149',
    period: '/month',
    description: 'Perfect for businesses that want to understand their AI presence.',
    features: [
      'Monthly AI search audit',
      '5 target keywords',
      'Audit across 4 AI platforms',
      'PDF report delivered by email',
      'Visibility score (0–100)',
      'Competitor mentions tracked',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '£299',
    period: '/month',
    description: 'For businesses serious about improving their AI visibility.',
    features: [
      'Weekly AI search audit',
      '15 target keywords',
      'Audit across all 4 AI platforms',
      'PDF report + client dashboard',
      'Competitor deep-dive analysis',
      'Monthly progress tracking',
      'Improvement recommendations',
    ],
    cta: 'Get started',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '£599',
    period: '/month',
    description: 'The full service — reports plus expert strategy calls.',
    features: [
      'Everything in Growth',
      'Monthly 1:1 strategy call',
      'Custom action plan',
      'Priority report delivery',
      'Industry benchmarking',
      'Dedicated account manager',
      'Quarterly business review',
    ],
    cta: 'Book a call',
    highlighted: false,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    if (planKey === 'premium') {
      window.location.href = 'mailto:hello@presenzia.ai?subject=Premium Plan Enquiry';
      return;
    }

    setLoading(planKey);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Please try again or email hello@presenzia.ai');
      }
    } catch {
      setError('Something went wrong. Please try again or email hello@presenzia.ai');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" style={{
      padding: '6rem 2rem',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Pricing
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          Simple, transparent pricing
        </h2>
        <p style={{ color: '#AAAAAA', maxWidth: '500px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.7 }}>
          No setup fees. No long-term contracts. Cancel anytime. Your first report is delivered within 48 hours of signing up.
        </p>
      </div>

      {/* Plans grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1px',
        background: '#222222',
        border: '1px solid #222222',
      }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            padding: '2.5rem',
            background: plan.highlighted ? '#0F0F0F' : '#0A0A0A',
            position: 'relative',
            borderTop: plan.highlighted ? '2px solid #C9A84C' : '2px solid transparent',
          }}>
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: '-1px',
                right: '1.5rem',
                background: '#C9A84C',
                color: '#0A0A0A',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.25rem 0.75rem',
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#AAAAAA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.75rem' }}>
                <span style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontSize: '2.5rem',
                  color: '#F5F0E8',
                  fontWeight: 600,
                }}>
                  {plan.price}
                </span>
                <span style={{ color: '#777777', fontSize: '0.875rem' }}>{plan.period}</span>
              </div>
              <p style={{ color: '#999999', fontSize: '0.875rem', lineHeight: 1.6 }}>{plan.description}</p>
            </div>

            <ul style={{ listStyle: 'none', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem', color: '#AAAAAA' }}>
                  <span style={{ color: '#C9A84C', marginTop: '2px', flexShrink: 0 }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.key)}
              disabled={loading === plan.key}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '0.875rem 1.5rem',
                background: plan.highlighted ? '#C9A84C' : 'transparent',
                color: plan.highlighted ? '#0A0A0A' : '#DDDDDD',
                border: plan.highlighted ? 'none' : '1px solid #333333',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
                cursor: loading === plan.key ? 'not-allowed' : 'pointer',
                opacity: loading === plan.key ? 0.7 : 1,
                transition: 'all 0.2s',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
              }}
              onMouseEnter={e => {
                if (loading === plan.key) return;
                const el = e.currentTarget;
                if (plan.highlighted) el.style.background = '#E8C96A';
                else { el.style.borderColor = '#C9A84C'; el.style.color = '#C9A84C'; }
              }}
              onMouseLeave={e => {
                if (loading === plan.key) return;
                const el = e.currentTarget;
                if (plan.highlighted) el.style.background = '#C9A84C';
                else { el.style.borderColor = '#333333'; el.style.color = '#DDDDDD'; }
              }}
            >
              {loading === plan.key ? 'Redirecting...' : `${plan.cta} →`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.5rem',
          background: '#1a0a0a',
          border: '1px solid #5a1a1a',
          color: '#ff6b7a',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#777777', fontSize: '0.8rem', marginTop: '2rem' }}>
        All plans include VAT. Billed monthly. Cancel anytime with 30 days notice.
      </p>
    </section>
  );
}
