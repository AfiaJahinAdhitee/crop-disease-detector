import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_COOKIE_NAME, verifyAccessToken } from '@/lib/auth-tokens'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  let user: { id: string; email?: string; phone?: string } | null = null

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken)
      user = { id: payload.sub, email: payload.email, phone: payload.phone }
    } catch {
      user = null
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

  const protectedRoutes = ['/', '/dashboard', '/upload']
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
  matcher: ['/', '/dashboard/:path*', '/upload/:path*', '/login'],
}