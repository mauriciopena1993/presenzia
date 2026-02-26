'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '£99',
    period: '/month',
    description: 'See exactly where your business stands across AI search — delivered to your inbox every month.',
    features: [
      'Monthly AI visibility audit',
      '4 AI platforms tested',
      'Visibility score & grade',
      'Competitor analysis',
      'Personalised action plan',
      'Delivered by email (report)',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '£199',
    period: '/month',
    description: 'Your monthly audit plus an online dashboard and AI tools to actively improve your visibility.',
    features: [
      'Everything in Starter',
      'Online client dashboard',
      'Weekly dashboard updates',
      'AI audit assistant',
      'Competitor deep-dive',
      'Priority support',
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
    description: 'The full service — expert guidance, daily insights, and a dedicated strategist in your corner.',
    features: [
      'Everything in Growth',
      'Daily dashboard updates',
      'Dedicated account manager',
      'Monthly 1:1 strategy call',
      'Custom prompt testing',
      'Industry benchmarking',
    ],
    cta: 'Book a call',
    highlighted: false,
  },
];

/* ── Comparison table data ── */

type CellValue = boolean | string;

interface ComparisonRow {
  feature: string;
  starter: CellValue;
  growth: CellValue;
  premium: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: 'Monthly AI visibility audit (4 platforms)',  starter: true,  growth: true,     premium: true },
  { feature: 'Visibility score, grade & action plan',      starter: true,  growth: true,     premium: true },
  { feature: 'Competitor analysis',                        starter: 'Basic', growth: 'Deep-dive', premium: 'Deep-dive' },
  { feature: 'Delivery format',                            starter: 'Report',  growth: 'Report + Online Dashboard', premium: 'Report + Online Dashboard' },
  { feature: 'Dashboard update frequency',                 starter: '—',   growth: 'Weekly', premium: 'Daily' },
  { feature: 'AI audit assistant',                         starter: false, growth: true,     premium: true },
  { feature: 'Priority support',                           starter: false, growth: true,     premium: true },
  { feature: 'Dedicated account manager',                  starter: false, growth: false,    premium: true },
  { feature: 'Monthly 1:1 strategy call',                  starter: false, growth: false,    premium: true },
  { feature: 'Custom prompt testing & benchmarking',       starter: false, growth: false,    premium: true },
];

/* ── Render helper for table cells ── */

function CellContent({ value }: { value: CellValue }) {
  if (value === true) {
    return <span style={{ display: 'inline-flex', justifyContent: 'center' }}><Check size={16} strokeWidth={2.5} style={{ color: '#C9A84C' }} /></span>;
  }
  if (value === false) {
    return <span style={{ color: '#444444', fontSize: '1rem' }}>—</span>;
  }
  return <span style={{ color: '#F5F0E8', fontSize: '0.8rem', fontWeight: 500 }}>{value}</span>;
}

/* ── Single plan card (shared between desktop grid and mobile tabs) ── */

