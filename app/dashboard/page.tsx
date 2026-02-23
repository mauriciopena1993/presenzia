import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Dashboard | presenzia.ai',
  description: 'Access your AI visibility reports and audit history.',
};

export default function DashboardPage() {
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
        Client Portal
      </div>

      <h1 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '1.5rem',
        lineHeight: 1.2,
      }}>
        Dashboard coming soon
      </h1>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        Your client dashboard is being built. In the meantime, your reports are delivered
        directly to your inbox. Have a question?{' '}
        <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>
          hello@presenzia.ai
        </a>
      </p>

      <Link href="/" style={{
        padding: '0.75rem 2rem',
        background: 'transparent',
        color: '#888',
        fontSize: '0.875rem',
        textDecoration: 'none',
        border: '1px solid #333',
        transition: 'all 0.2s',
        letterSpacing: '0.02em',
      }}>
        ← Back to home
      </Link>
    </div>
  );
}
