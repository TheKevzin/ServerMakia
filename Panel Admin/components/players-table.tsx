'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Wifi, Search, ChevronRight, X, UserX, Sparkles } from 'lucide-react'
import { type Player } from '@/types'
import { PlayerProfileModal } from '@/components/player-profile-modal'
import { usePlayers } from '@/lib/hooks'

export type { Player }

function latencyColor(ms: number) {
  if (ms < 60) return 'text-emerald-400'
  if (ms < 120) return 'text-amber-300'
  return 'text-rose-400'
}

export function PlayersTable({
  className,
  role,
  onSelectPlayer,
}: {
  className?: string
  role?: string | null
  onSelectPlayer?: (playerName: string) => void
}) {
  const { players, refresh } = usePlayers(5000)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [query, setQuery] = useState('')

  const kickPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `kick ${name} Expulsado por el administrador` })
    })
    refresh()
  }

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  const activeCount = filtered.filter(p => p.isActive).length

  return (
    <div className={cn("glass animate-enter flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-xl", className)}>
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Jugadores en Línea
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-end-stone shadow-[0_0_8px_rgba(168,85,247,0.2)]">
            <span className={cn("size-1.5 rounded-full", activeCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground")} />
            {activeCount}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 transition-[border-color,background-color] duration-150 focus:border-primary/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-primary/40 sm:w-56"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="tactile-btn absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              title="Limpiar búsqueda"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[16rem] max-h-[22rem] custom-scrollbar">
        <ul className="divide-y divide-white/[0.05]">
          {filtered.map((p) => (
            <li
              key={p.id}
              onClick={() => {
                if (onSelectPlayer) {
                  onSelectPlayer(p.name)
                } else {
                  setSelectedPlayer(p)
                }
              }}
              className={cn(
                "group flex items-center gap-4 px-5 py-3.5 cursor-pointer select-none",
                "transition-[background-color,transform] duration-150 ease-out hover:bg-white/[0.04] active:scale-[0.985]",
                !p.isActive && "opacity-55 grayscale hover:opacity-85"
              )}
              title="Haz clic para ver estadísticas e inventario"
            >
              <div className="relative size-10 shrink-0">
                <img
                  src={p.avatar || `https://mc-heads.net/avatar/${p.name}`}
                  alt={`${p.name} avatar`}
                  className="size-10 rounded-xl border border-white/10 object-cover shadow-sm transition-[border-color,transform] duration-150 group-hover:border-primary/40 group-hover:scale-105"
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-[#120914]",
                    p.isActive ? "bg-emerald-400" : "bg-neutral-500"
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground tracking-tight transition-colors duration-150 group-hover:text-end-stone">
                    {p.name}
                  </p>
                  {p.role === 'Admin' && (
                    <span className="rounded-md border border-primary/30 bg-primary/20 px-1.5 py-0.2 text-[10px] font-semibold text-end-stone">
                      OP
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-0.5">
                  {p.playtime || 'En línea'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {p.isActive ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-black/20 px-2 py-1">
                    <Wifi className={cn('size-3.5', latencyColor(p.latency))} />
                    <span className={cn('text-xs font-mono font-medium tabular-nums', latencyColor(p.latency))}>
                      {p.latency}ms
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">Desconectado</span>
                )}
                <ChevronRight className="size-4 text-muted-foreground/40 transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:text-end-stone" />
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
              <UserX className="size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No se encontraron jugadores.
              </p>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="tactile-btn mt-1 text-xs text-end-stone hover:underline"
                >
                  Limpiar filtro de búsqueda
                </button>
              )}
            </li>
          )}
        </ul>
      </div>

      {selectedPlayer && (
        <PlayerProfileModal
          player={players.find((p) => p.id === selectedPlayer.id) || selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onKick={kickPlayer}
        />
      )}
    </div>
  )
}
