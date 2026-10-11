'use client'

import { cn } from '@/lib/utils'
import { HardDrive, Clock, Server, DatabaseBackup } from 'lucide-react'

type StatsData = {
  total: number
  storageUsed: string
  lastBackup: string
  diskFree?: string
  diskTotal?: string
  diskUsedPercent?: number
}

export function BackupStatsCards({ stats }: { stats: StatsData }) {
  const summaryStats = [
    {
      label: 'Total de Copias',
      value: String(stats.total),
      subtext: 'Copias de seguridad activas',
      icon: DatabaseBackup,
      delayClass: 'animate-enter-1',
    },
    {
      label: 'Espacio de Copias',
      value: stats.storageUsed,
      subtext: stats.diskFree ? `${stats.diskFree} libres en la torre` : 'Espacio de copias',
      icon: HardDrive,
      delayClass: 'animate-enter-2',
    },
    {
      label: 'Espacio Libre en la Torre',
      value: stats.diskFree || '—',
      subtext: stats.diskTotal ? `de ${stats.diskTotal} en disco (${100 - (stats.diskUsedPercent || 0)}% libre)` : 'Disco físico',
      icon: Server,
      progress: stats.diskUsedPercent,
      delayClass: 'animate-enter-3',
    },
    {
      label: 'Última Copia',
      value: stats.lastBackup,
      subtext: 'Hora de Colombia',
      icon: Clock,
      delayClass: 'animate-enter-4',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryStats.map((s) => (
        <div
          key={s.label}
          className={cn(
            'glass flex flex-col justify-between rounded-3xl p-5 gap-3 border border-white/10 shadow-lg',
            'transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(168,85,247,0.12)]',
            s.delayClass
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-primary/20 text-end-stone shrink-0 shadow-sm">
              <s.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-foreground neon-text truncate">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground/80 tracking-tight">{s.label}</p>
            </div>
          </div>

          {s.subtext && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/85">
                <span className="truncate">{s.subtext}</span>
                {s.progress !== undefined && (
                  <span className="font-mono text-xs font-semibold text-foreground shrink-0 ml-1">
                    {s.progress}% usado
                  </span>
                )}
              </div>
              {s.progress !== undefined && (
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      s.progress > 85 ? 'bg-rose-500' : s.progress > 65 ? 'bg-amber-400' : 'bg-emerald-400'
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, s.progress))}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
