import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | presenzia.ai — AI Search Visibility for UK Wealth Managers & IFAs',
  description: 'Insights on AI search visibility for financial advisors — how ChatGPT, Claude and Perplexity recommend wealth managers, and how UK IFAs can improve their AI presence.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | presenzia.ai — AI Search Visibility for UK Wealth Managers & IFAs',
    description: 'Insights on AI search visibility for financial advisors — how ChatGPT, Claude and Perplexity recommend wealth managers, and how UK IFAs can improve their AI presence.',
    url: 'https://presenzia.ai/blog',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | presenzia.ai — AI Visibility Insights',
    description: 'Insights on AI search visibility for financial advisors — how AI recommends wealth managers and how to improve your presence.',
    images: ['/og-image.png'],
  },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div style={{ minHeight: '100vh', background: 'rgba(10,10,10,0.97)', fontFamily: 'var(--font-inter, Inter, sans-serif)', position: 'relative', zIndex: 1 }}>
      <div style={{ borderBottom: '1px solid #1A1A1A', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.3rem', color: '#F5F0E8', textDecoration: 'none' }}>
          presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
        </Link>
        <Link href="/" style={{ color: '#999', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to home</Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Insights
          </div>
          <h1 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            AI Visibility for UK Wealth Managers
          </h1>
          <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7 }}>
            Insights on how AI platforms recommend financial advisors, and what your firm can do about it.
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
              <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
                {/* Thumbnail */}
                <div style={{
                  width: '140px',
                  height: '74px',
                  position: 'relative',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '1px solid #1A1A1A',
                }}>
                  <Image
                    src={post.heroImage}
                    alt=""
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="140px"
                  />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: '0.75rem', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>{fmtDate(post.date)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>{post.readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.2rem', color: '#F5F0E8', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ color: '#999', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                    {post.description}
                  </p>
                </div>
                <span style={{ color: '#C9A84C', fontSize: '1.2rem', flexShrink: 0, marginTop: '0.25rem' }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Flywheel CTA */}
        <div style={{ marginTop: '4rem', padding: '2.5rem', background: '#111', border: '1px solid #2a2a2a', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Free tool
          </div>
          <p style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", color: '#F5F0E8', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            How visible is your firm to AI right now?
          </p>
          <p style={{ color: '#999', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Get a free instant score across ChatGPT, Claude, Perplexity, and Google AI. Takes 60 seconds, no signup required.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/score" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: '#C9A84C', color: '#0A0A0A', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em' }}>
              Get my free score →
            </Link>
            <Link href="/pricing" style={{ color: '#C9A84C', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
              View full audit plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
