import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — presenzia.ai',
  description: 'presenzia.ai is an AI search visibility auditing service for UK businesses, built by Ketzal LTD.',
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Our story
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '2rem', lineHeight: 1.2 }}>
          Built for UK businesses navigating the AI era
        </h1>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          When your customers ask ChatGPT, Claude, or Google AI to recommend a business like yours — do you appear?
          Most UK businesses don&apos;t. They&apos;re invisible to an entirely new layer of search, and they don&apos;t know it.
        </p>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
          presenzia.ai was founded to solve exactly this problem. We systematically audit your AI visibility across
          the four major AI platforms, deliver a clear scored report, and provide actionable steps to improve
          how AI search sees your business.
        </p>

        <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '3rem' }}>
          We&apos;re a trading name of Ketzal LTD (Company No. 14570156), based in London. Questions?{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>Say hello.</a>
        </p>

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
          Get your audit →
        </Link>
      </div>
    </div>
  );
}
