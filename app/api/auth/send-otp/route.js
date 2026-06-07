// Enter your email → click send OTP
// Look at your VS Code terminal — the OTP will print there
// Enter that code to log in


import { createHmac, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { email } = await request.json()

  const nonce = randomBytes(16).toString('hex')
  const expires = Date.now() + 10 * 60 * 1000
  const cookieValue = `${email.toLowerCase()}:${nonce}:${expires}`

  // Generate OTP but just log it instead of emailing
  const hmac = createHmac('sha256', process.env.OTP_SECRET)
  hmac.update(`${email.toLowerCase()}:${nonce}`)
  const hash = hmac.digest('hex')
  const otp = String(parseInt(hash.slice(0, 8), 16) % 1000000).padStart(6, '0')

  console.log(`🔑 OTP for ${email}: ${otp}`) // shows in terminal

  const response = NextResponse.json({ success: true })
  response.cookies.set('otp_nonce', cookieValue, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 10 * 60,
    path: '/',
  })

  return response
}
// import { Resend } from 'resend'
// import { createHmac, randomBytes } from 'crypto'
// import { NextResponse } from 'next/server'

// const resend = new Resend(process.env.RESEND_API_KEY)

// function generateOTP(email, nonce) {
//   const secret = process.env.OTP_SECRET
//   const hmac = createHmac('sha256', secret)
//   hmac.update(`${email}:${nonce}`)
//   const hash = hmac.digest('hex')
//   const num = parseInt(hash.slice(0, 8), 16)
//   return String(num % 1000000).padStart(6, '0')
// }

// export async function POST(request) {
//   try {
//     const { email } = await request.json()

//     if (!email || !email.includes('@')) {
//       return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
//     }

//     // Random nonce — different every request = different OTP every time
//     const nonce = randomBytes(16).toString('hex')
//     const otp = generateOTP(email.toLowerCase(), nonce)

//     // Store nonce + email + expiry in a cookie so verify-otp can check it
//     const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
//     const cookieValue = `${email.toLowerCase()}:${nonce}:${expires}`

//     await resend.emails.send({
//       from: 'CROP2 <onboarding@resend.dev>',
//       to: email,
//       subject: `${otp} is your CROP2 sign-in code`,
//       html: `
//         <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a1a0d; border-radius: 16px; border: 1px solid #1a3a1a;">
//           <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #4ade80; text-transform: uppercase; margin-bottom: 24px;">CROP2</div>
//           <h2 style="color: #f0fdf4; font-size: 22px; font-weight: 600; margin: 0 0 8px;">Your sign-in code</h2>
//           <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px;">Use this code to sign in to your CROP2 account. It expires in 10 minutes.</p>
//           <div style="background: #0f2a13; border: 1px solid #166534; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
//             <span style="font-size: 36px; font-weight: 700; letter-spacing: 0.2em; color: #4ade80; font-family: monospace;">${otp}</span>
//           </div>
//           <p style="color: #374151; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
//         </div>
//       `,
//     })

//     const response = NextResponse.json({ success: true })

//     // Set nonce cookie — httpOnly so JS can't touch it, expires in 10 min
//     response.cookies.set('otp_nonce', cookieValue, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       maxAge: 10 * 60, // 10 minutes in seconds
//       path: '/',
//     })

//     return response
//   } catch (err) {
//     console.error('send-otp error:', err)
//     return NextResponse.json({ error: 'Failed to send email. Try again.' }, { status: 500 })
//   }
// }