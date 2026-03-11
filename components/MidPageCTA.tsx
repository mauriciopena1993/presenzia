import Link from 'next/link';

export default function MidPageCTA() {
  return (
    <section style={{
      padding: 'clamp(3rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)',
      maxWidth: '700px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '2rem',
        lineHeight: 1.2,
      }}>
        Find out if your competitors are already ahead of you.
      </h2>
      <Link href="/score" className="midcta-btn" style={{
        display: 'inline-block',
        padding: '0.875rem 2rem',
        background: '#C9A84C',
        color: '#0A0A0A',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
        letterSpacing: '0.02em',
        transition: 'background 0.2s',
      }}>
        Get my free visibility score →
      </Link>
      <style>{`
        .midcta-btn:hover { background: #E8C96A !important; }
      `}</style>
    </section>
  );
}
