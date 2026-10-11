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
  const title = navItems.find((n) => n.id === activeSection)?.label ?? 'Dashboard'
  const subtitle = pageSubtitles[activeSection]

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
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
          {children}
        </div>
      </main>
    </div>
  )
}
