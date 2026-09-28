import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const SERVER_DIR = path.resolve(process.cwd(), '../server');
const BANNED_FILE = path.join(SERVER_DIR, 'banned-players.json');

export async function GET() {
  try {
    if (!fs.existsSync(BANNED_FILE)) {
      return NextResponse.json({ banned: [] });
    }

    const content = fs.readFileSync(BANNED_FILE, 'utf8');
    const banned = JSON.parse(content);

    return NextResponse.json({
      banned: banned.map((b: any) => ({
        uuid: b.uuid || '',
        name: b.name,
        reason: b.reason || 'No reason given',
        created: b.created || 'Unknown',
        source: b.source || 'Console',
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
