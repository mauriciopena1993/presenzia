import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | presenzia.ai',
  description: 'presenzia.ai audits how AI search engines see your business. Built by Ketzal LTD in London for UK businesses navigating the shift to AI-powered search.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>Back to home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Our story
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.2 }}>
          Your customers are searching differently now. We help you keep up.
        </h1>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          Something changed in 2024. Millions of people stopped typing into Google and started asking ChatGPT,
          Claude, and Perplexity for recommendations instead. &ldquo;Find me a good Italian restaurant in Manchester.&rdquo;
          &ldquo;Best accountant near me.&rdquo; &ldquo;Which dental practice should I go to in Bristol?&rdquo;
        </p>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          The problem? Most businesses have no idea whether AI mentions them or not. You could be spending thousands on
          traditional SEO while being completely absent from the fastest-growing search channel in the country.
        </p>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          We built presenzia to give you that answer. Every month, we test hundreds of real prompts across four
          major AI platforms and measure exactly how visible your business is. You get a scored report, a breakdown
          by platform, a list of competitors being recommended instead of you, and clear steps to improve.
        </p>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          No jargon, no fluff, no long-term contracts. Just a clear picture of where you stand in AI search,
          delivered to your inbox every month.
        </p>

        <div style={{
          padding: '1.5rem 2rem',
          background: '#0f1107',
          border: '1px solid #3a4a0f',
          marginBottom: '2.5rem',
        }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            The company
          </div>
          <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
            presenzia.ai is a trading name of Ketzal LTD (Company No. 14570156), based in London.
            We work exclusively with UK businesses. Questions? Reach us at{' '}
            <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
          </p>
        </div>

        <Link href="/#pricing" style={{
          display: 'inline-block',
          padding: '0.875rem 2rem',
          background: '#C9A84C',
          color: '#0A0A0A',
          fontWeight: 600,
          fontSize: '0.9rem',
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}>
          See our plans
        </Link>
      </div>
    </div>
  );
}
