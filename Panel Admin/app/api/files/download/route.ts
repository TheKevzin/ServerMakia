import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SERVER_DIR = path.resolve(process.cwd(), '../server');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing file id' }, { status: 400 });
    }

    const fullPath = path.join(SERVER_DIR, id);

    if (!fullPath.startsWith(SERVER_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return NextResponse.json({ error: 'Cannot download a directory directly' }, { status: 400 });
    }

    // Using a stream directly would be better for huge files, but for typical MC files this is okay
    const fileBuffer = fs.readFileSync(fullPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${path.basename(fullPath)}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
