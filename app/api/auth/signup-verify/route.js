import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, '')}@crop2.internal`
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

    // Read and validate pending signup cookie
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

    // Create user in Supabase auth (internal email + password)
    const internalEmail = phoneToEmail(phone)
    const admin = getAdminClient()

    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { name, phone, region, contact_email: email },
    })
    if (createError) throw new Error(createError.message)

    // The on_auth_user_created trigger already inserted an empty profiles row.
    // We update it with the full data. Small delay ensures the trigger has fired.
    await new Promise(r => setTimeout(r, 300))

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: name,
        phone,
        email,
        region,
      })
      .eq('id', userData.user.id)

    if (profileError) {
      console.error('profile update error:', profileError)
      // Fallback: insert in case trigger didn't fire
      await admin.from('profiles').insert({
        id: userData.user.id,
        full_name: name,
        phone,
        email,
        region,
      })
    }

    // Sign in to get a session
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: sessionData, error: sessionError } = await anonClient.auth.signInWithPassword({
      email: internalEmail,
      password,
    })
    if (sessionError) throw new Error(sessionError.message)

    const response = NextResponse.json({ session: sessionData.session })
    response.cookies.delete('signup_pending')
    return response
  } catch (err) {
    console.error('signup-verify error:', err)
    return NextResponse.json({ error: err.message || 'Registration failed.' }, { status: 500 })
  }
}