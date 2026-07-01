'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'

// Three-dot (⋮) menu: language toggle + sign out.
// ThemeToggle is kept as a separate visible button in the header bar.
export default function HeaderMenu() {
  const [open, setOpen]     = useState(false)
  const { t, i18n }         = useTranslation('common')
  const router              = useRouter()
  const menuRef             = useRef(null)
  const isEn = i18n.language === 'en' || i18n.language?.startsWith('en-')

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  async function handleSignOut() {
    setOpen(false)
    try {
      const { createClient } = await import('@/lib/supabase')
      await createClient().auth.signOut()
    } catch {}
    router.push('/login')
    router.refresh()
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>

      {/* ⋮ trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="More options"
        aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
        style={{
          border:     '1px solid var(--border)',
          color:      'var(--text-secondary)',
          background: open ? 'var(--bg-hover)' : 'transparent',
        }}
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2"  r="1.6"/>
          <circle cx="2" cy="8"  r="1.6"/>
          <circle cx="2" cy="14" r="1.6"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position:     'absolute',
            top:          'calc(100% + 8px)',
            right:        0,
            zIndex:       200,
            minWidth:     176,
            background:   'var(--bg-overlay)',
            border:       '1px solid var(--border)',
            borderRadius: 16,
            boxShadow:    '0 8px 24px rgba(0,0,0,0.18)',
            overflow:     'hidden',
          }}
        >
          {/* Language */}
          <button
            role="menuitem"
            onClick={() => { i18n.changeLanguage(isEn ? 'bn' : 'en'); setOpen(false) }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors text-left"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t('switchLang')}</span>
          </button>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Sign out */}
          <button
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors text-left"
            style={{ color: '#f87171' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{ fontWeight: 500 }}>{t('nav.signOut')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
