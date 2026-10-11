import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'enderlab-super-secret-key-change-me-in-production'
)

interface UserPayload {
  id?: string
  username?: string
  role?: 'ADMIN' | 'MODERATOR' | 'VIEWER' | string
  minecraftName?: string
  [key: string]: unknown
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('enderlab_auth')?.value

  const isLoginPath = pathname === '/login'
  const isRegisterPath = pathname === '/register'
  const isPublicAuthPath = isLoginPath || isRegisterPath

  let decodedUser: UserPayload | null = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      decodedUser = payload as UserPayload
    } catch {
      // Invalid, expired, or tampered JWT token
      decodedUser = null
    }
  }

  const isAuthenticated = Boolean(decodedUser)

  // 1. Unauthenticated users handling
  if (!isAuthenticated && !isPublicAuthPath) {
    // API routes: return JSON 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      if (!pathname.startsWith('/api/auth')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Session invalid or expired' },
          { status: 401 }
        )
      }
      return NextResponse.next()
    }

    // Page routes: redirect to /login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated users attempting to access /login or /register -> redirect to /dashboard
  if (isAuthenticated && isPublicAuthPath) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // 3. Authenticated requests: RBAC and user header propagation
  if (isAuthenticated && decodedUser) {
    const role = (decodedUser.role || 'VIEWER').toUpperCase()
    const requestHeaders = new Headers(request.headers)

    // Propagate trusted user identity to downstream API routes
    if (decodedUser.id) requestHeaders.set('x-user-id', String(decodedUser.id))
    if (decodedUser.role) requestHeaders.set('x-user-role', String(decodedUser.role))
    if (decodedUser.username) requestHeaders.set('x-user-username', String(decodedUser.username))
    if (decodedUser.minecraftName) requestHeaders.set('x-user-mc', String(decodedUser.minecraftName))

    // Page-level RBAC
    if (role === 'VIEWER') {
      const restrictedViewerPages = ['/files', '/users', '/backups', '/settings']
      if (restrictedViewerPages.some(page => pathname === page || pathname.startsWith(`${page}/`))) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashboardUrl)
      }

      // API-level RBAC for VIEWER
      if (
        pathname.startsWith('/api/files') ||
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/backups') ||
        pathname.startsWith('/api/settings')
      ) {
        return NextResponse.json({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
      }

      if (pathname.startsWith('/api/server')) {
        const allowedViewerPaths = ['/api/server/status', '/api/server/players', '/api/server/banned']
        if (!allowedViewerPaths.includes(pathname) || request.method !== 'GET') {
          return NextResponse.json({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
        }
      }
    } else if (role === 'MODERATOR') {
      const restrictedModPages = ['/files', '/users', '/backups']
      if (restrictedModPages.some(page => pathname === page || pathname.startsWith(`${page}/`))) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashboardUrl)
      }

      // API-level RBAC for MODERATOR
      if (
        pathname.startsWith('/api/files') ||
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/backups')
      ) {
        return NextResponse.json({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
      }
    }

    // Add security headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  }

  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

// Next.js 16 native export + backwards compatibility alias
export { proxy as middleware }

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|icon-dark-32x32.png|icon-light-32x32.png|apple-icon.png|map-api).*)',
  ],
}
