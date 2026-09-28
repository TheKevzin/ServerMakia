import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json({ success: false, message: 'No command provided' }, { status: 400 });
    }

    const result = await ServerManager.sendCommand(command);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
