import Link from 'next/link';

export default function PricingAnchor() {
  return (
    <section style={{
      padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
      maxWidth: '700px',
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
        marginBottom: '1rem',
        lineHeight: 1.2,
      }}>
        Start free. Upgrade when you&apos;re ready.
      </h2>
      <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Your first AI visibility score is free, no sign-up required.
        Paid plans start from <strong style={{ color: '#F5F0E8' }}>£249/month</strong> for ongoing monitoring and reporting.
      </p>
      <Link href="/pricing" style={{
        color: '#C9A84C',
        fontSize: '0.9rem',
        textDecoration: 'none',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        See full pricing →
      </Link>
    </section>
  );
}
