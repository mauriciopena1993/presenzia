import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
// PromptExampleBlock removed — its content overlaps with SampleReport's "Search Prompts" tab
import SampleReport from '@/components/SampleReport';
import Testimonials from '@/components/Testimonials';
import MidPageCTA from '@/components/MidPageCTA';
import LatestInsights from '@/components/LatestInsights';
import PricingAnchor from '@/components/PricingAnchor';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
// AmbientBackground is rendered globally in layout.tsx

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI search visibility, and why does it matter for IFAs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "When potential clients ask ChatGPT, Claude, Perplexity, or Google AI to recommend a financial adviser, AI generates a response based on its training data and web knowledge. Firms with strong AI visibility appear in these recommendations. Firms without it are invisible to a rapidly growing discovery channel. With over 15 million UK adults now using AI assistants regularly, this is becoming as important as Google rankings.",
      },
    },
    {
      '@type': 'Question',
      name: "I don't have time to implement recommendations myself. Can you do it for me?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Our Premium plan includes a dedicated strategist and done-for-you content creation, so you get the visibility gains without any implementation work from your team. Most Premium clients see their first improvements within 2\u20133 weeks of onboarding.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does presenzia.ai test my visibility?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We run 120+ carefully crafted search prompts across four major AI platforms \u2014 ChatGPT, Claude, Perplexity, and Google AI. These prompts mirror what real clients actually ask: 'best financial adviser in [your city]', 'pension transfer specialist near me', 'who should I speak to about inheritance tax planning'. We record every response, noting where your firm appears, where it doesn't, and which competitors are being recommended instead.",
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from traditional SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Traditional SEO optimises your website for Google's search index. AI search visibility is fundamentally different \u2014 AI models don't just crawl your website, they synthesise information from across the web to form opinions about which firms to recommend. The signals that matter are different: authoritative content, consistent citations across platforms, structured data, and thought leadership. A firm can rank #1 on Google and still be invisible to ChatGPT.",
      },
    },
    {
      '@type': 'Question',
      name: 'I already use VouchedFor / Unbiased / Google Ads. Do I still need this?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes \u2014 those platforms optimise for their own directories and for traditional search. AI search is a separate channel entirely. In fact, having strong directory listings can help your AI visibility, but only if the right signals are in place. Our audit shows you exactly where the gaps are and what to do about them.",
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly will I see results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Some quick wins \u2014 like updating your website's structured data and optimising your content for AI readability \u2014 can show results within 2\u20134 weeks. More substantial improvements, like building citation authority and publishing thought leadership content, typically take 2\u20133 months to fully register across AI platforms. Your re-audits track every change \u2014 weekly on Growth, daily on Premium.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. All plans are monthly with 30 days' notice. No long-term contracts, no cancellation fees.",
      },
    },
  ],
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'presenzia.ai',
  applicationCategory: 'BusinessApplication',
  description: 'AI search visibility audits for UK independent financial advisers and wealth managers.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'GBP',
    description: 'Free AI visibility score',
  },
  provider: {
    '@type': 'Organization',
    name: 'Ketzal LTD',
    url: 'https://presenzia.ai',
  },
};

export default function Home() {
  return (
    <main style={{ background: 'rgba(10,10,10,0.88)', minHeight: '100vh', position: 'relative' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <HowItWorks />
        <SampleReport />
        <Testimonials />
        <LatestInsights />
        <PricingAnchor />
        <FAQ />
        <MidPageCTA />
        <Footer />
      </div>
    </main>
  );
}
