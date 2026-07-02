'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import LeafPulse from './LeafPulse'

export default function PageTransitionOverlay() {
  const pathname   = usePathname()
  const [visible,  setVisible]  = useState(false)
  const [opacity,  setOpacity]  = useState(0)
  const prevPath   = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    setVisible(true)
    // next frame: fade in
    const raf     = requestAnimationFrame(() => setOpacity(1))
    // start fade out before removal
    const fadeOut = setTimeout(() => setOpacity(0), 260)
    const remove  = setTimeout(() => setVisible(false), 420)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fadeOut)
      clearTimeout(remove)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9998,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'var(--bg-page)',
        opacity,
        transition:     'opacity 0.16s ease',
        pointerEvents:  'none',
      }}
    >
      <LeafPulse size={48} speed="fast" />
    </div>
  )
}
