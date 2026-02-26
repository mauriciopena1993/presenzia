'use client';

import { useEffect, useRef } from 'react';

/*
 * UK Network Map — a subtle, scroll-responsive background showing
 * the silhouette of the UK with city lights and digital connections.
 * Extended across the full viewport with ambient network nodes for
 * consistent texture from top to bottom.
 */

// ── UK cities: [name, x%, y%, size, isCapital] ──
// Positions in a wider viewBox (0 0 200 120) to spread across full width
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

// ── Ambient network nodes (beyond UK) to fill the full background ──
// [x, y, size] — scattered across the wider viewBox
const AMBIENT_NODES: [number, number, number][] = [
  [15, 15, 1.2],
  [30, 45, 1.0],
  [8, 70, 1.3],
  [25, 90, 1.0],
  [45, 10, 1.1],
  [40, 65, 1.2],
  [50, 95, 0.9],
  [20, 30, 1.0],
  [35, 75, 1.1],
  [12, 50, 0.8],
  [155, 20, 1.2],
  [170, 50, 1.0],
  [185, 75, 1.3],
  [160, 85, 1.0],
  [175, 15, 1.1],
  [190, 40, 1.2],
  [165, 65, 0.9],
  [180, 95, 1.0],
  [150, 45, 1.1],
  [195, 60, 0.8],
  [145, 100, 1.0],
  [10, 105, 0.9],
  [35, 110, 1.1],
  [160, 105, 1.0],
  [185, 110, 0.9],
];

// ── Connections between UK cities: [fromIdx, toIdx, delay] ──
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

// ── Ambient connections (between ambient nodes and cities) ──
// [type, fromIdx, toIdx, delay] — type: 'aa' = ambient-to-ambient, 'ac' = ambient-to-city
const AMBIENT_CONNECTIONS: ['aa' | 'ac', number, number, number][] = [
  ['ac', 0, 17, 2],     // node0 → Belfast
  ['ac', 1, 17, 4],     // node1 → Belfast
  ['ac', 2, 18, 3],     // node2 → Plymouth
  ['ac', 5, 10, 1],     // node5 → Cardiff
  ['ac', 3, 18, 5],     // node3 → Plymouth
  ['ac', 7, 4, 2.5],    // node7 → Glasgow
  ['ac', 10, 19, 1.5],  // node10 → Norwich
  ['ac', 11, 0, 3],     // node11 → London
  ['ac', 13, 12, 4],    // node13 → Southampton
  ['ac', 15, 19, 2],    // node15 → Norwich
  ['ac', 17, 0, 5],     // node17 → London
  ['ac', 19, 13, 3.5],  // node19 → Cambridge
  ['aa', 0, 7, 3],      // ambient to ambient
  ['aa', 1, 5, 4.5],
  ['aa', 2, 3, 2],
  ['aa', 10, 11, 3.5],
  ['aa', 14, 15, 2.5],
  ['aa', 17, 19, 4],
  ['aa', 12, 13, 1.5],
  ['aa', 20, 3, 5],
  ['aa', 21, 2, 3],
  ['aa', 22, 5, 2],
  ['aa', 23, 11, 4],
  ['aa', 24, 15, 3.5],
];

// ── Simplified UK outline path (shifted right to center in wider viewBox) ──
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

