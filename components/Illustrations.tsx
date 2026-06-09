/**
 * Editorial monochrome illustrations. The brand forbids a second accent colour and
 * generic stock imagery — so every figure here is built from ink/canvas geometry around
 * the product's core idea: nodes, links, reasoning paths, and transformed text.
 * All use currentColor where they sit on a flipped (dark) surface.
 */

/* A reasoning network — ideas (nodes) linked into a conclusion. */
export function ReasoningWeb({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#efefef" />
      {/* links */}
      <g stroke="#000" strokeWidth="1.6">
        <line x1="80" y1="70" x2="190" y2="120" />
        <line x1="80" y1="200" x2="190" y2="120" />
        <line x1="120" y1="140" x2="190" y2="120" />
        <line x1="190" y1="120" x2="300" y2="90" />
        <line x1="190" y1="120" x2="300" y2="180" />
        <line x1="300" y1="90" x2="330" y2="150" />
        <line x1="300" y1="180" x2="330" y2="150" />
      </g>
      {/* idea nodes */}
      <g fill="#fff" stroke="#000" strokeWidth="1.6">
        <circle cx="80" cy="70" r="14" />
        <circle cx="80" cy="200" r="14" />
        <circle cx="120" cy="140" r="10" />
        <circle cx="300" cy="90" r="14" />
        <circle cx="300" cy="180" r="14" />
      </g>
      {/* the synthesising hub + conclusion (filled = decided) */}
      <circle cx="190" cy="120" r="22" fill="#000" />
      <circle cx="330" cy="150" r="18" fill="#000" />
      <path d="M323 150 l5 6 l10 -12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A reasoning trace — stacked thought steps leading to an answer. On dark surfaces. */
export function ThinkPath({ className = "" }: { className?: string }) {
  const steps = [0, 1, 2];
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#000" />
      {steps.map((i) => (
        <g key={i} transform={`translate(0 ${40 + i * 56})`}>
          <circle cx="64" cy="14" r="9" fill="none" stroke="#fff" strokeWidth="1.6" />
          <text x="64" y="18" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="monospace">
            {i + 1}
          </text>
          {i < steps.length - 1 && <line x1="64" y1="23" x2="64" y2="46" stroke="#4b4b4b" strokeWidth="1.6" />}
          <rect x="88" y="2" width={236 - i * 36} height="24" rx="6" fill="#282828" />
        </g>
      ))}
      {/* answer */}
      <g transform="translate(0 224)">
        <rect x="56" y="0" width="288" height="40" rx="10" fill="#fff" />
        <path d="M74 20 l8 8 l16 -18" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="110" y="14" width="210" height="12" rx="6" fill="#efefef" />
      </g>
    </svg>
  );
}

/* Rewrite — raw text transformed into refined text. */
export function RewriteGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#efefef" />
      {/* messy source */}
      <g transform="translate(40 70)">
        <rect width="120" height="160" rx="10" fill="#fff" stroke="#e2e2e2" strokeWidth="1.4" />
        <g fill="#afafaf">
          <rect x="16" y="22" width="88" height="8" rx="4" />
          <rect x="16" y="42" width="64" height="8" rx="4" />
          <rect x="16" y="62" width="92" height="8" rx="4" />
          <rect x="16" y="82" width="48" height="8" rx="4" />
          <rect x="16" y="102" width="80" height="8" rx="4" />
          <rect x="16" y="122" width="56" height="8" rx="4" />
        </g>
      </g>
      {/* transform mark */}
      <circle cx="200" cy="150" r="26" fill="#000" />
      <path
        d="M191 150 h18 M203 144 l6 6 l-6 6"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* refined result */}
      <g transform="translate(240 70)">
        <rect width="120" height="160" rx="10" fill="#000" />
        <g fill="#fff">
          <rect x="16" y="22" width="88" height="8" rx="4" />
          <rect x="16" y="42" width="88" height="8" rx="4" />
          <rect x="16" y="62" width="72" height="8" rx="4" />
          <rect x="16" y="92" width="88" height="8" rx="4" />
          <rect x="16" y="112" width="60" height="8" rx="4" />
        </g>
      </g>
    </svg>
  );
}

