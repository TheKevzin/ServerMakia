'use client'

import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

type DangerZoneTabProps = {
  isServerOnline: boolean
  dangerModal: 'reset' | 'delete' | null
  setDangerModal: (m: 'reset' | 'delete' | null) => void
  dangerConfirm: string
  setDangerConfirm: (s: string) => void
  handleDangerAction: () => void
  processing: boolean
}

export function DangerZoneTab({
  isServerOnline,
  dangerModal,
  setDangerModal,
  dangerConfirm,
  setDangerConfirm,
  handleDangerAction,
  processing,
}: DangerZoneTabProps) {
  return (
    <>
      <div className="rounded-3xl border border-destructive/30 bg-destructive/[0.06] p-6 animate-in fade-in slide-in-from-right-4">
        <h2 className="font-heading text-xl font-bold text-rose-400 mb-2">Danger Zone</h2>
        <p className="mb-6 text-sm text-muted-foreground">Irreversible actions. Proceed with extreme caution.</p>
        
        {isServerOnline && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-sm font-semibold text-rose-400">⚠️ Server is currently running. You must stop the server before performing destructive actions.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-destructive/20">
            <div>
              <h3 className="font-bold text-foreground">Reset World</h3>
              <p className="text-xs text-muted-foreground mt-1">Deletes all region chunks, player data, and advancements. The seed will be retained.</p>
            </div>
            <button 
              type="button"
              disabled={isServerOnline}
              onClick={() => setDangerModal('reset')}
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm font-bold text-rose-400 transition-colors hover:bg-destructive/20 hover:text-rose-300 disabled:opacity-50 disabled:hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="size-4" />
              Reset World
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/40 border border-destructive/20">
            <div>
              <h3 className="font-bold text-foreground">Delete Server</h3>
              <p className="text-xs text-muted-foreground mt-1">Permanently destroys the container, files, backups, and configuration.</p>
            </div>
            <button 
              type="button"
              disabled={isServerOnline}
              onClick={() => setDangerModal('delete')}
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-destructive/80 bg-destructive/20 px-5 py-3 text-sm font-bold text-rose-500 transition-colors hover:bg-destructive hover:text-white disabled:opacity-50 disabled:hover:bg-destructive/20 cursor-pointer"
            >
              <AlertTriangle className="size-4" />
              Delete Server
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {dangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-destructive/50 bg-[#140e36] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="size-5" />
                <h3 className="font-heading text-lg font-bold">
                  {dangerModal === 'reset' ? 'Reset World' : 'Delete Server'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => { setDangerModal(null); setDangerConfirm('') }} 
                className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {dangerModal === 'reset'
                ? 'This action cannot be undone. All blocks placed, world progress, and player inventory in this world will be permanently erased.'
                : 'This action cannot be undone. ALL server files, configurations, worlds, and local backups will be permanently deleted.'}
            </p>

            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 mb-4">
              <p className="text-xs font-semibold text-rose-400">
                Type <span className="font-mono font-bold text-white uppercase select-all">{dangerModal}</span> below to confirm:
              </p>
            </div>

            <input
              type="text"
              value={dangerConfirm}
              onChange={(e) => setDangerConfirm(e.target.value)}
              placeholder={`Type "${dangerModal}"`}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-destructive focus:outline-none focus:ring-1 focus:ring-destructive mb-6 transition-colors"
            />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setDangerModal(null); setDangerConfirm('') }}
                className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dangerConfirm.toLowerCase() !== dangerModal || processing}
                onClick={handleDangerAction}
                className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-bold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {processing && <Loader2 className="size-4 animate-spin" />}
                Confirm Destructive Action
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
