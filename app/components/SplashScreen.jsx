'use client'

import { useState, useEffect } from 'react'
import LeafPulse from './LeafPulse'
import LeaflineLogo from './LeaflineLogo'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer  = setTimeout(() => setFading(true),  1200)
    const removeTimer = setTimeout(() => setVisible(false), 1540)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '1.5rem',
        background:     'var(--bg-page)',
        opacity:        fading ? 0 : 1,
        transition:     'opacity 0.34s ease',
        pointerEvents:  fading ? 'none' : 'auto',
      }}
    >
      <LeafPulse size={72} speed="slow" />
      <LeaflineLogo size={30} />
    </div>
  )
}
