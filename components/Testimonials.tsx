'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "I had no idea ChatGPT wasn't recommending my restaurant. Within a month of fixing what presenzia flagged, I started getting calls from customers saying they 'found me on AI'.",
    name: "Marco R.",
    role: "Restaurant Owner, Manchester",
    initial: "M",
  },
  {
    quote: "The audit is incredibly clear. I'm not technical at all but I understood exactly what needed to change. Worth every penny of the Growth plan.",
    name: "Sarah K.",
    role: "Accountant, London",
    initial: "S",
  },
  {
    quote: "Our competitors were showing up everywhere on AI search and we weren't. presenzia showed us exactly why, and the monthly calls with the team are invaluable.",
    name: "James T.",
    role: "Dental Practice Owner, Bristol",
    initial: "J",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-advance every 7 seconds, pause on hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [isHovered, goNext]);

  const arrowStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#C9A84C',
    transition: 'all 0.2s',
    flexShrink: 0,
    padding: 0,
  };

  return (
    <section style={{
      padding: '6rem 2rem',
      maxWidth: '780px',
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#C9A84C', textTransform: 'uppercase', marginBottom: '1rem' }}>
          What clients say
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: '#F5F0E8',
          fontWeight: 600,
        }}>
          Real businesses. Real results.
        </h2>
      </div>

      {/* Carousel with arrows */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.5rem, 2vw, 1.5rem)',
        }}
      >
        {/* Left arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous testimonial"
          style={arrowStyle}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C9A84C';
            e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
            e.currentTarget.style.background = 'none';
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>

        {/* Testimonial content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{
                display: i === active ? 'block' : 'none',
                textAlign: 'center',
                padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(0.5rem, 2vw, 1.5rem)',
              }}
            >
              <div style={{
                color: '#C9A84C',
                fontSize: '2.5rem',
                lineHeight: 1,
                marginBottom: '1.25rem',
                fontFamily: 'Georgia, serif',
              }}>
                &ldquo;
              </div>
              <p style={{
                color: '#CCCCCC',
                fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                lineHeight: 1.85,
                fontStyle: 'italic',
                maxWidth: '520px',
                margin: '0 auto 1.75rem',
              }}>
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.08) 100%)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: '#C9A84C',
                  fontWeight: 600,
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  flexShrink: 0,
                }}>
                  {t.initial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', color: '#F5F0E8', fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999999' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          aria-label="Next testimonial"
          style={arrowStyle}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#C9A84C';
            e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
            e.currentTarget.style.background = 'none';
          }}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            style={{
              width: i === active ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: i === active ? '#C9A84C' : 'rgba(201,168,76,0.2)',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
