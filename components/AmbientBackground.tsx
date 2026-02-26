'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/*
 * UK Network Map — a subtle, static background texture showing
 * the silhouette of the UK with city dots and digital connections.
 * Only moves via scroll parallax — no constant animations.
 */

// ── UK cities: [name, x%, y%, size, isCapital] ──
const CITIES: [string, number, number, number, boolean][] = [
  ['London',      124, 82, 4,  true],
  ['Manchester',  104, 58, 3,  false],
  ['Birmingham',  108, 68, 3,  false],
  ['Leeds',       108, 54, 2.5, false],
  ['Glasgow',     84,  30, 3,  false],
  ['Edinburgh',   96,  32, 3,  false],
  ['Bristol',     96,  78, 2.5, false],
  ['Liverpool',   96,  58, 2.5, false],
  ['Newcastle',   104, 44, 2.5, false],
  ['Sheffield',   108, 60, 2,  false],
  ['Cardiff',     88,  78, 2.5, false],
  ['Nottingham',  112, 64, 2,  false],
  ['Southampton', 116, 84, 2,  false],
  ['Cambridge',   128, 74, 2,  false],
  ['Oxford',      116, 76, 2,  false],
  ['Aberdeen',    100, 22, 2,  false],
  ['Inverness',   84,  18, 2,  false],
  ['Belfast',     60,  40, 2.5, false],
  ['Plymouth',    76,  86, 2,  false],
  ['Norwich',     140, 70, 2,  false],
];

// ── Ambient network nodes to fill the full background ──
const AMBIENT_NODES: [number, number, number][] = [
  [15, 15, 1.2], [30, 45, 1.0], [8, 70, 1.3], [25, 90, 1.0],
  [45, 10, 1.1], [40, 65, 1.2], [50, 95, 0.9], [20, 30, 1.0],
  [35, 75, 1.1], [12, 50, 0.8], [155, 20, 1.2], [170, 50, 1.0],
  [185, 75, 1.3], [160, 85, 1.0], [175, 15, 1.1], [190, 40, 1.2],
  [165, 65, 0.9], [180, 95, 1.0], [150, 45, 1.1], [195, 60, 0.8],
  [145, 100, 1.0], [10, 105, 0.9], [35, 110, 1.1], [160, 105, 1.0],
  [185, 110, 0.9],
];

// ── Connections between UK cities ──
const CONNECTIONS: [number, number][] = [
  [0, 2], [0, 13], [0, 14], [0, 12],
  [1, 7], [1, 3], [1, 9], [2, 11],
  [2, 10], [3, 8], [4, 5], [5, 8],
  [6, 10], [6, 14], [8, 15], [15, 16],
  [4, 16], [4, 17], [18, 6], [19, 13],
];

// ── Ambient connections ──
const AMBIENT_CONNECTIONS: ['aa' | 'ac', number, number][] = [
  ['ac', 0, 17], ['ac', 1, 17], ['ac', 2, 18], ['ac', 5, 10],
  ['ac', 3, 18], ['ac', 7, 4], ['ac', 10, 19], ['ac', 11, 0],
  ['ac', 13, 12], ['ac', 15, 19], ['ac', 17, 0], ['ac', 19, 13],
  ['aa', 0, 7], ['aa', 1, 5], ['aa', 2, 3], ['aa', 10, 11],
  ['aa', 14, 15], ['aa', 17, 19], ['aa', 12, 13], ['aa', 20, 3],
  ['aa', 21, 2], ['aa', 22, 5], ['aa', 23, 11], ['aa', 24, 15],
];

// ── UK outline paths ──
const UK_PATH = `
  M 84,95 C 80,90 77,88 80,86 C 82,83 85,82 86,79 C 84,78 82,78 84,76
  C 86,74 89,76 90,78 C 92,80 94,82 97,84 C 100,85 104,84 106,82
  C 108,80 110,78 112,76 C 114,74 114,70 112,68 C 110,66 108,65 106,64
  C 104,63 102,62 100,62 C 98,62 97,60 96,58 C 95,56 94,54 94,52
  C 94,50 95,48 94,46 C 93,44 92,42 92,40 C 92,38 94,36 94,34
  C 94,32 92,30 90,28 C 88,26 90,24 92,22 C 94,20 92,18 90,16
  C 88,14 86,12 84,14 C 82,16 80,18 78,20
  C 76,22 78,24 80,26 C 82,28 84,30 84,32
  C 84,34 82,36 80,38 C 78,40 80,42 82,44
  C 84,46 86,48 88,50 C 90,52 90,54 90,56
  C 90,58 88,60 86,62 C 84,64 82,66 82,68
  C 82,70 84,72 86,74 C 84,76 82,78 80,80
  C 78,82 80,86 78,88 C 76,90 80,92 84,95 Z
`;

