'use client'

import { PlayersView } from '@/components/views/players-view'
import { useAuth } from '@/lib/hooks'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function PlayersContent() {
  const { role } = useAuth()
  const searchParams = useSearchParams()
  const selectedPlayer = searchParams.get('name')

  return (
    <PlayersView
      role={role}
      initialPlayerName={selectedPlayer}
      onClearSelectedPlayer={() => {
        // Clear the query param without full page reload
        window.history.replaceState(null, '', '/players')
      }}
    />
  )
}

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="size-6 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
      <PlayersContent />
    </Suspense>
  )
}
