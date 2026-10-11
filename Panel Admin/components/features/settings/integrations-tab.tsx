'use client'

import { cn } from '@/lib/utils'
import { Send, Loader2, Save } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

type IntegrationsTabProps = {
  state: any
  updateState: (key: string, value: any) => void
  toggleStateItem: (key: string) => void
  testWebhook: () => void
  driveState: { enabled: boolean; folderId: string; serviceAccount: string }
  setDriveState: React.Dispatch<React.SetStateAction<{ enabled: boolean; folderId: string; serviceAccount: string }>>
  saveDriveSettings: () => void
  driveProcessing: boolean
}

export function IntegrationsTab({
  state,
  updateState,
  toggleStateItem,
  testWebhook,
  driveState,
  setDriveState,
  saveDriveSettings,
  driveProcessing,
}: IntegrationsTabProps) {
  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
      {/* Discord Webhook */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-6 border-b border-border pb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Discord Webhooks</h2>
          <p className="text-sm text-muted-foreground">Send server events automatically to your Discord server</p>
        </div>
        <div className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Webhook URL</span>
            <div className="flex gap-2">
              <input
                type="url"
                value={state.discordUrl}
                onChange={(e) => updateState('discordUrl', e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
              />
              <button 
                type="button"
                onClick={testWebhook}
                className="flex items-center gap-2 rounded-xl bg-indigo-500/20 px-4 py-3 text-sm font-bold text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30 transition-colors cursor-pointer"
              >
                <Send className="size-4" />
                Test
              </button>
            </div>
          </label>
        </div>
      </div>

      {/* RCON Configuration */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-6 border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">Remote Console (RCON)</h2>
            <p className="text-sm text-muted-foreground">Allow external tools to run commands on the server</p>
          </div>
          <Toggle
            enabled={Boolean(state.rconEnabled)}
            onChange={() => toggleStateItem('rconEnabled')}
            label="Enable RCON"
          />
        </div>
        <div className={cn("grid gap-6 sm:grid-cols-2 transition-opacity", !state.rconEnabled && "opacity-50 pointer-events-none")}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">RCON Port</span>
            <input
              type="number"
              value={state.rconPort}
              onChange={(e) => updateState('rconPort', e.target.value)}
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">RCON Password</span>
            <input
              type="password"
              value={state.rconPass}
              onChange={(e) => updateState('rconPass', e.target.value)}
              placeholder="Enter strong password"
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Google Drive Cloud Backups */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-6 border-b border-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">Google Drive Cloud Backups</h2>
            <p className="text-sm text-muted-foreground">Automatically upload server backups to the cloud</p>
          </div>
          <Toggle
            enabled={driveState.enabled}
            onChange={() => setDriveState(d => ({ ...d, enabled: !d.enabled }))}
            label="Enable Google Drive"
          />
        </div>
        <div className={cn("grid gap-6 transition-opacity", !driveState.enabled && "opacity-50 pointer-events-none")}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Folder ID</span>
            <input
              value={driveState.folderId}
              onChange={(e) => setDriveState(d => ({ ...d, folderId: e.target.value }))}
              placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">The unique ID of the Google Drive folder where backups will be stored. It must be shared with the Service Account email.</p>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Service Account JSON</span>
            <textarea
              value={driveState.serviceAccount}
              onChange={(e) => setDriveState(d => ({ ...d, serviceAccount: e.target.value }))}
              placeholder='{"type": "service_account", ...}'
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors min-h-[100px] font-mono text-xs"
            />
          </label>
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={saveDriveSettings}
              disabled={driveProcessing || (driveState.enabled && (!driveState.folderId || !driveState.serviceAccount))}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {driveProcessing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Drive Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
