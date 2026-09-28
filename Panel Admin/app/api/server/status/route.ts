import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import si from 'systeminformation';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

let cachedTunnel = {
  domain: 'carolyn-canine.tun.ply.gg:57814',
  directIp: '147.185.221.215:57814',
  local: '192.168.101.10:25565',
  lastCheck: 0,
};

async function getLiveTunnel() {
  const now = Date.now();
  if (now - cachedTunnel.lastCheck < 45000) {
    return cachedTunnel;
  }

  try {
    const res = await fetch('https://api.playit.gg/tunnels/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Agent-Key a501645aa3000fcb7132eb6667388592e8ce472588eae37cca5e5cabc2fec185',
      },
      body: '{}',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      const tunnels = data?.data?.tunnels || [];
      const mcTunnel = tunnels.find((t: any) => t.tunnel_type === 'minecraft-java') || tunnels[0];
      if (mcTunnel?.alloc?.data) {
        const d = mcTunnel.alloc.data;
        const port = d.port_start || 25565;
        cachedTunnel = {
          domain: `${d.assigned_domain}:${port}`,
          directIp: `${d.static_ip4}:${port}`,
          local: '192.168.101.10:25565',
          lastCheck: now,
        };
      }
    }
  } catch (err) {
    // Retain previous cache on timeout/network glitch
  }

  return cachedTunnel;
}

export async function GET() {
  const isRunning = await ServerManager.isRunning();
  const tunnel = await getLiveTunnel();
  
  let cpu = 0;
  let ram = 0;
  let tps = 20.0;
  let players = 0;
  let uptime = 0; // en segundos

  try {
    const mem = await si.mem();
    ram = mem.active / 1024 / 1024 / 1024;
    
    const cpuLoad = await si.currentLoad();
    cpu = cpuLoad.currentLoad;

    if (isRunning) {
      if (process.platform === 'linux') {
        try {
          const { stdout } = await execAsync("ps -eo etimes,args | grep -E '[f]abric-server-launch' | awk '{print $1}' | head -n 1");
          const val = parseInt(stdout.trim());
          if (!isNaN(val)) uptime = val;
        } catch (e) {
          const time = si.time();
          uptime = time.uptime;
        }
      } else {
        const time = si.time();
        uptime = time.uptime;
      }

      // 1. Contar jugadores activos
      const listRes = await ServerManager.sendCommand('list');
      if (listRes.success && typeof listRes.response === 'string') {
        const match = listRes.response.match(/There are (\d+) of/);
        if (match) {
          players = parseInt(match[1]);
        }
      }

      // 2. Consultar TPS real desde Spark
      try {
        const sparkRes = await ServerManager.sendCommand('spark tps');
        if (sparkRes.success && typeof sparkRes.response === 'string') {
          // Spark outputs: "... 20.0, *20.0, *20.0, *20.0, *20.0"
          const matchTps = sparkRes.response.match(/(\d+\.\d+)/);
          if (matchTps) {
            const parsed = parseFloat(matchTps[1]);
            if (!isNaN(parsed) && parsed > 0 && parsed <= 20) {
              tps = parsed;
            }
          }
        }
      } catch (e) {
        // Fallback TPS 20
      }
    }
  } catch (e) {
  }

  return NextResponse.json({
    isRunning,
    metrics: {
      cpu: cpu.toFixed(1),
      ram: ram.toFixed(1),
      tps: tps.toFixed(1),
      players,
      uptime
    },
    tunnel
  });
}

