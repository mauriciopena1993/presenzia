'use client';

import { useEffect, useRef } from 'react';

/*
 * UK Network Map — a subtle, scroll-responsive background showing
 * the silhouette of the UK with city lights and digital connections.
 * Like a peaceful sleeping country seen from above at night.
 */

// ── UK cities: [name, x%, y%, size, isCapital] ──
// Positions approximate the UK map within an SVG viewBox
const CITIES: [string, number, number, number, boolean][] = [
  ['London',      62, 82, 4,  true],
  ['Manchester',  52, 58, 3,  false],
  ['Birmingham',  54, 68, 3,  false],
  ['Leeds',       54, 54, 2.5, false],
  ['Glasgow',     42, 30, 3,  false],
  ['Edinburgh',   48, 32, 3,  false],
  ['Bristol',     48, 78, 2.5, false],
  ['Liverpool',   48, 58, 2.5, false],
  ['Newcastle',   52, 44, 2.5, false],
  ['Sheffield',   54, 60, 2,  false],
  ['Cardiff',     44, 78, 2.5, false],
  ['Nottingham',  56, 64, 2,  false],
  ['Southampton', 58, 84, 2,  false],
  ['Cambridge',   64, 74, 2,  false],
  ['Oxford',      58, 76, 2,  false],
  ['Aberdeen',    50, 22, 2,  false],
  ['Inverness',   42, 18, 2,  false],
  ['Belfast',     30, 40, 2.5, false],
  ['Plymouth',    38, 86, 2,  false],
  ['Norwich',     70, 70, 2,  false],
];

// ── Connections between cities: [fromIdx, toIdx, delay] ──
const CONNECTIONS: [number, number, number][] = [
  [0, 2, 0],      // London - Birmingham
  [0, 13, 1.5],   // London - Cambridge
  [0, 14, 3],     // London - Oxford
  [0, 12, 4.5],   // London - Southampton
  [1, 7, 0.8],    // Manchester - Liverpool
  [1, 3, 2.2],    // Manchester - Leeds
  [1, 9, 3.8],    // Manchester - Sheffield
  [2, 11, 1.2],   // Birmingham - Nottingham
  [2, 10, 5],     // Birmingham - Cardiff
  [3, 8, 2.8],    // Leeds - Newcastle
  [4, 5, 0.5],    // Glasgow - Edinburgh
  [5, 8, 4],      // Edinburgh - Newcastle
  [6, 10, 1.8],   // Bristol - Cardiff
  [6, 14, 3.5],   // Bristol - Oxford
  [8, 15, 2],     // Newcastle - Aberdeen
  [15, 16, 4.2],  // Aberdeen - Inverness
  [4, 16, 5.5],   // Glasgow - Inverness
  [4, 17, 1],     // Glasgow - Belfast
  [18, 6, 3.2],   // Plymouth - Bristol
  [19, 13, 2.5],  // Norwich - Cambridge
];

// ── Simplified UK outline path (approximate) ──
const UK_PATH = `
  M 42,95 C 38,90 35,88 38,86 C 40,83 43,82 44,79 C 42,78 40,78 42,76
  C 44,74 47,76 48,78 C 50,80 52,82 55,84 C 58,85 62,84 64,82
  C 66,80 68,78 70,76 C 72,74 72,70 70,68 C 68,66 66,65 64,64
  C 62,63 60,62 58,62 C 56,62 55,60 54,58 C 53,56 52,54 52,52
  C 52,50 53,48 52,46 C 51,44 50,42 50,40 C 50,38 52,36 52,34
  C 52,32 50,30 48,28 C 46,26 48,24 50,22 C 52,20 50,18 48,16
  C 46,14 44,12 42,14 C 40,16 38,18 36,20
  C 34,22 36,24 38,26 C 40,28 42,30 42,32
  C 42,34 40,36 38,38 C 36,40 38,42 40,44
  C 42,46 44,48 46,50 C 48,52 48,54 48,56
  C 48,58 46,60 44,62 C 42,64 40,66 40,68
  C 40,70 42,72 44,74 C 42,76 40,78 38,80
  C 36,82 38,86 36,88 C 34,90 38,92 42,95 Z
`;

// Ireland/NI outline (simplified)
const NI_PATH = `
  M 26,36 C 24,34 22,36 22,38 C 22,40 24,42 26,44
  C 28,46 30,44 32,42 C 34,40 34,38 32,36
  C 30,34 28,36 26,36 Z
`;

