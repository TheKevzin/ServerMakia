import { exec } from 'child_process';
import path from 'path';
import { Rcon } from 'rcon-client';
import fs from 'fs';

const SERVER_DIR = path.resolve(process.cwd(), '../server');

export class ServerManager {
  
  static async isRunning() {
    // 1. Intentar por RCON (servidor listo y respondiendo)
    try {
      const rcon = await this.getRcon();
      rcon.end();
      return true;
    } catch (e) {
      // Fallback
    }

    // 2. Si estamos en Linux, verificar si el proceso de Java/Fabric está activo
    if (process.platform === 'linux') {
      try {
        return await new Promise<boolean>((resolve) => {
          exec('pgrep -f "[f]abric-server-launch"', (err, stdout) => {
            resolve(!err && stdout.trim().length > 0);
          });
        });
      } catch (e) {
        return false;
      }
    }

    return false;
  }

  static async start() {
    const running = await this.isRunning();
    if (running) {
      return { success: false, message: 'Server is already running' };
    }

    try {
      // En Linux usamos screen para iniciar el server en segundo plano de forma independiente
      exec(`cd "${SERVER_DIR}" && screen -dmS minecraft bash start.sh`);
      return { success: true, message: 'Server starting via screen...' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  static async stop() {
    const running = await this.isRunning();
    if (!running) {
      return { success: false, message: 'Server is not running' };
    }

    try {
      const rcon = await this.getRcon();
      await rcon.send('stop');
      rcon.end();
      return { success: true, message: 'Stop command sent via RCON' };
    } catch (e: any) {
      try {
        exec('screen -S minecraft -X stuff "stop^M" 2>/dev/null || pkill -f "[f]abric-server-launch"');
        return { success: true, message: 'Stop signal sent to server' };
      } catch (e2: any) {
        return { success: false, message: e.message };
      }
    }
  }

  static getLogs() {
    try {
      // Leemos las ultimas lineas del archivo log oficial en lugar de capturar la consola
      const logPath = path.join(SERVER_DIR, 'logs', 'latest.log');
      if (!fs.existsSync(logPath)) return [];
      
      const logs = fs.readFileSync(logPath, 'utf8');
      const lines = logs.split('\n').filter(l => 
        l.trim() !== '' && 
        !l.includes('RCON Client') && 
        !l.includes('RCON Listener')
      );
      // Devolvemos las ultimas 150 lineas para no saturar
      return lines.slice(-150);
    } catch (e) {
      return ['[ERROR] Could not read latest.log'];
    }
  }

  static async getRcon() {
    let rconPort = 25575;
    let rconPass = 'minecraft';

    try {
      const propPath = path.join(SERVER_DIR, 'server.properties');
      const props = fs.readFileSync(propPath, 'utf8');
      const passMatch = props.match(/rcon\.password=(.*)/);
      const portMatch = props.match(/rcon\.port=(\d+)/);
      if (passMatch) rconPass = passMatch[1].trim();
      if (portMatch) rconPort = parseInt(portMatch[1].trim());
    } catch (e) {
      // Fallback
    }

    const rcon = await Rcon.connect({
      host: '127.0.0.1',
      port: rconPort,
      password: rconPass,
      timeout: 2000
    });

    return rcon;
  }

  static async sendCommand(cmd: string) {
    try {
      const rcon = await this.getRcon();
      const response = await rcon.send(cmd);
      rcon.end();
      return { success: true, response };
    } catch (e: any) {
      return { success: false, message: 'Could not connect to RCON. Is server offline?' };
    }
  }
}
