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
      label: 'Total Backups',
      value: String(stats.total),
      subtext: 'Copias de seguridad activas',
      icon: DatabaseBackup,
    },
    {
      label: 'Storage Used',
      value: stats.storageUsed,
      subtext: stats.diskFree ? `${stats.diskFree} libres en la torre` : 'Espacio de copias',
      icon: HardDrive,
    },
    {
      label: 'Espacio Libre en la Torre',
      value: stats.diskFree || '—',
      subtext: stats.diskTotal ? `de ${stats.diskTotal} en disco (${100 - (stats.diskUsedPercent || 0)}% libre)` : 'Disco físico',
      icon: Server,
      progress: stats.diskUsedPercent,
    },
    {
      label: 'Last Backup',
      value: stats.lastBackup,
      subtext: 'Hora de Colombia',
      icon: Clock,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryStats.map((s) => (
        <div key={s.label} className="glass flex flex-col justify-between rounded-3xl p-5 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/25 text-end-stone shrink-0">
              <s.icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg sm:text-xl font-semibold text-foreground neon-text truncate">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>

          {s.subtext && (
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
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
