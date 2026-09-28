import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        status: true,
        minecraftName: true,
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { username, password, name, newRole } = await request.json()

    if (!username || !password || !newRole) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: newRole,
      },
      select: { id: true, username: true, role: true }
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status, role: newRole } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const updateData: any = {}
    if (status) updateData.status = status
    if (newRole) updateData.role = newRole

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Auto-whitelist if approved and has minecraftName
    if (status === 'APPROVED' && user.minecraftName) {
      // Import dynamically to avoid circular dependencies or initial load issues
      const { ServerManager } = await import('@/lib/server-manager')
      await ServerManager.sendCommand(`whitelist add ${user.minecraftName}`)
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
