import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Visibility Score | presenzia.ai — Check Your Firm in 60 Seconds',
  description:
    'Get a free AI visibility score for your wealth management or IFA firm. See how ChatGPT, Claude, Perplexity, and Google AI rank you — in under 60 seconds.',
  alternates: { canonical: '/score' },
  openGraph: {
    title: 'Free AI Visibility Score | presenzia.ai',
    description:
      'Check how AI search engines see your firm. Free instant score across ChatGPT, Claude, Perplexity, and Google AI.',
    url: 'https://presenzia.ai/score',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Visibility Score | presenzia.ai',
    description:
      'Check how AI search engines see your firm. Free instant score across ChatGPT, Claude, Perplexity, and Google AI.',
    images: ['/og-image.png'],
  },
};

export default function ScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
