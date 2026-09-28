import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SERVER_DIR = path.resolve(process.cwd(), '../server');
const PROPERTIES_FILE = path.join(SERVER_DIR, 'server.properties');
const START_SCRIPT = path.join(SERVER_DIR, 'start.sh');

function parseProperties(content: string) {
  const props: Record<string, string> = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed.substring(idx + 1).trim();
        props[key] = value;
      }
    }
  }
  return props;
}

import { ServerManager } from '@/lib/server-manager';

export async function GET() {
  try {
    const content = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    const props = parseProperties(content);

    let ramMin = '8G';
    let ramMax = '10G';
    
    try {
      const scriptContent = fs.readFileSync(START_SCRIPT, 'utf8');
      const varMinMatch = scriptContent.match(/RAM_MIN="([^"]+)"/);
      const varMaxMatch = scriptContent.match(/RAM_MAX="([^"]+)"/);
      if (varMinMatch) ramMin = varMinMatch[1];
      if (varMaxMatch) ramMax = varMaxMatch[1];
      if (!varMinMatch) {
        const flagMin = scriptContent.match(/-Xms([0-9]+[GM])/i);
        if (flagMin) ramMin = flagMin[1];
      }
      if (!varMaxMatch) {
        const flagMax = scriptContent.match(/-Xmx([0-9]+[GM])/i);
        if (flagMax) ramMax = flagMax[1];
      }
    } catch (e) {}

    let keepInventory = false;
    let mobGriefing = true;
    
    const isOnline = await ServerManager.isRunning();
    if (isOnline) {
      try {
        const kiRes = await ServerManager.sendCommand('gamerule keepInventory');
        if (kiRes.success && typeof kiRes.response === 'string') {
          keepInventory = kiRes.response.includes('true');
        }
        const mgRes = await ServerManager.sendCommand('gamerule mobGriefing');
        if (mgRes.success && typeof mgRes.response === 'string') {
          mobGriefing = mgRes.response.includes('true');
        }
      } catch (e) {}
    }

    const state = {
      toggles: {
        whitelist: props['white-list'] === 'true',
        cracked: props['online-mode'] === 'false',
        flight: props['allow-flight'] === 'true',
        secureprofile: props['enforce-secure-profile'] === 'true',
        pvp: props['pvp'] === 'true',
        hardcore: props['hardcore'] === 'true',
        keepinventory: keepInventory,
        mobgriefing: mobGriefing,
        commandblocks: props['enable-command-block'] === 'true',
        nether: props['allow-nether'] === 'true',
        mobs: props['spawn-monsters'] === 'true',
        animals: props['spawn-animals'] === 'true',
        npcs: props['spawn-npcs'] === 'true',
      },
      maxPlayers: props['max-players'] || '20',
      serverPort: props['server-port'] || '25565',
      motd: props['motd'] || 'A Minecraft Server',
      difficulty: props['difficulty'] || 'easy',
      gamemode: props['gamemode'] || 'survival',
      viewDistance: props['view-distance'] || '10',
      simDistance: props['simulation-distance'] || '10',
      rconEnabled: props['enable-rcon'] === 'true',
      rconPort: props['rcon.port'] || '25575',
      rconPass: props['rcon.password'] || '',
      // JVM flags are stored separately or just hardcoded for now
      ramMin: ramMin,
      ramMax: ramMax,
      javaVer: '21',
      nativeTransport: true,
      discordUrl: '',
    };

    return NextResponse.json(state);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const state = await req.json();
    let content = fs.readFileSync(PROPERTIES_FILE, 'utf8');
    
    const updateProp = (key: string, value: string | boolean) => {
      const regex = new RegExp('^(\\s*)' + key + '\\s*=.*$', 'm');
      if (regex.test(content)) {
        content = content.replace(regex, '$1' + key + '=' + value);
      } else {
        content += '\n' + key + '=' + value;
      }
    };

    // Aplicar estado
    updateProp('white-list', state.toggles.whitelist);
    updateProp('online-mode', !state.toggles.cracked);
    updateProp('allow-flight', state.toggles.flight);
    updateProp('enforce-secure-profile', state.toggles.secureprofile);
    updateProp('pvp', state.toggles.pvp);
    updateProp('hardcore', state.toggles.hardcore);
    updateProp('enable-command-block', state.toggles.commandblocks);
    updateProp('allow-nether', state.toggles.nether);
    updateProp('spawn-monsters', state.toggles.mobs);
    updateProp('spawn-animals', state.toggles.animals);
    updateProp('spawn-npcs', state.toggles.npcs);
    
    updateProp('max-players', state.maxPlayers);
    updateProp('server-port', state.serverPort);
    updateProp('motd', state.motd);
    updateProp('difficulty', state.difficulty);
    updateProp('gamemode', state.gamemode);
    updateProp('view-distance', state.viewDistance);
    updateProp('simulation-distance', state.simDistance);
    updateProp('enable-rcon', state.rconEnabled);
    updateProp('rcon.port', state.rconPort);
    updateProp('rcon.password', state.rconPass);

    fs.writeFileSync(PROPERTIES_FILE, content, 'utf8');

    // Update RAM in start.sh
    try {
      if (fs.existsSync(START_SCRIPT)) {
        let scriptContent = fs.readFileSync(START_SCRIPT, 'utf8');
        
        scriptContent = scriptContent.replace(/RAM_MIN="[^"]*"/, `RAM_MIN="${state.ramMin}"`);
        scriptContent = scriptContent.replace(/RAM_MAX="[^"]*"/, `RAM_MAX="${state.ramMax}"`);
        
        fs.writeFileSync(START_SCRIPT, scriptContent, 'utf8');
      }
    } catch (e) {
      console.error('Failed to update start.sh', e);
    }

    const isOnline = await ServerManager.isRunning();
    if (isOnline) {
      try {
        await ServerManager.sendCommand(`gamerule keepInventory ${state.toggles.keepinventory}`);
        await ServerManager.sendCommand(`gamerule mobGriefing ${state.toggles.mobgriefing}`);
      } catch (e) {}
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
