'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'
import LeaflineLogo from '@/app/components/LeaflineLogo'
import ThemeToggle from '@/app/components/ThemeToggle'
import HeaderMenu from '@/app/components/HeaderMenu'

function LanguageToggle({ className = '' }) {
  const { t, i18n } = useTranslation('common')
  const isEn = i18n.language === 'en' || i18n.language?.startsWith('en-')
  return (
    <button
      onClick={() => i18n.changeLanguage(isEn ? 'bn' : 'en')}
      className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${className}`}
      style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent' }}
    >
      {t('switchLang')}
    </button>
  )
}

const PART_SVGS = {
  leaf: (
    <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
      <path d="M32 8C32 8 12 20 12 38C12 49 21 58 32 58C43 58 52 49 52 38C52 20 32 8 32 8Z" fill="#16a34a" opacity="0.25"/>
      <path d="M32 8C32 8 12 20 12 38C12 49 21 58 32 58C43 58 52 49 52 38C52 20 32 8 32 8Z" stroke="#22c55e" strokeWidth="2.5" fill="none"/>
      <path d="M32 14C32 14 18 24 18 38C18 45.7 24.3 52 32 52" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
      <line x1="32" y1="8" x2="32" y2="58" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  root: (
    <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
      <rect x="26" y="6" width="12" height="16" rx="4" fill="#7c3aed" opacity="0.25" stroke="#a78bfa" strokeWidth="2"/>
      <line x1="32" y1="22" x2="32" y2="36" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32 36 Q24 42 18 52" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M32 36 Q40 42 46 52" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="18" cy="52" r="3" fill="#a78bfa" opacity="0.5"/>
      <circle cx="46" cy="52" r="3" fill="#a78bfa" opacity="0.5"/>
    </svg>
  ),
  fruit: (
    <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
      <path d="M32 10 Q30 6 26 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="32" cy="36" r="22" fill="#ea580c" opacity="0.2" stroke="#f97316" strokeWidth="2.5"/>
      <path d="M20 28 Q32 22 44 28" stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  flower: (
    <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
      <ellipse cx="32" cy="16" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8"/>
      <ellipse cx="48" cy="32" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8" transform="rotate(90 48 32)"/>
      <ellipse cx="32" cy="48" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8"/>
      <ellipse cx="16" cy="32" rx="7" ry="12" fill="#be185d" opacity="0.3" stroke="#ec4899" strokeWidth="1.8" transform="rotate(90 16 32)"/>
      <circle cx="32" cy="32" r="8" fill="#fbbf24" opacity="0.9" stroke="#f59e0b" strokeWidth="1.5"/>
    </svg>
  ),
  body: (
    <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
      <rect x="26" y="4" width="12" height="56" rx="6" fill="#78350f" opacity="0.3" stroke="#92400e" strokeWidth="2.5"/>
      <path d="M32 18 Q46 14 52 8" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M32 28 Q18 24 12 16" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
}

const PART_COLORS = {
  leaf: '#22c55e', root: '#a78bfa', fruit: '#f97316', flower: '#ec4899', body: '#d97706',
}


export default function Home() {
  const router = useRouter()
  const { t, i18n } = useTranslation(['home', 'common'])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [authUser, setAuthUser] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { createClient } = await import('@/lib/supabase')
        const { data: { user } } = await createClient().auth.getUser()
        setAuthUser(user)
      } catch {}
    }
    fetchUser()
  }, [])

  async function handleSignOut() {
    const { createClient } = await import('@/lib/supabase')
    await createClient().auth.signOut()
    setDrawerOpen(false)
    router.push('/login')
    router.refresh()
  }

  const userMeta = authUser ? (() => {
    const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
    const contact = authUser.phone || authUser.email || ''
    const region = authUser.user_metadata?.region || ''
    const initial = (name || contact || 'U').charAt(0).toUpperCase()
    return { name, contact, region, initial }
  })() : { name: null, contact: '', region: '', initial: '…' }

  const isEn = i18n.language === 'en' || i18n.language?.startsWith('en-')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {drawerOpen && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Side drawer ── */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: 288,
          background: 'var(--bg-overlay)',
          borderRight: '1px solid var(--border)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
          boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div className="flex items-center">
            <LeaflineLogo size={28} />
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="px-4 pb-5">
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '2px solid var(--brand-ring)' }}>
              {userMeta.initial}
            </div>
            <div className="min-w-0">
              {userMeta.name && <p className="font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{userMeta.name}</p>}
              {userMeta.contact && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{userMeta.contact}</p>}
              {userMeta.region && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>📍 {userMeta.region}</p>}
              {!userMeta.name && !userMeta.contact && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common:user.default')}</p>}
            </div>
          </div>
        </div>

        <div className="mx-4 h-px mb-3" style={{ background: 'var(--border)' }} />

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <a href="/history" onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-bg)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('common:nav.history')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('common:nav.historyDesc')}</p>
            </div>
          </a>

          <a href="/dashboard" onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(96,165,250,0.12)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('common:nav.dashboard')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('common:nav.dashboardDesc')}</p>
            </div>
          </a>
        </nav>

        <div className="px-3 pb-10 pt-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.10)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{t('common:language')}</p>
            <div className="flex items-center gap-1.5">
              <LanguageToggle />
              <ThemeToggle />
            </div>

          </div>

          <button onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = '' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <p className="font-semibold">{t('common:nav.signOut')}</p>
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="min-h-screen flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setDrawerOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-2xl transition-colors flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <line x1="2" y1="5" x2="20" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="flex items-center flex-1">
            <LeaflineLogo size={28} />
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <HeaderMenu />
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-5xl">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--brand)' }}>{t('home:hero.label')}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl" style={{ color: 'var(--text-primary)' }}>
                {t('home:hero.title')}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('home:hero.desc')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {Object.keys(PART_COLORS).map((key) => {
                const color = PART_COLORS[key]
                return (
                  <a key={key} href={`/upload?part=${key}`}
                    className="flex flex-col items-center gap-3 rounded-2xl p-5 text-center cursor-pointer transition-all"
                    style={{ minHeight: 160, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color + '80'
                      e.currentTarget.style.background = color + '0d'
                      e.currentTarget.style.boxShadow = `0 0 20px ${color}18`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'var(--bg-card)'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    <div>{PART_SVGS[key]}</div>
                    <div>
                      <p className="font-bold text-base leading-tight" style={{ color }}>{t(`home:parts.${key}.label`)}</p>
                      {!isEn && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t(`home:parts.${key}.labelEn`)}</p>}
                    </div>
                    <p className="text-xs leading-relaxed hidden sm:block" style={{ color: 'var(--text-muted)' }}>{t(`home:parts.${key}.desc`)}</p>
                    <span className="text-xs font-semibold" style={{ color }}>{t('home:diagnose')}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
