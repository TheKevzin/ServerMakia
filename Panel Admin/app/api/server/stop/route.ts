import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';

export async function POST() {
  const result = await ServerManager.stop();
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 400 });
  }
}
