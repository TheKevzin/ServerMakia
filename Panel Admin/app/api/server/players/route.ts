import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import { parseNbt } from '@/lib/nbt';
import { translateMinecraft, getItemTextureUrl, parseNbtItem } from '@/lib/minecraft-names';
import fs from 'fs';
import path from 'path';

import { SERVER_DIR, WORLD_DIR } from '@/lib/server-config';

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
      // RCON unavailable
    }
  }

  // 2. Load cached players from usercache.json
  const usercachePath = path.join(SERVER_DIR, 'usercache.json');
  let cachedPlayers: { name: string; uuid: string }[] = [];

  if (fs.existsSync(usercachePath)) {
    try {
      const data = fs.readFileSync(usercachePath, 'utf8');
      cachedPlayers = JSON.parse(data);
    } catch (e) {
      console.error('Error reading usercache.json', e);
    }
  }

  // 3. Load ops.json to determine admin status
  const opsPath = path.join(SERVER_DIR, 'ops.json');
  let ops: { uuid: string; name: string; level: number }[] = [];
  if (fs.existsSync(opsPath)) {
    try {
      ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
    } catch (e) {
      console.error('Error reading ops.json', e);
    }
  }

  // Deduplicate cachedPlayers by UUID
  const uniquePlayers = Array.from(
    new Map(cachedPlayers.map(p => [p.uuid, p])).values()
  );

  // 4. Enrich each player with playerdata (.dat) and stats (.json)
  const fullPlayers = uniquePlayers.map(p => {
    const uuid = p.uuid;
    const isOnline = onlineNames.some(on => on.toLowerCase() === p.name.toLowerCase());
    const isAdmin = ops.some(op => op.uuid === uuid || op.name.toLowerCase() === p.name.toLowerCase());

    let health = 20;
    let food = 20;
    let xpLevel = 0;
    let gamemode: 'Survival' | 'Creative' | 'Adventure' = 'Survival';
    let dimension: 'Overworld' | 'Nether' | 'The End' = 'Overworld';
    let coords = { x: 0, y: 64, z: 0 };
    let inventory: any[] = [];
    let equipment: Record<string, any> = {};
    let playTicks = 0;
    let deaths = 0;
    let mobKills = 0;
    let blocksMined = 0;
    let joined = 'Desconocido';

    // A. Parse playerdata (.dat)
    try {
      const datPath = path.join(WORLD_DIR, 'playerdata', `${uuid}.dat`);
      if (fs.existsSync(datPath)) {
        const stats = fs.statSync(datPath);
        joined = stats.birthtime ? stats.birthtime.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Reciente';

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
            for (const item of nbt.Inventory) {
              const parsed = parseNbtItem(item);
              if (parsed) {
                // If it's armor in legacy slot, track in equipment
                if (parsed.slot === 103) equipment.head = { item: parsed.name, qty: parsed.count, id: parsed.id, textureUrl: parsed.textureUrl, enchantments: parsed.enchantments.map(e => e.formatted), durabilityPct: parsed.durabilityPct, isEnchanted: parsed.isEnchanted };
                else if (parsed.slot === 102) equipment.chest = { item: parsed.name, qty: parsed.count, id: parsed.id, textureUrl: parsed.textureUrl, enchantments: parsed.enchantments.map(e => e.formatted), durabilityPct: parsed.durabilityPct, isEnchanted: parsed.isEnchanted };
                else if (parsed.slot === 101) equipment.legs = { item: parsed.name, qty: parsed.count, id: parsed.id, textureUrl: parsed.textureUrl, enchantments: parsed.enchantments.map(e => e.formatted), durabilityPct: parsed.durabilityPct, isEnchanted: parsed.isEnchanted };
                else if (parsed.slot === 100) equipment.feet = { item: parsed.name, qty: parsed.count, id: parsed.id, textureUrl: parsed.textureUrl, enchantments: parsed.enchantments.map(e => e.formatted), durabilityPct: parsed.durabilityPct, isEnchanted: parsed.isEnchanted };
                else if (parsed.slot === -106 || parsed.slot === 150) equipment.offhand = { item: parsed.name, qty: parsed.count, id: parsed.id, textureUrl: parsed.textureUrl, enchantments: parsed.enchantments.map(e => e.formatted), durabilityPct: parsed.durabilityPct, isEnchanted: parsed.isEnchanted };

                inventory.push({
                  item: parsed.customName ? `${parsed.customName} (${parsed.name})` : parsed.name,
                  qty: parsed.count,
                  id: parsed.id,
                  textureUrl: parsed.textureUrl,
                  enchantments: parsed.enchantments.map(e => e.formatted),
                  durabilityPct: parsed.durabilityPct,
                  isEnchanted: parsed.isEnchanted,
                  customName: parsed.customName,
                });
              }
            }
          }

          // Parse modern equipment
          if (nbt.equipment && typeof nbt.equipment === 'object') {
            const eqKeys = ['head', 'chest', 'legs', 'feet', 'offhand'] as const;
            for (const k of eqKeys) {
              if (nbt.equipment[k]) {
                const parsed = parseNbtItem(nbt.equipment[k]);
                if (parsed) {
                  equipment[k] = {
                    item: parsed.customName ? `${parsed.customName} (${parsed.name})` : parsed.name,
                    qty: parsed.count,
                    id: parsed.id,
                    textureUrl: parsed.textureUrl,
                    enchantments: parsed.enchantments.map(e => e.formatted),
                    durabilityPct: parsed.durabilityPct,
                    isEnchanted: parsed.isEnchanted,
                    customName: parsed.customName,
                  };
                }
              }
            }
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
      lastSeen: isOnline ? 'En línea ahora' : 'Desconectado',
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
      inventory: inventory.length > 0 ? inventory : [{ item: 'Inventario vacío', qty: 0 }],
      equipment,
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
