import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SERVER_DIR = path.resolve(process.cwd(), '../server');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const currentPath = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const targetDir = path.join(SERVER_DIR, currentPath || '');
    const fullPath = path.join(targetDir, file.name);

    if (!fullPath.startsWith(SERVER_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(fullPath, buffer);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
