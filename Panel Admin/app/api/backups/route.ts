import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { uploadAndManageDrive } from '@/lib/drive';

const SERVER_DIR = path.resolve(process.cwd(), '../server');
const BACKUPS_DIR = path.resolve(process.cwd(), '../backups');
const LOCK_FILE = path.join(BACKUPS_DIR, '.backup-in-progress');

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

export async function GET() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const isCreating = fs.existsSync(LOCK_FILE);
    let creatingName = '';
    if (isCreating) {
      try { creatingName = fs.readFileSync(LOCK_FILE, 'utf-8').trim(); } catch {}
    }

    const files = fs.readdirSync(BACKUPS_DIR)
      .filter(f => f.endsWith('.tar.gz'))
      .map(f => {
        const fullPath = path.join(BACKUPS_DIR, f);
        const stats = fs.statSync(fullPath);
        const isManual = f.includes('manual');
        const isThisCreating = isCreating && f === creatingName;
        return {
          id: f,
          name: f.replace('.tar.gz', ''),
          size: formatSize(stats.size),
          date: stats.mtime.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          type: isManual ? 'Manual' : 'Auto',
          status: isThisCreating ? 'Creating' as const : 'Completed' as const,
        };
      })
      .sort((a, b) => {
        const statsA = fs.statSync(path.join(BACKUPS_DIR, a.id));
        const statsB = fs.statSync(path.join(BACKUPS_DIR, b.id));
        return statsB.mtime.getTime() - statsA.mtime.getTime();
      });

    // Calculate total storage used
    let totalBytes = 0;
    for (const f of files) {
      const stats = fs.statSync(path.join(BACKUPS_DIR, f.id));
      totalBytes += stats.size;
    }

    return NextResponse.json({
      backups: files,
      stats: {
        total: files.length,
        storageUsed: formatSize(totalBytes),
        lastBackup: files.length > 0 ? files[0].date : 'Never',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, note } = await req.json();

    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    // Prevent multiple simultaneous backups
    if (fs.existsSync(LOCK_FILE)) {
      return NextResponse.json({ error: 'A backup is already in progress' }, { status: 409 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = name ? `manual-${name}-${timestamp}` : `manual-${timestamp}`;
    const backupFileName = `${backupName}.tar.gz`;
    const backupFile = path.join(BACKUPS_DIR, backupFileName);

    // Write lock file with the backup filename
    fs.writeFileSync(LOCK_FILE, backupFileName);

    // Only backup world data and essential configs (not the entire server)
    // World folders contain the irreplaceable player progress and builds
    // Config files are small but important for server identity
    const includes = [
      './world',
      './config',
      './server.properties',
      './whitelist.json',
      './banned-players.json',
      './banned-ips.json',
      './ops.json',
      './usercache.json',
    ].map(f => `"${f}"`).join(' ');
    const cmd = `cd "${SERVER_DIR}" && tar -czf "${backupFile}" ${includes} 2>/dev/null || tar -czf "${backupFile}" $(ls -d ${includes} 2>/dev/null)`;

    // Return immediately so the UI doesn't hang
    exec(cmd, { timeout: 600000 }, async (error) => {
      // Remove lock file no matter what
      try { fs.unlinkSync(LOCK_FILE); } catch {}

      if (error) {
        console.error('[Backup] tar failed:', error.message);
        // Clean up the partial file
        try { if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile); } catch {}
        return;
      }

      // Enforce 3 local backups max
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.tar.gz'))
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 3) {
        for (let i = 3; i < files.length; i++) {
          fs.unlinkSync(path.join(BACKUPS_DIR, files[i].name));
        }
      }

      // Trigger Google Drive upload via rclone (5 TB personal Google Drive) with fallback
      exec(`rclone copy "${backupFile}" "gdrive:Backups Servidor" --drive-chunk-size 64M`, (rErr) => {
        if (!rErr) {
          console.log('[Drive] Backup subido exitosamente a Google Drive (5 TB) vía rclone.');
        } else {
          const CONFIG_PATH = path.resolve(process.cwd(), 'drive-config.json');
          if (fs.existsSync(CONFIG_PATH)) {
            try {
              const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
              if (config.folderId && config.serviceAccount) {
                uploadAndManageDrive(backupFile, config.folderId, config.serviceAccount);
              }
            } catch {}
          }
        }
      });
    });

    // Return success immediately — the backup runs in the background
    return NextResponse.json({
      success: true,
      backup: {
        id: backupFileName,
        name: backupName,
        size: 'Calculating...',
        date: 'Just now',
        type: 'Manual',
        status: 'Creating',
        note: note || undefined,
      }
    });
  } catch (e: any) {
    try { fs.unlinkSync(LOCK_FILE); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const filePath = path.join(BACKUPS_DIR, id);

    // Security check
    if (!filePath.startsWith(BACKUPS_DIR) || !id.endsWith('.tar.gz')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
