'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type VerifyState = 'loading' | 'verified' | 'invalid';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan') || 'starter';
  const [state, setState] = useState<VerifyState>('loading');

  const planNames: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    premium: 'Premium',
  };

  useEffect(() => {
    if (!sessionId) {
      setState('invalid');
      return;
    }

    // Verify the session with our API
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
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to home</Link>
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
        Payment confirmed
      </div>

      <h1 style={{
        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        color: '#F5F0E8',
        fontWeight: 600,
        marginBottom: '1.5rem',
        lineHeight: 1.2,
      }}>
        Welcome to presenzia.ai
      </h1>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1.1rem',
        maxWidth: '500px',
        lineHeight: 1.7,
        marginBottom: '1rem',
      }}>
        You&apos;re now on the <strong style={{ color: '#F5F0E8' }}>{planNames[plan] || 'Starter'}</strong> plan.
      </p>

      <p style={{
        color: '#AAAAAA',
        fontSize: '1rem',
        maxWidth: '500px',
        lineHeight: 1.7,
        marginBottom: '2.5rem',
      }}>
        One last step — tell us about your business so we can run your AI visibility audit.
      </p>

      <Link href={`/onboarding?session_id=${sessionId}&plan=${plan}`} style={{
        padding: '1rem 2.5rem',
        background: '#C9A84C',
        color: '#0A0A0A',
        fontWeight: 700,
        fontSize: '1rem',
        textDecoration: 'none',
        letterSpacing: '0.02em',
        marginBottom: '1.5rem',
        display: 'inline-block',
      }}>
        Tell us about your business →
      </Link>

      <p style={{ color: '#444', fontSize: '0.8rem', marginBottom: '3rem' }}>
        Takes 30 seconds &mdash; needed to run your audit
      </p>
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
