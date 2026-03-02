import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | presenzia.ai',
  description: 'presenzia.ai audits how AI search engines see your firm. Built for UK wealth managers and financial advisors navigating the shift to AI-powered search.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | presenzia.ai',
    description: 'AI search visibility for UK wealth managers and IFAs. See where you stand, fix what\'s broken.',
    url: 'https://presenzia.ai/about',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | presenzia.ai',
    description: 'AI search visibility for UK wealth managers and IFAs. See where you stand, fix what\'s broken.',
    images: ['/og-image.png'],
  },
};

export default function AboutPage() {
  return (
    <main style={{ background: '#0A0A0A', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <div style={{ paddingTop: '72px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>

            <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Our story
            </div>
            <h1 style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              color: '#F5F0E8',
              fontWeight: 600,
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}>
              Your clients are searching differently now. We help you keep up.
            </h1>

            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 7',
              marginBottom: '2.5rem',
              overflow: 'hidden',
              border: '1px solid #1A1A1A',
            }}>
              <Image
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=525&fit=crop&q=80"
                alt="London cityscape at dusk with warm lights reflecting on the Thames"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 720px) 100vw, 720px"
                priority
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />
            </div>

            <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Something changed in 2024. Millions of people stopped typing into Google and started asking ChatGPT,
              Claude, and Perplexity for recommendations instead. &ldquo;Who is the best financial advisor in my area?&rdquo;
              &ldquo;Pension transfer specialist near me.&rdquo; &ldquo;Can you recommend a wealth manager in Surrey?&rdquo;
            </p>

            <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              The problem? Most IFA firms have no idea whether AI mentions them or not. You could be spending thousands on
              Google Ads and VouchedFor listings while being completely absent from the fastest-growing discovery channel in the country.
            </p>

            <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              We built presenzia to give wealth managers and financial advisors that answer. We test over 120 wealth-specific prompts across four
              major AI platforms and measure exactly how visible your firm is. You get a scored audit, a breakdown
              by platform, a list of competitors being recommended instead of you, and a prioritised action plan to fix it.
            </p>

            <p style={{ color: '#AAAAAA', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              No jargon, no fluff, no long-term contracts. Just a clear picture of where your firm stands in AI search
              and exactly what to do about it.
            </p>

            <div style={{
              padding: '1.5rem 2rem',
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              marginBottom: '2.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Who we are
              </div>
              <p style={{ color: '#AAAAAA', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                We come from backgrounds in finance and AI strategy consulting at major technology companies. Colleagues in financial advisory kept asking us how to get found by AI search engines, and we realised nobody was solving this properly. presenzia.ai is a trading name of Ketzal LTD (Company No. 14570156), based in London. Reach us at{' '}
                <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>hello@presenzia.ai</a>.
              </p>
            </div>

            <Link href="/score" style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}>
              Get your free score →
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
