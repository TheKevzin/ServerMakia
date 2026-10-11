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
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups, type NavIcon } from '@/lib/constants'
import { StatusDot } from './status-badge'
import { useServerStatus } from '@/lib/hooks'

const iconMap: Record<NavIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  console: TerminalSquare,
  players: Users,
  settings: Settings,
  files: FolderTree,
  backups: DatabaseBackup,
  users: Users,
}

export function Sidebar({
  active,
  role,
}: {
  active: string
  role: string | null
}) {
  const { isRunning } = useServerStatus()
  const pathname = usePathname()

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
          <p className="text-xs text-muted-foreground">Panel de Control</p>
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
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98]',
                      isActive
                        ? 'border border-primary/40 bg-primary/20 text-end-stone shadow-[0_0_16px_rgba(98,6,191,0.25)]'
                        : 'text-sidebar-foreground hover:bg-white/[0.06] hover:text-foreground',
                    )}
                  >
                    {isActive && (
                      <span className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-end-stone shadow-[0_0_8px_var(--end-stone)]" />
                    )}
                    <Icon
                      className={cn(
                        'size-4.5 shrink-0 transition-colors duration-150',
                        isActive
                          ? 'text-end-stone drop-shadow-[0_0_6px_rgba(225,242,189,0.4)]'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    <span className="hidden lg:inline tracking-tight">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="glass hidden items-center justify-between gap-2 rounded-2xl p-3 lg:mt-4 lg:flex w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot status={isRunning ? 'online' : 'offline'} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">
              {isRunning ? 'Servidor en Línea' : 'Servidor Desconectado'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {isRunning ? '1.21.11 · Fabric' : 'Detenido'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="tactile-btn shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-rose-400"
          title="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