// Ireland/NI outline (shifted right)
const NI_PATH = `
  M 56,36 C 54,34 52,36 52,38 C 52,40 54,42 56,44
  C 58,46 60,44 62,42 C 64,40 64,38 62,36
  C 60,34 58,36 56,36 Z
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

          // Parallax: shift the whole map as you scroll
          container.style.setProperty('--map-y', `${scrollY * -0.12}px`);
          // Scroll progress for brightness
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
          0%, 100% { opacity: var(--city-base, 0.5); transform: scale(1); }
          50% { opacity: calc(var(--city-base, 0.5) + 0.15); transform: scale(1.25); }
        }
        @keyframes ambient-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        @keyframes connection-flow {
          0% { stroke-dashoffset: 20; opacity: 0; }
          20% { opacity: 0.3; }
          50% { opacity: 0.12; }
          80% { opacity: 0.3; }
          100% { stroke-dashoffset: -20; opacity: 0; }
        }
        @keyframes ambient-flow {
          0% { stroke-dashoffset: 16; opacity: 0; }
          25% { opacity: 0.18; }
          50% { opacity: 0.06; }
          75% { opacity: 0.18; }
          100% { stroke-dashoffset: -16; opacity: 0; }
        }
        @keyframes data-packet {
          0% { offset-distance: 0%; opacity: 0; }
          15% { opacity: 0.6; }
          85% { opacity: 0.6; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.12; }
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
        {/* SVG network map — full viewport coverage */}
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
            opacity: 1,
          }}
        >
          <defs>
            {/* Glow filter for cities */}
            <filter id="city-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft glow for the map outline */}
            <filter id="map-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            {/* Radial gradient for London (capital glow) */}
            <radialGradient id="capital-glow">
              <stop offset="0%" stopColor="rgba(201,168,76,0.7)" />
              <stop offset="100%" stopColor="rgba(201,168,76,0)" />
            </radialGradient>
          </defs>

          {/* UK outline — ghost silhouette */}
          <path
            d={UK_PATH}
            fill="none"
            stroke="rgba(201,168,76,0.5)"
            strokeWidth="0.6"
            filter="url(#map-glow)"
          />
          <path
            d={NI_PATH}
            fill="none"
            stroke="rgba(201,168,76,0.4)"
            strokeWidth="0.5"
            filter="url(#map-glow)"
          />

          {/* Filled silhouette */}
          <path
            d={UK_PATH}
            fill="rgba(201,168,76,0.12)"
            stroke="none"
          >
            <animate
              attributeName="fill-opacity"
              values="0.12;0.18;0.12"
              dur="14s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d={NI_PATH}
            fill="rgba(201,168,76,0.08)"
            stroke="none"
          />

          {/* Ambient connections (wider network reaching to edges) */}
          {AMBIENT_CONNECTIONS.map(([type, from, to, delay], i) => {
            const fromNode = type === 'aa' || type === 'ac' ? AMBIENT_NODES[from] : null;
            const toNode = type === 'ac' ? CITIES[to] : type === 'aa' ? AMBIENT_NODES[to] : null;
            if (!fromNode || !toNode) return null;
            const [x1, y1] = [fromNode[0], fromNode[1]];
            const [x2, y2] = type === 'ac' ? [toNode[1], toNode[2]] : [toNode[0], toNode[1]];
            return (
              <line
                key={`amb-conn-${i}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(201,168,76,0.35)"
                strokeWidth="0.15"
                strokeDasharray="3 5"
                style={{
                  animation: `ambient-flow ${14 + (i % 8)}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}

          {/* UK Connection lines between cities */}
          {CONNECTIONS.map(([from, to, delay], i) => {
            const [, x1, y1] = CITIES[from];
            const [, x2, y2] = CITIES[to];
            return (
              <line
                key={`conn-${i}`}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke="rgba(201,168,76,0.6)"
                strokeWidth="0.2"
                strokeDasharray="2 3"
                style={{
                  animation: `connection-flow ${10 + (i % 6)}s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}

          {/* Ambient network dots (spread across full background) */}
          {AMBIENT_NODES.map(([x, y, size], i) => (
            <circle
              key={`amb-${i}`}
              cx={x} cy={y}
              r={size * 0.4}
              fill="rgba(201,168,76,0.8)"
              style={{
                animation: `ambient-pulse ${8 + (i % 8)}s ease-in-out ${i * 1.2}s infinite`,
              }}
            />
          ))}

          {/* City dots */}
          {CITIES.map(([name, cx, cy, size, isCapital], i) => (
            <g key={`city-${i}`}>
              {/* Outer glow ring for capitals */}
              {isCapital && (
                <circle
                  cx={cx} cy={cy}
                  r={size * 3}
                  fill="url(#capital-glow)"
                  style={{ animation: 'glow-breathe 10s ease-in-out infinite' }}
                />
              )}
              {/* City dot */}
              <circle
                cx={cx} cy={cy}
                r={size * 0.4}
                fill={isCapital ? 'rgba(232,201,106,1)' : 'rgba(201,168,76,0.9)'}
                filter="url(#city-glow)"
                style={{
                  ['--city-base' as string]: isCapital ? '0.6' : '0.4',
                  animation: `city-pulse ${7 + (i % 7)}s ease-in-out ${i * 1}s infinite`,
                }}
              />
              {/* Tiny label (only for larger cities) */}
              {size >= 3 && (
                <text
                  x={cx + size * 0.7}
                  y={cy + 0.4}
                  fill="rgba(201,168,76,0.4)"
                  fontSize="2"
                  fontFamily="Inter, sans-serif"
                  fontWeight="400"
                >
                  {name}
                </text>
              )}
            </g>
          ))}

          {/* Travelling data packets along city connections */}
          {CONNECTIONS.filter((_, i) => i % 3 === 0).map(([from, to, delay], i) => {
            const [, x1, y1] = CITIES[from];
            const [, x2, y2] = CITIES[to];
            return (
              <g key={`packet-${i}`}>
                <path
                  id={`packet-path-${i}`}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                  fill="none"
                  stroke="none"
                />
                <circle
                  r="0.5"
                  fill="rgba(232,201,106,1)"
                  style={{
                    offsetPath: `path('M ${x1} ${y1} L ${x2} ${y2}')`,
                    animation: `data-packet ${6 + i * 2}s ease-in-out ${delay + 2}s infinite`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Soft ambient glow behind the map */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '35%',
            width: '500px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: 1,
            transform: `translateY(var(--map-y, 0px))`,
          }}
        />
      </div>
    </>
  );
}
