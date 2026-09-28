import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

export async function uploadAndManageDrive(filePath: string, folderId: string, serviceAccountJson: string) {
  try {
    const credentials = JSON.parse(serviceAccountJson)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    const drive = google.drive({ version: 'v3', auth })
    
    console.log(`[Drive] Uploading ${filePath} to Drive...`)
    
    const fileMetadata = {
      name: path.basename(filePath),
      parents: [folderId],
    }
    
    const media = {
      mimeType: 'application/gzip',
      body: fs.createReadStream(filePath),
    }
    
    // Upload new backup
    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    })
    
    console.log(`[Drive] Upload complete.`)

    // Enforce 3 copies limit on Drive
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      orderBy: 'createdTime desc',
      fields: 'files(id, name, createdTime)',
    })

    const files = res.data.files || []
    if (files.length > 3) {
      const filesToDelete = files.slice(3)
      for (const file of filesToDelete) {
        if (file.id) {
          console.log(`[Drive] Deleting old backup: ${file.name}`)
          await drive.files.delete({ fileId: file.id })
        }
      }
    }
    
  } catch (error) {
    console.error('[Drive] Error in drive upload/manage process:', error)
  }
}
