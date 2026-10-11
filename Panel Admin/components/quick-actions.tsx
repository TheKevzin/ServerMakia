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
  CloudLightning,
  Sparkles,
  Loader2,
} from 'lucide-react'

const serverActions = [
  { id: 'start', label: 'Start Server', icon: Play, tone: 'emerald' },
  { id: 'restart', label: 'Restart Server', icon: RotateCcw, tone: 'neon' },
  { id: 'stop', label: 'Stop Server', icon: Square, tone: 'destructive' },
] as const

const timeActions = [
  { id: 'day', label: 'Day', icon: Sun },
  { id: 'noon', label: 'Noon', icon: Sunset },
  { id: 'night', label: 'Night', icon: Moon },
  { id: 'midnight', label: 'Midnight', icon: MoonStar },
] as const

const weatherActions = [
  { id: 'clear', label: 'Clear Sky', icon: CloudSun },
  { id: 'rain', label: 'Rain', icon: CloudRain },
  { id: 'storm', label: 'Thunderstorm', icon: CloudLightning },
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
    <div className={cn("glass grid gap-6 rounded-3xl p-5 animate-enter", role === 'MODERATOR' ? 'lg:grid-cols-2' : 'lg:grid-cols-3')}>
      {/* Power Controls */}
      {role !== 'MODERATOR' && (
        <div className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Power Controls
            </h2>
            <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">Control</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {serverActions.map((a) => {
              const isLoading = actionLoading === a.id
              return (
                <button
                  key={a.id}
                  disabled={!!actionLoading}
                  onClick={() => handleServerAction(a.id)}
                  className={cn(
                    'tactile-btn group relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-[border-color,background-color,box-shadow,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-50',
                    a.tone === 'destructive'
                      ? 'border-rose-500/25 bg-rose-500/10 text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/20 hover:shadow-[0_0_16px_rgba(244,63,94,0.18)]'
                      : a.tone === 'emerald'
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:shadow-[0_0_16px_rgba(16,185,129,0.18)]'
                        : 'border-amber-500/25 bg-amber-500/10 text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/20 hover:shadow-[0_0_16px_rgba(245,158,11,0.18)]'
                  )}
                >
                  <div className="flex size-7 items-center justify-center rounded-xl bg-black/30 shrink-0">
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <a.icon className="size-4 group-hover:scale-110 transition-transform duration-150" />
                    )}
                  </div>
                  <span className="font-semibold">{isLoading ? 'Executing...' : a.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Time Control */}
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Time Control
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">Overworld</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {timeActions.map((a) => {
            const isActive = time === a.id
            return (
              <button
                key={a.id}
                onClick={() => setServerTime(a.id)}
                aria-pressed={isActive ? 'true' : 'false'}
                className={cn(
                  'tactile-btn relative flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3.5 text-xs font-medium transition-[border-color,background-color,box-shadow,color] duration-150',
                  isActive
                    ? 'border-primary/60 bg-primary/25 text-end-stone shadow-[0_0_16px_rgba(168,85,247,0.3)] ring-1 ring-primary/40'
                    : 'border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground hover:border-white/20'
                )}
              >
                <a.icon className={cn('size-5 transition-transform duration-150', isActive && 'scale-110')} />
                <span className="tracking-tight">{a.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 size-1 rounded-full bg-end-stone shadow-[0_0_6px_currentColor]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Weather Control */}
      <div className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Weather Control
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">Overworld</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {weatherActions.map((a) => {
            const isActive = weather === a.id
            return (
              <button
                key={a.id}
                onClick={() => setServerWeather(a.id)}
                aria-pressed={isActive ? 'true' : 'false'}
                className={cn(
                  'tactile-btn relative flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-xs font-medium transition-[border-color,background-color,box-shadow,color] duration-150',
                  isActive
                    ? 'border-primary/60 bg-primary/25 text-end-stone shadow-[0_0_16px_rgba(168,85,247,0.3)] ring-1 ring-primary/40'
                    : 'border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground hover:border-white/20'
                )}
              >
                <div className="flex size-7 items-center justify-center rounded-xl bg-black/25 shrink-0">
                  <a.icon className={cn('size-4 transition-transform duration-150', isActive && 'scale-110 text-end-stone')} />
                </div>
                <span className="flex-1 text-left font-medium tracking-tight">{a.label}</span>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-end-stone shadow-[0_0_6px_currentColor]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