/* Data sovereignty — a shield over a bordered region with a lock. Data stays inside the nation. */
export function SovereignData({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#000" />
      {/* shield */}
      <path
        d="M200 56 L286 86 V158 C286 206 248 236 200 252 C152 236 114 206 114 158 V86 Z"
        fill="#282828"
        stroke="#4b4b4b"
        strokeWidth="1.6"
      />
      {/* bordered region (dashed = national border) */}
      <path
        d="M160 120 q14 -14 30 -6 q18 -10 32 6 q14 6 8 24 q6 16 -10 22 q-12 16 -32 8 q-18 8 -30 -8 q-14 -10 -6 -26 q-6 -14 8 -20 Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="1.4"
        strokeDasharray="5 5"
      />
      {/* lock at center */}
      <rect x="186" y="158" width="28" height="22" rx="4" fill="#fff" />
      <path d="M191 158 v-6 a9 9 0 0 1 18 0 v6" stroke="#fff" strokeWidth="2.2" fill="none" />
      <circle cx="200" cy="168" r="3" fill="#000" />
    </svg>
  );
}

/* A government institution — classical pediment + columns. */
export function Institution({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#efefef" />
      {/* pediment */}
      <path d="M120 96 L200 60 L280 96 Z" fill="#000" />
      {/* architrave */}
      <rect x="118" y="98" width="164" height="14" fill="#000" />
      {/* columns */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={132 + i * 44} y="118" width="16" height="92" fill="#000" />
      ))}
      {/* steps */}
      <rect x="108" y="212" width="184" height="10" fill="#000" />
      <rect x="98" y="224" width="204" height="12" fill="#000" />
    </svg>
  );
}

/* Document processing pipeline — raw documents in, structured + verified out. */
export function DocPipeline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#efefef" />
      {/* stacked input docs */}
      <g transform="translate(40 78)">
        <rect x="14" y="14" width="96" height="128" rx="8" fill="#fff" stroke="#e2e2e2" strokeWidth="1.4" />
        <rect x="7" y="7" width="96" height="128" rx="8" fill="#fff" stroke="#e2e2e2" strokeWidth="1.4" />
        <rect x="0" y="0" width="96" height="128" rx="8" fill="#fff" stroke="#afafaf" strokeWidth="1.4" />
        <g fill="#afafaf">
          <rect x="16" y="20" width="64" height="7" rx="3.5" />
          <rect x="16" y="38" width="48" height="7" rx="3.5" />
          <rect x="16" y="56" width="64" height="7" rx="3.5" />
          <rect x="16" y="74" width="40" height="7" rx="3.5" />
          <rect x="16" y="92" width="56" height="7" rx="3.5" />
        </g>
      </g>
      {/* processor */}
      <circle cx="200" cy="150" r="26" fill="#000" />
      <path d="M191 150 h18 M203 144 l6 6 l-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* structured + verified output */}
      <g transform="translate(252 78)">
        <rect width="108" height="144" rx="8" fill="#000" />
        <g fill="#fff">
          <rect x="16" y="18" width="76" height="7" rx="3.5" />
          <rect x="16" y="34" width="60" height="7" rx="3.5" />
        </g>
        <g fill="#4b4b4b">
          <rect x="16" y="54" width="76" height="6" rx="3" />
          <rect x="16" y="68" width="76" height="6" rx="3" />
          <rect x="16" y="82" width="52" height="6" rx="3" />
        </g>
        {/* verified check */}
        <circle cx="54" cy="116" r="15" fill="#fff" />
        <path d="M47 116 l5 5 l9 -10" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* A laptop running the model locally — privacy / on-device angle. */
export function LocalDevice({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="400" height="300" rx="16" fill="#000" />
      <rect x="110" y="80" width="180" height="120" rx="10" fill="#282828" stroke="#4b4b4b" strokeWidth="1.4" />
      <rect x="126" y="98" width="148" height="84" rx="6" fill="#000" />
      <circle cx="200" cy="140" r="22" fill="none" stroke="#fff" strokeWidth="1.6" />
      <path d="M188 148 L200 132 L212 142" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="188" cy="148" r="3.2" fill="#fff" />
      <circle cx="200" cy="132" r="3.2" fill="#fff" />
      <circle cx="212" cy="142" r="3.2" fill="#fff" />
      {/* base */}
      <path d="M96 210 h208 l14 18 H82 z" fill="#282828" stroke="#4b4b4b" strokeWidth="1.4" />
      {/* offline badge */}
      <g transform="translate(250 70)">
        <circle cx="0" cy="0" r="16" fill="#fff" />
        <path d="M-7 0 l4 4 l9 -9" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
