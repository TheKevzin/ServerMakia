'use client'

import { cn } from '@/lib/utils'
import { settingGroups } from '@/lib/data'
import { useState, useEffect } from 'react'
import { Save, RotateCcw, Trash2, Settings, Globe, Cpu, Link2, AlertTriangle, X, Loader2, Send } from 'lucide-react'
import { toast } from '@/lib/toast'

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        enabled
          ? 'neon-ring border-primary/50 bg-primary'
          : 'border-border bg-white/10',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-foreground shadow-sm transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export function SettingsView() {
  // Tabs
  const [activeTab, setActiveTab] = useState('general')

  // Initial State Data
  const initialToggles: Record<string, boolean> = {}
  settingGroups.forEach((g) => g.items.forEach((i) => (initialToggles[i.id] = i.enabled)))

  const initialState = {
    toggles: initialToggles,
    maxPlayers: '40',
    serverPort: '25565',
    motd: 'ServerMakia — Fabric 1.21.11 SMP',
    difficulty: 'hard',
    gamemode: 'survival',
    viewDistance: '10',
    simDistance: '10',
    ramMin: '6G',
    ramMax: '8G',
    javaVer: '21',
    nativeTransport: true,
    discordUrl: '',
    rconEnabled: false,
    rconPort: '25575',
    rconPass: ''
  }

  const [state, setState] = useState<any>(null)
  const [savedState, setSavedState] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Drive state
  const [driveState, setDriveState] = useState({ enabled: false, folderId: '', serviceAccount: '' })
  const [driveProcessing, setDriveProcessing] = useState(false)
  const [dangerModal, setDangerModal] = useState<'reset' | 'delete' | null>(null)
  const [dangerConfirm, setDangerConfirm] = useState('')
  const [processing, setProcessing] = useState(false)

  const [isServerOnline, setIsServerOnline] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setState(data)
          setSavedState(data)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    fetch('/api/settings/drive')
      .then(res => res.json())
      .then(data => {
        if (!data.error && data.enabled) {
          setDriveState({ enabled: true, folderId: data.folderId, serviceAccount: data.serviceAccount || '' })
        }
      })

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

  // Check if dirty whenever state changes
  useEffect(() => {
    if (state && savedState) {
      const dirty = JSON.stringify(state) !== JSON.stringify(savedState)
      setIsDirty(dirty)
    }
  }, [state, savedState])

  const toggleGroupItem = (id: string) =>
    setState((prev: any) => ({ ...prev, toggles: { ...prev.toggles, [id]: !prev.toggles[id] } }))

  const toggleStateItem = (field: string) =>
    setState((prev: any) => ({ ...prev, [field]: !prev[field] }))

  const updateState = (field: string, value: string) => {
    setState((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      })
      setSavedState(state)
      setIsDirty(false)
    } catch (e) {
      console.error('Failed to save settings', e)
    }
  }

  const handleReset = () => {
    setState(savedState)
    setIsDirty(false)
  }

  const executeDanger = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = dangerModal === 'reset' ? 'RESET' : 'DELETE'
    if (dangerConfirm !== target) return
    setProcessing(true)

    try {
      const res = await fetch('/api/server/danger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: dangerModal })
      });
      if (res.ok) {
        if (dangerModal === 'delete') {
          toast.success('Server deleted successfully.');
        } else {
          toast.success('World reset successfully.');
        }
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to execute danger action');
    }

    setProcessing(false)
    setDangerModal(null)
    setDangerConfirm('')
  }

  const testWebhook = async () => {
    if (!state.discordUrl) return;
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: state.discordUrl })
      });
      if (res.ok) {
        toast.success('Test message sent to Discord!');
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to send test message');
    }
  }

  const saveDriveSettings = async () => {
    setDriveProcessing(true)
    try {
      const res = await fetch('/api/settings/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveState.enabled ? { folderId: driveState.folderId, serviceAccount: driveState.serviceAccount } : { action: 'disable' })
      })
      if (res.ok) {
        toast.success(driveState.enabled ? 'Google Drive configured!' : 'Google Drive sync disabled')
      } else {
        const data = await res.json()
        toast.error(`Error: ${data.error}`)
      }
    } catch (e) {
      toast.error('Failed to save Drive settings')
    }
    setDriveProcessing(false)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'rules', label: 'World Rules', icon: Globe },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative min-h-[500px] pb-24">
      {isLoading || !state ? (
        <div className="flex w-full items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
      {/* Sidebar Tabs */}
      <div className="flex flex-col gap-2 lg:w-64 shrink-0">
        <h2 className="font-heading text-lg font-bold text-foreground mb-2 px-2">Settings</h2>
        <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap",
                activeTab === t.id 
                  ? t.danger 
                    ? "bg-destructive/20 text-rose-400 border border-destructive/50" 
                    : "bg-primary/20 text-end-stone border border-primary/50"
                  : "text-muted-foreground hover:bg-white/5 border border-transparent hover:text-foreground"
              )}
            >
              <t.icon className="size-4" />
              <span className="text-sm font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-4xl">
        {isServerOnline && activeTab !== 'danger' && (
          <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 animate-in fade-in">
            <p className="text-sm font-semibold text-sky-400 flex items-center gap-2">
              <AlertTriangle className="size-4" /> 
              Nota: El servidor está en línea. Los cambios de configuración se aplicarán en el próximo reinicio.
            </p>
          </div>
        )}
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="glass rounded-3xl p-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
            <div className="mb-6 border-b border-border pb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">Server Properties</h2>
              <p className="text-sm text-muted-foreground">Core configuration applied on next restart</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-end-stone/90">Message of the Day</span>
                <input
                  value={state.motd}
                  onChange={(e) => updateState('motd', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Server Port</span>
                <input
                  type="number"
                  value={state.serverPort}
                  onChange={(e) => updateState('serverPort', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Max Players</span>
                <input
                  type="number"
                  value={state.maxPlayers}
                  onChange={(e) => updateState('maxPlayers', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Difficulty</span>
                <select
                  value={state.difficulty}
                  onChange={(e) => updateState('difficulty', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="peaceful">Peaceful</option>
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Default Gamemode</span>
                <select
                  value={state.gamemode}
                  onChange={(e) => updateState('gamemode', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="survival">Survival</option>
                  <option value="creative">Creative</option>
                  <option value="adventure">Adventure</option>
                  <option value="spectator">Spectator</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">View Distance (Chunks)</span>
                <input
                  type="number"
                  min="2"
                  max="32"
                  value={state.viewDistance}
                  onChange={(e) => updateState('viewDistance', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Simulation Distance (Chunks)</span>
                <input
                  type="number"
                  min="2"
                  max="32"
                  value={state.simDistance}
                  onChange={(e) => updateState('simDistance', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                />
              </label>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 transition-opacity">
            {settingGroups.map((g) => (
              <div key={g.group} className="glass flex flex-col rounded-3xl h-fit">
                <div className="border-b border-border p-5">
                  <h2 className="font-heading text-sm font-semibold text-foreground">{g.group}</h2>
                </div>
                <ul className="divide-y divide-border">
                  {g.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-foreground mb-1">{item.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                      <Toggle enabled={state.toggles[item.id]} onChange={() => toggleGroupItem(item.id)} label={item.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="glass rounded-3xl p-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
            <div className="mb-6 border-b border-border pb-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">Performance & JVM Flags</h2>
              <p className="text-sm text-muted-foreground">Adjust memory allocation and Java settings</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Java Version</span>
                <select
                  value={state.javaVer}
                  onChange={(e) => updateState('javaVer', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="17">Java 17 (LTS)</option>
                  <option value="21">Java 21 (LTS) - Recommended</option>
                  <option value="22">Java 22</option>
                </select>
              </label>
              
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-white/5 mt-[28px]">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-bold text-foreground">Native Transport</p>
                  <p className="text-xs text-muted-foreground">Uses Epoll (Linux only) for faster networking</p>
                </div>
                <Toggle enabled={state.nativeTransport} onChange={() => toggleStateItem('nativeTransport')} label="Native Transport" />
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Min RAM (Xms)</span>
                <select
                  value={state.ramMin}
                  onChange={(e) => updateState('ramMin', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="2G">2 GB</option>
                  <option value="4G">4 GB</option>
                  <option value="6G">6 GB</option>
                  <option value="8G">8 GB</option>
                  <option value="10G">10 GB</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-end-stone/90">Max RAM (Xmx)</span>
                <select
                  value={state.ramMax}
                  onChange={(e) => updateState('ramMax', e.target.value)}
                  className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
                >
                  <option value="4G">4 GB</option>
                  <option value="6G">6 GB</option>
                  <option value="8G">8 GB</option>
                  <option value="10G">10 GB</option>
                  <option value="12G">12 GB</option>
                </select>
              </label>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary/80 font-mono">Aikar's flags are automatically injected on boot based on the RAM allocation to optimize garbage collection.</p>
            </div>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
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
                      onClick={testWebhook}
                      className="flex items-center gap-2 rounded-xl bg-indigo-500/20 px-4 py-3 text-sm font-bold text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30 transition-colors"
                    >
                      <Send className="size-4" />
                      Test
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="mb-6 border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">Remote Console (RCON)</h2>
                  <p className="text-sm text-muted-foreground">Allow external tools to run commands on the server</p>
                </div>
                <Toggle enabled={state.rconEnabled} onChange={() => toggleStateItem('rconEnabled')} label="Enable RCON" />
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

            <div className="glass rounded-3xl p-6 mt-6">
              <div className="mb-6 border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">Google Drive Cloud Backups</h2>
                  <p className="text-sm text-muted-foreground">Automatically upload server backups to the cloud</p>
                </div>
                <Toggle enabled={driveState.enabled} onChange={() => setDriveState(d => ({ ...d, enabled: !d.enabled }))} label="Enable Google Drive" />
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
                    onClick={saveDriveSettings}
                    disabled={driveProcessing || (driveState.enabled && (!driveState.folderId || !driveState.serviceAccount))}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {driveProcessing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Drive Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
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
                  disabled={isServerOnline}
                  onClick={() => setDangerModal('reset')}
                  className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-3 text-sm font-bold text-rose-400 transition-colors hover:bg-destructive/20 hover:text-rose-300 disabled:opacity-50 disabled:hover:bg-destructive/10"
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
                  disabled={isServerOnline}
                  onClick={() => setDangerModal('delete')}
                  className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-destructive/80 bg-destructive/20 px-5 py-3 text-sm font-bold text-rose-500 transition-colors hover:bg-destructive hover:text-white disabled:opacity-50 disabled:hover:bg-destructive/20"
                >
                  <AlertTriangle className="size-4" />
                  Delete Server
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* STICKY SAVE BAR */}
      {isDirty && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="glass flex flex-col sm:flex-row items-center justify-between gap-4 rounded-full p-3 pl-6 border-2 border-primary/40 shadow-[0_10px_40px_-10px_rgba(98,6,191,0.5)]">
            <p className="text-sm font-semibold text-foreground">
              You have unsaved changes.
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleReset}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                Reset
              </button>
              <button 
                onClick={handleSave}
                className="neon-ring flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full border border-primary/50 bg-primary px-6 py-2.5 text-sm font-bold text-end-stone transition-colors hover:bg-primary/80"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANGER MODAL */}
      {dangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-destructive/50 bg-[#1a0f14] p-6 shadow-[0_0_50px_rgba(225,29,72,0.15)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20 text-rose-500">
                <AlertTriangle className="size-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-rose-500">
                {dangerModal === 'reset' ? 'RESET WORLD' : 'DELETE SERVER'}
              </h3>
            </div>
            
            <p className="text-sm text-foreground/80 mb-6 mt-4">
              {dangerModal === 'reset' 
                ? "This will wipe all player progress, builds, and inventory. The seed will remain the same. This action cannot be undone."
                : "This will permanently destroy the entire server, including all backups and files. This action cannot be undone."}
            </p>

            <form onSubmit={executeDanger} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-foreground">
                  Type <strong className="text-rose-500">{dangerModal === 'reset' ? 'RESET' : 'DELETE'}</strong> to confirm
                </label>
                <input 
                  type="text" 
                  value={dangerConfirm}
                  onChange={(e) => setDangerConfirm(e.target.value)}
                  placeholder={dangerModal === 'reset' ? 'RESET' : 'DELETE'}
                  className="rounded-xl border border-destructive/50 bg-black/40 px-4 py-3 text-sm text-rose-400 outline-none focus:border-rose-500 transition-colors font-mono"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setDangerModal(null); setDangerConfirm('') }} className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={dangerConfirm !== (dangerModal === 'reset' ? 'RESET' : 'DELETE') || processing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:hover:opacity-40"
                >
                  {processing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  {processing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
        </>
      )}
    </div>
  )
}
