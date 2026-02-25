'use client';

const testimonials = [
  {
    quote: "I had no idea ChatGPT wasn't recommending my restaurant. Within a month of fixing what presenzia flagged, I started getting calls from customers saying they 'found me on AI'.",
    name: "Marco R.",
    role: "Restaurant Owner, Manchester",
    initial: "M",
  },
  {
    quote: "The audit is incredibly clear. I'm not technical at all but I understood exactly what needed to change. Worth every penny of the Growth plan.",
    name: "Sarah K.",
    role: "Accountant, London",
    initial: "S",
  },
  {
    quote: "Our competitors were showing up everywhere on AI search and we weren't. presenzia showed us exactly why, and the monthly calls with the team are invaluable.",
    name: "James T.",
    role: "Dental Practice Owner, Bristol",
    initial: "J",
  },
];

export default function Testimonials() {
  return (
    <section style={{
      padding: '6rem 2rem',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          What clients say
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: '#F5F0E8',
          fontWeight: 600,
        }}>
          Real businesses. Real results.
        </h2>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .testimonials-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="testimonials-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px',
        background: '#222222',
        border: '1px solid #222222',
      }}>
        {testimonials.map((t) => (
          <div key={t.name} style={{
            padding: '2.5rem',
            background: '#0A0A0A',
            transition: 'background 0.3s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0F0F0F'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0A0A0A'; }}
          >
            <div style={{ color: '#C9A84C', fontSize: '2rem', lineHeight: 1, marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>&ldquo;</div>
            <p style={{ color: '#BBBBBB', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem', fontStyle: 'italic' }}>
              {t.quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.08) 100%)',
                border: '1px solid rgba(201,168,76,0.3)',
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
                <div style={{ fontSize: '0.8rem', color: '#999999' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
