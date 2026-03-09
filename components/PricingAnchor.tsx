import Link from 'next/link';

export default function PricingAnchor() {
  return (
    <section style={{
      padding: 'clamp(3rem, 5vw, 5rem) clamp(1rem, 4vw, 2rem)',
      maxWidth: '820px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Pricing
      </div>
      <h2 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '1.75rem',
        lineHeight: 1.2,
      }}>
        Start with a free score. Go deeper when you&apos;re ready.
      </h2>

      <style>{`
        @media (max-width: 640px) {
          .pricing-ladder { flex-direction: column !important; }
          .pricing-step { min-width: 0 !important; }
        }
      `}</style>
      <div className="pricing-ladder" style={{
        display: 'flex',
        gap: '1px',
        background: '#1A1A1A',
        border: '1px solid #1A1A1A',
        marginBottom: '1.75rem',
      }}>
        {[
          { label: 'Free Score', price: '£0', desc: 'Instant AI visibility score across 4 platforms' },
          { label: 'Full Audit', price: '£99', desc: 'Complete audit with competitor analysis & action plan' },
          { label: 'Growth', price: '£249/mo', desc: 'Weekly re-audits, AI assistant & strategy calls' },
          { label: 'Premium', price: '£599/mo', desc: 'Daily monitoring, dedicated strategist & done-for-you content' },
        ].map((tier) => (
          <div key={tier.label} className="pricing-step" style={{
            flex: 1,
            minWidth: '150px',
            padding: '1.25rem 1rem',
            background: '#0F0F0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <span style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              {tier.label}
            </span>
            <span style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.35rem',
              color: tier.price === '£0' ? '#5BA88C' : '#F5F0E8',
              fontWeight: 600,
            }}>
              {tier.price}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.5, maxWidth: '160px' }}>
              {tier.desc}
            </span>
          </div>
        ))}
      </div>

      <Link href="/pricing" style={{
        color: '#C9A84C',
        fontSize: '0.9rem',
        textDecoration: 'none',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        Compare plans in detail →
      </Link>
    </section>
  );
}