function PlanCard({ plan, premiumMailto, handleClick }: {
  plan: typeof plans[number];
  premiumMailto: string;
  handleClick: (key: string) => void;
}) {
  return (
    <div style={{
      padding: 'clamp(1.5rem, 4vw, 2.5rem)',
      background: plan.highlighted ? 'rgba(15,15,15,0.88)' : 'rgba(10,10,10,0.88)',
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
          fontSize: '0.75rem',
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
          <span style={{ color: '#999999', fontSize: '0.875rem' }}>{plan.period}</span>
        </div>
        <p style={{ color: '#999999', fontSize: '0.875rem', lineHeight: 1.6 }}>{plan.description}</p>
      </div>

      <ul style={{ listStyle: 'none', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {plan.features.map((feature) => (
          <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem', color: '#AAAAAA' }}>
            <Check size={14} strokeWidth={2.5} style={{ color: '#C9A84C', marginTop: '3px', flexShrink: 0 }} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={() => plan.key === 'premium' ? (window.location.href = premiumMailto) : handleClick(plan.key)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          padding: '0.875rem 1.5rem',
          background: plan.highlighted ? '#C9A84C' : 'transparent',
          color: plan.highlighted ? '#0A0A0A' : '#DDDDDD',
          border: plan.highlighted ? 'none' : '1px solid #555555',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-inter, Inter, sans-serif)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget;
          if (plan.highlighted) el.style.background = '#E8C96A';
          else { el.style.borderColor = '#C9A84C'; el.style.color = '#C9A84C'; }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget;
          if (plan.highlighted) el.style.background = '#C9A84C';
          else { el.style.borderColor = '#555555'; el.style.color = '#DDDDDD'; }
        }}
      >
        {plan.cta} →
      </button>
      {plan.key === 'premium' && (
        <a
          href={premiumMailto}
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '0.75rem',
            fontSize: '0.85rem',
            color: '#C9A84C',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          or book a discovery call
        </a>
      )}
    </div>
  );
}

/* ── Component ── */

export default function Pricing() {
  const [showComparison, setShowComparison] = useState(false);
  const [mobileTab, setMobileTab] = useState(1); // Default to Growth (index 1)

  const handleClick = (planKey: string) => {
    window.location.href = `/onboarding?plan=${planKey}`;
  };

  const premiumMailto = `mailto:hello@presenzia.ai?subject=Premium%20Plan%20%E2%80%94%20Discovery%20Call%20Request&body=Hi%2C%0A%0AI%20would%20like%20to%20request%20more%20information%20about%20the%20Premium%20plan%20at%20presenzia.ai.%0A%0AName%20of%20company%3A%20%0AName%3A%20%0A%0AKind%20regards%2C`;

  return (
    <section id="pricing" style={{
      padding: '6rem clamp(1rem, 3vw, 2rem)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {/* ── Section header ── */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
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
          No setup fees. No long-term contracts. Cancel anytime. Your first audit is delivered within 48 hours of signing up.
        </p>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        .pricing-desktop { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .pricing-mobile-tabs { display: none; }
        .comparison-desktop { display: block; }
        .comparison-mobile { display: none; }
        @media (max-width: 860px) {
          .pricing-desktop { display: none !important; }
          .pricing-mobile-tabs { display: block !important; }
        }
        @media (max-width: 640px) {
          .comparison-desktop { display: none !important; }
          .comparison-mobile { display: block !important; }
        }
      `}</style>

      {/* ── Desktop: 3-column grid (unchanged) ── */}
      <div className="pricing-desktop">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} premiumMailto={premiumMailto} handleClick={handleClick} />
        ))}
      </div>

      {/* ── Mobile: tab switcher + single plan ── */}
      <div className="pricing-mobile-tabs">
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '0',
        }}>
          {plans.map((plan, i) => (
            <button
              key={plan.key}
              onClick={() => setMobileTab(i)}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                borderBottom: i === mobileTab ? '2px solid #C9A84C' : '2px solid transparent',
                color: i === mobileTab ? '#F5F0E8' : '#666666',
                fontSize: '0.8rem',
                fontWeight: i === mobileTab ? 600 : 400,
                letterSpacing: '0.05em',
                padding: '0.75rem 0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
                position: 'relative',
              }}
            >
              {plan.name}
              {plan.highlighted && (
                <span style={{
                  display: 'block',
                  fontSize: '0.6rem',
                  color: '#C9A84C',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  marginTop: '0.15rem',
                }}>
                  Popular
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active plan card */}
        <PlanCard plan={plans[mobileTab]} premiumMailto={premiumMailto} handleClick={handleClick} />
      </div>

      <p style={{ textAlign: 'center', color: '#999999', fontSize: '0.8rem', marginTop: '2rem' }}>
        All plans include VAT. Billed monthly. Cancel anytime with 30 days notice.
      </p>

      {/* ── Compare plans toggle ── */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button
          onClick={() => setShowComparison(!showComparison)}
          style={{
            background: 'none',
            border: '1px solid #333333',
            color: '#AAAAAA',
            fontSize: '0.85rem',
            fontWeight: 500,
            padding: '0.7rem 1.5rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C9A84C';
            e.currentTarget.style.color = '#C9A84C';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#333333';
            e.currentTarget.style.color = '#AAAAAA';
          }}
        >
          {showComparison ? 'Hide comparison' : 'Compare all features'}
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 0.3s ease',
              transform: showComparison ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {/* ── Comparison (collapsible) ── */}
      <div style={{
        maxHeight: showComparison ? '3000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.5s ease, opacity 0.4s ease',
        opacity: showComparison ? 1 : 0,
        marginTop: showComparison ? '2rem' : '0',
      }}>
        {/* Desktop: grid table */}
        <div className="comparison-desktop">
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr repeat(3, 80px)',
            gap: '0',
            padding: '0.75rem 1rem',
            fontFamily: 'var(--font-inter, Inter, sans-serif)',
          }}>
            <div style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Feature</div>
            {(['Starter', 'Growth', 'Premium'] as const).map((name) => (
              <div key={name} style={{
                textAlign: 'center',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: name === 'Growth' ? '#C9A84C' : '#666666',
              }}>
                {name}
              </div>
            ))}
          </div>

          {/* Rows */}
          {comparisonRows.map((row, idx) => (
            <div key={row.feature} style={{
              display: 'grid',
              gridTemplateColumns: '1fr repeat(3, 80px)',
              gap: '0',
              padding: '0.6rem 1rem',
              borderTop: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#AAAAAA', paddingRight: '0.5rem' }}>
                {row.feature}
              </div>
              {([row.starter, row.growth, row.premium] as CellValue[]).map((val, i) => (
                <div key={i} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CellContent value={val} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile: stacked feature cards */}
        <div className="comparison-mobile">
          {comparisonRows.map((row, idx) => (
            <div key={row.feature} style={{
              padding: '1rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              borderTop: idx === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
            }}>
              <div style={{ fontSize: '0.82rem', color: '#AAAAAA', marginBottom: '0.6rem' }}>
                {row.feature}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {([
                  { label: 'Starter', value: row.starter, highlight: false },
                  { label: 'Growth', value: row.growth, highlight: true },
                  { label: 'Premium', value: row.premium, highlight: false },
                ] as const).map(({ label, value, highlight }) => (
                  <div key={label} style={{
                    textAlign: 'center',
                    padding: '0.4rem 0.25rem',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{
                      fontSize: '0.6rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: highlight ? '#C9A84C' : '#555',
                      fontWeight: 600,
                      marginBottom: '0.3rem',
                    }}>
                      {label}
                    </div>
                    <CellContent value={value} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
