'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { ShieldCheck, Swords, Unlock, type LucideIcon } from 'lucide-react'

type Setting = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  enabled: boolean
}

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled ? 'true' : 'false'}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        enabled
          ? 'neon-ring border-primary/50 bg-primary'
          : 'border-border bg-white/10',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-foreground shadow-sm transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

export function ServerSettings() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'whitelist',
      label: 'Whitelist',
      description: 'Only approved players may join',
      icon: ShieldCheck,
      enabled: false,
    },
    {
      id: 'pvp',
      label: 'PVP',
      description: 'Allow player versus player combat',
      icon: Swords,
      enabled: false,
    },
    {
      id: 'cracked',
      label: 'Cracked Mode',
      description: 'Allow non-premium accounts (offline)',
      icon: Unlock,
      enabled: false,
    },
  ])

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch('/api/server/properties')
        const data = await res.json()
        setSettings(prev => prev.map(s => {
          if (s.id === 'whitelist') return { ...s, enabled: data.whitelist }
          if (s.id === 'pvp') return { ...s, enabled: data.pvp }
          if (s.id === 'cracked') return { ...s, enabled: data.cracked }
          return s
        }))
      } catch (e) {}
    }
    fetchProps()
  }, [])

  const toggle = async (id: string) => {
    const setting = settings.find(s => s.id === id)
    if (!setting) return

    const newEnabled = !setting.enabled
    
    // Optimistic update
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s)),
    )

    // Send to API
    await fetch('/api/server/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: newEnabled })
    })
  }

  return (
    <div className="glass flex flex-col rounded-3xl">
      <div className="border-b border-border p-5">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Server Settings
        </h2>
        <p className="text-xs text-muted-foreground">
          Some changes apply on next restart
        </p>
      </div>
      <ul className="divide-y divide-border">
        {settings.map((s) => (
          <li key={s.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-end-stone">
              <s.icon className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <Toggle
              enabled={s.enabled}
              onChange={() => toggle(s.id)}
              label={s.label}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
