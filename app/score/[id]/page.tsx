'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ScoreData {
  id: string;
  firmName: string;
  city: string;
  specialty: string;
  score: number;
  grade: string;
  mentionsCount: number;
  totalPrompts: number;
  topCompetitor: { name: string; count: number } | null;
  platformBreakdown: Array<{ platform: string; tested: number; mentioned: number }>;
  hasEmail: boolean;
}

function scoreColor(score: number): string {
  if (score <= 20) return '#E74C3C';
  if (score <= 40) return '#E67E22';
  if (score <= 60) return '#F39C12';
  if (score <= 80) return '#27AE60';
  return '#2ECC71';
}

export default function SharedScorePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/score/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Score not found');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#C9A84C', fontSize: '0.875rem', letterSpacing: '0.1em' }}>Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ color: '#E74C3C', fontSize: '1rem' }}>Score not found</div>
        <Link href="/score" style={{ color: '#C9A84C', textDecoration: 'none' }}>Get your own score →</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)', color: '#F5F0E8' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/score" style={{ color: '#C9A84C', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>Get YOUR score →</Link>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            AI Visibility Score
          </div>

          <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: '#AAAAAA' }}>
            {data.firmName} — {data.city}
          </h1>

          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: `4px solid ${scoreColor(data.score)}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: scoreColor(data.score), lineHeight: 1 }}>
              {data.score}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#999' }}>/ 100</div>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: `${scoreColor(data.score)}22`,
            border: `1px solid ${scoreColor(data.score)}44`,
            color: scoreColor(data.score),
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}>
            Grade: {data.grade}
          </div>

          <p style={{ color: '#AAAAAA', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Found in <strong style={{ color: '#F5F0E8' }}>{data.mentionsCount} of {data.totalPrompts}</strong> AI searches.
          </p>
        </div>

        {data.topCompetitor && (
          <div style={{
            padding: '1.25rem',
            background: 'rgba(231,76,60,0.08)',
            border: '1px solid rgba(231,76,60,0.2)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E74C3C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              ⚠ Top Competitor
            </div>
            <p style={{ color: '#F5F0E8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              <strong>&quot;{data.topCompetitor.name}&quot;</strong> appeared in{' '}
              <strong>{data.topCompetitor.count}</strong> searches.
            </p>
          </div>
        )}

        {/* Platform breakdown */}
        <div style={{ padding: '1.25rem', background: '#111', border: '1px solid #1A1A1A', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Platform Breakdown
          </div>
          {data.platformBreakdown.map(p => (
            <div key={p.platform} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
              <span style={{ color: '#F5F0E8', fontSize: '0.9rem' }}>{p.platform}</span>
              <span style={{ color: p.mentioned > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.9rem', fontWeight: 600 }}>
                {p.mentioned}/{p.tested}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#AAAAAA', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Want to see YOUR firm&apos;s AI visibility score?
          </p>
          <Link
            href="/score"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}
          >
            Get my free score →
          </Link>
        </div>
      </div>
    </div>
  );
}
