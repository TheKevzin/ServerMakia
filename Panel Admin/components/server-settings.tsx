'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { ShieldCheck, Swords, Unlock, Check, Loader2, type LucideIcon } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { toast } from '@/lib/toast'

type Setting = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  enabled: boolean
}

export function ServerSettings() {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'whitelist',
      label: 'Lista Blanca (Whitelist)',
      description: 'Solo jugadores autorizados pueden ingresar',
      icon: ShieldCheck,
      enabled: false,
    },
    {
      id: 'pvp',
      label: 'Combate PVP',
      description: 'Permitir daño entre jugadores en el mundo',
      icon: Swords,
      enabled: false,
    },
    {
      id: 'cracked',
      label: 'Modo No-Premium (Offline)',
      description: 'Permitir conexiones de cuentas sin cuenta oficial de Mojang',
      icon: Unlock,
      enabled: false,
    },
  ])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await fetch('/api/server/properties')
        const data = await res.json()
        setSettings(prev => prev.map(s => {
          if (s.id === 'whitelist') return { ...s, enabled: Boolean(data.whitelist) }
          if (s.id === 'pvp') return { ...s, enabled: Boolean(data.pvp) }
          if (s.id === 'cracked') return { ...s, enabled: Boolean(data.cracked) }
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
    setUpdatingId(id)
    
    // Optimistic update
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s)),
    )

    try {
      const res = await fetch('/api/server/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: newEnabled })
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(`${setting.label}: ${newEnabled ? 'Activado' : 'Desactivado'}`)
    } catch {
      // Revert optimistic state on failure
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !newEnabled } : s)),
      )
      toast.error(`Error al actualizar ${setting.label}`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="glass animate-enter flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Ajustes Rápidos del Servidor
          </h2>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            Los cambios se sincronizan en caliente o aplicarán en el próximo reinicio
          </p>
        </div>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {settings.map((s) => {
          const isUpdating = updatingId === s.id
          return (
            <li
              key={s.id}
              className="group flex items-center gap-4 px-5 py-4 transition-[background-color] duration-150 hover:bg-white/[0.03]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-primary/20 text-end-stone shadow-sm transition-transform duration-150 group-hover:scale-105">
                <s.icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground tracking-tight">{s.label}</p>
                  {isUpdating && (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground/80 mt-0.5">{s.description}</p>
              </div>
              <Toggle
                enabled={s.enabled}
                onChange={() => toggle(s.id)}
                label={s.label}
                disabled={isUpdating}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
