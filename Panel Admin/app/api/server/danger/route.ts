import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { ServerManager } from '@/lib/server-manager';

const SERVER_DIR = path.resolve(process.cwd(), '../server');

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action !== 'reset' && action !== 'delete') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const isOnline = await ServerManager.isRunning();
    if (isOnline) {
      return NextResponse.json({ error: 'Server must be offline to perform this action.' }, { status: 400 });
    }

    if (action === 'reset') {
      const foldersToDelete = ['world', 'world_nether', 'world_the_end'];
      for (const folder of foldersToDelete) {
        const fullPath = path.join(SERVER_DIR, folder);
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (fs.existsSync(SERVER_DIR)) {
        fs.rmSync(SERVER_DIR, { recursive: true, force: true });
      }
      return NextResponse.json({ success: true });
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
