'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const examples = [
  {
    prompt: '"Can you recommend a good independent financial adviser in London?"',
    results: [
      { platform: 'ChatGPT', firms: ['Progeny Wealth', 'Brewin Dolphin', 'Tilney Smith & Williamson', 'Quilter Cheviot'] },
      { platform: 'Perplexity', firms: ['St. James\'s Place', 'Quilter', 'Brewin Dolphin', 'Schroders Personal Wealth'] },
      { platform: 'Google AI', firms: ['Nutmeg', 'Brewin Dolphin', 'Chase de Vere', 'Progeny Wealth'] },
    ],
  },
  {
    prompt: '"Best pension transfer specialist near Manchester"',
    results: [
      { platform: 'ChatGPT', firms: ['Progeny Wealth', 'Chase de Vere', 'Foster Denovo', 'True Potential'] },
      { platform: 'Perplexity', firms: ['True Potential', 'Chase de Vere', 'Sanlam', 'Foster Denovo'] },
      { platform: 'Google AI', firms: ['Hargreaves Lansdown', 'AJ Bell', 'Interactive Investor', 'True Potential'] },
    ],
  },
  {
    prompt: '"Who should I speak to about inheritance tax planning in the UK?"',
    results: [
      { platform: 'ChatGPT', firms: ['Quilter Cheviot', 'St. James\'s Place', 'Schroders Personal Wealth'] },
      { platform: 'Perplexity', firms: ['Brewin Dolphin', 'Quilter', 'Rathbones', 'Charles Stanley'] },
      { platform: 'Google AI', firms: ['Quilter Cheviot', 'Brewin Dolphin', 'Brooks Macdonald'] },
    ],
  },
];

export default function PromptExampleBlock() {
  const [activeExample, setActiveExample] = useState(0);
  const [showMore, setShowMore] = useState(false);

  const visibleExamples = showMore ? examples : [examples[0]];

  return (
    <section style={{
      padding: 'clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 2rem)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          What clients see
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          This is what AI recommends right now
        </h2>
        <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto' }}>
          We tested real prompts across major AI platforms. These are the firms that appear — is yours one of them?
        </p>
      </div>

      <style>{`
        .prompt-example-card { transition: background 0.2s; }
        .prompt-example-card:hover { background: rgba(201,168,76,0.03) !important; }
        @media (max-width: 768px) {
          .prompt-results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {visibleExamples.map((example, idx) => (
        <div key={idx} className="prompt-example-card" style={{
          border: '1px solid #1A1A1A',
          background: 'rgba(10,10,10,0.6)',
          marginBottom: '1rem',
          overflow: 'hidden',
        }}>
          {/* Prompt */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1A1A1A',
            background: 'rgba(201,168,76,0.03)',
          }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Prompt tested
            </div>
            <div style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1rem',
              color: '#F5F0E8',
              fontStyle: 'italic',
            }}>
              {example.prompt}
            </div>
          </div>

          {/* Results grid */}
          <div className="prompt-results-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: '#1A1A1A',
          }}>
            {example.results.map((result) => (
              <div key={result.platform} style={{ background: '#0A0A0A', padding: '1.25rem 1.5rem' }}>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  color: '#888',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}>
                  {result.platform}
                </div>
                {result.firms.map((firm, i) => (
                  <div key={i} style={{
                    fontSize: '0.82rem',
                    color: '#AAAAAA',
                    padding: '0.3rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }}>
                    {i + 1}. {firm}
                  </div>
                ))}
                {/* Prompt to check */}
                <div style={{
                  fontSize: '0.78rem',
                  color: '#C9A84C',
                  padding: '0.5rem 0.6rem',
                  marginTop: '0.5rem',
                  background: 'rgba(201,168,76,0.06)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  fontStyle: 'italic',
                }}>
                  Is your firm here?
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!showMore && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setShowMore(true)}
            style={{
              background: 'none',
              border: '1px solid #333',
              color: '#AAAAAA',
              fontSize: '0.85rem',
              padding: '0.6rem 1.25rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#AAAAAA'; }}
          >
            See more prompt examples
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </section>
  );
}
