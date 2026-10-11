import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const BACKUPS_DIR = path.resolve(process.cwd(), '../backups');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.endsWith('.tar.gz') || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return NextResponse.json({ error: 'Invalid backup id' }, { status: 400 });
    }

    const fullPath = path.join(BACKUPS_DIR, id);

    // If file is not present locally, pull it from Google Drive
    if (!fs.existsSync(fullPath)) {
      try {
        await execAsync(`rclone copy "gdrive:Backups Servidor/${id}" "${BACKUPS_DIR}" --drive-chunk-size 64M`);
      } catch (err) {
        console.error('[Download] Failed to pull from Google Drive:', err);
      }
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    const fileStream = fs.createReadStream(fullPath);

    // Convert node readstream to web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${id}"`,
        'Content-Type': 'application/gzip',
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
