import { createClient } from './supabase'

// Send OTP via Resend (our own API route)
export async function sendOTP(email: string): Promise<void> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to send code.')
}

// Verify OTP via our API route — returns session
export async function verifyOTP(email: string, token: string): Promise<void> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Invalid code.')

  // Set the session on the client-side Supabase instance
  if (data.session) {
    const supabase = createClient()
    await supabase.auth.setSession(data.session)
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Get current user
export async function getCurrentUser() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

// Get current session
export async function getSession() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}