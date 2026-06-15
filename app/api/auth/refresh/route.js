import { NextResponse } from 'next/server'
import {
  clearAuthCookies,
  consumeRefreshToken,
  getCookieValue,
  persistRefreshToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/lib/auth-tokens'

export async function POST(request) {
  try {
    const refreshToken = getCookieValue(request.headers.get('cookie') || '', 'refresh_token')
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required.' }, { status: 401 })
    }

    const payload = verifyRefreshToken(refreshToken)
    consumeRefreshToken(payload.sub, refreshToken)

    const accessToken = signAccessToken({
      sub: payload.sub,
      email: payload.email,
      phone: payload.phone,
      role: payload.role || 'user',
    })
    const nextRefreshToken = signRefreshToken({
      sub: payload.sub,
      email: payload.email,
      phone: payload.phone,
      role: payload.role || 'user',
    })

    const response = NextResponse.json({ user: { id: payload.sub, email: payload.email, phone: payload.phone } })
    setAuthCookies(response, { accessToken, refreshToken: nextRefreshToken })
    persistRefreshToken(payload.sub, nextRefreshToken)
    return response
  } catch (error) {
    const response = NextResponse.json({ error: 'Refresh token is invalid or expired.' }, { status: 401 })
    clearAuthCookies(response)
    return response
  }
}
