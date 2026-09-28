'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Wifi, LogOut, Search, Ban } from 'lucide-react'


export type Player = {
  id: string
  name: string
  avatar: string
  role: 'Member' | 'Mod' | 'Admin'
  playtime: string
  latency: number
  isActive?: boolean
}

function latencyColor(ms: number) {
  if (ms < 60) return 'text-emerald-300'
  if (ms < 120) return 'text-end-stone'
  return 'text-rose-300'
}

function roleBadge(role: Player['role']) {
  switch (role) {
    case 'Admin':
      return 'bg-primary/25 text-end-stone border-primary/40'
    case 'Mod':
      return 'bg-[#b06bf0]/20 text-[#d8b8f7] border-[#b06bf0]/30'
    default:
      return 'bg-white/5 text-muted-foreground border-border'
  }
}

export function PlayersTable({ className, role }: { className?: string; role?: string | null }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/server/players')
        const data = await res.json()
        if (data.players) {
          setPlayers(data.players)
        }
      } catch (e) {}
    }

    const interval = setInterval(fetchPlayers, 3000)
    fetchPlayers()
    return () => clearInterval(interval)
  }, [])

  const kickPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `kick ${name} Kicked by admin` })
    })
    setPlayers((prev) => prev.filter((x) => x.name !== name))
  }

  const banPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `ban ${name} Banned by admin` })
    })
    setPlayers((prev) => prev.filter((x) => x.name !== name))
  }

  const changeRole = async (name: string, newRole: Player['role']) => {
    if (newRole === 'Admin') {
      await fetch('/api/server/rcon', { method: 'POST', body: JSON.stringify({ command: `op ${name}` }) })
    } else {
      await fetch('/api/server/rcon', { method: 'POST', body: JSON.stringify({ command: `deop ${name}` }) })
    }
    setPlayers(prev => prev.map(p => p.name === name ? { ...p, role: newRole } : p))
  }

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className={cn("glass flex flex-col rounded-3xl overflow-hidden", className)}>
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
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
            className="w-full rounded-xl border border-border bg-white/5 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 sm:w-56"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[16rem] max-h-[22rem]">
        <ul className="divide-y divide-border">
          {filtered.map((p) => (
            <li
              key={p.id}
              className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]", !p.isActive && "opacity-50 grayscale")}
            >
              <img
                src={p.avatar || '/placeholder.svg'}
                alt={`${p.name} avatar`}
                className="size-10 shrink-0 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.playtime}
                </p>
              </div>

              {p.isActive && (
                <div className="hidden items-center gap-1.5 sm:flex">
                  <Wifi className={cn('size-4', latencyColor(p.latency))} />
                  <span className={cn('text-sm tabular-nums', latencyColor(p.latency))}>
                    {p.latency}ms
                  </span>
                </div>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No players online.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
