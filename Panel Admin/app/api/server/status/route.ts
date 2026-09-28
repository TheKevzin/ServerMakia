import { NextResponse } from 'next/server';
import { ServerManager } from '@/lib/server-manager';
import si from 'systeminformation';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  const isRunning = await ServerManager.isRunning();
  
  let cpu = 0;
  let ram = 0;
  let tps = 20;
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
          const { stdout } = await execAsync("ps -eo etimes,command | grep '[S]CREEN -dmS minecraft' | awk '{print $1}'");
          const val = parseInt(stdout.trim());
          if (!isNaN(val)) uptime = val;
        } catch (e) {
          // fallback
          const time = si.time();
          uptime = time.uptime;
        }
      } else {
        // Fallback for Windows local dev
        const time = si.time();
        uptime = time.uptime;
      }

      const listRes = await ServerManager.sendCommand('list');
      if (listRes.success && typeof listRes.response === 'string') {
        const match = listRes.response.match(/There are (\d+) of/);
        if (match) {
          players = parseInt(match[1]);
        }
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
    }
  });
}
