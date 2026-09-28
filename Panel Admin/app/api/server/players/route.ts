import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const isRunning = await ServerManager.isRunning();
  let playersList: any[] = [];
  let onlineNames: string[] = [];

  // Read usercache.json for historical players
  try {
    const serverPath = path.resolve(process.cwd(), '../server');
    const usercachePath = path.join(serverPath, 'usercache.json');
    if (fs.existsSync(usercachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(usercachePath, 'utf8'));
      if (Array.isArray(cacheData)) {
        playersList = cacheData.map((p, i) => ({
          id: p.uuid || `${i}-${p.name}`,
          name: p.name,
          avatar: `https://mc-heads.net/avatar/${p.name}/100`,
          role: 'Member',
          playtime: 'Offline',
          latency: 0,
          isActive: false
        }));
      }
    }
  } catch (e) {
    console.error('Error reading usercache.json', e);
  }

  // Get active players via RCON
  if (isRunning) {
    try {
      const res = await ServerManager.sendCommand('list');
      if (res.success && typeof res.response === 'string') {
        const parts = res.response.split(':');
        if (parts.length > 1) {
          const namesStr = parts[1].trim();
          if (namesStr.length > 0) {
            onlineNames = namesStr.split(',').map(n => n.trim());
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // Merge active status
  for (const onlineName of onlineNames) {
    const existing = playersList.find(p => p.name.toLowerCase() === onlineName.toLowerCase());
    if (existing) {
      existing.isActive = true;
      existing.playtime = 'Active now';
      existing.latency = Math.floor(Math.random() * 50) + 10;
    } else {
      playersList.push({
        id: `active-${onlineName}`,
        name: onlineName,
        avatar: `https://mc-heads.net/avatar/${onlineName}/100`,
        role: 'Member',
        playtime: 'Active now',
        latency: Math.floor(Math.random() * 50) + 10,
        isActive: true
      });
    }
  }

  // Deduplicate by name (case-insensitive), keeping the active version if it exists
  const seen = new Map<string, any>();
  for (const p of playersList) {
    const key = p.name.toLowerCase();
    const existing = seen.get(key);
    if (!existing || (p.isActive && !existing.isActive)) {
      seen.set(key, p);
    }
  }
  playersList = Array.from(seen.values());

  // Sort: Active first, then offline
  playersList.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ players: playersList });
}
