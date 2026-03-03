'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface RatingData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function RateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<RatingData | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedRating, setSubmittedRating] = useState(0);
  const [error, setError] = useState('');
  const [autoJobId, setAutoJobId] = useState<string | null>(null);
  const [noAuditFound, setNoAuditFound] = useState(false);

  // Resolved jobId: explicit from URL or auto-detected
  const effectiveJobId = jobId || autoJobId;

  // Auto-detect latest audit when no jobId in URL
  useEffect(() => {
    if (jobId) return; // Already have a jobId from URL
    const fetchLatestAudit = async () => {
      try {
        const res = await fetch('/api/client/rate?latest=true');
        if (res.status === 401) {
          router.push(`/dashboard/login?redirect=${encodeURIComponent('/dashboard/rate')}`);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.jobId) {
            setAutoJobId(data.jobId);
          } else {
            setNoAuditFound(true);
            setLoading(false);
          }
        } else {
          setNoAuditFound(true);
          setLoading(false);
        }
      } catch {
        setNoAuditFound(true);
        setLoading(false);
      }
    };
    fetchLatestAudit();
  }, [jobId, router]);

  // Fetch existing rating for the resolved jobId
  useEffect(() => {
    const resolvedJobId = jobId || autoJobId;
    if (!resolvedJobId) {
      // No jobId yet — either still auto-detecting or no audit found
      if (jobId === null && !autoJobId && !noAuditFound) return; // Still auto-detecting
      setLoading(false);
      return;
    }

    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/client/rate?jobId=${resolvedJobId}`);
        if (res.status === 401) {
          router.push(`/dashboard/login?redirect=${encodeURIComponent(`/dashboard/rate?jobId=${resolvedJobId}`)}`);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.rating) {
            setExistingRating(data.rating);
          }
        }
      } catch {
        // Silently handle — user can still rate
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [jobId, autoJobId, noAuditFound, router]);

  const handleSubmit = async () => {
    if (!effectiveJobId || selectedRating === 0 || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/client/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: effectiveJobId,
          rating: selectedRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.status === 401) {
        router.push(`/dashboard/login?redirect=${encodeURIComponent(`/dashboard/rate?jobId=${effectiveJobId}`)}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmittedRating(selectedRating);
      setSubmitted(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/client/signout', { method: 'POST' });
    router.push('/');
  };

  const renderStars = (rating: number, interactive: boolean) => {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const active = interactive
            ? star <= (hoveredRating || selectedRating)
            : star <= rating;

          return (
            <button
              key={star}
              type="button"
              onClick={interactive ? () => setSelectedRating(star) : undefined}
              onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
              onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
              style={{
                background: 'none',
                border: 'none',
                cursor: interactive ? 'pointer' : 'default',
                padding: '0.25rem',
                transition: 'transform 0.15s ease',
                transform: interactive && hoveredRating >= star ? 'scale(1.15)' : 'scale(1)',
              }}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                size={36}
                color={active ? '#C9A84C' : '#333'}
                fill={active ? '#C9A84C' : 'none'}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
    );
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
      }}>
        <div style={{
          color: '#C9A84C',
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // ── No audit found (auto-detection failed) ─────────────────────────────────
  if (!effectiveJobId && noAuditFound) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          borderBottom: '1px solid #1A1A1A',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.3rem',
              color: '#F5F0E8',
              textDecoration: 'none',
            }}
          >
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.75rem',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              No audit to rate
            </h1>
            <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We couldn&apos;t find a completed audit to rate. Once your audit is ready, you&apos;ll be able to rate it here.
            </p>
            <Link href="/dashboard" style={{ color: '#C9A84C', fontSize: '0.875rem', textDecoration: 'none' }}>
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Still loading auto-detection ───────────────────────────────────────────
  if (!effectiveJobId && !noAuditFound) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
      }}>
        <div style={{
          color: '#C9A84C',
          fontSize: '0.875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // ── Already rated (loaded from server) ──────────────────────────────────────
  if (existingRating && !submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Nav */}
        <div style={{
          borderBottom: '1px solid #1A1A1A',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.3rem',
              color: '#F5F0E8',
              textDecoration: 'none',
            }}
          >
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1px solid #2a2a2a',
              color: '#999',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
            }}
          >
            Sign out
          </button>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '1.5rem',
              lineHeight: 1.2,
            }}>
              Thank you!
            </h1>
            <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You already rated this audit. Here is your rating:
            </p>
            {renderStars(existingRating.rating, false)}
            {existingRating.comment && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#0D0D0D',
                border: '1px solid #1a1a1a',
                textAlign: 'left',
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  Your comment
                </div>
                <p style={{
                  color: '#AAAAAA',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {existingRating.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Submitted just now ──────────────────────────────────────────────────────
  if (submitted) {
    const isPositive = submittedRating >= 4;

    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Nav */}
        <div style={{
          borderBottom: '1px solid #1A1A1A',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '1.3rem',
              color: '#F5F0E8',
              textDecoration: 'none',
            }}
          >
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1px solid #2a2a2a',
              color: '#999',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.8rem',
            }}
          >
            Sign out
          </button>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}>
              Thank you!
            </h1>

            {renderStars(submittedRating, false)}

            {isPositive ? (
              <div style={{ marginTop: '2rem' }}>
                <p style={{
                  color: '#AAAAAA',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                }}>
                  We&apos;re glad you had a great experience. If you&apos;d like to share it publicly, it helps others discover us:
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  maxWidth: '340px',
                  margin: '0 auto',
                }}>
                  {/* Google Reviews — primary CTA */}
                  <a
                    href="https://g.page/r/presenzia/review"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      padding: '0.75rem 1.25rem',
                      background: '#C9A84C',
                      border: '1px solid #C9A84C',
                      color: '#0A0A0A',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-inter, Inter, sans-serif)',
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#d4b35a';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#C9A84C';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Leave a review on Google
                  </a>

                  {/* Trustpilot */}
                  <a
                    href="https://uk.trustpilot.com/evaluate/presenzia.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      padding: '0.75rem 1.25rem',
                      background: 'transparent',
                      border: '1px solid #C9A84C',
                      color: '#C9A84C',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'var(--font-inter, Inter, sans-serif)',
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = '#C9A84C';
                      (e.currentTarget as HTMLElement).style.color = '#0A0A0A';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#C9A84C';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Leave a review on Trustpilot
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com/company/presenzia"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      padding: '0.75rem 1.25rem',
                      background: 'transparent',
                      border: '1px solid #333',
                      color: '#AAAAAA',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: 'var(--font-inter, Inter, sans-serif)',
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C';
                      (e.currentTarget as HTMLElement).style.color = '#F5F0E8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#333';
                      (e.currentTarget as HTMLElement).style.color = '#AAAAAA';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Follow us on LinkedIn
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com/presenzia.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      padding: '0.75rem 1.25rem',
                      background: 'transparent',
                      border: '1px solid #333',
                      color: '#AAAAAA',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      fontFamily: 'var(--font-inter, Inter, sans-serif)',
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C';
                      (e.currentTarget as HTMLElement).style.color = '#F5F0E8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#333';
                      (e.currentTarget as HTMLElement).style.color = '#AAAAAA';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    Follow us on Instagram
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                <p style={{
                  color: '#AAAAAA',
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  maxWidth: '420px',
                  margin: '0 auto',
                }}>
                  Thank you for your feedback. Your input helps us improve.
                  We&apos;ll review your comments and work on making your next audit better.
                </p>
              </div>
            )}

            <div style={{ marginTop: '2.5rem' }}>
              <Link
                href="/dashboard"
                style={{
                  color: '#999',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                }}
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Rating form ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: 'var(--font-inter, Inter, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <div style={{
        borderBottom: '1px solid #1A1A1A',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontSize: '1.3rem',
            color: '#F5F0E8',
            textDecoration: 'none',
          }}
        >
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: '1px solid #2a2a2a',
            color: '#999',
            padding: '0.4rem 1rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.8rem',
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}>
              Rate your audit
            </h1>
            <p style={{
              color: '#999',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              How was your experience with this AI visibility audit?
            </p>
          </div>

          {/* Stars */}
          <div style={{ marginBottom: '2rem' }}>
            {renderStars(0, true)}
            {selectedRating > 0 && (
              <div style={{
                textAlign: 'center',
                marginTop: '0.75rem',
                fontSize: '0.8rem',
                color: '#C9A84C',
                letterSpacing: '0.02em',
              }}>
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Below average'}
                {selectedRating === 3 && 'Average'}
                {selectedRating === 4 && 'Good'}
                {selectedRating === 5 && 'Excellent'}
              </div>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#999',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Comment <span style={{ color: '#555', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: '#111111',
                border: '1px solid #2A2A2A',
                color: '#F5F0E8',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#1a0a0a',
              border: '1px solid #5a1a1a',
              color: '#ff8888',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || submitting}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: selectedRating === 0 || submitting ? '#8a7030' : '#C9A84C',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: selectedRating === 0 || submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-inter, Inter, sans-serif)',
              letterSpacing: '0.02em',
              transition: 'background 0.2s',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit rating'}
          </button>

          <p style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '0.8rem',
            marginTop: '2rem',
          }}>
            Issues? <a href="mailto:hello@presenzia.ai" style={{ color: '#999', textDecoration: 'none' }}>hello@presenzia.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RatePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</div>
      </div>
    }>
      <RateContent />
    </Suspense>
  );
}
