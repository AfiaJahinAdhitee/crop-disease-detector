'use client'

import { LEAF, STEM, C_VEIN, VEINS } from './LeaflineLogo'

// Cycle duration in seconds per speed
const DUR = { slow: 4.2, default: 2.8, fast: 1.6 }

// Ripple starts at the stem, travels up through the center vein, then the
// lateral pairs fire in bottom-to-top order as the wave passes each branch.
// stem + center vein = step 0. pair5 (y=36, nearest stem) = step 1, …, pair1 (y=13, nearest tip) = step 5.
// VEINS order: [L1,R1, L2,R2, L3,R3, L4,R4, L5,R5]
const STEPS = [5, 5, 4, 4, 3, 3, 2, 2, 1, 1]
const STEP_FRAC = 0.14  // 14 % of cycle per step; 5 steps × 14 % + 30 % fade = 100 % (tip fades exactly at cycle end)

export default function LeafPulse({ size = 64, speed = 'default', className = '' }) {
  const dur = DUR[speed] ?? DUR.default
  const step = dur * STEP_FRAC

  const w = Math.round(size * (30 / 52))
  const anim = (delay = 0) =>
    ({ animation: `leaf-ripple ${dur}s ease-out ${delay.toFixed(2)}s infinite` })

  return (
    <svg
      viewBox="0 0 30 52"
      width={w}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Layer 1: static green leaf body */}
      <path d={LEAF} fill="var(--brand)" />
      <path d={STEM} fill="var(--brand)" />

      {/* Layer 2: whole-leaf glow — body brightens as wave starts (synced to stem) */}
      <path d={LEAF} fill="var(--brand-pulse)" className="leaf-glow-anim"
        style={{ animation: `leaf-glow ${dur}s ease-out 0s infinite` }} />

      {/* Layer 3: dim base veins — always visible */}
      <path d={C_VEIN} stroke="var(--brand-on)" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" />
      {VEINS.map((d, i) => (
        <path key={`b${i}`} d={d} stroke="var(--brand-on)" strokeWidth="1" strokeLinecap="round" opacity="0.28" fill="none" />
      ))}

      {/* Layer 4: stem ripple — fires first (step 0) */}
      <path d={STEM} fill="var(--brand-pulse)" className="leaf-ripple-anim" style={anim(0)} />

      {/* Layer 5: center vein — pulse travels stem→tip via stroke-dashoffset.
          Path reversed (M15 44 → M15 5) so dashoffset draws upward from base to tip. */}
      <path
        d="M15 44L15 5"
        stroke="var(--brand-pulse)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="leaf-vein-draw"
        style={{ animation: `leaf-vein-draw ${dur}s ease-out 0.01s infinite` }}
      />

      {/* Layer 6: lateral vein ripples — bottom to top, tapered by proximity to stem */}
      {VEINS.map((d, i) => (
        <path
          key={`p${i}`}
          d={d}
          stroke="var(--brand-pulse)"
          strokeWidth={1.0 + Math.floor(i / 2) * 0.1}
          strokeLinecap="round"
          fill="none"
          className="leaf-ripple-anim"
          style={anim(STEPS[i] * step)}
        />
      ))}
    </svg>
  )
}
