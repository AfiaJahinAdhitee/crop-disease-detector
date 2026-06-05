import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function generateOTP(email, nonce) {
  const secret = process.env.OTP_SECRET
  const hmac = createHmac('sha256', secret)
  hmac.update(`${email}:${nonce}`)
  const hash = hmac.digest('hex')
  const num = parseInt(hash.slice(0, 8), 16)
  return String(num % 1000000).padStart(6, '0')
}

function getStablePassword(email) {
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`stable-password:${email}`)
  return hmac.digest('hex')
}

export async function POST(request) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Read nonce from cookie
    const cookieStore = await cookies()
    const nonceCookie = cookieStore.get('otp_nonce')?.value

    if (!nonceCookie) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    const [cookieEmail, nonce, expires] = nonceCookie.split(':')

    // Validate cookie belongs to this email and hasn't expired
    if (cookieEmail !== normalizedEmail) {
      return NextResponse.json({ error: 'Email mismatch. Please request a new code.' }, { status: 400 })
    }
    if (Date.now() > parseInt(expires)) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    // Verify the OTP against the nonce
    const expectedOTP = generateOTP(normalizedEmail, nonce)
    if (token !== expectedOTP) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }

    // OTP valid — create or sign in user via admin
    const admin = getAdminClient()
    const stablePassword = getStablePassword(normalizedEmail)

    const { data: listData } = await admin.auth.admin.listUsers()
    const existingUser = listData?.users?.find(u => u.email === normalizedEmail)

    if (!existingUser) {
      const { error: createError } = await admin.auth.admin.createUser({
        email: normalizedEmail,
        password: stablePassword,
        email_confirm: true,
      })
      if (createError) throw new Error(createError.message)
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: sessionData, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: stablePassword,
    })
    if (sessionError) throw new Error(sessionError.message)

    // Clear the nonce cookie after successful use (one-time use)
    const response = NextResponse.json({ session: sessionData.session })
    response.cookies.delete('otp_nonce')
    return response

  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: err.message || 'Verification failed.' }, { status: 500 })
  }
}