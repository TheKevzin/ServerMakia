import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = ServerManager.getLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
