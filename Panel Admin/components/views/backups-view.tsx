'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import {
  DatabaseBackup,
  RotateCcw,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from '@/lib/toast'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useServerStatus } from '@/lib/hooks'
import type { Backup } from '@/types/server'
import {
  BackupStatsCards,
  BackupScheduleCard,
  BackupModals,
} from '@/components/features/backups'

export function BackupsView() {
  const { isRunning: isServerOnline } = useServerStatus()

  // SWR for Backups & Stats
  const { data, isLoading, mutate: refreshBackups } = useSWR<{
    backups: Backup[]
    stats: {
      total: number
      storageUsed: string
      lastBackup: string
      diskFree?: string
      diskTotal?: string
      diskUsedPercent?: number
    }
  }>('/api/backups', fetcher, {
    refreshInterval: 10_000,
    revalidateOnFocus: true,
  })

  const backups = data?.backups ?? []
  const stats = data?.stats ?? { total: 0, storageUsed: '0 B', lastBackup: 'Never' }

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null)
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null)
  const [backupToDownload, setBackupToDownload] = useState<Backup | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newNote, setNewNote] = useState('')
  const [creating, setCreating] = useState(false)

  // Restore form state
  const [restoreConfirm, setRestoreConfirm] = useState('')
  const [restoreWorld, setRestoreWorld] = useState(true)
  const [restorePlugins, setRestorePlugins] = useState(true)
  const [restoring, setRestoring] = useState(false)

  // Auto backup schedule state
  const [autoBackup, setAutoBackup] = useState(true)
  const [frequency, setFrequency] = useState('Daily at 00:00')
  const [retention, setRetention] = useState('7 days')
  const [savingSchedule, setSavingSchedule] = useState(false)

  // Polling faster while a backup is in progress
  useEffect(() => {
    const hasCreating = backups.some((b) => b.status === 'Creating' || b.status === 'In Progress')
    if (!hasCreating) return
    const interval = setInterval(() => refreshBackups(), 2500)
    return () => clearInterval(interval)
  }, [backups, refreshBackups])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    setIsCreateModalOpen(false)

    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, note: newNote }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success('¡Creación de copia de seguridad iniciada!')
      } else {
        toast.error(result.error || 'Error al crear la copia de seguridad')
      }
    } catch {
      toast.error('Error de red al crear copia de seguridad')
    } finally {
      setCreating(false)
      setNewName('')
      setNewNote('')
      refreshBackups()
    }
  }

  const confirmDelete = async () => {
    if (!backupToDelete) return
    const id = backupToDelete.id
    setIsDeleting(true)
    try {
      const res = await fetch('/api/backups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success(`¡Copia "${backupToDelete.name}" eliminada!`)
        setBackupToDelete(null)
        refreshBackups()
      } else {
        toast.error('Error al eliminar la copia de seguridad')
      }
    } catch {
      toast.error('Error al eliminar la copia de seguridad')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!backupToRestore || (restoreConfirm !== 'RESTORE' && restoreConfirm !== 'RESTAURAR') || restoring) return

    setRestoring(true)
    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: backupToRestore.id,
          world: restoreWorld,
          plugins: restorePlugins,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success('¡Servidor restaurado exitosamente!')
        setIsRestoreModalOpen(false)
        setRestoreConfirm('')
        setBackupToRestore(null)
      } else {
        toast.error(`Error al restaurar: ${result.error}`)
      }
    } catch {
      toast.error('Error al restaurar la copia de seguridad')
    } finally {
      setRestoring(false)
    }
  }

  const confirmDownload = () => {
    if (!backupToDownload) return
    window.location.href = `/api/backups/download?id=${encodeURIComponent(backupToDownload.id)}`
    setBackupToDownload(null)
  }

  const handleSaveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const res = await fetch('/api/backups/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, retention }),
      })
      if (res.ok) {
        toast.success('¡Regla de copias de seguridad guardada!')
      } else {
        toast.error('Error al guardar la regla')
      }
    } catch {
      toast.error('Error al guardar la regla')
    } finally {
      setSavingSchedule(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {isServerOnline && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 animate-in fade-in">
          <p className="text-sm font-semibold text-rose-400">
            ⚠️ El servidor está actualmente en ejecución. Debes detener el servidor antes de restaurar una copia de seguridad.
          </p>
        </div>
      )}

      {/* Summary stats */}
      <BackupStatsCards stats={stats} />

      {/* Auto backup schedule + create button */}
      <BackupScheduleCard
        autoBackup={autoBackup}
        setAutoBackup={setAutoBackup}
        frequency={frequency}
        setFrequency={setFrequency}
        retention={retention}
        setRetention={setRetention}
        onSaveSchedule={handleSaveSchedule}
        savingSchedule={savingSchedule}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        creating={creating}
      />

      {/* Backup list */}
      <div className="glass flex flex-col rounded-3xl">
        <div className="border-b border-border p-5">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Historial de Copias de Seguridad
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {isLoading ? (
            <li className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </li>
          ) : backups.length === 0 ? (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              Aún no hay copias de seguridad. ¡Crea tu primera copia!
            </li>
          ) : (
            backups.map((b) => {
              const inProgress = b.status === 'In Progress' || b.status === 'Creating'
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-end-stone">
                      {inProgress ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <DatabaseBackup className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate font-mono text-sm text-foreground">{b.name}</p>
                        <span
                          className={cn(
                            'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            b.type === 'Manual'
                              ? 'border-primary/40 bg-primary/20 text-end-stone'
                              : 'border-border bg-white/5 text-muted-foreground'
                          )}
                        >
                          {b.type === 'Manual' ? 'Manual' : 'Automática'}
                        </span>
                        {b.note && (
                          <span className="rounded-md border border-sky-500/30 bg-sky-500/10 text-sky-300 px-1.5 py-0.5 text-[10px]">
                            {b.note}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.date} · {b.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={inProgress || isServerOnline}
                      onClick={() => {
                        setBackupToRestore(b)
                        setIsRestoreModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-destructive/50 bg-destructive/20 px-3 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:bg-destructive/30 disabled:opacity-40 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span className="hidden sm:inline">Restaurar</span>
                    </button>
                    <button
                      type="button"
                      disabled={inProgress}
                      onClick={() => setBackupToDownload(b)}
                      title="Descargar"
                      className="flex size-8 items-center justify-center rounded-xl border border-border bg-white/5 text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40 disabled:opacity-40 cursor-pointer"
                    >
                      <Download className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={inProgress}
                      onClick={() => setBackupToDelete(b)}
                      title="Eliminar"
                      className="flex size-8 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-rose-300 transition-colors hover:bg-destructive/20 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>

      {/* Modal Dialogs */}
      <BackupModals
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        newName={newName}
        setNewName={setNewName}
        newNote={newNote}
        setNewNote={setNewNote}
        handleCreateSubmit={handleCreateSubmit}

        isRestoreModalOpen={isRestoreModalOpen}
        setIsRestoreModalOpen={setIsRestoreModalOpen}
        backupToRestore={backupToRestore}
        setBackupToRestore={setBackupToRestore}
        restoreConfirm={restoreConfirm}
        setRestoreConfirm={setRestoreConfirm}
        restoreWorld={restoreWorld}
        setRestoreWorld={setRestoreWorld}
        restorePlugins={restorePlugins}
        setRestorePlugins={setRestorePlugins}
        restoring={restoring}
        isServerOnline={isServerOnline}
        handleRestoreSubmit={handleRestoreSubmit}

        backupToDownload={backupToDownload}
        setBackupToDownload={setBackupToDownload}
        confirmDownload={confirmDownload}

        backupToDelete={backupToDelete}
        setBackupToDelete={setBackupToDelete}
        isDeleting={isDeleting}
        confirmDelete={confirmDelete}
      />
    </div>
  )
}
