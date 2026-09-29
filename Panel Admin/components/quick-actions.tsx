'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Play,
  RotateCcw,
  Square,
  Sun,
  Sunset,
  Moon,
  MoonStar,
  CloudSun,
  CloudRain,
  CloudLightning
} from 'lucide-react'

const serverActions = [
  { id: 'start', label: 'Start', icon: Play, tone: 'emerald' },
  { id: 'restart', label: 'Restart', icon: RotateCcw, tone: 'neon' },
  { id: 'stop', label: 'Stop', icon: Square, tone: 'destructive' },
] as const

const timeActions = [
  { id: 'day', label: 'Day', icon: Sun },
  { id: 'noon', label: 'Noon', icon: Sunset },
  { id: 'night', label: 'Night', icon: Moon },
  { id: 'midnight', label: 'Midnight', icon: MoonStar },
] as const

const weatherActions = [
  { id: 'clear', label: 'Clear', icon: CloudSun },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'storm', label: 'Storm', icon: CloudLightning },
] as const

export function QuickActions({ role }: { role?: string | null }) {
  const [time, setTime] = useState<string>('day')
  const [weather, setWeather] = useState<string>('clear')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const logAction = (msg: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('console-action', { detail: { command: msg } }))
    }
  }

  const handleServerAction = async (actionId: string) => {
    setActionLoading(actionId)
    try {
      if (actionId === 'start') {
        logAction('Starting Minecraft server...')
        await fetch('/api/server/start', { method: 'POST' })
      } else if (actionId === 'stop') {
        logAction('Stopping Minecraft server...')
        await fetch('/api/server/stop', { method: 'POST' })
      } else if (actionId === 'restart') {
        logAction('Restarting server...')
        await fetch('/api/server/stop', { method: 'POST' })
        setTimeout(async () => {
          await fetch('/api/server/start', { method: 'POST' })
        }, 5000)
      }
    } finally {
      setTimeout(() => setActionLoading(null), 1500)
    }
  }

  const setServerTime = async (id: string) => {
    setTime(id)
    logAction(`Executing: /time set ${id}`)
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `time set ${id}` })
    })
  }

  const setServerWeather = async (id: string) => {
    setWeather(id)
    const cmd = id === 'storm' ? 'thunder' : id
    logAction(`Executing: /weather ${cmd}`)
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `weather ${cmd}` })
    })
  }

  return (
    <div className={cn("glass grid gap-6 rounded-3xl p-5", role === 'MODERATOR' ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
      {/* Power Controls */}
      {role !== 'MODERATOR' && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Power Controls
            </h2>
            <span className="text-xs text-muted-foreground">Server state</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {serverActions.map((a) => {
              const isLoading = actionLoading === a.id
              return (
                <button
                  key={a.id}
                  disabled={!!actionLoading}
                  onClick={() => handleServerAction(a.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed',
                    a.tone === 'destructive'
                      ? 'border-destructive/30 bg-destructive/10 text-rose-300 hover:bg-destructive/20'
                      : a.tone === 'emerald'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : a.tone === 'neon'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
                  )}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <a.icon className={cn("size-4", isLoading && "animate-spin")} />
                    <span>{isLoading ? 'Executing...' : a.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Time Control */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Time Control
          </h2>
          <span className="text-xs text-muted-foreground">Overworld</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {timeActions.map((a) => {
            const isActive = time === a.id
            return (
              <button
                key={a.id}
                onClick={() => setServerTime(a.id)}
                aria-pressed={isActive ? 'true' : 'false'}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-xs font-medium transition-all active:scale-95',
                  isActive
                    ? 'neon-ring border-primary/50 bg-primary/25 text-end-stone'
                    : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
                )}
              >
                <a.icon className="size-5" />
                {a.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Weather Control */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Weather Control
          </h2>
          <span className="text-xs text-muted-foreground">Overworld</span>
        </div>
        <div className="flex flex-col gap-3">
          {weatherActions.map((a) => {
            const isActive = weather === a.id
            return (
              <button
                key={a.id}
                onClick={() => setServerWeather(a.id)}
                aria-pressed={isActive ? 'true' : 'false'}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all active:scale-95',
                  isActive
                    ? 'neon-ring border-primary/50 bg-primary/25 text-end-stone'
                    : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
                )}
              >
                <a.icon className="size-5" />
                {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