export default function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

          // Parallax: shift the whole map slightly as you scroll
          container.style.setProperty('--map-y', `${scrollY * -0.04}px`);
          // Scroll progress drives brightness changes
          container.style.setProperty('--scroll-progress', `${progress}`);

          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes city-pulse {
          0%, 100% { opacity: var(--city-base, 0.4); transform: scale(1); }
          50% { opacity: calc(var(--city-base, 0.4) + 0.15); transform: scale(1.3); }
        }
        @keyframes connection-flow {
          0% { stroke-dashoffset: 20; opacity: 0; }
          15% { opacity: 0.25; }
          50% { opacity: 0.12; }
          85% { opacity: 0.25; }
          100% { stroke-dashoffset: -20; opacity: 0; }
        }
        @keyframes data-packet {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
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
          ['--map-y' as string]: '0px',
          ['--scroll-progress' as string]: '0',
        }}
      >
        {/* SVG network map */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '85vh',
            height: '85vh',
            transform: `translate(-50%, calc(-50% + var(--map-y, 0px)))`,
            opacity: 1,
          }}
        >
          <defs>
            {/* Glow filter for cities */}
            <filter id="city-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft glow for the map outline */}
            <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>

            {/* Radial gradient for London (capital glow) */}
            <radialGradient id="capital-glow">
              <stop offset="0%" stopColor="rgba(201,168,76,0.3)" />
              <stop offset="100%" stopColor="rgba(201,168,76,0)" />
            </radialGradient>
          </defs>

          {/* UK outline — very subtle ghost silhouette */}
          <path
            d={UK_PATH}
            fill="none"
            stroke="rgba(201,168,76,0.06)"
            strokeWidth="0.4"
            filter="url(#map-glow)"
          />
          <path
            d={NI_PATH}
            fill="none"
            stroke="rgba(201,168,76,0.05)"
            strokeWidth="0.3"
            filter="url(#map-glow)"
          />

          {/* Filled silhouette — extremely faint */}
          <path
            d={UK_PATH}
            fill="rgba(201,168,76,0.015)"
            stroke="none"
          >
            <animate
              attributeName="fill-opacity"
              values="0.015;0.025;0.015"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d={NI_PATH}
            fill="rgba(201,168,76,0.012)"
            stroke="none"
          />

          {/* Connection lines between cities */}
          {CONNECTIONS.map(([from, to, delay], i) => {
            const [, x1, y1] = CITIES[from];
            const [, x2, y2] = CITIES[to];
            return (
              <line
                key={`conn-${i}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(201,168,76,0.15)"
                strokeWidth="0.15"
                strokeDasharray="2 3"
                style={{
                  animation: `connection-flow ${6 + (i % 4)}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}

          {/* City dots */}
          {CITIES.map(([name, cx, cy, size, isCapital], i) => (
            <g key={`city-${i}`}>
              {/* Outer glow ring for capitals */}
              {isCapital && (
                <circle
                  cx={cx} cy={cy}
                  r={size * 2.5}
                  fill="url(#capital-glow)"
                  style={{ animation: 'glow-breathe 5s ease-in-out infinite' }}
                />
              )}
              {/* City dot */}
              <circle
                cx={cx} cy={cy}
                r={size * 0.35}
                fill={isCapital ? 'rgba(232,201,106,0.7)' : 'rgba(201,168,76,0.5)'}
                filter="url(#city-glow)"
                style={{
                  ['--city-base' as string]: isCapital ? '0.5' : '0.3',
                  animation: `city-pulse ${4 + (i % 5)}s ease-in-out ${i * 0.7}s infinite`,
                }}
              />
              {/* Tiny label (only for larger cities) */}
              {size >= 3 && (
                <text
                  x={cx + size * 0.6}
                  y={cy + 0.3}
                  fill="rgba(201,168,76,0.12)"
                  fontSize="1.8"
                  fontFamily="Inter, sans-serif"
                  fontWeight="400"
                >
                  {name}
                </text>
              )}
            </g>
          ))}

          {/* Travelling data packets along connections */}
          {CONNECTIONS.filter((_, i) => i % 3 === 0).map(([from, to, delay], i) => {
            const [, x1, y1] = CITIES[from];
            const [, x2, y2] = CITIES[to];
            const pathId = `packet-path-${i}`;
            return (
              <g key={`packet-${i}`}>
                <path
                  id={pathId}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  fill="none"
                  stroke="none"
                />
                <circle
                  r="0.4"
                  fill="rgba(232,201,106,0.6)"
                  style={{
                    offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
                    animation: `data-packet ${3 + i}s ease-in-out ${delay + 1}s infinite`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Soft ambient glow behind the map — very subtle warm wash */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '40%',
            width: '400px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 0.5,
            transform: `translateY(var(--map-y, 0px))`,
          }}
        />
      </div>
    </>
  );
}
