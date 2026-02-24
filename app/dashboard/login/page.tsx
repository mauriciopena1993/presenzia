'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  // Stored for admin resend — null for client (server cookie handles it)
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    setResendCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // ── Send code ──────────────────────────────────────────────────────────────
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        return;
      }

      // Admin: server returns challengeToken; client: server sets a cookie
      if (data.challengeToken) setChallengeToken(data.challengeToken);
      setStep('code');
      startCountdown();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend code ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          // Pass existing token for admin so server reuses the same OTP
          ...(challengeToken ? { existingChallengeToken: challengeToken } : {}),
        }),
      });
      const data = await res.json();
      if (data.challengeToken) setChallengeToken(data.challengeToken);
    } catch {
      // silently ignore — user can try again
    } finally {
      setResendLoading(false);
      startCountdown();
    }
  };

  // ── Verify code ────────────────────────────────────────────────────────────
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          ...(challengeToken ? { challengeToken } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired code. Please try again.');
        return;
      }

      // Hard navigation so middleware picks up the new session cookie
      window.location.href = data.redirect ?? '/dashboard';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: '#111111',
    border: '1px solid #2A2A2A',
    color: '#F5F0E8',
    fontSize: '1rem',
    fontFamily: 'var(--font-inter, Inter, sans-serif)',
    outline: 'none',
    boxSizing: 'border-box',
    letterSpacing: step === 'code' ? '0.25em' : 'normal',
    textAlign: step === 'code' ? 'center' : 'left',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}>
              {step === 'email' ? 'Login' : 'Enter your code'}
            </h1>
            <p style={{ color: '#999', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {step === 'email'
                ? 'Enter your email address to receive a login code.'
                : `We sent a 6-digit code to ${email}. Check your inbox.`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                autoFocus
              />

              {error && (
                <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.875rem',
                  background: loading ? '#8a7030' : '#C9A84C',
                  color: '#0A0A0A',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  width: '100%',
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? 'Sending code...' : 'Send login code →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                maxLength={6}
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={inputStyle}
                autoFocus
              />

              {error && (
                <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{
                  padding: '0.875rem',
                  background: loading || code.length < 6 ? '#8a7030' : '#C9A84C',
                  color: '#0A0A0A',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)',
                  width: '100%',
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? 'Verifying...' : 'Sign in →'}
              </button>

              {/* Resend countdown */}
              <div style={{ textAlign: 'center' }}>
                {resendCountdown > 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                    Resend code in {resendCountdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendLoading ? '#888' : '#C9A84C',
                      fontSize: '0.8rem',
                      cursor: resendLoading ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      padding: 0,
                      textDecoration: 'underline',
                      textDecorationColor: resendLoading ? '#888' : '#C9A84C',
                    }}
                  >
                    {resendLoading ? 'Sending...' : "Didn't receive it? Send again →"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError('');
                  setChallengeToken(null);
                  if (countdownRef.current) clearInterval(countdownRef.current);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '0.5rem',
                  fontFamily: 'inherit',
                }}
              >
                ← Use a different email
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '2rem' }}>
            Issues? <a href="mailto:hello@presenzia.ai" style={{ color: '#999', textDecoration: 'none' }}>hello@presenzia.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}
