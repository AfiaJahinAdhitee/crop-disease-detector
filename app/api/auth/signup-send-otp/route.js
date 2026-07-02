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
    const { phone, email, name, region, password } = await request.json()

    if (!phone || !email || !name || !region || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    //send info to database
    

    // Check if phone already registered
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const internalEmail = phoneToEmail(phone)
    const { data: listData } = await admin.auth.admin.listUsers()
    const existing = listData?.users?.find(u => u.email === internalEmail)
    if (existing) {
      return NextResponse.json({ error: 'This phone number is already registered. Please sign in.' }, { status: 409 })
    }

    const nonce = randomBytes(16).toString('hex')
    const otp = generateOTP(`signup:${phone}`, nonce)
    const expires = Date.now() + 10 * 60 * 1000

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 Signup OTP for ${phone}: ${otp}`)
    }

    // Send OTP to the user's own email
    await transporter.sendMail({
      from: `"Leafline" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} — Verify your Leafline account`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a1a0d;border-radius:16px;border:1px solid #1a3a1a;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;color:#4ade80;text-transform:uppercase;margin-bottom:24px;">Leafline</div>
          <h2 style="color:#f0fdf4;font-size:22px;font-weight:600;margin:0 0 8px;">Verify your account</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">Hello <strong style="color:#9ca3af">${name}</strong>, welcome to Leafline.</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 28px;">Use this code to complete your registration. It expires in 10 minutes.</p>
          <div style="background:#0f2a13;border:1px solid #166534;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:0.2em;color:#4ade80;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#374151;font-size:12px;margin:0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    // Store pending signup in cookie — includes the user's real email
    const cookieData = JSON.stringify({ phone, email, name, region, nonce, expires })
    const response = NextResponse.json({ success: true })
    response.cookies.set('signup_pending', cookieData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('signup-send-otp error:', err)
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 })
  }
}