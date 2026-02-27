import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import SampleReport from '@/components/SampleReport';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
// AmbientBackground is rendered globally in layout.tsx

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI search visibility, and why does it matter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "When someone asks ChatGPT, Claude, Perplexity, or Google's AI to recommend a business like yours, the AI generates a response from its training data and real-time knowledge. If your business isn't being recommended, you're invisible to a growing segment of customers who never get as far as a Google search. AI search visibility measures how often and how prominently your business appears in these AI-generated recommendations.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does presenzia.ai actually test my visibility?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We run hundreds of real customer search prompts across four major AI platforms: ChatGPT, Claude, Perplexity, and Google AI. Prompts include queries like "best [business type] in [your city]", "[service] near me", and specific use-case questions relevant to your industry. We record whether your business is mentioned, where it appears, and which competitors are being recommended instead.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do I actually receive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Within minutes of signing up, your audit begins running automatically. You'll receive your full report by email shortly after — usually within minutes. It includes your overall AI Visibility Score (0–100), a platform-by-platform breakdown, a list of competitors that are currently appearing in your place, and specific, actionable recommendations to improve your visibility. Growth and Premium clients also get access to an online dashboard.",
      },
    },
    {
      '@type': 'Question',
      name: 'How is this different from traditional SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Traditional SEO focuses on ranking in Google's blue-link search results. AI visibility is about appearing in AI-generated answers, which increasingly sit above those results or replace them entirely. The factors that drive it are different: structured content, authoritative mentions, clear business descriptions, and consistent signals across directories.",
      },
    },
    {
      '@type': 'Question',
      name: "I'm a small local business. Is this relevant to me?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Especially so. Local searches like "best Italian in Shoreditch", "top-rated salon in Bristol", or "accountant near me" are exactly the type of queries AI assistants are used for most. Local businesses are often the least represented in AI outputs, which creates a real opportunity for those who act early.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this right for my business?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If customers could find you by asking AI something like "best [your service] in [your area]", then yes. We work with restaurants, salons, gyms, dental practices, solicitors, accountants, and many more. Online-only businesses are welcome too.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel at any time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. All plans are monthly subscriptions with no long-term contract. You can cancel with 30 days' notice at any time. Your audits and dashboard access remain available until the end of your billing period.",
      },
    },
  ],
};

export default function Home() {
  return (
    <main style={{ background: 'rgba(10,10,10,0.88)', minHeight: '100vh', position: 'relative' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <HowItWorks />
        <SampleReport />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
