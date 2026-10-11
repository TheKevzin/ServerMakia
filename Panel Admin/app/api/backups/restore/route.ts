import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { ServerManager } from '@/lib/server-manager';

const execAsync = util.promisify(exec);
const BACKUPS_DIR = path.resolve(process.cwd(), '../backups');
import { SERVER_DIR } from '@/lib/server-config';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id || !id.endsWith('.tar.gz') || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return NextResponse.json({ error: 'Invalid backup id' }, { status: 400 });
    }

    const fullPath = path.join(BACKUPS_DIR, id);

    // If backup is in cloud only, pull from Google Drive
    if (!fs.existsSync(fullPath)) {
      try {
        await execAsync(`rclone copy "gdrive:Backups Servidor/${id}" "${BACKUPS_DIR}" --drive-chunk-size 64M`);
      } catch (err) {
        console.error('[Restore] Failed to pull from Google Drive:', err);
      }
    }

    if (!fullPath.startsWith(BACKUPS_DIR) || !fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    const isOnline = await ServerManager.isRunning();
    if (isOnline) {
      return NextResponse.json({ error: 'Server must be offline to restore a backup.' }, { status: 400 });
    }

    // Command to extract the tar.gz directly into the SERVER_DIR
    const cmd = `tar -xzf "${fullPath}" -C "${SERVER_DIR}"`;

    return new Promise<Response>((resolve) => {
      exec(cmd, { timeout: 300000 }, (error) => {
        if (error) {
          resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true }));
        }
      });
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
