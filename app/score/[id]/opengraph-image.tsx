import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function scoreColor(score: number): string {
  if (score <= 20) return '#E74C3C';
  if (score <= 40) return '#E67E22';
  if (score <= 60) return '#F39C12';
  if (score <= 80) return '#27AE60';
  return '#2ECC71';
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data } = await supabase
    .from('free_scores')
    .select('firm_name, city, score, grade, specialty')
    .eq('share_id', id)
    .single();

  const firmName = data?.firm_name ?? 'Unknown Firm';
  const city = data?.city ?? '';
  const score = data?.score ?? 0;
  const grade = data?.grade ?? 'F';
  const color = scoreColor(score);

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          justifyContent: 'space-between',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#F5F0E8', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </span>
          <span style={{ color: '#C9A84C', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            AI Visibility Score
          </span>
        </div>

        {/* Middle: firm name + score */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '650px' }}>
            <div
              style={{
                color: '#F5F0E8',
                fontSize: firmName.length > 30 ? 40 : 50,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              {firmName}
            </div>
            {city && (
              <div style={{ color: '#888', fontSize: 22 }}>
                {city}
              </div>
            )}
          </div>

          {/* Score circle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: `6px solid ${color}`,
            }}
          >
            <div style={{ fontSize: 80, fontWeight: 700, color, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: 20, color: '#888' }}>/ 100</div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                background: `${color}22`,
                border: `2px solid ${color}44`,
                color,
                fontSize: 18,
                fontWeight: 700,
                padding: '8px 20px',
                letterSpacing: '0.05em',
              }}
            >
              Grade: {grade}
            </div>
          </div>
          <div style={{ color: '#555', fontSize: 16 }}>
            Get your free score at presenzia.ai/score
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
