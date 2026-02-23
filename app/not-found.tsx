import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | presenzia.ai',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
    }}>
      <div style={{
        fontSize: '0.7rem',
        letterSpacing: '0.15em',
        color: '#C9A84C',
        textTransform: 'uppercase',
        marginBottom: '1.5rem',
      }}>
        404 — Not found
      </div>

      <h1 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '1.25rem',
        lineHeight: 1.2,
      }}>
        This page doesn&apos;t exist
      </h1>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '420px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        The page you&apos;re looking for may have moved or never existed.
        Let&apos;s get you back on track.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '0.75rem 2rem',
          background: '#C9A84C',
          color: '#0A0A0A',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
          letterSpacing: '0.02em',
        }}>
          Back to home →
        </Link>
        <a href="mailto:hello@presenzia.ai" style={{
          padding: '0.75rem 2rem',
          background: 'transparent',
          color: '#888',
          fontSize: '0.875rem',
          textDecoration: 'none',
          border: '1px solid #333',
          letterSpacing: '0.02em',
        }}>
          Contact us
        </a>
      </div>
    </div>
  );
}
