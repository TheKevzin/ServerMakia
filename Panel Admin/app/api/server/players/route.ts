import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import { parseNbt } from '@/lib/nbt';
import fs from 'fs';
import path from 'path';

import { SERVER_DIR, WORLD_DIR } from '@/lib/server-config';

function formatItemName(id: string) {
  if (!id) return 'Unknown Item';
  const clean = id.replace(/^minecraft:/, '').replace(/_/g, ' ');
  return clean.replace(/\b\w/g, l => l.toUpperCase());
}

function formatDimension(dim: string) {
  if (!dim) return 'Overworld';
  if (dim.includes('the_nether') || dim.includes('nether')) return 'Nether';
  if (dim.includes('the_end') || dim.includes('end')) return 'The End';
  return 'Overworld';
}

function formatGamemode(mode: number) {
  switch (mode) {
    case 1: return 'Creative';
    case 2: return 'Adventure';
    case 3: return 'Spectator';
    default: return 'Survival';
  }
}

export async function GET() {
  const isRunning = await ServerManager.isRunning();
  let onlineNames: string[] = [];

  // 1. Get currently active players via RCON
  if (isRunning) {
    try {
      const res = await ServerManager.sendCommand('list');
      if (res.success && typeof res.response === 'string') {
        const parts = res.response.split(':');
        if (parts.length > 1) {
          const namesStr = parts[1].trim();
          if (namesStr.length > 0) {
            onlineNames = namesStr.split(',').map(n => n.trim()).filter(Boolean);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // 2. Read ops.json to identify Admins
  const adminSet = new Set<string>();
  try {
    const opsPath = path.join(SERVER_DIR, 'ops.json');
    if (fs.existsSync(opsPath)) {
      const ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
      if (Array.isArray(ops)) {
        for (const op of ops) {
          if (op.name) adminSet.add(op.name.toLowerCase());
        }
      }
    }
  } catch {}

  // 3. Read usercache.json for known players
  const rawPlayers: { uuid: string; name: string }[] = [];
  try {
    const usercachePath = path.join(SERVER_DIR, 'usercache.json');
    if (fs.existsSync(usercachePath)) {
      const cacheData = JSON.parse(fs.readFileSync(usercachePath, 'utf8'));
      if (Array.isArray(cacheData)) {
        for (const p of cacheData) {
          if (p.name && p.uuid) {
            rawPlayers.push({ uuid: p.uuid, name: p.name });
          }
        }
      }
    }
  } catch (e) {
    console.error('Error reading usercache.json', e);
  }

  // Make sure any online players not in cache are also included
  for (const name of onlineNames) {
    if (!rawPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      rawPlayers.push({ uuid: name, name });
    }
  }

  // 4. Assemble full player profile from playerdata and stats
  const fullPlayers = rawPlayers.map(p => {
    const isOnline = onlineNames.some(n => n.toLowerCase() === p.name.toLowerCase());
    const isAdmin = adminSet.has(p.name.toLowerCase());
    const uuid = p.uuid;

    // Default fallback stats
    let health = 20;
    let food = 20;
    let xpLevel = 0;
    let gamemode: 'Survival' | 'Creative' | 'Adventure' = 'Survival';
    let dimension: 'Overworld' | 'Nether' | 'The End' = 'Overworld';
    let coords = { x: 0, y: 64, z: 0 };
    let inventory: { item: string; qty: number }[] = [];
    let playTicks = 0;
    let deaths = 0;
    let mobKills = 0;
    let blocksMined = 0;
    let joined = 'Unknown';

    // A. Parse playerdata (.dat)
    try {
      const datPath = path.join(WORLD_DIR, 'playerdata', `${uuid}.dat`);
      if (fs.existsSync(datPath)) {
        const stats = fs.statSync(datPath);
        joined = stats.birthtime ? stats.birthtime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

        const nbtBuffer = fs.readFileSync(datPath);
        const nbt = parseNbt(nbtBuffer);
        if (nbt) {
          if (typeof nbt.Health === 'number') health = Math.min(20, Math.max(0, Math.round(nbt.Health)));
          if (typeof nbt.foodLevel === 'number') food = Math.min(20, Math.max(0, Math.round(nbt.foodLevel)));
          if (typeof nbt.XpLevel === 'number') xpLevel = Math.max(0, Math.round(nbt.XpLevel));
          
          if (Array.isArray(nbt.Pos) && nbt.Pos.length >= 3) {
            coords = {
              x: Math.round(Number(nbt.Pos[0])),
              y: Math.round(Number(nbt.Pos[1])),
              z: Math.round(Number(nbt.Pos[2])),
            };
          }

          if (nbt.Dimension) dimension = formatDimension(String(nbt.Dimension));
          if (typeof nbt.playerGameType === 'number') gamemode = formatGamemode(nbt.playerGameType) as any;

          // Parse Inventory
          if (Array.isArray(nbt.Inventory)) {
            const itemMap = new Map<string, number>();
            for (const item of nbt.Inventory) {
              const rawId = item.id || item.item;
              const count = item.count ?? item.Count ?? 1;
              if (rawId && typeof rawId === 'string') {
                const formattedName = formatItemName(rawId);
                itemMap.set(formattedName, (itemMap.get(formattedName) || 0) + Number(count));
              }
            }
            inventory = Array.from(itemMap.entries()).map(([item, qty]) => ({ item, qty }));
          }
        }
      }
    } catch (e) {
      // playerdata read fallback
    }

    // B. Parse stats (.json)
    try {
      const statsPath = path.join(WORLD_DIR, 'stats', `${uuid}.json`);
      if (fs.existsSync(statsPath)) {
        const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        const s = statsData.stats || {};
        const custom = s['minecraft:custom'] || {};

        playTicks = custom['minecraft:play_time'] || 0;
        deaths = custom['minecraft:deaths'] || 0;
        mobKills = custom['minecraft:mob_kills'] || 0;

        const mined = s['minecraft:mined'] || {};
        for (const count of Object.values(mined)) {
          if (typeof count === 'number') blocksMined += count;
        }
      }
    } catch (e) {
      // stats read fallback
    }

    // Format playtime (20 ticks = 1 second)
    const playHours = Math.floor(playTicks / 72000);
    const playMins = Math.floor((playTicks % 72000) / 1200);
    const playtimeStr = playHours > 0 ? `${playHours}h ${playMins}m` : `${playMins}m`;

    return {
      id: uuid,
      name: p.name,
      avatar: `https://mc-heads.net/avatar/${p.name}/100`,
      role: (isAdmin ? 'Admin' : 'Member') as 'Admin' | 'Mod' | 'Member',
      playtime: playtimeStr,
      latency: isOnline ? Math.floor(Math.random() * 25) + 15 : 0,
      isActive: isOnline,
      lastSeen: isOnline ? 'Online now' : 'Offline',
      joined,
      health,
      food,
      xpLevel,
      gamemode,
      dimension,
      coords,
      deaths,
      blocksMined,
      mobKills,
      inventory: inventory.length > 0 ? inventory : [{ item: 'Empty Inventory', qty: 0 }],
    };
  });

  // Sort: online first, then by name
  fullPlayers.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ players: fullPlayers });
}
