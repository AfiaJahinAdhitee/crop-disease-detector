import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  createAuthPayload,
  persistRefreshToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from '@/lib/auth-tokens'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function phoneToEmail(phone) {
  return `${String(phone).replace(/\D/g, '')}@crop2.internal`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const phone = String(body.phone || '').trim()
    const password = String(body.password || '').trim()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 })
    }

    const email = phoneToEmail(phone)

    const admin = getAdminClient()
    const { data: listData } = await admin.auth.admin.listUsers()
    const user = listData?.users?.find((entry) => entry.email === email)
    if (!user) {
      return NextResponse.json({ error: 'No account found with this phone number.' }, { status: 404 })
    }

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    const authPayload = createAuthPayload({
      id: data.user.id,
      email: data.user.email,
      phone,
    })
    const accessToken = signAccessToken(authPayload)
    const refreshToken = signRefreshToken(authPayload)

    const response = NextResponse.json({
      session: data.session,
      user: { id: data.user.id, email: data.user.email, phone },
      authenticated: true,
    })

    setAuthCookies(response, { accessToken, refreshToken })
    persistRefreshToken(data.user.id, refreshToken)
    return response
  } catch (err) {
    console.error('signin error:', err)
    return NextResponse.json({ error: 'Sign in failed.' }, { status: 500 })
  }
}