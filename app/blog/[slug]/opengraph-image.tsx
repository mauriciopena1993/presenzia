import { ImageResponse } from 'next/og';
import { getBlogPost } from '@/lib/blog-posts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  const title = post?.title ?? 'AI Visibility Insights';
  const category = post?.category ?? 'Insights';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          justifyContent: 'space-between',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#F5F0E8', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
            presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
          </span>
          <span style={{ color: '#333', fontSize: 14, marginLeft: 8 }}>|</span>
          <span style={{ color: '#666', fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {category}
          </span>
        </div>

        {/* Middle: title */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '40px 0' }}>
          <div
            style={{
              color: '#F5F0E8',
              fontSize: title.length > 60 ? 46 : 54,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '980px',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: descriptor */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            style={{
              background: '#C9A84C',
              color: '#0A0A0A',
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 18px',
              letterSpacing: '0.05em',
            }}
          >
            AI VISIBILITY INSIGHTS
          </div>
          <div style={{ color: '#333', fontSize: 14 }}>presenzia.ai</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
