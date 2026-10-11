import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { uploadAndManageDrive } from '@/lib/drive';

const execAsync = util.promisify(exec);

import { SERVER_DIR } from '@/lib/server-config';
const BACKUPS_DIR = path.resolve(process.cwd(), '../backups');
const LOCK_FILE = path.join(BACKUPS_DIR, '.backup-in-progress');

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

// In-memory cache for Google Drive listing (45s TTL)
let cachedDriveBackups: { name: string; size: number; mtime: number }[] = [];
let lastDriveCheck = 0;

async function getDriveBackups() {
  const now = Date.now();
  if (now - lastDriveCheck < 45000 && cachedDriveBackups.length > 0) {
    return cachedDriveBackups;
  }
  try {
    const { stdout } = await execAsync('rclone lsjson "gdrive:Backups Servidor" --timeout 4s');
    const items = JSON.parse(stdout);
    if (Array.isArray(items)) {
      cachedDriveBackups = items
        .filter((it: any) => it.Name && it.Name.endsWith('.tar.gz'))
        .map((it: any) => ({
          name: it.Name,
          size: it.Size || 0,
          mtime: it.ModTime ? new Date(it.ModTime).getTime() : now,
        }));
      lastDriveCheck = now;
    }
  } catch (err) {
    // If rclone fails or times out, return existing cache
  }
  return cachedDriveBackups;
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

    // 1. Get Google Drive items (cached)
    const driveItems = await getDriveBackups();
    const driveMap = new Map<string, { size: number; mtime: number }>();
    for (const d of driveItems) {
      driveMap.set(d.name, d);
    }

    // 2. Get local items
    const localFiles = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.tar.gz'));
    const allNames = Array.from(new Set([...localFiles, ...driveMap.keys()]));

    // 3. Build unified backups list
    const backupsList = allNames.map(f => {
      const localPath = path.join(BACKUPS_DIR, f);
      const isLocal = fs.existsSync(localPath);
      const isCloud = driveMap.has(f);

      let sizeBytes = 0;
      let mtimeMs = 0;

      if (isLocal) {
        try {
          const stats = fs.statSync(localPath);
          sizeBytes = stats.size;
          mtimeMs = stats.mtime.getTime();
        } catch {}
      } else if (isCloud) {
        sizeBytes = driveMap.get(f)!.size;
        mtimeMs = driveMap.get(f)!.mtime;
      }

      const isManual = f.includes('manual');
      const isThisCreating = isCreating && f === creatingName;
      const mtimeDate = new Date(mtimeMs || Date.now());

      let location = 'Local';
      if (isLocal && isCloud) location = 'Local & Cloud';
      else if (!isLocal && isCloud) location = 'Google Drive';

      return {
        id: f,
        name: f.replace('.tar.gz', ''),
        size: formatSize(sizeBytes),
        bytes: sizeBytes,
        mtime: mtimeMs,
        date: mtimeDate.toLocaleString('en-US', {
          timeZone: 'America/Bogota',
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
          hour12: true
        }),
        type: isManual ? ('Manual' as const) : ('Auto' as const),
        status: isThisCreating ? ('Creating' as const) : ('Completed' as const),
        location,
        isLocal,
        isCloud,
      };
    }).sort((a, b) => b.mtime - a.mtime);

    // 4. Calculate total storage across all backups
    let totalBytes = 0;
    for (const b of backupsList) {
      totalBytes += b.bytes;
    }

    // 5. Calculate host disk space ("la torre")
    let diskFreeFormatted = '';
    let diskTotalFormatted = '';
    let diskUsedPercent = 0;
    let diskFreeBytes = 0;
    let diskTotalBytes = 0;

    try {
      if (typeof (fs as any).statfsSync === 'function') {
        const s = (fs as any).statfsSync(BACKUPS_DIR);
        diskFreeBytes = Number(s.bavail) * Number(s.bsize);
        diskTotalBytes = Number(s.blocks) * Number(s.bsize);
        diskFreeFormatted = formatSize(diskFreeBytes);
        diskTotalFormatted = formatSize(diskTotalBytes);
        diskUsedPercent = diskTotalBytes > 0 ? Math.round(((diskTotalBytes - diskFreeBytes) / diskTotalBytes) * 100) : 0;
      }
    } catch (e) {
      // fallback
    }

    return NextResponse.json({
      backups: backupsList,
      stats: {
        total: backupsList.length,
        storageUsed: formatSize(totalBytes),
        lastBackup: backupsList.length > 0 ? backupsList[0].date : 'Never',
        localCount: localFiles.length,
        cloudCount: driveMap.size,
        diskFree: diskFreeFormatted,
        diskTotal: diskTotalFormatted,
        diskUsedPercent,
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

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const p = (type: string) => parts.find(x => x.type === type)?.value || '00';
    const timestamp = `${p('year')}-${p('month')}-${p('day')}_${p('hour')}-${p('minute')}-${p('second')}`;
    const backupName = name ? `manual-${name}-${timestamp}` : `manual-${timestamp}`;
    const backupFileName = `${backupName}.tar.gz`;
    const backupFile = path.join(BACKUPS_DIR, backupFileName);

    // Write lock file with the backup filename
    fs.writeFileSync(LOCK_FILE, backupFileName);

    // Elements to backup
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
        try { if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile); } catch {}
        return;
      }

      // Safe local retention: keep up to 30 backups locally (or based on auto-backup.sh configuration)
      let maxBackups = 30;
      try {
        const scriptPath = path.resolve(SERVER_DIR, 'auto-backup.sh');
        if (fs.existsSync(scriptPath)) {
          const match = fs.readFileSync(scriptPath, 'utf-8').match(/MAX_BACKUPS=([0-9]+)/);
          if (match) maxBackups = Math.max(20, parseInt(match[1], 10));
        }
      } catch {}

      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.tar.gz'))
        .map(f => ({ name: f, time: fs.statSync(path.join(BACKUPS_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

      if (files.length > maxBackups) {
        for (let i = maxBackups; i < files.length; i++) {
          try { fs.unlinkSync(path.join(BACKUPS_DIR, files[i].name)); } catch {}
        }
      }

      // Trigger Google Drive upload via rclone (5 TB personal Google Drive) with fallback
      exec(`rclone copy "${backupFile}" "gdrive:Backups Servidor" --drive-chunk-size 64M`, (rErr) => {
        lastDriveCheck = 0; // Invalidate drive cache
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

    if (!id || !id.endsWith('.tar.gz') || id.includes('..') || id.includes('/') || id.includes('\\')) {
      return NextResponse.json({ error: 'Invalid backup ID' }, { status: 400 });
    }

    const filePath = path.join(BACKUPS_DIR, id);

    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }

    // Also delete from Google Drive
    try {
      exec(`rclone deletefile "gdrive:Backups Servidor/${id}"`);
    } catch {}

    lastDriveCheck = 0; // Invalidate drive cache

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
