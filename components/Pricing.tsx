'use client';

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '£99',
    period: '/month',
    description: 'Everything you need to see where you stand with AI.',
    features: [
      'Monthly AI search audit',
      'Audit across 4 AI platforms',
      'PDF report delivered by email',
      'Visibility score (0\u2013100)',
      'Competitor mentions tracked',
      'Actionable recommendations',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '£199',
    period: '/month',
    description: 'For businesses actively improving their AI visibility.',
    features: [
      'Weekly AI search audit',
      'Audit across all 4 AI platforms',
      'Client dashboard access',
      'PDF report + live dashboard',
      'Competitor deep-dive analysis',
      'Weekly progress tracking',
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
    description: 'The full service for businesses that want expert guidance.',
    features: [
      'Everything in Growth',
      'Daily dashboard updates',
      'Dedicated account manager',
      'Monthly 1:1 strategy call',
      'Custom action plan',
      'Priority report delivery',
      'Industry benchmarking',
    ],
    cta: 'Book a call',
    highlighted: false,
  },
];

export default function Pricing() {
  const handleClick = (planKey: string) => {
    if (planKey === 'premium') {
      window.location.href = 'mailto:hello@presenzia.ai?subject=Premium Plan Enquiry';
      return;
    }
    window.location.href = `/onboarding?plan=${planKey}`;
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
              onClick={() => handleClick(plan.key)}
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
                else { el.style.borderColor = '#333333'; el.style.color = '#DDDDDD'; }
              }}
            >
              {`${plan.cta} →`}
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: '#777777', fontSize: '0.8rem', marginTop: '2rem' }}>
        All plans include VAT. Billed monthly. Cancel anytime with 30 days notice.
      </p>
    </section>
  );
}
