'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown when entering OTP step
  const startCountdown = () => {
    setResendCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.challengeToken) {
      setChallengeToken(data.challengeToken);
      setStep('otp');
      startCountdown();
    } else if (data.sent) {
      // Email not recognized but we show same UI (security)
      setStep('otp');
      startCountdown();
    } else {
      setError('Failed to send code. Try again.');
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');

    const res = await fetch('/api/admin/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setResendLoading(false);

    if (data.challengeToken) {
      setChallengeToken(data.challengeToken);
    }

    // Always restart the countdown whether successful or not
    startCountdown();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, challengeToken }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      // Hard navigation to ensure middleware re-validates the session cookie
      window.location.href = '/admin';
    } else {
      setError(data.error || 'Invalid code. Try again.');
    }
  };

  const s = {
    page: { minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '2rem' },
    card: { width: '100%', maxWidth: '380px' },
    brand: { fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.5rem', color: '#F5F0E8', marginBottom: '2.5rem', textAlign: 'center' as const },
    label: { display: 'block', fontSize: '0.7rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' },
    input: { width: '100%', padding: '0.75rem 1rem', background: '#111', border: '1px solid #2a2a2a', color: '#F5F0E8', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const },
    btn: { width: '100%', padding: '0.875rem', background: '#C9A84C', color: '#0A0A0A', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: '1rem' },
    hint: { fontSize: '0.8rem', color: '#555', textAlign: 'center' as const, marginTop: '1rem' },
    error: { padding: '0.75rem', background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff8888', fontSize: '0.85rem', marginTop: '1rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={s.brand}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </div>
        </Link>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <label style={s.label}>Admin email</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="hello@presenzia.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={s.input}
            />
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Sending...' : 'Send login code →'}
            </button>
            {error && <div style={s.error}>{error}</div>}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Code sent to {email}
            </p>
            <label style={s.label}>6-digit code</label>
            <input
              type="text"
              required
              autoFocus
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ ...s.input, fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center' }}
            />
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Verifying...' : 'Sign in →'}
            </button>

            {/* Resend countdown / button */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              {resendCountdown > 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#444', margin: 0 }}>
                  Resend code in {resendCountdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendLoading ? '#555' : '#C9A84C',
                    fontSize: '0.8rem',
                    cursor: resendLoading ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    padding: 0,
                    textDecoration: 'underline',
                    textDecorationColor: resendLoading ? '#555' : '#C9A84C',
                  }}
                >
                  {resendLoading ? 'Sending...' : "Didn't receive it? Send again →"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setOtp(''); if (countdownRef.current) clearInterval(countdownRef.current); }}
              style={{ ...s.hint, background: 'none', border: 'none', cursor: 'pointer', color: '#555', width: '100%', marginTop: '0.75rem' }}
            >
              ← Use different email
            </button>
            {error && <div style={s.error}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
