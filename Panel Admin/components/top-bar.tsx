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
        <p className="text-xs font-medium uppercase tracking-widest text-end-stone/70">
          ServerMakia · Fabric 1.21.11
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="glass flex items-center gap-2 rounded-xl py-1 pl-1 pr-3 transition-colors hover:border-primary/40 cursor-default">
          {minecraftName ? (
            <img src={`https://mc-heads.net/avatar/${minecraftName}`} alt={minecraftName} className="size-8 rounded-lg" />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <User className="size-4" />
            </div>
          )}
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {username || 'Loading...'}
          </span>
        </div>
      </div>
    </header>
  )
}
