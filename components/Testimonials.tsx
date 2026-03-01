const testimonials = [
  {
    quote: "I had no idea my competitors were showing up on ChatGPT and I wasn't. Within 6 weeks of implementing presenzia's recommendations, three new clients mentioned finding us through AI search.",
    name: "Richard H.",
    role: "Chartered Financial Planner, Surrey",
    initial: "R",
  },
  {
    quote: "The audit showed us exactly why our main competitor was being recommended by every AI platform. The action plan was specific enough that our marketing team could implement it the same week.",
    name: "Catherine M.",
    role: "IFA Practice Owner, Edinburgh",
    initial: "C",
  },
  {
    quote: "We've spent thousands on Google Ads and VouchedFor listings. This is the first service that's shown us the next frontier. Every IFA needs to see their AI visibility score.",
    name: "David P.",
    role: "Wealth Manager, Manchester",
    initial: "D",
  },
];

export default function Testimonials() {
  return (
    <section style={{
      padding: '6rem 2rem',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          What clients say
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: '#F5F0E8',
          fontWeight: 600,
        }}>
          Real IFA firms. Real results.
        </h2>
      </div>

      <style>{`
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
        }
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div
            key={t.name}
            style={{
              background: '#0F0F0F',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
            }}
          >
            {/* Quote */}
            <div>
              <div style={{
                color: 'rgba(201,168,76,0.35)',
                fontSize: '2.5rem',
                lineHeight: 1,
                fontFamily: 'Georgia, serif',
                marginBottom: '0.75rem',
                userSelect: 'none',
              }}>
                &ldquo;
              </div>
              <p style={{
                color: '#CCCCCC',
                fontSize: '0.88rem',
                lineHeight: 1.8,
                margin: '0 0 1.5rem',
              }}>
                {t.quote}
              </p>
            </div>

            {/* Attribution */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.06) 100%)',
                border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                color: '#C9A84C',
                fontWeight: 600,
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                flexShrink: 0,
              }}>
                {t.initial}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#888', letterSpacing: '0.02em' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
