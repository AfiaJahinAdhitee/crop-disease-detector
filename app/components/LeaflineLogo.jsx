'use client'

// ─── Leaf geometry (viewBox "0 0 30 52") ─────────────────────────────────────
// Pointed oval leaf with a small stem nub at the bottom.
// Widest ~x=3/x=27 at y≈23. Tip at (15,2). Base narrows to (15,45). Stem to (15,50).

// Outer leaf silhouette
export const LEAF = 'M15 2C23 6 28 15 27 25C26 35 21 43 15 45C9 43 4 35 3 25C2 15 7 6 15 2Z'

// Stem nub — small teardrop at bottom
export const STEM = 'M15 45C14.6 46.5 14.6 48.5 15 50C15.4 48.5 15.4 46.5 15 45Z'

// Central vein — tip to base (length = 39 px, straight line)
export const C_VEIN = 'M15 5L15 44'

// Lateral veins: 5 pairs branching upward toward the tip as they extend outward.
// Branch points along C_VEIN: pair 1 at y=13 (pos 8), pair 2 at y=19 (pos 14),
// pair 3 at y=25 (pos 20), pair 4 at y=31 (pos 26), pair 5 at y=36 (pos 31).
export const VEINS = [
  'M15 13Q11 10 9 8',  'M15 13Q19 10 21 8',   // pair 1
  'M15 19Q9 16 5 14',  'M15 19Q21 16 25 14',  // pair 2
  'M15 25Q8 22 4 20',  'M15 25Q22 22 26 20',  // pair 3
  'M15 31Q9 28 5 26',  'M15 31Q21 28 25 26',  // pair 4
  'M15 36Q10 33 7 32', 'M15 36Q20 33 23 32',  // pair 5
]

// ─── LeafMark ─────────────────────────────────────────────────────────────────
// Standalone leaf icon — for composing with HTML text or anywhere you need
// just the mark (no wordmark). size = rendered height in px.
export function LeafMark({ size = 32, animate = false, className = '' }) {
  const w = Math.round(size * (30 / 52))
  return (
    <svg
      viewBox="0 0 30 52"
      width={w}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g className={animate ? 'leafline-animate' : ''}>
        {/* Leaf body + stem */}
        <path d={LEAF} fill="var(--brand)" />
        <path d={STEM} fill="var(--brand)" />
        {/* Central vein */}
        <path d={C_VEIN} stroke="var(--brand-on)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        {/* Lateral veins */}
        {VEINS.map((d, i) => (
          <path key={i} d={d} stroke="var(--brand-on)" strokeWidth="1" strokeLinecap="round" opacity="0.5" fill="none" />
        ))}
      </g>
    </svg>
  )
}

// ─── LeaflineLogo ─────────────────────────────────────────────────────────────
// Full logo: leaf mark + "Leafline" wordmark in one SVG.
// size = rendered height in px.
export default function LeaflineLogo({
  size = 32,
  animate = false,
  className = '',
}) {
  // ViewBox: leaf 0–30 wide, gap 10, wordmark ~130 wide → total 172
  const vbW = 172
  const vbH = 52
  const w = Math.round(size * (vbW / vbH))

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={w}
      height={size}
      fill="none"
      aria-label="Leafline"
      className={className}
    >
      {/* Leaf mark */}
      <g className={animate ? 'leafline-animate' : ''}>
        <path d={LEAF} fill="var(--brand)" />
        <path d={STEM} fill="var(--brand)" />
        <path d={C_VEIN} stroke="var(--brand-on)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        {VEINS.map((d, i) => (
          <path key={i} d={d} stroke="var(--brand-on)" strokeWidth="1" strokeLinecap="round" opacity="0.5" fill="none" />
        ))}
      </g>

      {/* Wordmark */}
      <text
        x="40"
        y="35"
        fontSize="26"
        fontWeight="700"
        fontFamily="var(--font-geist-sans, system-ui, -apple-system, sans-serif)"
        letterSpacing="-0.5"
        fill="var(--text-primary)"
      >
        Leafline
      </text>
    </svg>
  )
}
