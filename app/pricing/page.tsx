import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Pricing — presenzia.ai | AI Visibility for Financial Advisors',
  description:
    'AI Visibility Audit from £297. Monthly retainers from £697/mo. See exactly where your firm stands in AI search and what to do about it.',
  openGraph: {
    title: 'Pricing — presenzia.ai',
    description:
      'AI Visibility Audit from £297. Monthly retainers from £697/mo.',
  },
};

export default function PricingPage() {
  return (
    <main style={{ background: 'rgba(10,10,10,0.88)', minHeight: '100vh', position: 'relative' }}>
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
