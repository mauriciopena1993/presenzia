import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(4rem, 7vw, 7rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 5vw, 5rem)',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Badge */}
      <div style={{
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
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        fontWeight: 600,
        color: '#F5F0E8',
        lineHeight: 1.1,
        maxWidth: '900px',
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
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        color: '#AAAAAA',
        maxWidth: '620px',
        marginBottom: '2.5rem',
        lineHeight: 1.75,
        fontWeight: 300,
      }}>
        AI search is replacing Google — and it&apos;s happening fast. Millions already use ChatGPT, Claude, and Perplexity to find financial advisors, and that number is growing exponentially across every age group. If your firm isn&apos;t showing up, your competitors are. Are you prepared?
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
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

      {/* Social proof strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '1.75rem 2.5rem',
        width: '100%',
        maxWidth: '720px',
      }}>
        {[
          { stat: '94%', label: 'of UK IFA firms not found on ChatGPT' },
          { stat: '100+', label: 'wealth-specific prompts tested' },
          { stat: '4', label: 'AI platforms audited' },
        ].map((item) => (
          <div key={item.stat} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: '#C9A84C', fontWeight: 600 }}>{item.stat}</div>
            <div style={{ fontSize: '0.8rem', color: '#999999', letterSpacing: '0.04em', marginTop: '0.3rem' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* AI platform badges */}
      <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#999999', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: '0.25rem' }}>Audited across</span>
        {['ChatGPT', 'Claude', 'Perplexity', 'Google AI'].map((ai) => (
          <span key={ai} style={{
            padding: '0.3rem 0.75rem',
            border: '1px solid #2A2A2A',
            fontSize: '0.75rem',
            color: '#999999',
            letterSpacing: '0.05em',
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
      `}</style>
    </section>
  );
}
