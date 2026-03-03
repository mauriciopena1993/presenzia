'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { PLAN_LABELS } from '@/lib/plans';

type VerifyState = 'loading' | 'verified' | 'invalid';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'audit';
  const [state, setState] = useState<VerifyState>('loading');

  const planNames = PLAN_LABELS;

  useEffect(() => {
    if (!sessionId) {
      setState('invalid');
      return;
    }

    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setState(data.valid ? 'verified' : 'invalid');
      })
      .catch(() => setState('invalid'));
  }, [sessionId]);

  if (state === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#C9A84C', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Confirming your order...</div>
      </div>
    );
  }

  if (state === 'invalid') {
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
        <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '2rem', color: '#F5F0E8', marginBottom: '1rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#AAAAAA', marginBottom: '2rem' }}>
          We couldn&apos;t verify your payment. If you completed a purchase, please email{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C' }}>hello@presenzia.ai</a> and we&apos;ll sort it out immediately.
        </p>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Back to home</Link>
      </div>
    );
  }

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
      {/* Gold checkmark */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        marginBottom: '2rem',
        color: '#C9A84C',
      }}>
        ✓
      </div>

      <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
        Payment confirmed
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
        You&apos;re on the <strong style={{ color: '#F5F0E8' }}>{planNames[plan] || 'AI Visibility Audit'}</strong> plan.
        We&apos;re now testing how AI platforms respond to queries about your firm across 120+ wealth-specific prompts.
      </p>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '480px',
        lineHeight: 1.7,
        marginBottom: '3rem',
      }}>
        Your audit is already being processed and will be delivered to your inbox <strong style={{ color: '#F5F0E8' }}>within 15 minutes</strong>.
      </p>

      <div style={{
        padding: '1.5rem 2.5rem',
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        maxWidth: '400px',
        width: '100%',
        marginBottom: '3rem',
      }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          What happens next
        </div>
        <ul style={{ listStyle: 'none', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, margin: 0 }}>
          {[
            'Confirmation email sent to your inbox',
            'AI platforms tested across 120+ wealth-specific prompts',
            'Platform-by-platform breakdown prepared',
            'Full audit delivered to your email shortly',
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
        Back to home
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C' }}>Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
