import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const SERVER_DIR = path.resolve(process.cwd(), '../server');
const SCRIPT_PATH = path.join(SERVER_DIR, 'auto-backup.sh');

export async function POST(req: Request) {
  try {
    const { frequency, retention } = await req.json();

    if (!frequency || !retention) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (process.platform !== 'linux') {
      return NextResponse.json({ success: true, message: 'Cron simulated on non-Linux OS' });
    }

    // Determine cron expression based on frontend values
    let cronExpr = '0 0 * * *'; // default daily
    if (frequency === 'Every 12 hours') cronExpr = '0 */12 * * *';
    else if (frequency === 'Daily at 00:00') cronExpr = '0 0 * * *';
    else if (frequency === 'Weekly on Sunday') cronExpr = '0 0 * * 0';

    // Parse retention
    let maxBackups = 7;
    if (retention === '7 days') maxBackups = 7;
    else if (retention === '15 days') maxBackups = 15;
    else if (retention === '30 days') maxBackups = 30;

    // Update retention in script
    if (fs.existsSync(SCRIPT_PATH)) {
      let scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
      scriptContent = scriptContent.replace(/MAX_BACKUPS=[0-9]+/, `MAX_BACKUPS=${maxBackups}`);
      fs.writeFileSync(SCRIPT_PATH, scriptContent, 'utf8');
      
      // Make it executable just in case
      try {
         exec(`chmod +x "${SCRIPT_PATH}"`);
      } catch (e) {}
    }

    // Setup cron job (overwrite previous auto-backup cron if exists)
    const cronJob = `${cronExpr} bash "${SCRIPT_PATH}"`;
    const setupCronCmd = `(crontab -l 2>/dev/null | grep -v "auto-backup.sh"; echo "${cronJob}") | crontab -`;

    return new Promise<Response>((resolve) => {
      exec(setupCronCmd, (error) => {
        if (error) {
          resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ success: true }));
        }
      });
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
