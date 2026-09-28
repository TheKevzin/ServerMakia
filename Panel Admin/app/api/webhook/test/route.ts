import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 });
    }

    const embed = {
      title: '✅ Webhook Test Successful!',
      description: 'Tu panel ServerMakia está conectado exitosamente con este canal de Discord.',
      color: 6424319, // #6206bf, primary color
      footer: {
        text: 'ServerMakia — Fabric 1.21.11'
      },
      timestamp: new Date().toISOString()
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'ServerMakia Bot',
        embeds: [embed]
      })
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send message to Discord' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
