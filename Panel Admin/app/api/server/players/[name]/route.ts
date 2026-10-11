import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import { parseNbt } from '@/lib/nbt';
import {
  translateMinecraft,
  getItemTextureUrl,
  getBlockTextureUrl,
  ITEM_MAX_DURABILITY,
} from '@/lib/minecraft-names';
import fs from 'fs';
import path from 'path';

import { SERVER_DIR, WORLD_DIR } from '@/lib/server-config';

function formatDimension(dim: string | undefined): string {
  if (!dim) return 'minecraft:overworld';
  if (dim.includes('the_nether') || dim.includes('nether')) return 'minecraft:the_nether';
  if (dim.includes('the_end') || dim.includes('end')) return 'minecraft:the_end';
  return 'minecraft:overworld';
}

function parseItem(rawItem: any) {
  if (!rawItem || !rawItem.id) return null;
  const id = String(rawItem.id);
  const count = Number(rawItem.count ?? rawItem.Count ?? 1);
  const slot = Number(rawItem.Slot ?? 0);

  let damage: number | null = null;
  if (rawItem.components && typeof rawItem.components['minecraft:damage'] === 'number') {
    damage = rawItem.components['minecraft:damage'];
  } else if (rawItem.tag && typeof rawItem.tag.Damage === 'number') {
    damage = rawItem.tag.Damage;
  }

  const maxDamage = ITEM_MAX_DURABILITY[id] || null;
  let durabilityPct: number | null = null;
  if (damage !== null && maxDamage !== null) {
    durabilityPct = Math.max(0, Math.min(100, Math.round(((maxDamage - damage) / maxDamage) * 100)));
  }

  return {
    slot,
    id,
    name: translateMinecraft(id),
    count,
    damage,
    maxDamage,
    durabilityPct,
    textureUrl: getItemTextureUrl(id),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> | { name: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const searchKey = decodeURIComponent(resolvedParams.name).trim();

  // 1. Locate player UUID and Name in usercache.json
  let targetUuid = searchKey;
  let targetName = searchKey;

  try {
    const usercachePath = path.join(SERVER_DIR, 'usercache.json');
    if (fs.existsSync(usercachePath)) {
      const cache = JSON.parse(fs.readFileSync(usercachePath, 'utf8'));
      if (Array.isArray(cache)) {
        const found = cache.find(
          (u) =>
            u.name.toLowerCase() === searchKey.toLowerCase() ||
            u.uuid.toLowerCase() === searchKey.toLowerCase()
        );
        if (found) {
          targetUuid = found.uuid;
          targetName = found.name;
        }
      }
    }
  } catch (e) {
    console.error('Error reading usercache', e);
  }

  // 2. Check live online status via RCON
  const isRunning = await ServerManager.isRunning();
  let isOnline = false;
  if (isRunning) {
    try {
      const res = await ServerManager.sendCommand('list');
      if (res.success && typeof res.response === 'string') {
        const parts = res.response.split(':');
        if (parts.length > 1) {
          const names = parts[1].split(',').map((n) => n.trim().toLowerCase());
          isOnline = names.includes(targetName.toLowerCase());
        }
      }
    } catch {}
  }

  // 3. Check ops.json, whitelist.json, banned-players.json
  let isOp = false;
  try {
    const opsPath = path.join(SERVER_DIR, 'ops.json');
    if (fs.existsSync(opsPath)) {
      const ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
      if (Array.isArray(ops)) {
        isOp = ops.some(
          (o) =>
            (o.name && o.name.toLowerCase() === targetName.toLowerCase()) ||
            (o.uuid && o.uuid.toLowerCase() === targetUuid.toLowerCase())
        );
      }
    }
  } catch {}

  let isWhitelisted = false;
  try {
    const wlPath = path.join(SERVER_DIR, 'whitelist.json');
    if (fs.existsSync(wlPath)) {
      const wl = JSON.parse(fs.readFileSync(wlPath, 'utf8'));
      if (Array.isArray(wl)) {
        isWhitelisted = wl.some(
          (w) =>
            (w.name && w.name.toLowerCase() === targetName.toLowerCase()) ||
            (w.uuid && w.uuid.toLowerCase() === targetUuid.toLowerCase())
        );
      }
    }
  } catch {}

  let isBanned = false;
  try {
    const banPath = path.join(SERVER_DIR, 'banned-players.json');
    if (fs.existsSync(banPath)) {
      const bans = JSON.parse(fs.readFileSync(banPath, 'utf8'));
      if (Array.isArray(bans)) {
        isBanned = bans.some(
          (b) =>
            (b.name && b.name.toLowerCase() === targetName.toLowerCase()) ||
            (b.uuid && b.uuid.toLowerCase() === targetUuid.toLowerCase())
        );
      }
    }
  } catch {}

  // 4. Parse playerdata (.dat)
  let health = 20;
  let food = 20;
  let xpLevel = 0;
  let xpP = 0;
  let gamemodeIndex = 0; // 0=survival, 1=creative, 2=adventure, 3=spectator
  let currentPos = { x: 0, y: 64, z: 0, dimension: 'minecraft:overworld' };
  let respawnPos: { x: number; y: number; z: number; dimension: string } | null = null;
  let lastDeathPos: { x: number; y: number; z: number; dimension: string } | null = null;
  const inventoryBySlot: Record<number, any> = {};
  const enderItems: any[] = [];

  try {
    const datPath = path.join(WORLD_DIR, 'playerdata', `${targetUuid}.dat`);
    if (fs.existsSync(datPath)) {
      const buf = fs.readFileSync(datPath);
      const nbt = parseNbt(buf);
      if (nbt) {
        if (typeof nbt.Health === 'number') health = Number(nbt.Health.toFixed(1));
        if (typeof nbt.foodLevel === 'number') food = Math.round(nbt.foodLevel);
        if (typeof nbt.XpLevel === 'number') xpLevel = Math.round(nbt.XpLevel);
        if (typeof nbt.XpP === 'number') xpP = Number(nbt.XpP.toFixed(3));
        if (typeof nbt.playerGameType === 'number') gamemodeIndex = nbt.playerGameType;

        if (Array.isArray(nbt.Pos) && nbt.Pos.length >= 3) {
          currentPos = {
            x: Number(Number(nbt.Pos[0]).toFixed(2)),
            y: Number(Number(nbt.Pos[1]).toFixed(2)),
            z: Number(Number(nbt.Pos[2]).toFixed(2)),
            dimension: formatDimension(nbt.Dimension),
          };
        }

        // Respawn position
        if (nbt.respawn && Array.isArray(nbt.respawn.pos)) {
          respawnPos = {
            x: Number(Number(nbt.respawn.pos[0]).toFixed(2)),
            y: Number(Number(nbt.respawn.pos[1]).toFixed(2)),
            z: Number(Number(nbt.respawn.pos[2]).toFixed(2)),
            dimension: formatDimension(nbt.respawn.dimension),
          };
        } else if (typeof nbt.SpawnX === 'number' && typeof nbt.SpawnY === 'number') {
          respawnPos = {
            x: Number(Number(nbt.SpawnX).toFixed(2)),
            y: Number(Number(nbt.SpawnY).toFixed(2)),
            z: Number(Number(nbt.SpawnZ).toFixed(2)),
            dimension: formatDimension(nbt.SpawnDimension),
          };
        }

        // Last death position
        if (nbt.LastDeathLocation && Array.isArray(nbt.LastDeathLocation.pos)) {
          lastDeathPos = {
            x: Number(Number(nbt.LastDeathLocation.pos[0]).toFixed(2)),
            y: Number(Number(nbt.LastDeathLocation.pos[1]).toFixed(2)),
            z: Number(Number(nbt.LastDeathLocation.pos[2]).toFixed(2)),
            dimension: formatDimension(nbt.LastDeathLocation.dimension),
          };
        }

        // Parse Inventory slots
        if (Array.isArray(nbt.Inventory)) {
          for (const raw of nbt.Inventory) {
            const parsed = parseItem(raw);
            if (parsed) {
              inventoryBySlot[parsed.slot] = parsed;
            }
          }
        }

        // Parse Ender chest items
        if (Array.isArray(nbt.EnderItems)) {
          for (const raw of nbt.EnderItems) {
            const parsed = parseItem(raw);
            if (parsed) enderItems.push(parsed);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error parsing playerdata NBT', e);
  }

  // 5. Parse stats (.json)
  let playTicks = 0;
  let deaths = 0;
  let mobKills = 0;
  let playerKills = 0;

  let walkCm = 0;
  let sprintCm = 0;
  let boatCm = 0;
  let fallCm = 0;
  let horseCm = 0;
  let swimCm = 0;
  let crouchCm = 0;
  let climbCm = 0;
  let flyCm = 0;

  const minedList: { id: string; name: string; count: number; textureUrl: string }[] = [];
  const usedList: { id: string; name: string; count: number; textureUrl: string }[] = [];
  const killedList: { id: string; name: string; count: number; headUrl: string }[] = [];

  let totalMined = 0;
  let totalUsed = 0;
  let totalKilled = 0;

  try {
    const statsPath = path.join(WORLD_DIR, 'stats', `${targetUuid}.json`);
    if (fs.existsSync(statsPath)) {
      const statsJson = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      const s = statsJson.stats || {};
      const custom = s['minecraft:custom'] || {};

      playTicks = custom['minecraft:play_time'] || 0;
      deaths = custom['minecraft:deaths'] || 0;
      mobKills = custom['minecraft:mob_kills'] || 0;
      playerKills = custom['minecraft:player_kills'] || 0;

      walkCm = custom['minecraft:walk_one_cm'] || 0;
      sprintCm = custom['minecraft:sprint_one_cm'] || 0;
      boatCm = custom['minecraft:boat_one_cm'] || 0;
      fallCm = custom['minecraft:fall_one_cm'] || 0;
      horseCm = custom['minecraft:horse_one_cm'] || 0;
      swimCm = custom['minecraft:swim_one_cm'] || 0;
      crouchCm = custom['minecraft:crouch_one_cm'] || 0;
      climbCm = custom['minecraft:climb_one_cm'] || 0;
      flyCm = (custom['minecraft:aviate_one_cm'] || 0) + (custom['minecraft:fly_one_cm'] || 0);

      // Mined blocks
      const mined = s['minecraft:mined'] || {};
      for (const [rawId, count] of Object.entries(mined)) {
        const c = Number(count);
        totalMined += c;
        minedList.push({
          id: rawId,
          name: translateMinecraft(rawId),
          count: c,
          textureUrl: getBlockTextureUrl(rawId),
        });
      }
      minedList.sort((a, b) => b.count - a.count);

      // Used items
      const used = s['minecraft:used'] || {};
      for (const [rawId, count] of Object.entries(used)) {
        const c = Number(count);
        totalUsed += c;
        usedList.push({
          id: rawId,
          name: translateMinecraft(rawId),
          count: c,
          textureUrl: getItemTextureUrl(rawId),
        });
      }
      usedList.sort((a, b) => b.count - a.count);

      // Killed mobs
      const killed = s['minecraft:killed'] || {};
      for (const [rawId, count] of Object.entries(killed)) {
        const c = Number(count);
        totalKilled += c;
        const cleanName = rawId.replace(/^minecraft:/, '');
        killedList.push({
          id: rawId,
          name: translateMinecraft(rawId),
          count: c,
          headUrl: `https://mc-heads.net/avatar/${cleanName}/32`,
        });
      }
      killedList.sort((a, b) => b.count - a.count);
    }
  } catch (e) {
    console.error('Error parsing stats JSON', e);
  }

  // Calculate distances in blocks (1 block = 100 cm)
  const distWalk = Math.round(walkCm / 100);
  const distSprint = Math.round(sprintCm / 100);
  const distBoat = Math.round(boatCm / 100);
  const distFall = Math.round(fallCm / 100);
  const distHorse = Math.round(horseCm / 100);
  const distSwim = Math.round(swimCm / 100);
  const distCrouch = Math.round(crouchCm / 100);
  const distClimb = Math.round(climbCm / 100);
  const distFly = Math.round(flyCm / 100);
  const distTotal =
    distWalk + distSprint + distBoat + distFall + distHorse + distSwim + distCrouch + distClimb + distFly;

  // Format play time in Spanish
  const totalHours = Math.floor(playTicks / 72000);
  const totalMinutes = Math.floor((playTicks % 72000) / 1200);
  const playTimeFormatted =
    totalHours > 0
      ? `${totalHours} horas, ${totalMinutes} minutos`
      : `${totalMinutes} minutos`;

  const kdRatio =
    deaths > 0 ? (mobKills / deaths).toFixed(1) : String(mobKills);

  // Gamemode names
  const gamemodeMap: Record<number, string> = {
    0: 'survival',
    1: 'creative',
    2: 'adventure',
    3: 'spectator',
  };

  return NextResponse.json({
    player: {
      name: targetName,
      uuid: targetUuid,
      avatar: `https://mc-heads.net/avatar/${targetName}/64`,
      isActive: isOnline,
      lastSeen: isOnline ? 'Conectado' : 'Desconectado',
      gamemode: gamemodeMap[gamemodeIndex] || 'survival',
      gamemodeIndex,
      isOp,
      isWhitelisted,
      isBanned,
      health,
      food,
      xpLevel,
      xpP,
      currentPos,
      respawnPos,
      lastDeathPos,
      inventorySlots: inventoryBySlot,
      enderItems,
      stats: {
        playTimeFormatted,
        playerKills,
        mobKills,
        deaths,
        kdRatio,
        distances: {
          total: distTotal,
          walk: distWalk,
          sprint: distSprint,
          boat: distBoat,
          fall: distFall,
          horse: distHorse,
          swim: distSwim,
          crouch: distCrouch,
          climb: distClimb,
          fly: distFly,
        },
        mined: {
          total: totalMined,
          items: minedList,
        },
        used: {
          total: totalUsed,
          items: usedList,
        },
        killed: {
          total: totalKilled,
          items: killedList,
        },
      },
    },
  });
}
