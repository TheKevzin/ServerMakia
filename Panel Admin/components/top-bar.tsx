'use client'

import { useState } from 'react'
import { LogOut, User, Check, Sparkles } from 'lucide-react'

export function TopBar({
  title,
  subtitle,
  username,
  minecraftName,
}: {
  title: string
  subtitle?: string
  username?: string
  minecraftName?: string
}) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-end-stone shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Fabric 1.21.11
          </span>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground/85 tracking-tight">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="glass flex items-center gap-2.5 rounded-2xl py-1.5 pl-2 pr-3 border-white/10 transition-[border-color,background-color,box-shadow] duration-150 hover:border-primary/40 hover:bg-white/[0.04]">
          {minecraftName ? (
            <img
              src={`https://mc-heads.net/avatar/${minecraftName}`}
              alt={minecraftName}
              className="size-7 rounded-xl ring-1 ring-border/50 shadow-sm object-cover"
            />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-xl bg-primary/20 text-end-stone">
              <User className="size-3.5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground tracking-tight leading-none">
              {username || 'Operador'}
            </span>
            <span className="text-[10px] text-muted-foreground/80 leading-none mt-0.5">
              Administrador
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Cerrar sesión"
          className="tactile-btn flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-[border-color,background-color,color] duration-150 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 active:scale-95 disabled:opacity-50"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
