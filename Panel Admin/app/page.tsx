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
import { MapView } from '@/components/views/map-view'
import { UsersView } from '@/components/views/users-view'
import { ViewerDashboard } from '@/components/views/viewer-dashboard'
import { navItems } from '@/lib/data'

const subtitles: Record<string, string> = {
  dashboard: 'Live overview of your server health and activity',
  map: 'Explore your Minecraft world in real-time 3D',
  console: 'Stream logs and run commands in real time',
  players: 'Manage who is online and who is banned',
  settings: 'Configure gameplay, access, and world rules',
  files: 'Browse and edit your server configuration files',
  backups: 'Create, restore, and schedule world backups',
  users: 'Manage panel access and permissions',
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
          setRole(d.role)
          setUsername(d.username)
          setMinecraftName(d.minecraftName)
        }
      })
  }, [])

  const title = navItems.find((n) => n.id === active)?.label ?? 'Dashboard'

  if (!role) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar active={active} onNavigate={setActive} role={role} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8 lg:pr-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <TopBar title={title} subtitle={subtitles[active]} username={username} minecraftName={minecraftName} />

          {active === 'dashboard' && role === 'VIEWER' && <ViewerDashboard />}
          {active === 'dashboard' && role !== 'VIEWER' && <DashboardView role={role} />}
          {active === 'map' && <MapView />}
          
          {(role === 'ADMIN' || role === 'MODERATOR') && (
            <>
              {active === 'console' && <ConsoleView role={role} />}
              {active === 'players' && <PlayersView role={role} />}
            </>
          )}

          {role === 'ADMIN' && (
            <>
              {active === 'files' && <FilesView />}
              {active === 'backups' && <BackupsView />}
              {active === 'settings' && <SettingsView />}
              {active === 'users' && <UsersView />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
