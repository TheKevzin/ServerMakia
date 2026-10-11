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
  Shield,
  Sparkles,
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
    if (!confirm(`¿Estás seguro de que deseas banear a ${player.name} del servidor?`)) return
    setIsBanning(true)
    try {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: `ban ${player.name} Baneado por el administrador` })
      })
      toast.success(`El jugador ${player.name} ha sido baneado.`)
      onClose()
    } catch {
      toast.error(`Error al banear a ${player.name}`)
    }
    setIsBanning(false)
  }

  const isOnline = player.lastSeen?.toLowerCase().includes('online') || player.lastSeen?.toLowerCase().includes('en línea')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${player.name}`}
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
            aria-label="Cerrar perfil"
            title="Cerrar perfil"
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-white/5 text-muted-foreground transition-colors hover:text-foreground hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Health & food bars */}
          <div className="flex flex-col gap-3">
            <Bar label="Salud" icon={Heart} value={player.health ?? 20} max={20} color="bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <Bar label="Hambre" icon={Drumstick} value={player.food ?? 20} max={20} color="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
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
            <StatPill icon={Star} label="Nivel de XP" value={player.xpLevel ?? 0} />
            <StatPill icon={Clock} label="Tiempo Jugado" value={player.playtime || '0m'} />
            <StatPill icon={Skull} label="Muertes" value={player.deaths ?? 0} />
            <StatPill icon={Swords} label="Mobs Eliminados" value={(player.mobKills ?? 0).toLocaleString()} />
            <StatPill icon={Pickaxe} label="Bloques Minados" value={(player.blocksMined ?? 0).toLocaleString()} />
            <StatPill icon={CalendarDays} label="Primera Conexión" value={player.joined || 'Reciente'} />
          </div>

          {/* Equipment / Armor */}
          {player.equipment && (
            <div>
              <p className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Shield className="size-4 text-primary" />
                Equipamiento y Armadura
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: 'head', label: 'Casco', item: player.equipment.head },
                  { key: 'chest', label: 'Pechera', item: player.equipment.chest },
                  { key: 'legs', label: 'Pantalones', item: player.equipment.legs },
                  { key: 'feet', label: 'Botas', item: player.equipment.feet },
                  { key: 'offhand', label: 'Mano Sec.', item: player.equipment.offhand },
                ].map(({ key, label, item }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center relative transition-all min-h-[92px]",
                      item
                        ? "bg-white/[0.04] border-primary/40 hover:bg-white/[0.07]"
                        : "bg-white/[0.01] border-white/5 opacity-60"
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      {label}
                    </span>
                    {item ? (
                      <>
                        <div className="relative size-8 flex items-center justify-center">
                          <img
                            src={item.textureUrl}
                            alt={item.item}
                            className="size-7 object-contain drop-shadow"
                            onError={(e) => {
                              const t = e.currentTarget
                              if (!t.src.includes('/block/') && item.id) {
                                t.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${item.id.replace(/^minecraft:/, '')}.png`
                              }
                            }}
                          />
                          {item.isEnchanted && (
                            <Sparkles className="size-3 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                          )}
                        </div>
                        <p className={cn("text-[11px] font-semibold truncate w-full mt-1", item.isEnchanted ? "text-purple-300 font-bold" : "text-foreground")}>
                          {item.item}
                        </p>
                        {item.enchantments && item.enchantments.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 justify-center mt-1 max-w-full">
                            {item.enchantments.slice(0, 2).map((ench, ei) => (
                              <span key={ei} className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-[80px]">
                                {ench}
                              </span>
                            ))}
                            {item.enchantments.length > 2 && (
                              <span className="text-[8px] text-muted-foreground">+{item.enchantments.length - 2}</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 py-2">— Vacío —</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <Package className="size-4 text-primary" />
                Inventario Actual
              </p>
              <span className="text-xs text-muted-foreground">
                {player.inventory?.filter(s => s.qty > 0 && s.item !== 'Inventario vacío').length || 0} objetos
              </span>
            </div>
            
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border max-h-56 overflow-y-auto custom-scrollbar">
              {player.inventory && player.inventory.length > 0 && player.inventory[0].qty > 0 && player.inventory[0].item !== 'Inventario vacío' ? (
                player.inventory.map((slot, i) => (
                  <li
                    key={`${slot.item}-${i}`}
                    className="flex items-center justify-between gap-3 bg-white/[0.02] px-4 py-2 text-xs transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {slot.textureUrl ? (
                        <div className="relative size-7 shrink-0 flex items-center justify-center rounded-lg bg-black/40 border border-white/5">
                          <img
                            src={slot.textureUrl}
                            alt={slot.item}
                            className="size-5 object-contain"
                            onError={(e) => {
                              const t = e.currentTarget
                              if (!t.src.includes('/block/') && slot.id) {
                                t.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${slot.id.replace(/^minecraft:/, '')}.png`
                              }
                            }}
                          />
                          {slot.isEnchanted && (
                            <Sparkles className="size-2.5 text-purple-400 absolute -top-1 -right-1" />
                          )}
                        </div>
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        <span className={cn("font-medium truncate max-w-[260px]", slot.isEnchanted ? "text-purple-300 font-semibold" : "text-foreground")}>
                          {slot.item}
                        </span>
                        {slot.enchantments && slot.enchantments.length > 0 && (
                          <span className="text-[10px] text-purple-400/90 truncate max-w-[260px]">
                            ✦ {slot.enchantments.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="rounded-md bg-primary/20 border border-primary/30 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary shrink-0">
                      x{slot.qty}
                    </span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                  El inventario está vacío
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
            className="tactile-btn flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-[border-color,background-color,transform] duration-150 hover:bg-rose-500/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOut className="size-4" />
            Expulsar (Kick)
          </button>
          <button
            onClick={handleBan}
            disabled={isBanning}
            className="tactile-btn flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/20 px-4 py-2.5 text-sm font-medium text-rose-200 transition-[border-color,background-color,transform] duration-150 hover:bg-rose-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            <Ban className="size-4" />
            {isBanning ? 'Baneando...' : 'Banear Jugador'}
          </button>
        </div>
      </div>
    </div>
  )
}
