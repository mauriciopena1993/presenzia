'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';

  const planNames: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    premium: 'Premium',
  };

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
      {/* Checkmark */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#0f1107',
        border: '1px solid #3a4a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#C9A84C',
      }}>
        ✓
      </div>

      <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Audit queued
      </div>

      <h1 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '1.25rem',
        lineHeight: 1.2,
      }}>
        Your audit is underway
      </h1>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        marginBottom: '1rem',
      }}>
        You&apos;re on the <strong style={{ color: '#F5F0E8' }}>{planNames[plan] || 'Starter'}</strong> plan.
        We&apos;re now testing how AI platforms respond to queries about your business across 100+ prompts.
      </p>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        marginBottom: '3rem',
      }}>
        Your report will be delivered by email within <strong style={{ color: '#F5F0E8' }}>48 hours</strong>.
        Check your inbox — we&apos;ll send a confirmation shortly.
      </p>

      <div style={{
        padding: '1.5rem 2.5rem',
        background: '#0f1107',
        border: '1px solid #3a4a0f',
        maxWidth: '400px',
        width: '100%',
        marginBottom: '3rem',
      }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          What happens next
        </div>
        <ul style={{ listStyle: 'none', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, margin: 0 }}>
          {[
            'Confirmation email sent to your inbox',
            'AI platforms tested across 100+ prompts',
            'Platform-by-platform breakdown prepared',
            'Full PDF report delivered within 48 hours',
          ].map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', color: '#AAAAAA', alignItems: 'flex-start' }}>
              <span style={{ color: '#C9A84C', flexShrink: 0, fontWeight: 600 }}>{i + 1}.</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <Link href="/" style={{
        padding: '0.875rem 2rem',
        background: '#C9A84C',
        color: '#0A0A0A',
        fontWeight: 600,
        fontSize: '0.9rem',
        textDecoration: 'none',
        letterSpacing: '0.02em',
      }}>
        Back to home →
      </Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C' }}>Loading...</div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
