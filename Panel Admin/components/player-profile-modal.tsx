'use client'

import { cn } from '@/lib/utils'
import { type Player } from '@/types'
import {
  X,
  Heart,
  Drumstick,
  Star,
  MapPin,
  Skull,
  Pickaxe,
  Swords,
  Clock,
  CalendarDays,
  Package,
  LogOut,
  Ban,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart
  label: string
  value: string | number
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-3">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-end-stone shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-heading text-base font-semibold text-foreground">
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function Bar({
  label,
  icon: Icon,
  value,
  max,
  color,
}: {
  label: string
  icon: typeof Heart
  value: number
  max: number
  color: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="tabular-nums font-medium text-foreground">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
        />
      </div>
    </div>
  )
}

export function PlayerProfileModal({
  player,
  onClose,
  onKick,
}: {
  player: Player
  onClose: () => void
  onKick: (name: string) => void
}) {
  const [isBanning, setIsBanning] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleBan = async () => {
    if (!confirm(`Are you sure you want to ban ${player.name} from the server?`)) return
    setIsBanning(true)
    try {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: `ban ${player.name} Banned by admin via web panel` })
      })
      toast.success(`Player ${player.name} has been banned.`)
      onClose()
    } catch {
      toast.error(`Failed to ban ${player.name}`)
    }
    setIsBanning(false)
  }

  const isOnline = player.lastSeen?.toLowerCase().includes('online')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} profile`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-md sm:items-center sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="glass-strong relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto custom-scrollbar rounded-t-3xl border border-primary/20 sm:rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center gap-4 border-b border-border p-5">
          <img
            src={player.avatar || `https://mc-heads.net/avatar/${player.name}/100`}
            alt={`${player.name} avatar`}
            className="neon-ring size-16 shrink-0 rounded-2xl border border-border object-cover bg-black/40"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-xl font-semibold text-foreground">
                {player.name}
              </h2>
              <span className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                player.role === 'Admin' ? 'border-primary/40 bg-primary/25 text-end-stone' : 'border-border bg-white/5 text-muted-foreground'
              )}>
                {player.role}
              </span>
            </div>
            <p className={cn(
              "mt-0.5 flex items-center gap-1.5 text-xs font-medium",
              isOnline ? "text-emerald-400" : "text-muted-foreground"
            )}>
              <span className={cn(
                "size-2 rounded-full shrink-0",
                isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" : "bg-white/20"
              )} />
              {player.lastSeen} · {player.gamemode}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-white/5 text-muted-foreground transition-colors hover:text-foreground hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Health & food bars */}
          <div className="flex flex-col gap-3">
            <Bar label="Health" icon={Heart} value={player.health ?? 20} max={20} color="bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <Bar label="Hunger" icon={Drumstick} value={player.food ?? 20} max={20} color="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>

          {/* Location */}
          <div className="glass flex items-center justify-between rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              <span className="font-medium text-foreground">{player.dimension || 'Overworld'}</span>
            </div>
            <code className="rounded-lg bg-white/5 border border-border px-2.5 py-1 font-mono text-xs text-primary">
              X: {player.coords?.x ?? 0}, Y: {player.coords?.y ?? 64}, Z: {player.coords?.z ?? 0}
            </code>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatPill icon={Star} label="XP Level" value={player.xpLevel ?? 0} />
            <StatPill icon={Clock} label="Playtime" value={player.playtime || '0m'} />
            <StatPill icon={Skull} label="Deaths" value={player.deaths ?? 0} />
            <StatPill icon={Swords} label="Mob Kills" value={(player.mobKills ?? 0).toLocaleString()} />
            <StatPill icon={Pickaxe} label="Blocks Mined" value={(player.blocksMined ?? 0).toLocaleString()} />
            <StatPill icon={CalendarDays} label="First Seen" value={player.joined || 'Recent'} />
          </div>

          {/* Inventory */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Package className="size-4 text-primary" />
                Current Inventory
              </p>
              <span className="text-xs text-muted-foreground">
                {player.inventory?.filter(s => s.qty > 0).length || 0} items
              </span>
            </div>
            
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border max-h-56 overflow-y-auto custom-scrollbar">
              {player.inventory && player.inventory.length > 0 && player.inventory[0].qty > 0 ? (
                player.inventory.map((slot, i) => (
                  <li
                    key={`${slot.item}-${i}`}
                    className="flex items-center justify-between bg-white/[0.02] px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="font-medium text-foreground truncate max-w-[280px]">{slot.item}</span>
                    <span className="rounded-md bg-primary/20 border border-primary/30 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary shrink-0">
                      x{slot.qty}
                    </span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Inventory is empty
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card/80 p-5 backdrop-blur-md">
          <button
            onClick={() => {
              onKick(player.name)
              onClose()
            }}
            disabled={!isOnline}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOut className="size-4" />
            Kick Player
          </button>
          <button
            onClick={handleBan}
            disabled={isBanning}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/50 bg-destructive/20 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-destructive/30 disabled:opacity-50"
          >
            <Ban className="size-4" />
            {isBanning ? 'Banning...' : 'Ban Player'}
          </button>
        </div>
      </div>
    </div>
  )
}
