import crypto from 'crypto'
import jwt from 'jsonwebtoken'

export const ACCESS_COOKIE_NAME = 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'

const refreshTokenStore = globalThis.__refreshTokenStore ??= new Map()

function getSecret(secretName) {
  const configured = process.env[secretName]
  if (configured && configured.trim()) return configured

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${secretName} is required in production.`)
  }

  return process.env.JWT_SECRET || process.env.OTP_SECRET || 'development-only-secret'
}

function getAccessTokenTtl() {
  return process.env.ACCESS_TOKEN_TTL || '15m'
}

function getRefreshTokenTtl() {
  return process.env.REFRESH_TOKEN_TTL || '30d'
}

export function signAccessToken(payload) {
  return jwt.sign(
    { ...payload, tokenType: 'access' },
    getSecret('JWT_SECRET'),
    { expiresIn: getAccessTokenTtl() }
  )
}

export function signRefreshToken(payload) {
  return jwt.sign(
    { ...payload, tokenType: 'refresh' },
    getSecret('JWT_REFRESH_SECRET'),
    { expiresIn: getRefreshTokenTtl() }
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getSecret('JWT_SECRET'))
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET'))
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function createAuthPayload(user) {
  return {
    sub: user.id || user.email,
    email: user.email,
    phone: user.phone,
    role: user.role || 'user',
  }
}

export function persistRefreshToken(userId, token) {
  const payload = verifyRefreshToken(token)
  refreshTokenStore.set(String(userId), {
    currentHash: hashToken(token),
    currentJti: payload.jti,
    revoked: false,
    updatedAt: Date.now(),
  })
  return payload
}

export function consumeRefreshToken(userId, token) {
  const payload = verifyRefreshToken(token)
  const stored = refreshTokenStore.get(String(userId))
  const tokenHash = hashToken(token)

  if (!stored || stored.revoked || stored.currentHash !== tokenHash || stored.currentJti !== payload.jti) {
    if (stored && !stored.revoked) {
      refreshTokenStore.set(String(userId), {
        ...stored,
        revoked: true,
        invalidatedAt: Date.now(),
      })
    }
    throw new Error('Refresh token revoked or reused.')
  }

  return payload
}

export function rotateRefreshToken(userId, oldToken, newToken) {
  const payload = consumeRefreshToken(userId, oldToken)
  const newPayload = persistRefreshToken(userId, newToken)
  return { payload, newPayload }
}

export function revokeRefreshToken(userId) {
  const stored = refreshTokenStore.get(String(userId))
  if (stored) {
    refreshTokenStore.set(String(userId), {
      ...stored,
      revoked: true,
      invalidatedAt: Date.now(),
    })
  }
}

export function setAuthCookies(response, { accessToken, refreshToken }) {
  const isProduction = process.env.NODE_ENV === 'production'
  response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
}

export function clearAuthCookies(response) {
  const isProduction = process.env.NODE_ENV === 'production'
  response.cookies.set(ACCESS_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function getCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';').map((part) => part.trim())
  const match = parts.find((part) => part.startsWith(`${cookieName}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(cookieName.length + 1))
}
