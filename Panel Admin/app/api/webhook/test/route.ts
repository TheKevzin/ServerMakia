import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 });
    }

    const embed = {
      title: '✅ Webhook Test Successful!',
      description: 'Your EnderLab panel is successfully connected to this Discord channel.',
      color: 6424319, // #6206bf, primary color
      footer: {
        text: 'EnderLab Server Panel'
      },
      timestamp: new Date().toISOString()
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'EnderLab',
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
