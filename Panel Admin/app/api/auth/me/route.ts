import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'enderlab-super-secret-key-change-me-in-production')

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('enderlab_auth')?.value
    if (!token) return NextResponse.json({ authenticated: false })

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return NextResponse.json({ 
      authenticated: true, 
      role: payload.role, 
      username: payload.username,
      minecraftName: payload.minecraftName
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}
