'use client'

import { DashboardView } from '@/components/views/dashboard-view'
import { useAuth } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { role } = useAuth()
  const router = useRouter()

  return (
    <DashboardView
      role={role}
      onSelectPlayer={(playerName) => {
        router.push(`/players?name=${encodeURIComponent(playerName)}`)
      }}
    />
  )
}