const NI_PATH = `
  M 56,36 C 54,34 52,36 52,38 C 52,40 54,42 56,44
  C 58,46 60,44 62,42 C 64,40 64,38 62,36
  C 60,34 58,36 56,36 Z
`;

export default function AmbientBackground() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) return;
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Gentle parallax shift as user scrolls
          container.style.setProperty('--map-y', `${scrollY * -0.08}px`);
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
  }, [isDashboard]);

  // Dashboard pages have solid backgrounds — skip the ambient map
  if (isDashboard) return null;

  return (
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
      }}
    >
      {/* SVG network map — static texture, moves only on scroll */}
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '140vw',
          height: '140vh',
          minWidth: '140vh',
          minHeight: '140vw',
          transform: `translate(-50%, calc(-50% + var(--map-y, 0px)))`,
        }}
      >
        <defs>
          <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <radialGradient id="capital-glow">
            <stop offset="0%" stopColor="rgba(201,168,76,0.06)" />
            <stop offset="100%" stopColor="rgba(201,168,76,0)" />
          </radialGradient>
        </defs>

        {/* UK outline — ghost silhouette */}
        <path d={UK_PATH} fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth="0.4" filter="url(#map-glow)" />
        <path d={NI_PATH} fill="none" stroke="rgba(201,168,76,0.04)" strokeWidth="0.3" filter="url(#map-glow)" />

        {/* Filled silhouette */}
        <path d={UK_PATH} fill="rgba(201,168,76,0.02)" stroke="none" />
        <path d={NI_PATH} fill="rgba(201,168,76,0.012)" stroke="none" />

        {/* Ambient connections */}
        {AMBIENT_CONNECTIONS.map(([type, from, to], i) => {
          const fromNode = AMBIENT_NODES[from];
          const toNode = type === 'ac' ? CITIES[to] : AMBIENT_NODES[to];
          if (!fromNode || !toNode) return null;
          const [x1, y1] = [fromNode[0], fromNode[1]];
          const [x2, y2] = type === 'ac' ? [toNode[1], toNode[2]] : [toNode[0], toNode[1]];
          return (
            <line
              key={`amb-conn-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(201,168,76,0.03)"
              strokeWidth="0.08"
              strokeDasharray="3 6"
            />
          );
        })}

        {/* UK connection lines */}
        {CONNECTIONS.map(([from, to], i) => {
          const [, x1, y1] = CITIES[from];
          const [, x2, y2] = CITIES[to];
          return (
            <line
              key={`conn-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(201,168,76,0.06)"
              strokeWidth="0.12"
              strokeDasharray="2 4"
            />
          );
        })}

        {/* Ambient network dots */}
        {AMBIENT_NODES.map(([x, y, size], i) => (
          <circle
            key={`amb-${i}`}
            cx={x} cy={y}
            r={size * 0.25}
            fill="rgba(201,168,76,0.07)"
          />
        ))}

        {/* City dots */}
        {CITIES.map(([, cx, cy, size, isCapital], i) => (
          <g key={`city-${i}`}>
            {isCapital && (
              <circle cx={cx} cy={cy} r={size * 2} fill="url(#capital-glow)" />
            )}
            <circle
              cx={cx} cy={cy}
              r={size * 0.3}
              fill={isCapital ? 'rgba(232,201,106,0.15)' : 'rgba(201,168,76,0.1)'}
            />
          </g>
        ))}
      </svg>

      {/* Soft ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '35%',
          width: '500px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.02) 0%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: 0.5,
          transform: `translateY(var(--map-y, 0px))`,
        }}
      />
    </div>
  );
}
