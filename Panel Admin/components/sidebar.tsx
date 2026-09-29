'use client'

import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TerminalSquare,
  Users,
  Settings,
  Boxes,
  FolderTree,
  DatabaseBackup,
  LogOut,
} from 'lucide-react'
import { navGroups, type NavIcon } from '@/lib/data'

const iconMap: Record<NavIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  console: TerminalSquare,
  players: Users,
  settings: Settings,
  files: FolderTree,
  backups: DatabaseBackup,
}

export function Sidebar({
  active,
  onNavigate,
  role,
}: {
  active: string
  onNavigate: (id: string) => void
  role: string
}) {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside className="glass-strong sticky top-0 z-20 flex h-auto shrink-0 flex-row items-center gap-2 rounded-none border-b px-3 py-2 lg:top-4 lg:my-4 lg:ml-4 lg:h-[calc(100vh-2rem)] lg:w-60 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-y-auto custom-scrollbar lg:rounded-3xl lg:border lg:px-3 lg:py-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 lg:mb-6">
        <div className="neon-ring flex size-10 items-center justify-center rounded-xl bg-primary/30">
          <Boxes className="size-5 text-end-stone" />
        </div>
        <div className="hidden lg:block">
          <p className="font-heading text-sm font-semibold leading-tight text-foreground">
            ServerMakia
          </p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-row gap-1 lg:flex-col lg:gap-0">
        {navGroups.map((group) => {
          return (
            <div key={group.group} className="flex flex-row gap-1 lg:flex-col">
              <p className="hidden px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 first:lg:pt-0 lg:block">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = iconMap[item.icon]
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out',
                      isActive
                        ? 'neon-ring bg-primary/25 text-end-stone shadow-[0_0_20px_rgba(98,6,191,0.3)]'
                        : 'text-sidebar-foreground hover:bg-white/5 hover:text-foreground hover:scale-105 active:scale-95 hover:shadow-lg',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-end-stone'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="glass hidden items-center justify-between gap-2 rounded-2xl p-3 lg:mt-4 lg:flex w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">Online</p>
            <p className="text-[11px] text-muted-foreground truncate">1.21.11 · Fabric</p>
          </div>
        </div>
        <button onClick={handleLogout} className="shrink-0 p-1 text-muted-foreground hover:text-rose-400 transition-colors" title="Sign out">
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
