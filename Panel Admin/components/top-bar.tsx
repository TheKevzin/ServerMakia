'use client'

import { LogOut, User } from 'lucide-react'

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
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-end-stone">
            Fabric 1.21.11
          </span>
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground/80">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="glass flex items-center gap-2.5 rounded-2xl py-1 pl-1.5 pr-3.5 border-border/50 transition-[border-color,background-color] duration-150 hover:border-primary/40 hover:bg-white/[0.04]">
          {minecraftName ? (
            <img
              src={`https://mc-heads.net/avatar/${minecraftName}`}
              alt={minecraftName}
              className="size-7 rounded-lg ring-1 ring-border/50 shadow-sm"
            />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-end-stone">
              <User className="size-3.5" />
            </div>
          )}
          <span className="text-sm font-medium text-foreground tracking-tight">
            {username || 'Account'}
          </span>
        </div>
      </div>
    </header>
  )
}
