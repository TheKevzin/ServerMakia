'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { DashboardView } from '@/components/views/dashboard-view'
import { ConsoleView } from '@/components/views/console-view'
import { FilesView } from '@/components/views/files-view'
import { BackupsView } from '@/components/views/backups-view'
import { PlayersView } from '@/components/views/players-view'
import { SettingsView } from '@/components/views/settings-view'
import { navItems } from '@/lib/data'

const subtitles: Record<string, string> = {
  dashboard: 'Resumen en tiempo real del estado de tu servidor y recursos',
  console: 'Registro de logs en vivo y ejecución de comandos RCON',
  players: 'Monitoreo de jugadores activos y gestión de permisos',
  files: 'Explorador y editor de archivos de configuración del servidor',
  backups: 'Crear, restaurar y sincronizar copias con Google Drive',
  settings: 'Configuración de reglas del juego, memoria y propiedades',
}

export default function Page() {
  const [active, setActive] = useState('dashboard')
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [minecraftName, setMinecraftName] = useState<string>('')
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setRole(d.role || 'ADMIN')
          setUsername(d.username || 'Admin')
          setMinecraftName(d.minecraftName || '')
        } else {
          window.location.href = '/login'
        }
      })
      .catch(() => {
        window.location.href = '/login'
      })
  }, [])

  const title = navItems.find((n) => n.id === active)?.label ?? 'Dashboard'

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar active={active} onNavigate={setActive} role={role} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8 lg:pr-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <TopBar title={title} subtitle={subtitles[active]} username={username} minecraftName={minecraftName} />

          {active === 'dashboard' && <DashboardView role={role} />}
          {active === 'console' && <ConsoleView role={role} />}
          {active === 'players' && <PlayersView role={role} />}
          {active === 'files' && <FilesView />}
          {active === 'backups' && <BackupsView />}
          {active === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  )
}
