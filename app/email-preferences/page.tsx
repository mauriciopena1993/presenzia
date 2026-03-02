'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function EmailPreferencesContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(!!emailParam);
  const [saving, setSaving] = useState(false);
  const [found, setFound] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [suppressed, setSuppressed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const fetchPreferences = async (lookupEmail: string) => {
    if (!lookupEmail) return;
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch(`/api/email-preferences?email=${encodeURIComponent(lookupEmail)}`);
      const data = await res.json();
      if (data.found) {
        setFound(true);
        setBusinessName(data.business_name || '');
        setSuppressed(data.marketing_suppressed);
      } else {
        setFound(false);
        setError('We could not find an account with that email address.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailParam) {
      fetchPreferences(emailParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam]);

  const handleToggle = async (newValue: boolean) => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/email-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marketing_suppressed: newValue }),
      });
      const data = await res.json();
      if (data.success) {
        setSuppressed(newValue);
        setSaved(true);
      } else {
        setError(data.error || 'Failed to update preferences.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      color: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Nav */}
      <div style={{
        width: '100%',
        borderBottom: '1px solid #1A1A1A',
        padding: '1rem clamp(1rem, 3vw, 2rem)',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: '1.2rem',
          color: '#F5F0E8',
          textDecoration: 'none',
        }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
      </div>

      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '3rem clamp(1rem, 3vw, 2rem)',
      }}>
        <h1 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}>
          Email preferences
        </h1>
        <p style={{
          color: '#AAAAAA',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Manage what emails you receive from presenzia.ai.
        </p>

        {/* Email lookup (if not provided via URL) */}
        {!found && !loading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your email address
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  flex: 1,
                  background: '#111',
                  border: '1px solid #2a2a2a',
                  color: '#F5F0E8',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => fetchPreferences(email)}
                disabled={!email.includes('@') || loading}
                style={{
                  background: email.includes('@') ? '#C9A84C' : '#2a2a2a',
                  color: email.includes('@') ? '#0A0A0A' : '#666',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: email.includes('@') ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Look up
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#C9A84C', fontSize: '0.85rem' }}>
            Loading preferences...
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(204,68,68,0.06)',
            border: '1px solid rgba(204,68,68,0.2)',
            color: '#cc8888',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(74,158,106,0.06)',
            border: '1px solid rgba(74,158,106,0.2)',
            color: '#4a9e6a',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
          }}>
            Your preferences have been updated.
          </div>
        )}

        {found && !loading && (
          <div>
            {businessName && (
              <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.5rem' }}>
                Showing preferences for <span style={{ color: '#F5F0E8', fontWeight: 500 }}>{businessName}</span> ({email})
              </p>
            )}

            {/* Marketing emails toggle */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#0D0D0D',
              border: '1px solid #1a1a1a',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Marketing emails
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: 0, lineHeight: 1.6 }}>
                    Product updates, tips, referral invitations, and promotional content.
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(!suppressed)}
                  disabled={saving}
                  style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    background: suppressed ? '#333' : '#4a9e6a',
                    position: 'relative',
                    cursor: saving ? 'wait' : 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#F5F0E8',
                    position: 'absolute',
                    top: '3px',
                    left: suppressed ? '3px' : '27px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: suppressed ? 'rgba(204,68,68,0.06)' : 'rgba(74,158,106,0.06)',
                border: `1px solid ${suppressed ? 'rgba(204,68,68,0.15)' : 'rgba(74,158,106,0.15)'}`,
                fontSize: '0.78rem',
                color: suppressed ? '#cc8888' : '#4a9e6a',
              }}>
                {suppressed
                  ? 'You are currently unsubscribed from marketing emails.'
                  : 'You are currently subscribed to marketing emails.'}
              </div>
            </div>

            {/* Transactional emails info */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: '#0D0D0D',
              border: '1px solid #1a1a1a',
              marginBottom: '2rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#F5F0E8', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Transactional emails
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: 0, lineHeight: 1.6 }}>
                    Audit reports, login codes, billing confirmations, and account updates.
                  </p>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  Always on
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', marginBottom: 0, lineHeight: 1.6 }}>
                These emails are essential to your account and cannot be disabled.
              </p>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6 }}>
              Questions? Contact us at <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmailPreferencesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>Loading...</div>
      </div>
    }>
      <EmailPreferencesContent />
    </Suspense>
  );
}
