import { createHmac, randomBytes } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, '')}@crop2.internal`
}

function generateOTP(key, nonce) {
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`${key}:${nonce}`)
  return String(parseInt(hmac.digest('hex').slice(0, 8), 16) % 1000000).padStart(6, '0')
}

export async function POST(request) {
  try {
    const { phone, email } = await request.json()
    if (!phone || !email) {
      return NextResponse.json({ error: 'Phone number and email are required.' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up the user's profile to verify phone + email match
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, phone')
      .eq('phone', phone)
      .single()

    // Always respond with success for security (don't reveal if phone exists)
    if (profileError || !profile) {
      return NextResponse.json({ success: true })
    }

    // Verify the email matches what's stored in the database
    if (profile.email?.toLowerCase() !== email.toLowerCase()) {
      // Still return success — don't reveal the mismatch to potential attackers
      return NextResponse.json({ success: true })
    }

    const nonce = randomBytes(16).toString('hex')
    const otp = generateOTP(`forgot:${phone}`, nonce)
    const expires = Date.now() + 10 * 60 * 1000

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Forgot OTP for ${phone}: ${otp}`)
    }

    // Send OTP to the verified email address
    await transporter.sendMail({
      from: `"CROP2" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} — Reset your CROP2 password`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a1a0d;border-radius:16px;border:1px solid #1a3a1a;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;color:#4ade80;text-transform:uppercase;margin-bottom:24px;">CROP2</div>
          <h2 style="color:#f0fdf4;font-size:22px;font-weight:600;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 28px;">Use this code to reset your password. It expires in 10 minutes.</p>
          <div style="background:#0f2a13;border:1px solid #166534;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:0.2em;color:#4ade80;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#374151;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    const cookieData = JSON.stringify({ phone, email, nonce, expires })
    const response = NextResponse.json({ success: true })
    response.cookies.set('forgot_pending', cookieData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('forgot-send-otp error:', err)
    return NextResponse.json({ error: 'Failed to send reset code.' }, { status: 500 })
  }
}