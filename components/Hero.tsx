import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '72px clamp(1.5rem, 5vw, 2rem) 0',
      boxSizing: 'border-box',
      width: '100%',
      position: 'relative',
      textAlign: 'center',
      overflow: 'hidden',
    }}>
      {/* Radial gold glow behind headline */}
      <div className="hero-gold-glow" style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(201, 168, 76, 0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="hero-wrapper" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: 'clamp(2.5rem, 4vw, 4rem) 0 clamp(3rem, 6vw, 5rem)',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* 1. Badge */}
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 1rem',
          border: '1px solid rgba(201,168,76,0.35)',
          background: 'rgba(201,168,76,0.06)',
          marginBottom: 'clamp(1.5rem, 2.5vw, 2rem)',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          color: '#C9A84C',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          AI Visibility for IFAs and Wealth Managers
        </div>

        {/* 2. Headline */}
        <h1 className="hero-headline" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 5rem)',
          fontWeight: 600,
          color: '#F5F0E8',
          lineHeight: 1.1,
          maxWidth: '100%',
          marginBottom: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          letterSpacing: '-0.02em',
          textWrap: 'balance' as any,
        }}>
          Is your firm{' '}
          <span style={{
            background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            invisible
          </span>{' '}
          to AI search?
        </h1>

        {/* 3. Subheadline (79% stat embedded) */}
        <p className="hero-subheadline" style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
          color: '#AAAAAA',
          maxWidth: '520px',
          marginBottom: '1rem',
          lineHeight: 1.75,
          fontWeight: 300,
          textWrap: 'balance' as any,
        }}>
          79%<Link href="/blog/we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible" className="hero-source-link" style={{ fontSize: '0.6em', verticalAlign: 'super', color: '#888888', textDecoration: 'none', transition: 'color 0.2s' }}><sup>¹</sup></Link> of UK IFA firms aren&apos;t found when clients ask ChatGPT, Claude, or Perplexity for a recommendation. Are you one of them?
        </p>

        {/* 4. Footnote */}
        <div className="hero-footnote" style={{
          fontSize: '0.6875rem',
          color: '#888888',
          fontStyle: 'italic',
          marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)',
          textWrap: 'balance' as any,
        }}>
          <Link href="/blog/we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible" className="hero-source-link" style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.2s' }}>
            ¹ 149-firm study, presenzia.ai (2026)
          </Link>
        </div>

        {/* 5. Primary CTA */}
        <Link href="/score" className="hero-cta-primary" style={{
          padding: '0.875rem 2rem',
          background: '#C9A84C',
          color: '#0A0A0A',
          fontWeight: 600,
          fontSize: '0.9rem',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'all 0.2s',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          Get my free visibility score →
        </Link>

        {/* Reassurance line */}
        <div style={{
          fontSize: '0.75rem',
          color: '#999999',
          marginBottom: '1.75rem',
          textWrap: 'balance' as any,
        }}>
          No credit card. A real AI audit of your firm in under 60 seconds.
        </div>

        {/* 6. Secondary CTA */}
        <Link href="#sample-report" className="hero-cta-secondary" style={{
          padding: '0.875rem 2rem',
          background: 'transparent',
          color: '#CCCCCC',
          fontWeight: 400,
          fontSize: '0.9rem',
          textDecoration: 'none',
          border: '1px solid #555555',
          transition: 'all 0.2s',
        }}>
          See a sample audit →
        </Link>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero-cta-primary:hover { background: #E8C96A !important; }
        .hero-cta-secondary:hover { border-color: #C9A84C !important; color: #F5F0E8 !important; }
        .hero-source-link:hover { color: #C9A84C !important; }
        @media (max-width: 768px) {
          .hero-wrapper { padding-top: 3rem !important; padding-bottom: 6.5rem !important; }
          .hero-cta-primary, .hero-cta-secondary { width: 100%; text-align: center; justify-content: center; }
          .hero-badge { margin-bottom: 1.5rem !important; }
          .hero-headline { margin-bottom: 2rem !important; }
          .hero-subheadline { margin-bottom: 1rem !important; }
          .hero-footnote { margin-bottom: 3rem !important; }
          .hero-cta-primary { margin-bottom: 0.625rem !important; }
        }
      `}</style>
    </section>
  );
}
