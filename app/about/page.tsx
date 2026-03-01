import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | presenzia.ai',
  description: 'We combine financial services experience with AI and strategy consulting expertise to help UK wealth managers and IFAs become visible in AI-powered search.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | presenzia.ai',
    description: 'Finance background meets AI expertise. We help UK wealth managers show up where clients are searching.',
  },
};

export default function AboutPage() {
  return (
    <main style={{ background: '#0A0A0A', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <div style={{ paddingTop: '72px' }}>

          {/* Hero */}
          <section style={{ maxWidth: '720px', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: '#C9A84C',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                About Us
              </div>
              <h1 style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: '#F5F0E8',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '1.5rem',
              }}>
                Finance meets AI
              </h1>
              <p style={{
                color: '#AAAAAA',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                maxWidth: '580px',
                margin: '0 auto',
              }}>
                We started our careers in finance and moved into AI strategy and consulting at some of the world&apos;s largest technology companies. Presenzia exists because we kept hearing the same question from former colleagues.
              </p>
            </div>
          </section>

          {/* Story */}
          <section style={{ maxWidth: '680px', margin: '0 auto', padding: '0 2rem 4rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
            }}>
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}>
                  Where we come from
                </div>
                <p style={{ color: '#CCCCCC', fontSize: '0.95rem', lineHeight: 1.85, margin: 0 }}>
                  Our team comes from the world of financial services. We studied finance, worked in advisory and planning roles early in our careers, and built real relationships across the industry. That background gives us a genuine understanding of how firms operate, what clients expect, and why trust matters more in this sector than almost any other.
                </p>
              </div>

              <div>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}>
                  What changed
                </div>
                <p style={{ color: '#CCCCCC', fontSize: '0.95rem', lineHeight: 1.85, margin: 0 }}>
                  Over time, we moved into strategy consulting and AI roles at major technology companies. We saw first-hand how AI was reshaping search, discovery, and decision-making across every industry. And we started getting the same question from friends and former colleagues in financial advisory: <em style={{ color: '#F5F0E8', fontStyle: 'normal', fontWeight: 500 }}>&quot;How do I get my firm recommended by ChatGPT?&quot;</em>
                </p>
              </div>

              <div>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}>
                  What we found
                </div>
                <p style={{ color: '#CCCCCC', fontSize: '0.95rem', lineHeight: 1.85, margin: 0 }}>
                  We started investigating. We tested thousands of prompts across ChatGPT, Claude, Perplexity, and Google AI, asking the kinds of questions real clients ask when searching for a financial advisor. The results were striking: the vast majority of well-established, highly-qualified firms were completely invisible. AI was recommending a small handful of firms repeatedly while ignoring the rest, regardless of quality or reputation.
                </p>
              </div>

              <div>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}>
                  Why we built Presenzia
                </div>
                <p style={{ color: '#CCCCCC', fontSize: '0.95rem', lineHeight: 1.85, margin: 0 }}>
                  We realised this was a problem we were uniquely positioned to solve. We understand the financial advisory industry from the inside. We understand how AI systems work from our years in tech. And we had a growing list of colleagues asking for help. So we built Presenzia: a way for IFAs and wealth managers to see exactly where they stand in AI search, understand what&apos;s working (and what isn&apos;t), and take concrete steps to improve. Our goal is straightforward: help great firms get found by the clients who need them.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section style={{
            borderTop: '1px solid #1A1A1A',
            borderBottom: '1px solid #1A1A1A',
            background: '#080808',
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
              <style>{`
                @media (max-width: 600px) {
                  .about-values-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>
              <div
                className="about-values-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2rem',
                }}
              >
                {[
                  { label: 'Finance-first', desc: 'Built by people who\'ve worked in financial services. We understand your clients, your regulators, and your reputation.' },
                  { label: 'Data, not guesswork', desc: 'Every score and recommendation is backed by real AI search data from 120+ prompts across four platforms.' },
                  { label: 'UK-specialist', desc: 'We focus exclusively on UK wealth managers and IFAs. Every prompt, benchmark, and recommendation is tailored to this market.' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '1.5rem', background: '#0A0A0A', border: '1px solid #1A1A1A' }}>
                    <h3 style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontSize: '1.05rem',
                      color: '#F5F0E8',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                    }}>
                      {item.label}
                    </h3>
                    <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Company info + CTA */}
          <section style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              padding: '1.5rem 2rem',
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              marginBottom: '2.5rem',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                The company
              </div>
              <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                presenzia.ai is a trading name of Ketzal LTD (Company No. 14570156), based in London.
                We&apos;re a focused team building the tools that UK financial advisory firms need to stay visible as AI transforms how clients search. Questions? Reach us at{' '}
                <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
              </p>
            </div>

            <h2 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.5rem',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              See where your firm stands
            </h2>
            <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              It takes under a minute. No signup, no credit card. Just your firm name and a few details.
            </p>
            <Link href="/score" style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              Get your free score →
            </Link>
          </section>
        </div>
        <Footer />
      </div>
    </main>
  );
}
