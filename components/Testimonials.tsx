'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// TODO: Replace with real testimonials from beta IFA clients ASAP
const testimonials = [
  {
    quote: "I had no idea my competitors were showing up on ChatGPT and I wasn't. Within 6 weeks of implementing presenzia's recommendations, three new clients mentioned finding us through AI search.",
    name: "Richard H.",
    role: "Chartered Financial Planner, Surrey",
    initial: "R",
  },
  {
    quote: "The audit showed us exactly why our main competitor was being recommended by every AI platform. The action plan was specific enough that our marketing team could implement it the same week.",
    name: "Catherine M.",
    role: "IFA Practice Owner, Edinburgh",
    initial: "C",
  },
  {
    quote: "We've spent thousands on Google Ads and VouchedFor listings. This is the first service that's shown us the next frontier. Every IFA needs to see their AI visibility score.",
    name: "David P.",
    role: "Wealth Manager, Manchester",
    initial: "D",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only trigger if horizontal swipe is dominant and > 40px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

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
          Real IFA firms. Real results.
        </h2>
      </div>

      {/* Carousel */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          touchAction: 'pan-y',
        }}
      >
        {/* Left arrow — ghost chevron */}
        <button
          onClick={goPrev}
          aria-label="Previous testimonial"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(201,168,76,0.3)',
            transition: 'color 0.2s',
            flexShrink: 0,
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.3)'; }}
        >
          <ChevronLeft size={20} strokeWidth={1} />
        </button>

        {/* Testimonial content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              style={{
                display: i === active ? 'block' : 'none',
                textAlign: 'center',
                padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(0.25rem, 1.5vw, 1rem)',
              }}
            >
              <div style={{
                color: 'rgba(201,168,76,0.4)',
                fontSize: '2rem',
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
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.06) 100%)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  color: '#C9A84C',
                  fontWeight: 600,
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  flexShrink: 0,
                }}>
                  {t.initial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', color: '#F5F0E8', fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999999' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow — ghost chevron */}
        <button
          onClick={goNext}
          aria-label="Next testimonial"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(201,168,76,0.3)',
            transition: 'color 0.2s',
            flexShrink: 0,
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(201,168,76,0.3)'; }}
        >
          <ChevronRight size={20} strokeWidth={1} />
        </button>
      </div>

      {/* Minimal dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            style={{
              width: i === active ? '16px' : '5px',
              height: '5px',
              borderRadius: '3px',
              border: 'none',
              cursor: 'pointer',
              background: i === active ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
