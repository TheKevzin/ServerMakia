import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PANEL_DIR = path.resolve(__dirname, '..');

const backupFilePath = process.argv[2];
if (!backupFilePath || !fs.existsSync(backupFilePath)) {
  console.error('[Drive CLI] No backup file provided or file does not exist:', backupFilePath);
  process.exit(1);
}

const configPath = path.resolve(PANEL_DIR, 'drive-config.json');
if (!fs.existsSync(configPath)) {
  console.log('[Drive CLI] drive-config.json not found. Skipping Google Drive upload.');
  process.exit(0);
}

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (!config.folderId || !config.serviceAccount) {
    console.log('[Drive CLI] Google Drive not fully configured. Skipping upload.');
    process.exit(0);
  }

  const credentials = JSON.parse(config.serviceAccount);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  console.log(`[Drive CLI] Uploading ${backupFilePath} to Google Drive folder: ${config.folderId}...`);

  const fileMetadata = {
    name: path.basename(backupFilePath),
    parents: [config.folderId],
  };

  const media = {
    mimeType: 'application/gzip',
    body: fs.createReadStream(backupFilePath),
  };

  const uploadRes = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, size',
  });

  console.log(`[Drive CLI] Backup uploaded successfully! File ID: ${uploadRes.data.id}`);

  // Enforce 3 backups maximum on Google Drive
  const listRes = await drive.files.list({
    q: `'${config.folderId}' in parents and trashed=false`,
    orderBy: 'createdTime desc',
    fields: 'files(id, name, createdTime)',
  });

  const files = listRes.data.files || [];
  if (files.length > 3) {
    const toDelete = files.slice(3);
    for (const f of toDelete) {
      if (f.id) {
        console.log(`[Drive CLI] Purging old remote backup: ${f.name} (${f.id})`);
        await drive.files.delete({ fileId: f.id });
      }
    }
  }
} catch (err) {
  console.error('[Drive CLI] Error uploading to Google Drive:', err);
  process.exit(1);
}
