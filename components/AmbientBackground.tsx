'use client';

import { useEffect, useRef } from 'react';

// Deterministic pseudo-random positions for city light dots
// Each dot: [left%, top%, size(px), baseOpacity, animationDelay(s), animationDuration(s)]
const CITY_LIGHTS: [number, number, number, number, number, number][] = [
  [8, 12, 2, 0.04, 0, 7],
  [15, 45, 3, 0.05, 1.2, 9],
  [22, 78, 2, 0.03, 3.5, 8],
  [31, 23, 2, 0.04, 0.8, 11],
  [37, 67, 3, 0.05, 2.1, 7],
  [44, 34, 2, 0.03, 4.3, 10],
  [52, 88, 2, 0.04, 1.7, 8],
  [58, 15, 3, 0.05, 3.0, 9],
  [63, 52, 2, 0.03, 0.5, 11],
  [71, 81, 2, 0.04, 2.8, 7],
  [76, 28, 3, 0.05, 4.0, 9],
  [83, 61, 2, 0.03, 1.5, 8],
  [89, 42, 2, 0.04, 3.2, 10],
  [94, 73, 3, 0.05, 0.3, 7],
  [12, 91, 2, 0.03, 2.5, 11],
  [47, 8, 2, 0.04, 4.7, 8],
  [67, 38, 3, 0.05, 1.0, 9],
  [28, 55, 2, 0.03, 3.8, 10],
  [79, 15, 2, 0.04, 0.6, 7],
  [55, 70, 3, 0.05, 2.3, 9],
];

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const onScroll = () => {
      scrollRef.current = window.scrollY;

      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          const scrollY = scrollRef.current;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          // Normalize scroll progress 0-1
          const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

          // Update CSS custom properties for parallax and brightness
          container.style.setProperty('--scroll-y', `${scrollY}`);
          container.style.setProperty('--scroll-progress', `${progress}`);

          // Parallax offsets for each orb layer (different speeds)
          container.style.setProperty('--parallax-1', `${scrollY * -0.02}px`);
          container.style.setProperty('--parallax-2', `${scrollY * 0.015}px`);
          container.style.setProperty('--parallax-3', `${scrollY * -0.025}px`);
          container.style.setProperty('--parallax-4', `${scrollY * 0.01}px`);
          container.style.setProperty('--parallax-5', `${scrollY * -0.018}px`);

          // Scroll-linked opacity boost (0.03 base -> up to 0.055 at full scroll)
          const opacityBoost = progress * 0.025;
          container.style.setProperty('--scroll-opacity-boost', `${opacityBoost}`);

          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initialize values
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes ambient-float-1 {
          0%, 100% { transform: translate(0, var(--parallax-1, 0px)) scale(1); }
          25% { transform: translate(30px, calc(-20px + var(--parallax-1, 0px))) scale(1.05); }
          50% { transform: translate(-15px, calc(25px + var(--parallax-1, 0px))) scale(0.95); }
          75% { transform: translate(20px, calc(15px + var(--parallax-1, 0px))) scale(1.02); }
        }
        @keyframes ambient-float-2 {
          0%, 100% { transform: translate(0, var(--parallax-2, 0px)) scale(1); }
          33% { transform: translate(-25px, calc(30px + var(--parallax-2, 0px))) scale(1.03); }
          66% { transform: translate(35px, calc(-15px + var(--parallax-2, 0px))) scale(0.97); }
        }
        @keyframes ambient-float-3 {
          0%, 100% { transform: translate(0, var(--parallax-3, 0px)) scale(1); }
          20% { transform: translate(40px, calc(10px + var(--parallax-3, 0px))) scale(1.04); }
          40% { transform: translate(-10px, calc(-30px + var(--parallax-3, 0px))) scale(0.96); }
          60% { transform: translate(15px, calc(20px + var(--parallax-3, 0px))) scale(1.01); }
          80% { transform: translate(-30px, calc(-5px + var(--parallax-3, 0px))) scale(0.98); }
        }
        @keyframes ambient-float-4 {
          0%, 100% { transform: translate(0, var(--parallax-4, 0px)); }
          50% { transform: translate(-20px, calc(35px + var(--parallax-4, 0px))); }
        }
        @keyframes ambient-float-5 {
          0%, 100% { transform: translate(0, var(--parallax-5, 0px)) scale(1); }
          30% { transform: translate(25px, calc(-25px + var(--parallax-5, 0px))) scale(1.06); }
          70% { transform: translate(-35px, calc(15px + var(--parallax-5, 0px))) scale(0.94); }
        }
        @keyframes ambient-twinkle {
          0%, 100% { opacity: var(--dot-base-opacity, 0.04); }
          50% { opacity: calc(var(--dot-base-opacity, 0.04) + 0.02 + var(--scroll-opacity-boost, 0)); }
        }
        @keyframes ambient-pulse {
          0%, 100% { opacity: 0.03; transform: scale(1); }
          50% { opacity: 0.05; transform: scale(1.15); }
        }
      `}</style>

      <div
        ref={containerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          // CSS custom properties initialized
          ['--scroll-y' as string]: '0',
          ['--scroll-progress' as string]: '0',
          ['--parallax-1' as string]: '0px',
          ['--parallax-2' as string]: '0px',
          ['--parallax-3' as string]: '0px',
          ['--parallax-4' as string]: '0px',
          ['--parallax-5' as string]: '0px',
          ['--scroll-opacity-boost' as string]: '0',
        }}
      >
        {/* === GRADIENT ORBS === */}

        {/* Orb 1 - Large warm gold, top-left area */}
        <div
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-10%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 40%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: `calc(0.04 + var(--scroll-opacity-boost, 0))`,
            animation: 'ambient-float-1 25s ease-in-out infinite',
            willChange: 'transform, opacity',
          }}
        />

        {/* Orb 2 - Medium deep gold, center-right */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,118,49,0.05) 0%, rgba(139,118,49,0.015) 45%, transparent 70%)',
            filter: 'blur(90px)',
            opacity: `calc(0.035 + var(--scroll-opacity-boost, 0))`,
            animation: 'ambient-float-2 30s ease-in-out infinite',
            willChange: 'transform, opacity',
          }}
        />

        {/* Orb 3 - Small warm accent, mid-left */}
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: '15%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, rgba(201,168,76,0.01) 50%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: `calc(0.03 + var(--scroll-opacity-boost, 0))`,
            animation: 'ambient-float-3 20s ease-in-out infinite',
            willChange: 'transform, opacity',
          }}
        />

        {/* Orb 4 - Large ambient wash, bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '30%',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, rgba(139,118,49,0.01) 40%, transparent 65%)',
            filter: 'blur(120px)',
            opacity: `calc(0.04 + var(--scroll-opacity-boost, 0))`,
            animation: 'ambient-float-4 35s ease-in-out infinite',
            willChange: 'transform, opacity',
          }}
        />

        {/* Orb 5 - Subtle vein of light, top-right diagonal */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '25%',
            width: '250px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.01) 50%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: `calc(0.03 + var(--scroll-opacity-boost, 0))`,
            transform: 'rotate(-30deg)',
            animation: 'ambient-float-5 28s ease-in-out infinite',
            willChange: 'transform, opacity',
          }}
        />

        {/* === CITY LIGHT DOTS === */}
        {CITY_LIGHTS.map(([left, top, size, baseOpacity, delay, duration], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: i % 3 === 0
                ? 'rgba(201,168,76,0.9)'    // warm gold
                : i % 3 === 1
                  ? 'rgba(232,201,106,0.8)'  // lighter gold
                  : 'rgba(139,111,46,0.85)',  // deep gold
              ['--dot-base-opacity' as string]: `${baseOpacity}`,
              opacity: baseOpacity,
              animation: `ambient-twinkle ${duration}s ease-in-out ${delay}s infinite`,
              willChange: 'opacity',
            }}
          />
        ))}

        {/* === SUBTLE VEIN LINES (light veins running through the dark) === */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '0',
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.03) 20%, rgba(201,168,76,0.05) 50%, rgba(201,168,76,0.03) 80%, transparent 100%)',
            opacity: `calc(0.5 + var(--scroll-opacity-boost, 0) * 8)`,
            animation: 'ambient-float-4 40s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '65%',
            left: '0',
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(139,118,49,0.03) 30%, rgba(201,168,76,0.04) 60%, transparent 100%)',
            opacity: `calc(0.4 + var(--scroll-opacity-boost, 0) * 6)`,
            animation: 'ambient-float-2 45s ease-in-out infinite',
          }}
        />

        {/* Horizon glow - faint warm light at the bottom edge like a distant city horizon */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '200px',
            background: 'linear-gradient(to top, rgba(201,168,76,0.03) 0%, rgba(139,118,49,0.01) 40%, transparent 100%)',
            opacity: `calc(0.6 + var(--scroll-opacity-boost, 0) * 5)`,
          }}
        />
      </div>
    </>
  );
}
