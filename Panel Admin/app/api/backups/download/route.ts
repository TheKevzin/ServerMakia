import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const BACKUPS_DIR = path.resolve(process.cwd(), '../backups');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !id.endsWith('.tar.gz')) {
      return NextResponse.json({ error: 'Invalid backup id' }, { status: 400 });
    }

    const fullPath = path.join(BACKUPS_DIR, id);

    if (!fullPath.startsWith(BACKUPS_DIR) || !fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    const fileBuffer = fs.readFileSync(fullPath);

    return new NextResponse(fileBuffer, {
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
