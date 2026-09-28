'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import {
  DatabaseBackup,
  HardDrive,
  Clock,
  Plus,
  RotateCcw,
  Download,
  Trash2,
  Loader2,
  CalendarClock,
  AlertTriangle,
  X
} from 'lucide-react'
import { toast } from '@/lib/toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Backup = {
  id: string
  name: string
  size: string
  date: string
  type: 'Auto' | 'Manual'
  status: 'Completed' | 'In Progress' | 'Creating'
  note?: string
}

export function BackupsView() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [stats, setStats] = useState({ total: 0, storageUsed: '0 B', lastBackup: 'Never' })
  const [autoBackup, setAutoBackup] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null)

  // Create form state
  const [newName, setNewName] = useState('')
  const [newNote, setNewNote] = useState('')
  const [creating, setCreating] = useState(false)

  // Restore form state
  const [restoreConfirm, setRestoreConfirm] = useState('')
  const [restoreWorld, setRestoreWorld] = useState(true)
  const [restorePlugins, setRestorePlugins] = useState(true)
  const [restoreConfig, setRestoreConfig] = useState(true)
  const [restoring, setRestoring] = useState(false)

  const [isServerOnline, setIsServerOnline] = useState(false)

  // Auto backup state
  const [frequency, setFrequency] = useState('Daily at 00:00')
  const [retention, setRetention] = useState('7 days')
  const [savingSchedule, setSavingSchedule] = useState(false)

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups')
      const data = await res.json()
      if (data.backups) {
        setBackups(data.backups)
        setStats(data.stats)
      }
    } catch (e) {}
    setIsLoading(false)
  }

  // Auto-refresh while a backup is being created
  useEffect(() => {
    const hasCreating = backups.some(b => b.status === 'Creating' || b.status === 'In Progress')
    if (!hasCreating) return
    const interval = setInterval(fetchBackups, 3000)
    return () => clearInterval(interval)
  }, [backups])

  useEffect(() => {
    fetchBackups()

    const checkStatus = () => {
      fetch('/api/server/status')
        .then(res => res.json())
        .then(data => setIsServerOnline(data.isRunning))
        .catch(() => setIsServerOnline(false))
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (creating) return
    setCreating(true)
    setIsCreateModalOpen(false)

    // Add a pending entry
    const pendingId = `pending-${Date.now()}`
    const pending: Backup = {
      id: pendingId,
      name: newName || `manual-${new Date().toISOString().slice(0, 10)}`,
      size: '—',
      date: 'Creating...',
      type: 'Manual',
      status: 'In Progress',
      note: newNote || undefined
    }
    setBackups(prev => [pending, ...prev])

    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, note: newNote })
      })
      const data = await res.json()

      if (data.success && data.backup) {
        // Replace pending with real backup
        setBackups(prev => prev.map(b => b.id === pendingId ? data.backup : b))
      } else {
        // Remove pending on error
        setBackups(prev => prev.filter(b => b.id !== pendingId))
      }
    } catch (e) {
      setBackups(prev => prev.filter(b => b.id !== pendingId))
    }

    setCreating(false)
    setNewName('')
    setNewNote('')
    fetchBackups() // Refresh stats
  }

  const deleteBackup = async (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id))
    await fetch('/api/backups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchBackups()
  }

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (restoreConfirm !== 'RESTAURAR' || !backupToRestore) return
    setRestoring(true)

    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: backupToRestore.id })
      });
      if (res.ok) {
        toast.success('Backup restored successfully!');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error restoring backup');
    }

    setRestoring(false)
    setIsRestoreModalOpen(false)
    setRestoreConfirm('')
    setBackupToRestore(null)
  }

  const handleDownload = (id: string) => {
    window.open(`/api/backups/download?id=${encodeURIComponent(id)}`);
  }

  const handleSaveSchedule = async () => {
    setSavingSchedule(true)
    try {
      const res = await fetch('/api/backups/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, retention })
      })
      if (res.ok) {
        toast.success('Auto-backup schedule updated successfully!')
      } else {
        const data = await res.json()
        toast.error(`Error: ${data.error}`)
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to save schedule')
    }
    setSavingSchedule(false)
  }

  const summaryStats = [
    { label: 'Total Backups', value: String(stats.total), icon: DatabaseBackup },
    { label: 'Storage Used', value: stats.storageUsed, icon: HardDrive },
    { label: 'Last Backup', value: stats.lastBackup, icon: Clock },
  ]

  return (
    <div className="flex flex-col gap-6 relative">
      {isServerOnline && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-400">⚠️ Server is currently running. You must stop the server before restoring a backup.</p>
        </div>
      )}
      {/* Summary stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-4 sm:grid-cols-3 flex-1">
          {summaryStats.map((s) => (
            <div key={s.label} className="glass flex items-center gap-4 rounded-3xl p-5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/25 text-end-stone">
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-foreground neon-text">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto backup + create */}
      <div className="glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-end-stone mt-1">
            <CalendarClock className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <p className="font-heading text-sm font-semibold text-foreground">
                Automatic Backups
              </p>
              <button
                role="switch"
                title="Toggle Auto Backup"
                aria-checked={autoBackup}
                onClick={() => setAutoBackup((v) => !v)}
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
                  autoBackup ? 'border-primary/50 bg-primary/40' : 'border-border bg-white/5'
                )}
              >
                <span className={cn('absolute top-[1px] size-4 rounded-full bg-foreground transition-all', autoBackup ? 'left-[17px] bg-end-stone shadow-[0_0_10px_rgba(98,6,191,0.8)]' : 'left-[1px]')} />
              </button>
            </div>
            {autoBackup && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger title="Backup frequency" className="w-[180px] bg-white/5 border-border text-foreground">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                    <SelectItem value="Daily at 00:00">Daily at 00:00</SelectItem>
                    <SelectItem value="Weekly on Sunday">Weekly on Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <span>keep last</span>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger title="Retention policy" className="w-[120px] bg-white/5 border-border text-foreground">
                    <SelectValue placeholder="Retention" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 days">7 days</SelectItem>
                    <SelectItem value="15 days">15 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <button 
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  className="ml-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary-foreground px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {savingSchedule ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {creating ? 'Creating…' : 'Create Backup'}
          </button>
        </div>
      </div>

      {/* Backup list */}
      <div className="glass flex flex-col rounded-3xl">
        <div className="border-b border-border p-5">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Backup History
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {isLoading ? (
            <li className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </li>
          ) : backups.length === 0 ? (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No backups yet. Create your first backup!
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
                      {inProgress ? <Loader2 className="size-4 animate-spin" /> : <DatabaseBackup className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-sm text-foreground">{b.name}</p>
                        <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', b.type === 'Manual' ? 'border-primary/40 bg-primary/20 text-end-stone' : 'border-border bg-white/5 text-muted-foreground')}>
                          {b.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.date} · {b.size}
                      </p>
                      {b.note && <p className="text-xs italic text-muted-foreground/80 mt-1">"{b.note}"</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      disabled={inProgress || isServerOnline}
                      onClick={() => {
                        setBackupToRestore(b)
                        setIsRestoreModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-destructive/50 bg-destructive/20 px-3 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:bg-destructive/30 disabled:opacity-40"
                    >
                      <RotateCcw className="size-3.5" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                    <button
                      disabled={inProgress}
                      onClick={() => handleDownload(b.id)}
                      title="Download"
                      className="flex size-8 items-center justify-center rounded-xl border border-border bg-white/5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                    >
                      <Download className="size-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBackup(b.id)}
                      title="Delete"
                      className="flex size-8 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-rose-300 transition-colors hover:bg-destructive/20"
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-heading font-bold text-foreground">Create Manual Backup</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground" title="Close" aria-label="Close">
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
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
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
              <h3 className="text-xl font-heading font-bold text-rose-500">DANGER ZONE</h3>
            </div>
            
            <p className="text-sm text-foreground/80 mb-6">
              You are about to restore the server to <strong className="text-foreground">{backupToRestore.name}</strong>. Current progress may be permanently lost.
            </p>

            <form onSubmit={handleRestoreSubmit} className="flex flex-col gap-5">
              {/* Selective Restore */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-black/40 p-4">
                <p className="text-sm font-semibold text-foreground">Selective Restore</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={restoreWorld} onChange={(e) => setRestoreWorld(e.target.checked)} className="accent-rose-500 w-4 h-4 cursor-pointer" />
                  <span className="text-sm text-foreground/80">World Data (level.dat, region files)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={restorePlugins} onChange={(e) => setRestorePlugins(e.target.checked)} className="accent-rose-500 w-4 h-4 cursor-pointer" />
                  <span className="text-sm text-foreground/80">Plugins & Mods</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={restoreConfig} onChange={(e) => setRestoreConfig(e.target.checked)} className="accent-rose-500 w-4 h-4 cursor-pointer" />
                  <span className="text-sm text-foreground/80">Server Configs (server.properties)</span>
                </label>
              </div>

              {/* Confirm Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-foreground">Type <strong className="text-rose-500">RESTAURAR</strong> to confirm</label>
                <input 
                  type="text" 
                  value={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.value)}
                  placeholder="RESTAURAR"
                  className="rounded-xl border border-destructive/50 bg-black/40 px-4 py-2 text-sm text-rose-400 outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setIsRestoreModalOpen(false)} className="flex-1 rounded-xl border border-border bg-white/5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={restoreConfirm !== 'RESTAURAR' || restoring}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:hover:opacity-40"
                >
                  {restoring ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                  {restoring ? 'Restoring...' : 'Restore Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
