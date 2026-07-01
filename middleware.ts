import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  signAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth-tokens'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  let user: { id: string; email?: string; phone?: string } | null = null

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken)
      if (typeof payload === 'object' && payload !== null && typeof payload.sub === 'string') {
        user = {
          id: payload.sub,
          email: typeof payload.email === 'string' ? payload.email : undefined,
          phone: typeof payload.phone === 'string' ? payload.phone : undefined,
        }
      }
    } catch {
      user = null
    }
  }

  // Silent refresh: access_token missing/expired but refresh_token still valid →
  // issue a new access_token so subsequent requests work without hitting this path.
  if (!user) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value
    if (refreshToken) {
      try {
        const rp = verifyRefreshToken(refreshToken)
        if (typeof rp === 'object' && rp !== null && typeof rp.sub === 'string') {
          const newAccessToken = signAccessToken({
            sub: rp.sub,
            email: rp.email,
            phone: rp.phone,
            role: rp.role || 'user',
          })
          user = {
            id: rp.sub,
            email: typeof rp.email === 'string' ? rp.email : undefined,
            phone: typeof rp.phone === 'string' ? rp.phone : undefined,
          }
          supabaseResponse.cookies.set(ACCESS_COOKIE_NAME, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
          })
        }
      } catch {}
    }
  }

  if (!user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    user = supabaseUser
  }

  const protectedRoutes = ['/', '/dashboard', '/upload', '/history']
  const isProtected = protectedRoutes.some((route) => pathname === route || (route !== '/' && pathname.startsWith(route)))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/login' && user) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/upload/:path*', '/history/:path*', '/login'],
}