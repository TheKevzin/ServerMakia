'use client'

import { AlertTriangle, Download, Trash2, RotateCcw, X, Loader2 } from 'lucide-react'
import type { Backup } from '@/types/server'

type BackupModalsProps = {
  // Create Modal
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  newName: string
  setNewName: (name: string) => void
  newNote: string
  setNewNote: (note: string) => void
  handleCreateSubmit: (e: React.FormEvent) => void

  // Restore Modal
  isRestoreModalOpen: boolean
  setIsRestoreModalOpen: (open: boolean) => void
  backupToRestore: Backup | null
  setBackupToRestore: (b: Backup | null) => void
  restoreConfirm: string
  setRestoreConfirm: (s: string) => void
  restoreWorld: boolean
  setRestoreWorld: (b: boolean) => void
  restorePlugins: boolean
  setRestorePlugins: (b: boolean) => void
  restoring: boolean
  isServerOnline: boolean
  handleRestoreSubmit: (e: React.FormEvent) => void

  // Download Modal
  backupToDownload: Backup | null
  setBackupToDownload: (b: Backup | null) => void
  confirmDownload: () => void

  // Delete Modal
  backupToDelete: Backup | null
  setBackupToDelete: (b: Backup | null) => void
  isDeleting: boolean
  confirmDelete: () => void
}

export function BackupModals({
  isCreateModalOpen,
  setIsCreateModalOpen,
  newName,
  setNewName,
  newNote,
  setNewNote,
  handleCreateSubmit,

  isRestoreModalOpen,
  setIsRestoreModalOpen,
  backupToRestore,
  setBackupToRestore,
  restoreConfirm,
  setRestoreConfirm,
  restoreWorld,
  setRestoreWorld,
  restorePlugins,
  setRestorePlugins,
  restoring,
  isServerOnline,
  handleRestoreSubmit,

  backupToDownload,
  setBackupToDownload,
  confirmDownload,

  backupToDelete,
  setBackupToDelete,
  isDeleting,
  confirmDelete,
}: BackupModalsProps) {
  return (
    <>
      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-bold text-foreground">Create Manual Backup</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Backup Name <span className="text-muted-foreground">(Optional)</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. pre-dragon-fight"
                  className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Note / Tag <span className="text-muted-foreground">(Optional)</span></label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Why are you making this backup?"
                  className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground outline-none focus:border-primary resize-none h-20 transition-colors"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESTORE MODAL */}
      {isRestoreModalOpen && backupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-destructive/50 bg-[#1a0f14] p-6 shadow-[0_0_50px_rgba(225,29,72,0.15)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20 text-rose-500">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-rose-500">CONFIRM RESTORATION</h3>
                <p className="text-xs text-rose-300/80">World state will be reverted</p>
              </div>
            </div>
            
            <p className="text-sm text-foreground/80 mb-4">
              You are about to restore the server to <strong className="text-foreground">{backupToRestore.name}</strong>. Current world changes since this backup may be permanently replaced.
            </p>

            <div className="rounded-2xl border border-destructive/30 bg-black/40 p-3.5 mb-4 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Snapshot Name:</span>
                <span className="font-mono font-medium text-foreground truncate max-w-[200px]">{backupToRestore.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Archive Size:</span>
                <span className="text-foreground">{backupToRestore.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Snapshot Date:</span>
                <span className="text-foreground">{backupToRestore.date}</span>
              </div>
              {backupToRestore.note && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Note:</span>
                  <span className="text-cyan-400 font-medium">{backupToRestore.note}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-4">
              {/* Selective Restore */}
              <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-black/40 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Components to Restore</p>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={restoreWorld}
                    onChange={(e) => setRestoreWorld(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-foreground/90">World Data (level.dat, dimension regions, entities)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={restorePlugins}
                    onChange={(e) => setRestorePlugins(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-foreground/90">Config & Data (server.properties, whitelist, ops)</span>
                </label>
              </div>

              {/* Confirm Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-foreground">Type <strong className="text-rose-500">RESTORE</strong> to confirm:</label>
                <input 
                  type="text" 
                  value={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.value)}
                  placeholder="RESTORE"
                  className="rounded-xl border border-destructive/50 bg-black/40 px-4 py-2 text-sm text-rose-400 outline-none focus:border-rose-500 transition-colors uppercase"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsRestoreModalOpen(false)
                    setRestoreConfirm('')
                    setBackupToRestore(null)
                  }}
                  className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={restoreConfirm !== 'RESTORE' || restoring || isServerOnline}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:hover:opacity-40 cursor-pointer"
                >
                  {restoring ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                  {restoring ? 'Restoring...' : 'Restore Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOWNLOAD CONFIRMATION MODAL */}
      {backupToDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl border border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Download className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">Download Backup</h3>
                <p className="text-xs text-muted-foreground">Save backup archive to your device</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/[0.02] p-4 mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Backup Name:</span>
                <span className="font-mono font-semibold text-foreground truncate max-w-[200px]">{backupToDownload.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Archive Size:</span>
                <span className="font-medium text-foreground">{backupToDownload.size}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{backupToDownload.date}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              The archive will be downloaded directly via your browser (.tar.gz). You can use it as a local offline restore point or inspect it with 7-Zip/WinRAR.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBackupToDownload(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDownload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Download className="size-4" />
                Download Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {backupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-destructive/40 bg-[#160d12] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20 text-rose-400">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold text-foreground">Confirm Deletion</h3>
                <p className="text-xs text-muted-foreground">Permanent deletion of backup file</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/[0.02] p-4 mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Backup Name:</span>
                <span className="font-mono font-semibold text-foreground truncate max-w-[200px]">{backupToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">File Size:</span>
                <span className="font-medium text-foreground">{backupToDelete.size}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Creation Date:</span>
                <span className="text-foreground">{backupToDelete.date}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300/80 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              ⚠️ Are you sure you want to delete this backup? This action cannot be undone and will remove the file from local storage and Google Drive.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBackupToDelete(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {isDeleting ? 'Deleting...' : 'Delete Backup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
