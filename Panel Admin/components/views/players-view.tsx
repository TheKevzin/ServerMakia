'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Wifi, LogOut, Search, Ban, Users, Clock, ShieldAlert } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Player = {
  id: string
  name: string
  avatar: string
  role: 'Admin' | 'Mod' | 'Member'
  playtime: string
  latency: number
  isActive?: boolean
}

type BannedPlayer = {
  uuid: string
  name: string
  reason: string
  created: string
  source: string
}

function latencyColor(ms: number, isActive?: boolean) {
  if (!isActive) return 'text-muted-foreground'
  if (ms < 60) return 'text-emerald-300'
  if (ms < 120) return 'text-end-stone'
  return 'text-rose-300'
}

function roleBadge(role: Player['role'], isActive?: boolean) {
  if (!isActive) return 'bg-white/5 text-muted-foreground border-border opacity-50'
  switch (role) {
    case 'Admin':
      return 'bg-primary/25 text-end-stone border-primary/40'
    case 'Mod':
      return 'bg-[#b06bf0]/20 text-[#d8b8f7] border-[#b06bf0]/30'
    default:
      return 'bg-white/5 text-muted-foreground border-border'
  }
}

export function PlayersView({ role }: { role?: string | null }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [bannedPlayers, setBannedPlayers] = useState<BannedPlayer[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/server/players')
        const data = await res.json()
        if (data.players) setPlayers(data.players)
      } catch (e) {}
    }

    const fetchBanned = async () => {
      try {
        const res = await fetch('/api/server/banned')
        const data = await res.json()
        if (data.banned) setBannedPlayers(data.banned)
      } catch (e) {}
    }

    fetchPlayers()
    fetchBanned()
    const interval = setInterval(fetchPlayers, 5000)
    return () => clearInterval(interval)
  }, [])

  const kickPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `kick ${name} Kicked by admin` })
    })
    // Re-fetch instantly instead of filtering locally to sync status
    const res = await fetch('/api/server/players')
    const data = await res.json()
    if (data.players) setPlayers(data.players)
  }

  const banPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `ban ${name} Banned by admin` })
    })
    // Sync status
    const resPlayers = await fetch('/api/server/players')
    const dataPlayers = await resPlayers.json()
    if (dataPlayers.players) setPlayers(dataPlayers.players)
    
    // Refresh banned list
    setTimeout(async () => {
      const res = await fetch('/api/server/banned')
      const data = await res.json()
      if (data.banned) setBannedPlayers(data.banned)
    }, 1000)
  }

  const pardonPlayer = async (name: string) => {
    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `pardon ${name}` })
    })
    setBannedPlayers(prev => prev.filter(b => b.name !== name))
  }

  const changeRole = async (name: string, newRole: Player['role']) => {
    if (newRole === 'Admin') {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: `op ${name}` })
      })
    } else {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: `deop ${name}` })
      })
    }
    setPlayers(prev => prev.map(p => p.name === name ? { ...p, role: newRole } : p))
  }

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  const activePlayers = players.filter(p => p.isActive)

  const stats = [
    { label: 'Online Now', value: String(activePlayers.length), icon: Users },
    { label: 'Avg. Latency', value: activePlayers.length > 0 ? Math.round(activePlayers.reduce((a, p) => a + p.latency, 0) / activePlayers.length) + 'ms' : '—', icon: Clock },
    { label: 'Banned', value: String(bannedPlayers.length), icon: ShieldAlert },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="glass flex items-center gap-4 rounded-3xl p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/25 text-end-stone">
              <s.icon className="size-5" />
            </div>
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground neon-text">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Online players */}
      <div className="glass flex flex-col rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Server Players
            </h2>
            <span className="rounded-full bg-primary/25 px-2 py-0.5 text-xs font-medium text-end-stone">
              {activePlayers.length} online
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

        <ul className="divide-y divide-border">
          {filtered.map((p) => (
            <li
              key={p.id}
              className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]", !p.isActive && "opacity-60 grayscale")}
            >
              <img
                src={p.avatar || '/placeholder.svg'}
                alt={`${p.name} avatar`}
                className={cn("size-10 shrink-0 rounded-xl border border-border object-cover", p.isActive && "ring-2 ring-emerald-500/50")}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <p className={cn("truncate text-sm font-medium", p.isActive ? "text-foreground" : "text-muted-foreground")}>
                    {p.name}
                  </p>
                  {role === 'VIEWER' ? (
                    <span
                      title="Rank"
                      className={cn(
                        'w-max rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-center',
                        roleBadge(p.role, p.isActive),
                      )}
                    >
                      {p.role}
                    </span>
                  ) : (
                    <div className="w-max">
                      <Select value={p.role} onValueChange={(val: string) => changeRole(p.name, val as Player['role'])}>
                        <SelectTrigger disabled={!p.isActive} className={cn(
                          'h-auto w-auto inline-flex appearance-none rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/50 text-center',
                          roleBadge(p.role, p.isActive)
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Member" className="focus:bg-white/10 cursor-pointer">MEMBER</SelectItem>
                          <SelectItem value="Mod" className="focus:bg-[#b06bf0]/20 text-[#d8b8f7] cursor-pointer">MOD</SelectItem>
                          <SelectItem value="Admin" className="focus:bg-primary/20 text-end-stone cursor-pointer">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.playtime}
                </p>
              </div>

              <div className="hidden items-center gap-1.5 sm:flex w-16 justify-end">
                {p.isActive ? (
                  <>
                    <Wifi className={cn('size-4', latencyColor(p.latency, p.isActive))} />
                    <span className={cn('text-sm tabular-nums', latencyColor(p.latency, p.isActive))}>
                      {p.latency}ms
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
              </div>

              {role !== 'VIEWER' && (
                <div className="flex items-center gap-2">
                  {p.isActive && (
                    <button
                      onClick={() => kickPlayer(p.name)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
                    >
                      <LogOut className="size-3.5" />
                      Kick
                    </button>
                  )}
                  <button
                    onClick={() => banPlayer(p.name)}
                    className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors hover:bg-destructive/20"
                  >
                    <Ban className="size-3.5" />
                    Ban
                  </button>
                </div>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No players found.
            </li>
          )}
        </ul>
      </div>

      {/* Banned players */}
      <div className="glass flex flex-col rounded-3xl">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Ban className="size-4 text-rose-300" />
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Banned Players
          </h2>
          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-rose-300">
            {bannedPlayers.length}
          </span>
        </div>
        <ul className="divide-y divide-border">
          {bannedPlayers.map((b) => (
            <li
              key={b.name}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
            >
              <img
                src={`https://mc-heads.net/avatar/${b.name}/40`}
                alt={`${b.name} avatar`}
                className="size-10 shrink-0 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {b.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.reason} · by {b.source}
                </p>
              </div>
              {role !== 'VIEWER' && (
                <button
                  onClick={() => pardonPlayer(b.name)}
                  className="rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-end-stone transition-colors hover:border-primary/40"
                >
                  Pardon
                </button>
              )}
            </li>
          ))}
          {bannedPlayers.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-muted-foreground">
              No banned players.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
