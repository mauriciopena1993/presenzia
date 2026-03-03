import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

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
  platformBreakdown: Array<{ platform: string; tested: number; mentioned: number; failed?: boolean }>;
  platformsAvailable: number;
  platformsTotal: number;
  hasEmail: boolean;
}

function scoreColor(score: number): string {
  if (score <= 20) return '#E74C3C';
  if (score <= 40) return '#E67E22';
  if (score <= 60) return '#F39C12';
  if (score <= 80) return '#27AE60';
  return '#2ECC71';
}

async function getScoreData(id: string): Promise<ScoreData | null> {
  const { data, error } = await supabase
    .from('free_scores')
    .select('*')
    .eq('share_id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.share_id,
    firmName: data.firm_name,
    city: data.city,
    specialty: data.specialty,
    score: data.score,
    grade: data.grade,
    topCompetitor: data.top_competitor_name ? {
      name: data.top_competitor_name,
      count: data.top_competitor_count,
    } : null,
    mentionsCount: data.results_json?.mentionsCount || 0,
    totalPrompts: data.results_json?.totalPrompts || 0,
    platformBreakdown: data.results_json?.platformBreakdown || [],
    platformsAvailable: data.results_json?.platformsAvailable || data.results_json?.platformBreakdown?.filter((p: { failed?: boolean }) => !p.failed).length || 0,
    platformsTotal: data.results_json?.platformsTotal || data.results_json?.platformBreakdown?.length || 0,
    hasEmail: !!data.email,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getScoreData(id);

  if (!data) {
    return { title: 'Score not found | presenzia.ai' };
  }

  const title = `${data.firmName} scored ${data.score}/100 on AI Visibility | presenzia.ai`;
  const description = `${data.firmName} in ${data.city} was found in ${data.mentionsCount} of ${data.totalPrompts} AI searches. Grade: ${data.grade}. See how your firm compares.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://presenzia.ai/score/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function SharedScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getScoreData(id);

  if (!data) {
    notFound();
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
            {data.firmName} &middot; {data.city}
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
              Top Competitor
            </div>
            <p style={{ color: '#F5F0E8', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              <strong>&quot;{data.topCompetitor.name}&quot;</strong> appeared in{' '}
              <strong>{data.topCompetitor.count}</strong> searches.
            </p>
          </div>
        )}

        {/* Reliability banner when platforms failed */}
        {data.platformsAvailable < data.platformsTotal && (
          <div style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(243,156,18,0.08)',
            border: '1px solid rgba(243,156,18,0.2)',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#F39C12',
            lineHeight: 1.6,
          }}>
            Score based on <strong>{data.platformsAvailable} of {data.platformsTotal}</strong> platforms. Some were temporarily unavailable.
          </div>
        )}

        {/* Platform breakdown */}
        <div style={{ padding: '1.25rem', background: '#111', border: '1px solid #1A1A1A', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Platform Breakdown
          </div>
          {data.platformBreakdown.map(p => (
            <div key={p.platform} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
              <span style={{ color: p.failed ? '#666' : '#F5F0E8', fontSize: '0.9rem' }}>{p.platform}</span>
              {p.failed ? (
                <span style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  Temporarily unavailable
                </span>
              ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '80px', height: '4px', background: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${p.tested > 0 ? (p.mentioned / p.tested) * 100 : 0}%`,
                    background: p.mentioned > 0 ? '#27AE60' : '#E74C3C',
                    borderRadius: '2px',
                  }} />
                </div>
                <span style={{ color: p.mentioned > 0 ? '#27AE60' : '#E74C3C', fontSize: '0.9rem', fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>
                  {p.mentioned}/{p.tested}
                </span>
              </div>
              )}
            </div>
          ))}
        </div>

        {/* Blurred preview section */}
        <div style={{
          position: 'relative',
          background: '#111',
          border: '1px solid #1A1A1A',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1.25rem 1.5rem 0' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              What&apos;s in the full audit
            </div>
          </div>

          <div style={{ padding: '0 1.5rem', filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
            {[
              { label: 'Full competitor analysis', detail: '5+ competitors ranked and compared' },
              { label: 'Personalised action plan', detail: '7 prioritised steps for your firm' },
              { label: 'Platform-by-platform breakdown', detail: 'ChatGPT, Claude, Perplexity, Google AI' },
              { label: 'Specific search prompts tested', detail: '120+ prompts with results' },
              { label: 'Implementation guides', detail: 'Step-by-step instructions for each action' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #1A1A1A' }}>
                <span style={{ color: '#F5F0E8', fontSize: '0.85rem' }}>{item.label}</span>
                <span style={{ color: '#888', fontSize: '0.75rem' }}>{item.detail}</span>
              </div>
            ))}
          </div>

          {/* Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.9) 60%, rgba(10,10,10,0.98) 100%)',
            padding: '3rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <p style={{ color: '#F5F0E8', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600, marginBottom: '0.25rem' }}>
              Want to see the full breakdown?
            </p>
            <p style={{ color: '#999', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.5 }}>
              120+ prompts, competitor analysis, and a personalised action plan
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#AAAAAA', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.7 }}>
            Want to see <strong style={{ color: '#F5F0E8' }}>your</strong> firm&apos;s AI visibility score?
          </p>
          <Link
            href="/score"
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem 2rem',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
              marginBottom: '0.75rem',
            }}
          >
            Get my free score →
          </Link>
          <Link href="/pricing" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none' }}>
            Or see audit plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
