'use client'

import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { useAuth } from '@/lib/hooks'
import { navItems, pageSubtitles } from '@/lib/constants'
import { usePathname } from 'next/navigation'

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, username, minecraftName, loading } = useAuth()
  const pathname = usePathname()

  // Extract the active section from the pathname (e.g., /dashboard → 'dashboard')
  const activeSection = pathname.split('/')[1] || 'dashboard'
  const title = navItems.find((n) => n.id === activeSection)?.label ?? 'Panel Principal'
  const subtitle = pageSubtitles[activeSection]

  if (loading || !role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <div className="size-9 rounded-full border-2 border-primary/40 border-t-end-stone animate-spin shadow-[0_0_20px_rgba(98,6,191,0.5)]" />
        <span className="text-xs font-mono text-muted-foreground/70 animate-pulse tracking-wider">
          INICIALIZANDO...
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar
        active={activeSection}
        role={role}
      />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:py-8 lg:pr-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <TopBar title={title} subtitle={subtitle} username={username} minecraftName={minecraftName} />
          <div key={pathname} className="animate-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
