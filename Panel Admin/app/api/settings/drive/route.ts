import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'enderlab-super-secret-key-change-me-in-production')
const CONFIG_PATH = path.resolve(process.cwd(), 'drive-config.json')

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('enderlab_auth')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
      return NextResponse.json({
        enabled: true,
        folderId: config.folderId,
        serviceAccount: config.serviceAccount ? '***HIDDEN***' : null
      })
    }
    
    return NextResponse.json({ enabled: false })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('enderlab_auth')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    if (body.action === 'disable') {
      if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH)
      return NextResponse.json({ success: true, enabled: false })
    }

    const { folderId, serviceAccount } = body
    if (!folderId || !serviceAccount) {
      return NextResponse.json({ error: 'Missing folderId or serviceAccount' }, { status: 400 })
    }

    let finalServiceAccount = serviceAccount;
    if (serviceAccount === '***HIDDEN***') {
      if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        finalServiceAccount = config.serviceAccount;
      }
    }

    // Try parsing the service account to validate it
    try {
      JSON.parse(finalServiceAccount)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON for Service Account' }, { status: 400 })
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ folderId, serviceAccount: finalServiceAccount }, null, 2))
    return NextResponse.json({ success: true, enabled: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
