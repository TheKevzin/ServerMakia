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
              <h3 className="text-lg font-heading font-bold text-foreground">Crear Copia de Seguridad Manual</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Nombre de la Copia <span className="text-muted-foreground">(Opcional)</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ej. antes-del-dragon"
                  className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Nota / Etiqueta <span className="text-muted-foreground">(Opcional)</span></label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="¿Por qué estás creando esta copia?"
                  className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground outline-none focus:border-primary resize-none h-20 transition-colors"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Crear
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
                <h3 className="text-xl font-heading font-bold text-rose-500">CONFIRMAR RESTAURACIÓN</h3>
                <p className="text-xs text-rose-300/80">El estado del mundo será restaurado</p>
              </div>
            </div>
            
            <p className="text-sm text-foreground/80 mb-4">
              Estás a punto de restaurar el servidor a <strong className="text-foreground">{backupToRestore.name}</strong>. Los cambios realizados después de este respaldo se reemplazarán de manera definitiva.
            </p>

            <div className="rounded-2xl border border-destructive/30 bg-black/40 p-3.5 mb-4 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nombre del Respaldo:</span>
                <span className="font-mono font-medium text-foreground truncate max-w-[200px]">{backupToRestore.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tamaño del Archivo:</span>
                <span className="text-foreground">{backupToRestore.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fecha del Respaldo:</span>
                <span className="text-foreground">{backupToRestore.date}</span>
              </div>
              {backupToRestore.note && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nota:</span>
                  <span className="text-cyan-400 font-medium">{backupToRestore.note}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-4">
              {/* Selective Restore */}
              <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-black/40 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Componentes a Restaurar</p>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={restoreWorld}
                    onChange={(e) => setRestoreWorld(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-foreground/90">Datos del Mundo (level.dat, dimensiones, entidades)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={restorePlugins}
                    onChange={(e) => setRestorePlugins(e.target.checked)}
                    className="accent-rose-500 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="text-foreground/90">Configuración y Datos (server.properties, whitelist, ops)</span>
                </label>
              </div>

              {/* Confirm Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-foreground">Escribe <strong className="text-rose-500">RESTAURAR</strong> para confirmar:</label>
                <input 
                  type="text" 
                  value={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.value.toUpperCase())}
                  placeholder="RESTAURAR"
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
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={(restoreConfirm !== 'RESTAURAR' && restoreConfirm !== 'RESTORE') || restoring || isServerOnline}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:hover:opacity-40 cursor-pointer"
                >
                  {restoring ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                  {restoring ? 'Restaurando...' : 'Restaurar Ahora'}
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
                <h3 className="text-lg font-heading font-bold text-foreground">Descargar Copia de Seguridad</h3>
                <p className="text-xs text-muted-foreground">Guarda el archivo de respaldo en tu dispositivo</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/[0.02] p-4 mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Nombre de la Copia:</span>
                <span className="font-mono font-semibold text-foreground truncate max-w-[200px]">{backupToDownload.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tamaño del Archivo:</span>
                <span className="font-medium text-foreground">{backupToDownload.size}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="text-foreground">{backupToDownload.date}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              El archivo se descargará directamente vía tu navegador (.tar.gz). Puedes conservarlo como copia fuera de línea o abrirlo con 7-Zip/WinRAR.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBackupToDownload(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDownload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Download className="size-4" />
                Descargar Ahora
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
                <h3 className="text-lg font-heading font-bold text-foreground">Confirmar Eliminación</h3>
                <p className="text-xs text-muted-foreground">Eliminación definitiva del archivo de respaldo</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/[0.02] p-4 mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Nombre de la Copia:</span>
                <span className="font-mono font-semibold text-foreground truncate max-w-[200px]">{backupToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tamaño de Archivo:</span>
                <span className="font-medium text-foreground">{backupToDelete.size}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fecha de Creación:</span>
                <span className="text-foreground">{backupToDelete.date}</span>
              </div>
            </div>

            <p className="text-xs text-rose-300/80 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              ⚠️ ¿Estás seguro de que deseas eliminar esta copia de seguridad? Esta acción no se puede deshacer y borrará el archivo del almacenamiento local y Google Drive.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setBackupToDelete(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {isDeleting ? 'Eliminando...' : 'Eliminar Copia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
