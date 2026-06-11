import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function generateOTP(key, nonce) {
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`${key}:${nonce}`)
  return String(parseInt(hmac.digest('hex').slice(0, 8), 16) % 1000000).padStart(6, '0')
}

export async function POST(request) {
  try {
    const { phone, email, token } = await request.json()
    if (!phone || !email || !token) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const raw = cookieStore.get('forgot_pending')?.value
    if (!raw) {
      return NextResponse.json({ error: 'Session expired. Please restart the process.' }, { status: 400 })
    }

    let pending
    try { pending = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 400 })
    }

    if (pending.phone !== phone || pending.email !== email) {
      return NextResponse.json({ error: 'Mismatch. Please restart the process.' }, { status: 400 })
    }
    if (Date.now() > pending.expires) {
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    const expectedOTP = generateOTP(`forgot:${phone}`, pending.nonce)
    if (token !== expectedOTP) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
    }

    // Mark OTP as verified — store a "verified" flag in cookie
    const verifiedData = JSON.stringify({ phone, email, verified: true, expires: Date.now() + 5 * 60 * 1000 })
    const response = NextResponse.json({ success: true })
    response.cookies.set('forgot_verified', verifiedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60,
      path: '/',
    })
    response.cookies.delete('forgot_pending')
    return response
  } catch (err) {
    console.error('forgot-verify-otp error:', err)
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 })
  }
}