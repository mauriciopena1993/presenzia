import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Visibility Score for UK Financial Advisers | presenzia.ai',
  description:
    'Is your IFA firm visible on ChatGPT, Claude, Perplexity, and Google AI? Get your free AI visibility score in 60 seconds. Used by UK wealth managers and IFAs.',
  alternates: { canonical: '/score' },
  keywords: [
    'free ai visibility score financial adviser',
    'ifa ai visibility checker',
    'chatgpt financial adviser visibility',
    'ai search score uk ifa',
    'check if chatgpt recommends my firm',
  ],
  openGraph: {
    title: 'Free AI Visibility Score for UK Financial Advisers | presenzia.ai',
    description:
      'Is your IFA firm visible on ChatGPT, Claude, Perplexity, and Google AI? Free instant score in 60 seconds.',
    url: 'https://presenzia.ai/score',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Visibility Score for UK IFAs | presenzia.ai',
    description:
      'Is your IFA firm visible on ChatGPT, Claude, Perplexity, and Google AI? Free instant score in 60 seconds.',
    images: ['/og-image.png'],
  },
};

export default function ScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
