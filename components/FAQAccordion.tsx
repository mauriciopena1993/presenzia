'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
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
  );
}
