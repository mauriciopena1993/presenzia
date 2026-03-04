import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { PLANS } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Pricing | presenzia.ai | AI Visibility for Financial Advisors',
  description:
    `AI Visibility Audit from ${PLANS.audit.priceDisplay}. Monthly retainers from ${PLANS.growth.priceDisplay}/mo. See exactly where your firm stands in AI search and what to do about it.`,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | presenzia.ai: AI Visibility Audits & Retainers',
    description:
      `AI Visibility Audit from ${PLANS.audit.priceDisplay}. Monthly retainers from ${PLANS.growth.priceDisplay}/mo. See exactly where your firm stands in AI search.`,
    url: 'https://presenzia.ai/pricing',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing | presenzia.ai: AI Visibility for Financial Advisors',
    description:
      `AI Visibility Audit from ${PLANS.audit.priceDisplay}. Monthly retainers from ${PLANS.growth.priceDisplay}/mo.`,
    images: ['/og-image.png'],
  },
};

const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AI Visibility Audit for Financial Advisors',
  description:
    'Comprehensive AI search visibility audit for UK wealth managers and IFAs. Tests 120+ prompts across ChatGPT, Claude, Perplexity, and Google AI.',
  brand: { '@type': 'Organization', name: 'presenzia.ai' },
  url: 'https://presenzia.ai/pricing',
  offers: [
    {
      '@type': 'Offer',
      name: PLANS.audit.name,
      price: String(PLANS.audit.price),
      priceCurrency: 'GBP',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://presenzia.ai/pricing',
      description:
        'One-off AI visibility audit with 120+ prompts, online dashboard, and downloadable PDF report with personalised action plan.',
    },
    {
      '@type': 'Offer',
      name: PLANS.growth.name,
      price: String(PLANS.growth.price),
      priceCurrency: 'GBP',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://presenzia.ai/pricing',
      description:
        'Weekly re-audits, weekly dashboard updates, AI audit assistant, competitor deep-dive with real-time alerts, and priority email support.',
    },
    {
      '@type': 'Offer',
      name: PLANS.premium.name,
      price: String(PLANS.premium.price),
      priceCurrency: 'GBP',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      url: 'https://presenzia.ai/pricing',
      description:
        'Daily monitoring, dedicated account strategist, done-for-you content, monthly strategy calls, and exclusive territory protection.',
    },
  ],
};

export default function PricingPage() {
  return (
    <main style={{ background: 'rgba(10,10,10,0.88)', minHeight: '100vh', position: 'relative' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <div style={{ paddingTop: '72px' }}>
          <Pricing />
        </div>
        <Footer />
      </div>
    </main>
  );
}
