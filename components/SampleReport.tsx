'use client';

export default function SampleReport() {
  return (
    <section id="sample-report" style={{
      padding: '6rem 2rem',
      borderTop: '1px solid #222222',
      borderBottom: '1px solid #222222',
      background: '#080808',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Sample report
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '1.25rem',
              lineHeight: 1.2,
            }}>
              See exactly what your clients receive
            </h2>
            <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Every report is clear, professional, and designed to be understood by any business owner — no technical knowledge required. Your clients open it, see their score, understand the gaps, and know exactly what to do next.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
              {[
                'Overall AI Visibility Score (0–100)',
                'Platform-by-platform breakdown',
                'Competitor comparison table',
                'Exact prompts that mention (or miss) you',
                'Actionable recommendations',
              ].map(item => (
                <li key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: '#BBBBBB' }}>
                  <span style={{ color: '#C9A84C', flexShrink: 0 }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: mock report card */}
          <div style={{
            background: '#111111',
            border: '1px solid #222222',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* Report header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #222222' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#777777', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>presenzia.ai</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#F5F0E8' }}>AI Visibility Report</div>
                <div style={{ fontSize: '0.75rem', color: '#777777', marginTop: '0.25rem' }}>Smith & Co Solicitors · February 2026</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#C9A84C', lineHeight: 1 }}>34</div>
                <div style={{ fontSize: '0.65rem', color: '#777777', letterSpacing: '0.05em' }}>/ 100 score</div>
              </div>
            </div>

            {/* Platform breakdown */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#888888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Platform breakdown</div>
              {[
                { name: 'ChatGPT', score: 2, max: 10, found: false },
                { name: 'Claude', score: 4, max: 10, found: false },
                { name: 'Perplexity', score: 8, max: 10, found: true },
                { name: 'Google AI', score: 3, max: 10, found: false },
              ].map(platform => (
                <div key={platform.name} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.8rem', color: platform.found ? '#F5F0E8' : '#888888' }}>{platform.name}</span>
                    <span style={{ fontSize: '0.7rem', color: platform.found ? '#C9A84C' : '#555555' }}>{platform.found ? 'Found' : 'Not found'}</span>
                  </div>
                  <div style={{ height: '3px', background: '#222222', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${(platform.score / platform.max) * 100}%`, background: platform.found ? '#C9A84C' : '#333333', borderRadius: '2px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top recommendation */}
            <div style={{ padding: '1rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div style={{ fontSize: '0.65rem', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top recommendation</div>
              <p style={{ fontSize: '0.8rem', color: '#AAAAAA', lineHeight: 1.65 }}>
                Add structured FAQ content to your website answering &ldquo;best solicitor in [city]&rdquo; — this is the primary prompt pattern where competitors are being cited instead of you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
