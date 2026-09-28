'use client'

import { cn } from '@/lib/utils'
import { type Player } from '@/lib/data'
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
import { useEffect } from 'react'

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
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-end-stone">
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
        <span className="tabular-nums text-foreground">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${(value / max) * 100}%` }}
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
  onKick: (id: string) => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} profile`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="glass-strong relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl border sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center gap-4 border-b border-border p-5">
          <img
            src={player.avatar || '/placeholder.svg'}
            alt={`${player.name} avatar`}
            className="neon-ring size-16 shrink-0 rounded-2xl border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-xl font-semibold text-foreground">
                {player.name}
              </h2>
              <span className="rounded-md border border-primary/40 bg-primary/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-end-stone">
                {player.role}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {player.lastSeen} · {player.gamemode}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Health & food bars */}
          <div className="flex flex-col gap-3">
            <Bar label="Health" icon={Heart} value={player.health} max={20} color="bg-rose-400" />
            <Bar label="Hunger" icon={Drumstick} value={player.food} max={20} color="bg-amber-400" />
          </div>

          {/* Location */}
          <div className="glass flex items-center justify-between rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-end-stone" />
              {player.dimension}
            </div>
            <code className="rounded-lg bg-white/5 px-2 py-1 font-mono text-xs text-end-stone">
              {player.coords.x}, {player.coords.y}, {player.coords.z}
            </code>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatPill icon={Star} label="XP Level" value={player.xpLevel} />
            <StatPill icon={Clock} label="Playtime" value={player.playtime} />
            <StatPill icon={Skull} label="Deaths" value={player.deaths} />
            <StatPill icon={Swords} label="Mob Kills" value={player.mobKills.toLocaleString()} />
            <StatPill icon={Pickaxe} label="Blocks Mined" value={player.blocksMined.toLocaleString()} />
            <StatPill icon={CalendarDays} label="Joined" value={player.joined} />
          </div>

          {/* Inventory */}
          <div>
            <p className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
              <Package className="size-4 text-end-stone" />
              Inventory
            </p>
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {player.inventory.map((slot) => (
                <li
                  key={slot.item}
                  className="flex items-center justify-between bg-white/[0.02] px-4 py-2.5 text-sm"
                >
                  <span className="text-foreground">{slot.item}</span>
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium tabular-nums text-end-stone">
                    x{slot.qty}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card/60 p-5 backdrop-blur">
          <button
            onClick={() => {
              onKick(player.id)
              onClose()
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-destructive/20"
          >
            <LogOut className="size-4" />
            Kick
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-destructive/25">
            <Ban className="size-4" />
            Ban
          </button>
        </div>
      </div>
    </div>
  )
}
