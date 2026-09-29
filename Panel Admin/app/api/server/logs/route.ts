import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = ServerManager.getLogs();
    const isRunning = await ServerManager.isRunning();
    return NextResponse.json({ logs, isRunning });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
