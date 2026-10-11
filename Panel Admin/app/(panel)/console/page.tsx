'use client'

import { ConsoleView } from '@/components/views/console-view'
import { useAuth } from '@/lib/hooks'

export default function ConsolePage() {
  const { role } = useAuth()

  return <ConsoleView role={role} />
}
