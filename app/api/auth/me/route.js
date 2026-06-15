import { NextResponse } from 'next/server'
import { getCookieValue, verifyAccessToken } from '@/lib/auth-tokens'

export async function GET(request) {
  try {
    const accessToken = getCookieValue(request.headers.get('cookie') || '', 'access_token')
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const payload = verifyAccessToken(accessToken)
    return NextResponse.json({ user: { id: payload.sub, email: payload.email, phone: payload.phone } })
  } catch {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  }
}
