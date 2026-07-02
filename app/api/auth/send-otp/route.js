import { createHmac, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Gmail SMTP transporter — uses your own Gmail account, no 3rd party service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,         // e.g. yourname@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (16-char), NOT your login password
  },
})

function generateOTP(email, nonce) {
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`${email}:${nonce}`)
  const hash = hmac.digest('hex')
  return String(parseInt(hash.slice(0, 8), 16) % 1000000).padStart(6, '0')
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const nonce = randomBytes(16).toString('hex')
    const otp = generateOTP(email.toLowerCase(), nonce)
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
    const cookieValue = `${email.toLowerCase()}:${nonce}:${expires}`

    // In development: print OTP to terminal so devs can test without checking inbox
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔑 OTP for ${email}: ${otp}`)
    }

    // Send OTP via Gmail SMTP
    await transporter.sendMail({
      from: `"Leafline" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${otp} is your Leafline sign-in code`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a1a0d; border-radius: 16px; border: 1px solid #1a3a1a;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #4ade80; text-transform: uppercase; margin-bottom: 24px;">Leafline</div>
          <h2 style="color: #f0fdf4; font-size: 22px; font-weight: 600; margin: 0 0 8px;">Your sign-in code</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px;">Use this code to sign in to your Leafline account. It expires in 10 minutes.</p>
          <div style="background: #0f2a13; border: 1px solid #166534; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 0.2em; color: #4ade80; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #374151; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set('otp_nonce', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Failed to send email. Try again.' }, { status: 500 })
  }
}