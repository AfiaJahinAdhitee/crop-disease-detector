import { cookies } from 'next/headers'
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth-tokens'

// Resolves userId from request cookies using a two-step fallback:
// 1. Custom JWT access_token (15-min TTL, fast path)
// 2. Custom JWT refresh_token (30-day TTL, used when access_token is expired)
//
// The refresh_token fallback is safe here: it is httpOnly (no XSS exposure),
// and we only read the sub claim after verifying the JWT signature — no rotation
// occurs. Middleware handles issuing a fresh access_token on the response side.
export async function getUserId() {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get('access_token')?.value
  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken)
      if (payload?.sub) return String(payload.sub)
    } catch {}
  }

  const refreshToken = cookieStore.get('refresh_token')?.value
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken)
      if (payload?.sub) return String(payload.sub)
    } catch {}
  }

  return null
}
