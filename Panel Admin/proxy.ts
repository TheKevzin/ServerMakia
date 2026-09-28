import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'enderlab-super-secret-key-change-me-in-production')

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('enderlab_auth')?.value
  const isLoginPath = request.nextUrl.pathname === '/login'
  const isRegisterPath = request.nextUrl.pathname === '/register'
  const isPublicAuthPath = isLoginPath || isRegisterPath

  let decodedToken = null

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      decodedToken = payload
    } catch (err) {
      console.error('Invalid JWT:', err)
    }
  }

  const isAuth = !!decodedToken

  if (!isAuth && !isPublicAuthPath) {
    if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!request.nextUrl.pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (isAuth && isPublicAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Add user context to headers for API routes
  if (isAuth) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decodedToken.id as string)
    requestHeaders.set('x-user-role', decodedToken.role as string)
    requestHeaders.set('x-user-username', decodedToken.username as string)

    // Basic API RBAC
    const path = request.nextUrl.pathname
    const role = decodedToken.role as string
    
    // Viewer restrictions
    if (role === 'VIEWER') {
      if (path.startsWith('/api/files') || path.startsWith('/api/users') || path.startsWith('/api/backups') || path.startsWith('/api/settings')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (path.startsWith('/api/server')) {
        const allowedViewerPaths = ['/api/server/status', '/api/server/players', '/api/server/banned']
        if (!allowedViewerPaths.includes(path) || request.method !== 'GET') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
    }

    // Moderator restrictions
    if (role === 'MODERATOR') {
      if (path.startsWith('/api/files') || path.startsWith('/api/users') || path.startsWith('/api/backups')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|icon-dark-32x32.png|icon-light-32x32.png|apple-icon.png|map-api).*)',
  ],
}
