'use client';

import { Globe, Cpu, BarChart3, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const values: { icon: LucideIcon; label: string; description: string }[] = [
  {
    icon: Cpu,
    label: '4 AI Platforms',
    description: 'We test across ChatGPT, Claude, Perplexity & Google AI — the engines shaping discovery.',
  },
  {
    icon: Globe,
    label: 'UK Focused',
    description: 'Built specifically for UK businesses and the nuances of local search.',
  },
  {
    icon: BarChart3,
    label: 'Data-Driven',
    description: 'Every recommendation backed by real search data, not guesswork.',
  },
  {
    icon: TrendingUp,
    label: 'Monthly Tracking',
    description: 'Watch your visibility improve over time with recurring audits.',
  },
];

export default function About() {
  return (
    <section
      id="about"
      style={{
        borderTop: '1px solid #222222',
        background: '#080808',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '6rem 2rem',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: '#C9A84C',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            About Presenzia
          </div>
          <h2
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}
          >
            Built for the businesses AI overlooks
          </h2>
          <p
            style={{
              color: '#AAAAAA',
              fontSize: '1rem',
              lineHeight: 1.8,
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            AI search is replacing the way customers find businesses. When someone asks ChatGPT
            for the best restaurant nearby or asks Claude to recommend a solicitor, most local
            businesses are completely invisible. Presenzia was built to change that — giving every
            business the clarity and data they need to show up where it matters most.
          </p>
        </div>

        {/* Value cards grid */}
        <style>{`
          @media (max-width: 600px) {
            .about-grid { grid-template-columns: 1fr !important; }
          }
          @media (min-width: 601px) and (max-width: 860px) {
            .about-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
        <div
          className="about-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: '#222222',
            border: '1px solid #222222',
          }}
        >
          {values.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '2.25rem 2rem',
                background: '#0A0A0A',
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0F0F0F';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#0A0A0A';
              }}
            >
              <item.icon
                size={22}
                strokeWidth={1.5}
                style={{ color: '#C9A84C', marginBottom: '1.25rem', display: 'block' }}
              />
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontSize: '1.05rem',
                  color: '#F5F0E8',
                  fontWeight: 600,
                  marginBottom: '0.6rem',
                }}
              >
                {item.label}
              </h3>
              <p style={{ color: '#999999', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer line */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            fontSize: '0.8rem',
            color: '#555555',
            letterSpacing: '0.05em',
          }}
        >
          Founded in London, 2026 &mdash; a Ketzal LTD company
        </div>
      </div>
    </section>
  );
}
