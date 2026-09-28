'use client'

import { ServerConnectionCard } from '@/components/server-connection-card'
import { MetricCards } from '@/components/metric-cards'
import { QuickActions } from '@/components/quick-actions'
import { PlayersTable } from '@/components/players-table'
import { ServerSettings } from '@/components/server-settings'
import { ConsolePreview } from '@/components/console-preview'

export function DashboardView({ role }: { role?: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      <ServerConnectionCard />
      <MetricCards />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Columna Izquierda (Ancha) */}
        <div className="flex flex-col gap-6 lg:col-span-2 h-full">
          <QuickActions role={role} />
          <ConsolePreview className="flex-1" />
        </div>

        {/* Columna Derecha (Estrecha) */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full">
          <PlayersTable className="flex-1" role={role} />
          {role === 'ADMIN' && <ServerSettings />}
        </div>
      </div>
    </div>
  )
}
