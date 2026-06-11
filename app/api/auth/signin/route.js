import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Derive a stable email from phone (since Supabase auth uses email)
function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, '')}@crop2.internal`
}

export async function POST(request) {
  try {
    const { phone, password } = await request.json()
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required.' }, { status: 400 })
    }

    const email = phoneToEmail(phone)

    // Check user exists
    const admin = getAdminClient()
    const { data: listData } = await admin.auth.admin.listUsers()
    const user = listData?.users?.find(u => u.email === email)
    if (!user) {
      return NextResponse.json({ error: 'No account found with this phone number.' }, { status: 404 })
    }

    // Sign in with email + password
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    return NextResponse.json({ session: data.session })
  } catch (err) {
    console.error('signin error:', err)
    return NextResponse.json({ error: 'Sign in failed.' }, { status: 500 })
  }
}