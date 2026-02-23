import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | presenzia.ai — AI Search Visibility for UK Businesses',
  description: 'Practical guides on AI search visibility, how ChatGPT recommends local businesses, and how UK small businesses can improve their presence in AI results.',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Insights
          </div>
          <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            AI Visibility for UK Small Businesses
          </h1>
          <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7 }}>
            Practical guides on how AI recommends local businesses, and what you can do about it.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: 'block',
                padding: '2rem 0',
                borderTop: '1px solid #1A1A1A',
                textDecoration: 'none',
                borderBottom: i === posts.length - 1 ? '1px solid #1A1A1A' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '0.65rem', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#444' }}>{fmtDate(post.date)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#444' }}>{post.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                    {post.description}
                  </p>
                </div>
                <span style={{ color: '#C9A84C', fontSize: '1.2rem', flexShrink: 0, marginTop: '0.25rem' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
