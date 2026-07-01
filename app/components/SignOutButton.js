'use client'

import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '@/app/i18n/config'

export default function SignOutButton({ className = '' }) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        borderRadius: '8px',
        padding: '0.4rem 0.9rem',
        fontSize: '0.82rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
    >
      {loading ? t('loading') : t('nav.signOut')}
    </button>
  )
}
