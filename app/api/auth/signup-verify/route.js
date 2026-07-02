import { createHmac } from 'crypto'
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

function generateOTP(key, nonce) {
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`${key}:${nonce}`)
  return String(parseInt(hmac.digest('hex').slice(0, 8), 16) % 1000000).padStart(6, '0')
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
    const { phone, email, token, name, region, password } = await request.json()
    if (!phone || !email || !token || !name || !region || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const raw = cookieStore.get('signup_pending')?.value
    if (!raw) {
      return NextResponse.json({ error: 'Session expired. Please restart registration.' }, { status: 400 })
    }

    let pending
    try { pending = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Invalid session. Please restart registration.' }, { status: 400 })
    }

    if (pending.phone !== phone || pending.email !== email) {
      return NextResponse.json({ error: 'Data mismatch. Please restart registration.' }, { status: 400 })
    }
    if (Date.now() > pending.expires) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    const expectedOTP = generateOTP(`signup:${phone}`, pending.nonce)
    if (token !== expectedOTP) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }

    const internalEmail = phoneToEmail(phone)
    const admin = getAdminClient()

    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { name, phone, region, contact_email: email },
    })
    if (createError) throw new Error(createError.message)

    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: userData.user.id,
        full_name: name,
        phone,
        email,
        region,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('profile upsert error:', profileError)
      throw new Error('Failed to save profile.')
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: sessionData, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: internalEmail,
      password,
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
    response.cookies.delete('signup_pending')
    setAuthCookies(response, { accessToken, refreshToken })
    persistRefreshToken(sessionData.user.id, refreshToken)
    return response
  } catch (err) {
    console.error('signup-verify error:', err)
    return NextResponse.json({ error: err.message || 'Registration failed.' }, { status: 500 })
  }
}