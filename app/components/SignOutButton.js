'use client'

import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignOutButton({ className = '' }) {
  const router = useRouter()
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
        border: '1px solid rgba(74,222,128,0.2)',
        color: '#6b7280',
        borderRadius: '8px',
        padding: '0.4rem 0.9rem',
        fontSize: '0.82rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  )
}