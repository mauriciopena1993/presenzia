'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

const faqs = [
  {
    q: 'What is AI search visibility, and why does it matter?',
    a: 'When someone asks ChatGPT, Claude, Perplexity, or Google\'s AI to recommend a business like yours (a restaurant, a gym, a solicitor), the AI generates a response from its training data and real-time knowledge. If your business isn\'t being recommended, you\'re invisible to a growing segment of customers who never get as far as a Google search. AI search visibility measures how often and how prominently your business appears in these AI-generated recommendations.',
  },
  {
    q: 'How does presenzia.ai actually test my visibility?',
    a: 'We run 80+ real customer search prompts across four major AI platforms: ChatGPT, Claude, Perplexity, and Google AI. Prompts include queries like "best [business type] in [your city]", "[service] near me", and specific use-case questions relevant to your industry. We record whether your business is mentioned, where it appears, and which competitors are being recommended instead. This gives you a clear, scored picture of your AI presence.',
  },
  {
    q: 'What do I actually receive?',
    a: 'Your audit begins running automatically the moment you sign up. You\'ll receive your full report by email within 15 minutes. It includes your overall AI Visibility Score (0–100), a platform-by-platform breakdown, a list of competitors that are currently appearing in your place, and specific, actionable recommendations to improve your visibility. Growth and Premium clients also get access to an online dashboard where they can track progress over time.',
  },
  {
    q: 'How is this different from traditional SEO?',
    a: 'Traditional SEO focuses on ranking in Google\'s blue-link search results. AI visibility is about appearing in AI-generated answers, which increasingly sit above those results or replace them entirely. The factors that drive it are different: structured content, authoritative mentions, clear business descriptions, and consistent signals across directories. Our audits tell you exactly what to focus on.',
  },
  {
    q: 'I\'m a small local business. Is this relevant to me?',
    a: 'Especially so. Local searches like "best Italian in Shoreditch", "top-rated salon in Bristol", or "accountant near me" are exactly the type of queries AI assistants handle most. Local businesses are often the least represented in AI outputs, which creates a real opportunity for those who act early. If a competitor is appearing and you\'re not, you\'re losing customers you don\'t even know about.',
  },
  {
    q: 'Is this right for my business?',
    a: 'If customers could find you by asking AI something like "best [your service] in [your area]", then yes. We work with restaurants, salons, gyms, dental practices, solicitors, accountants, and many more. Online-only businesses are welcome too. If people search for what you do, AI visibility matters.',
  },
  {
    q: 'How quickly will I see results if I follow the recommendations?',
    a: 'AI models update their knowledge bases on different schedules. Some changes, like improving your Google Business Profile or getting mentions in local press, can show results within 4–8 weeks. Others, like building topical authority through content, take longer. Our monthly (or weekly, on Growth) audits let you track progress as you implement changes.',
  },
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. All plans are monthly subscriptions with no long-term contract. You can cancel with 30 days\' notice at any time. Your audits and dashboard access remain available until the end of your billing period.',
  },
  {
    q: 'How do I get in touch?',
    a: 'Email us at hello@presenzia.ai and we typically reply within a few hours during business days. You can also find answers to most questions right here.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" style={{
      padding: '6rem 2rem',
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

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              borderBottom: i === faqs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '1.5rem 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                fontFamily: 'var(--font-inter, Inter, sans-serif)',
              }}
            >
              <span style={{
                fontSize: '0.95rem',
                color: open === i ? '#F5F0E8' : '#CCCCCC',
                lineHeight: 1.5,
                fontWeight: open === i ? 600 : 400,
                transition: 'color 0.2s',
              }}>
                {faq.q}
              </span>
              <Plus
                size={18}
                strokeWidth={1.5}
                style={{
                  color: '#C9A84C',
                  flexShrink: 0,
                  marginTop: '2px',
                  transform: open === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {open === i && (
              <p style={{
                color: '#AAAAAA',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                paddingBottom: '1.5rem',
                margin: 0,
              }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

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
