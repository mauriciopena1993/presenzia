import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-posts';

const FEATURED_SLUGS = [
  'we-tested-149-uk-ifa-firms-on-chatgpt-79-percent-were-invisible',
  'what-makes-ai-recommend-one-financial-advisor-over-another',
  'ai-visibility-checklist-15-things-every-uk-financial-adviser-should-fix',
  'geo-vs-seo-why-google-rankings-are-no-longer-enough-for-financial-advisers',
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function LatestInsights() {
  const posts = FEATURED_SLUGS.map(s => BLOG_POSTS.find(p => p.slug === s)).filter(Boolean);

  return (
    <section style={{
      padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 2rem)',
      maxWidth: '900px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Latest insights
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>
          AI visibility research and strategy
        </h2>
        <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
          Data-driven insights on how AI platforms recommend financial advisers, and what your firm can do about it.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {posts.map((post, i) => post && (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="insight-row"
            style={{
              display: 'block',
              padding: '1.5rem 0',
              borderTop: '1px solid #1A1A1A',
              textDecoration: 'none',
              borderBottom: i === posts.length - 1 ? '1px solid #1A1A1A' : 'none',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#888' }}>{fmtDate(post.date)}</span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  color: '#F5F0E8',
                  fontWeight: 600,
                  lineHeight: 1.35,
                  marginBottom: '0.4rem',
                }}>
                  {post.title}
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                  {post.description}
                </p>
              </div>
              <span style={{ color: '#C9A84C', fontSize: '1.1rem', flexShrink: 0, marginTop: '0.2rem' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/blog" style={{
          color: '#C9A84C',
          fontSize: '0.9rem',
          textDecoration: 'none',
          fontWeight: 500,
          transition: 'opacity 0.2s',
        }}>
          View all insights →
        </Link>
      </div>
    </section>
  );
}
