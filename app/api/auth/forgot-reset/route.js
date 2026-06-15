import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  createAuthPayload,
  persistRefreshToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth-tokens'

function phoneToEmail(phone) {
  return `${String(phone).replace(/\D/g, '')}@crop2.internal`
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request) {
  try {
    const { phone, email, newPassword } = await request.json()
    if (!phone || !email || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const raw = cookieStore.get('forgot_verified')?.value
    if (!raw) {
      return NextResponse.json({ error: 'Not verified. Please complete OTP verification first.' }, { status: 401 })
    }

    let verified
    try { verified = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 400 })
    }

    if (!verified.verified || verified.phone !== phone || verified.email !== email) {
      return NextResponse.json({ error: 'Verification mismatch.' }, { status: 401 })
    }
    if (Date.now() > verified.expires) {
      return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 401 })
    }

    const admin = getAdminClient()
    const internalEmail = phoneToEmail(phone)
    const { data: listData } = await admin.auth.admin.listUsers()
    const user = listData?.users?.find((entry) => entry.email === internalEmail)
    if (!user) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })
    if (updateError) throw new Error(updateError.message)

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: sessionData, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: internalEmail,
      password: newPassword,
    })
    if (sessionError) throw new Error(sessionError.message)

    const authPayload = createAuthPayload({
      id: sessionData.user.id,
      email: sessionData.user.email,
      phone,
    })
    const accessToken = signAccessToken(authPayload)
    const refreshToken = signRefreshToken(authPayload)

    const response = NextResponse.json({ session: sessionData.session, user: authPayload, authenticated: true })
    response.cookies.delete('forgot_verified')
    setAuthCookies(response, { accessToken, refreshToken })
    persistRefreshToken(sessionData.user.id, refreshToken)
    return response
  } catch (err) {
    console.error('forgot-reset error:', err)
    return NextResponse.json({ error: err.message || 'Password reset failed.' }, { status: 500 })
  }
}