import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — presenzia.ai',
  description: 'Insights on AI search visibility, how AI recommends businesses, and tips to improve your presence.',
};

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Insights
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.2 }}>
          Blog coming soon
        </h1>
        <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
          We&apos;re working on guides and insights about AI search visibility for UK businesses. Check back soon.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: 'transparent',
          color: '#888',
          fontSize: '0.875rem',
          textDecoration: 'none',
          border: '1px solid #333',
          letterSpacing: '0.02em',
        }}>
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
