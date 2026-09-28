import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const prisma = new PrismaClient()
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'enderlab-super-secret-key-change-me-in-production')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { username }
    })

    const masterPassword = process.env.MASTER_PASSWORD || 'enderlab'

    // Auto-create or repair admin user if logging in with master credentials
    if (username === 'admin' && password === masterPassword) {
      const hashedPassword = await bcrypt.hash(masterPassword, 10)
      if (!user) {
        user = await prisma.user.create({
          data: {
            username: 'admin',
            name: 'Administrator',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'APPROVED'
          }
        })
      } else if (!user.password || !(await bcrypt.compare(password, user.password))) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            status: 'APPROVED'
          }
        })
      }
    }

    if (!user || !user.password) {
      console.log(`[AUTH] Failed login attempt for user: ${username}`)
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.status === 'PENDING') {
      if (user.role === 'ADMIN') {
        // Auto-approve the admin since they were caught by the new DB schema default
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'APPROVED' }
        })
      } else {
        console.log(`[AUTH] Pending approval login attempt for user: ${username}`)
        return NextResponse.json({ success: false, error: 'Account pending admin approval' }, { status: 403 })
      }
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (isValid) {
      console.log(`[AUTH] Successful login for user: ${username} (Role: ${user.role})`)
      const cookieStore = await cookies()
      
      const token = await new SignJWT({ 
        id: user.id, 
        username: user.username, 
        role: user.role,
        minecraftName: user.minecraftName 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(JWT_SECRET)

      cookieStore.set('enderlab_auth', token, {
        httpOnly: true,
        secure: request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://'),
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
      
      return NextResponse.json({ success: true, role: user.role })
    }
    
    console.log(`[AUTH] Failed login attempt for user: ${username}`)
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('[AUTH] Error parsing request:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
