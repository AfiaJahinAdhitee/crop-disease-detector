import { createClient } from './supabase'

export async function sendOTP(email: string): Promise<void> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to send code.')
}

export async function verifyOTP(email: string, token: string): Promise<void> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Invalid code.')

  if (data.session) {
    const supabase = createClient()
    await supabase.auth.setSession(data.session)
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Ignore logout failures and still clear Supabase state.
  }

  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
    if (!res.ok) {
      return null
    }
    const data = await res.json()
    return data.user ?? null
  } catch {
    return null
  }
}

export async function getSession() {
  const user = await getCurrentUser()
  return user ? { user } : null
}