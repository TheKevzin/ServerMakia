'use client'

import { useState } from 'react'
import { Globe, Copy, Check, Wifi, Layers, Sparkles } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { useServerStatus } from '@/lib/hooks'

export function ServerConnectionCard() {
  const { isRunning, tunnel } = useServerStatus()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  return (
    <div className="animate-enter relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-[#140b17]/80 to-background/90 p-5 shadow-2xl backdrop-blur-xl transition-[border-color,box-shadow] duration-200 hover:border-primary/45 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left: Main Hostname & Live Badge */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20 text-end-stone shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-transform duration-200 hover:scale-105">
            <Globe className="size-6 text-end-stone" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-end-stone/80">
                Dirección Pública (Minecraft)
              </span>
              <StatusBadge status={isRunning ? 'online' : 'offline'} />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground select-all bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/5">
                {tunnel.domain}
              </span>

              <button
                onClick={() => copyToClipboard(tunnel.domain, 'domain')}
                className="tactile-btn group relative flex items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/20 px-3.5 py-1.5 text-xs font-medium text-end-stone shadow-sm transition-[background-color,border-color,box-shadow,color] duration-150 hover:bg-primary/35 hover:border-primary/50 hover:shadow-[0_0_14px_rgba(168,85,247,0.3)]"
              >
                {copiedKey === 'domain' ? (
                  <>
                    <Check className="size-3.5 text-emerald-400 animate-in zoom-in-75 duration-150" />
                    <span className="text-emerald-300 font-semibold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-end-stone/90 group-hover:scale-110 transition-transform duration-150" />
                    <span>Copiar IP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Secondary IP addresses (Direct IP & Local LAN) */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t border-border/40 lg:border-t-0">
          {/* Direct numeric IP */}
          <div
            onClick={() => copyToClipboard(tunnel.directIp, 'direct')}
            className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 cursor-pointer transition-[border-color,background-color,transform] duration-150 hover:border-primary/30 hover:bg-white/[0.04] active:scale-[0.98]"
            title="Clic para copiar IP numérica directa"
          >
            <div className="flex size-6 items-center justify-center rounded-lg bg-white/[0.05] text-muted-foreground group-hover:text-primary transition-colors">
              <Layers className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">IP Directa</span>
              <span className="font-mono text-xs text-foreground/90 tabular-nums">{tunnel.directIp}</span>
            </div>
            <div className="ml-1 rounded-lg p-1 text-muted-foreground group-hover:text-end-stone transition-colors">
              {copiedKey === 'direct' ? (
                <Check className="size-3.5 text-emerald-400 animate-in zoom-in-75" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </div>
          </div>

          {/* Local LAN IP */}
          <div
            onClick={() => copyToClipboard(tunnel.local, 'local')}
            className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2 cursor-pointer transition-[border-color,background-color,transform] duration-150 hover:border-primary/30 hover:bg-white/[0.04] active:scale-[0.98]"
            title="Clic para copiar IP de red local (LAN)"
          >
            <div className="flex size-6 items-center justify-center rounded-lg bg-white/[0.05] text-muted-foreground group-hover:text-primary transition-colors">
              <Wifi className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Red Local (LAN)</span>
              <span className="font-mono text-xs text-foreground/90 tabular-nums">{tunnel.local}</span>
            </div>
            <div className="ml-1 rounded-lg p-1 text-muted-foreground group-hover:text-end-stone transition-colors">
              {copiedKey === 'local' ? (
                <Check className="size-3.5 text-emerald-400 animate-in zoom-in-75" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
