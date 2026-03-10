import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 clamp(1.5rem, 5vw, 2rem)',
      boxSizing: 'border-box',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Main hero content — vertically centered, fills viewport */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 'clamp(5rem, 8vw, 7rem) 0 clamp(3rem, 5vw, 4rem)',
        boxSizing: 'border-box',
      }}>
        {/* Badge */}
        <div className="hero-badge" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 1rem',
          border: '1px solid rgba(201,168,76,0.35)',
          background: 'rgba(201,168,76,0.06)',
          marginBottom: '2rem',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          color: '#C9A84C',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          AI Visibility for Wealth Managers
        </div>

        {/* Headline */}
        <h1 className="hero-headline" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 5rem)',
          fontWeight: 600,
          color: '#F5F0E8',
          lineHeight: 1.1,
          maxWidth: '100%',
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
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

        {/* Subheadline */}
        <p className="hero-subheadline" style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#AAAAAA',
          maxWidth: '620px',
          marginBottom: '2.5rem',
          lineHeight: 1.75,
          fontWeight: 300,
        }}>
          Clients are finding financial advisers on ChatGPT and AI search, not Google.
          Find out if your firm shows up, or if your competitors do instead.
        </p>

        {/* CTA Buttons */}
        <div className="hero-cta-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
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
          }}>
            Get my free visibility score →
          </Link>
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
            See a sample IFA audit
          </Link>
        </div>

        {/* Single dominant stat */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(3rem, 8vw, 4.5rem)',
            color: '#C9A84C',
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            79%<span style={{ fontSize: '0.4em', verticalAlign: 'super', marginLeft: '2px', opacity: 0.7, fontWeight: 400 }}>¹</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#999999', letterSpacing: '0.04em', marginTop: '0.75rem' }}>
            of UK IFA firms not found on AI search
          </div>
          <Link href="/blog/we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible" className="hero-source-link" style={{ display: 'inline-block', fontSize: '0.65rem', color: '#555555', textDecoration: 'none', marginTop: '0.5rem', transition: 'color 0.2s', fontStyle: 'italic' }}>
            ¹ 149-firm study, presenzia.ai (2026)
          </Link>
        </div>
      </div>

      {/* AI platform badges — below the fold */}
      <div className="hero-platform-tags" style={{ padding: '1rem 0 clamp(1.5rem, 3vw, 2rem)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span className="platform-label" style={{ fontSize: '0.75rem', color: '#999999', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.25rem' }}>Audited across</span>
        {['ChatGPT', 'Claude', 'Perplexity', 'Google AI'].map((ai) => (
          <span key={ai} style={{
            padding: '0.3rem 0.75rem',
            border: '1px solid #2A2A2A',
            fontSize: '0.75rem',
            color: '#999999',
            letterSpacing: '0.05em',
            textAlign: 'center',
            minWidth: '90px',
          }}>{ai}</span>
        ))}
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
          .hero-cta-primary, .hero-cta-secondary { width: 100%; text-align: center; justify-content: center; }
          .hero-badge { margin-bottom: 1.25rem !important; }
          .hero-headline { margin-bottom: 1rem !important; }
          .hero-subheadline { margin-bottom: 1.5rem !important; }
          .hero-cta-row { margin-bottom: 2.5rem !important; }
          .hero-platform-tags { display: grid !important; grid-template-columns: 1fr 1fr; gap: 0.5rem !important; justify-items: center; }
          .hero-platform-tags .platform-label { grid-column: 1 / -1; }
        }
      `}</style>
    </section>
  );
}
