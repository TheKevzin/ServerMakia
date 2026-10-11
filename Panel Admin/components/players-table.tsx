'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Wifi, Search, ChevronRight } from 'lucide-react'
import { type Player } from '@/types'
import { PlayerProfileModal } from '@/components/player-profile-modal'

export type { Player }

function latencyColor(ms: number) {
  if (ms < 60) return 'text-emerald-300'
  if (ms < 120) return 'text-end-stone'
  return 'text-rose-300'
}

import { usePlayers } from '@/lib/hooks'

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
      body: JSON.stringify({ command: `kick ${name} Kicked by admin` })
    })
    refresh()
  }

  const banPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `ban ${name} Banned by admin` })
    })
    refresh()
  }

  const changeRole = async (name: string, newRole: Player['role']) => {
    if (newRole === 'Admin') {
      await fetch('/api/server/rcon', { method: 'POST', body: JSON.stringify({ command: `op ${name}` }) })
    } else {
      await fetch('/api/server/rcon', { method: 'POST', body: JSON.stringify({ command: `deop ${name}` }) })
    }
    refresh()
  }

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className={cn("glass animate-enter flex flex-col rounded-3xl overflow-hidden", className)}>
      <div className="flex flex-col gap-3 border-b border-border/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Online Players
          </h2>
          <span className="rounded-full bg-primary/25 px-2 py-0.5 text-xs font-medium text-end-stone">
            {filtered.filter(p => p.isActive).length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-xl border border-border/60 bg-white/5 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 sm:w-56 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[16rem] max-h-[22rem] custom-scrollbar">
        <ul className="divide-y divide-border/40">
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
                "group flex items-center gap-4 px-5 py-3.5 transition-[background-color,transform] duration-150 ease-out cursor-pointer hover:bg-white/[0.06] active:scale-[0.99] select-none",
                !p.isActive && "opacity-50 grayscale hover:opacity-80"
              )}
              title="Click to view player stats & inventory"
            >
              <img
                src={p.avatar || '/placeholder.svg'}
                alt={`${p.name} avatar`}
                className="size-10 shrink-0 rounded-xl border border-border object-cover group-hover:border-primary/40 transition-colors"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.playtime}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {p.isActive ? (
                  <div className="flex items-center gap-1.5">
                    <Wifi className={cn('size-4', latencyColor(p.latency))} />
                    <span className={cn('text-sm tabular-nums', latencyColor(p.latency))}>
                      {p.latency}ms
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No players found.
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
