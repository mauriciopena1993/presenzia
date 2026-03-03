import FAQAccordion from './FAQAccordion';

const faqs = [
  {
    q: 'What is AI search visibility, and why does it matter for IFAs?',
    a: 'AI search is replacing Google as the way people find services — and it\u2019s happening faster than anyone expected. Over 15 million UK adults already use AI assistants regularly, and that number is growing exponentially across all age groups. When a prospective client asks ChatGPT or Claude to recommend a financial advisor, they trust the answer and act on it. Firms that appear in these responses get the enquiry. Firms that don\u2019t are invisible to an entire generation of high-net-worth clients. This isn\u2019t a future trend — it\u2019s happening now.',
  },
  {
    q: 'How does presenzia.ai test my visibility?',
    a: 'We run 100+ carefully crafted search prompts across four major AI platforms: ChatGPT, Claude, Perplexity, and Google AI. These prompts mirror what real clients actually ask: \u201Cbest financial advisor in [your city]\u201D, \u201Cpension transfer specialist near me\u201D, \u201Cwho should I speak to about inheritance tax planning\u201D. We record every response, noting where your firm appears, where it doesn\u2019t, and which competitors are being recommended instead. Results are delivered via your online dashboard and a downloadable PDF report.',
  },
  {
    q: 'How is this different from traditional SEO?',
    a: 'Traditional SEO optimises your website for Google\u2019s search index. AI search visibility is fundamentally different. AI models don\u2019t just crawl your website; they synthesise information from across the web to form opinions about which firms to recommend. The signals that matter are different: authoritative content, consistent citations across platforms, structured data, and thought leadership. A firm can rank #1 on Google and still be invisible to ChatGPT.',
  },
  {
    q: 'I already use VouchedFor / Unbiased / Google Ads. Do I still need this?',
    a: 'Yes. Those platforms optimise for their own directories and for traditional search. AI search is a separate channel entirely. In fact, having strong directory listings can help your AI visibility, but only if the right signals are in place. Our audit shows you exactly where the gaps are and what to do about them.',
  },
  {
    q: 'How quickly will I see results?',
    a: 'Some quick wins, like updating your website\u2019s structured data and optimising your content for AI readability, can show results within 2\u20134 weeks. More substantial improvements, like building citation authority and publishing thought leadership content, typically take 2\u20133 months to fully register across AI platforms. Your monthly re-audits track every change.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We won\u2019t have access to any of your confidential or client data. We only test publicly available AI search results using the details you provide. All data is stored securely and never shared with third parties.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. All plans are monthly with 30 days\u2019 notice. No long-term contracts, no cancellation fees.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" style={{
      padding: 'clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 2rem)',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          FAQs
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          color: '#F5F0E8',
          fontWeight: 600,
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}>
          Common questions
        </h2>
        <p style={{ color: '#AAAAAA', fontSize: '1rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
          Everything you need to know before getting started.
        </p>
      </div>

      <FAQAccordion faqs={faqs} />

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ color: '#999', fontSize: '0.9rem' }}>
          Still have questions?{' '}
          <a href="mailto:hello@presenzia.ai" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            Email us at hello@presenzia.ai
          </a>
        </p>
      </div>
    </section>
  );
}
