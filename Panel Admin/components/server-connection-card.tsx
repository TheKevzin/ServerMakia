'use client'

import { useState } from 'react'
import { Globe, Copy, Check, Wifi, Layers } from 'lucide-react'
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
    <div className="animate-enter relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-[#1a0f18]/80 to-background/90 p-5 shadow-2xl backdrop-blur-xl transition-[border-color,box-shadow] duration-200 hover:border-primary/45">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left: Main Hostname & Live Badge */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20 text-end-stone shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <Globe className="size-6 animate-pulse" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-end-stone/80">
                Public Server Address (Minecraft)
              </span>
              <StatusBadge status={isRunning ? 'online' : 'offline'} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground select-all">
                {tunnel.domain}
              </span>

              <button
                onClick={() => copyToClipboard(tunnel.domain, 'domain')}
                className="tactile-btn flex items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/20 px-3 py-1.5 text-xs font-medium text-end-stone hover:bg-primary/35 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
              >
                {copiedKey === 'domain' ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Secondary IP addresses (Direct IP & Local LAN) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t border-border/40 lg:border-t-0">
          {/* Direct numeric IP */}
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-black/30 px-3 py-1.5">
            <Layers className="size-3.5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Numeric IP</span>
              <span className="font-mono text-xs text-foreground/90">{tunnel.directIp}</span>
            </div>
            <button
              onClick={() => copyToClipboard(tunnel.directIp, 'direct')}
              title="Copy direct IP"
              className="tactile-btn ml-1 rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              {copiedKey === 'direct' ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </button>
          </div>

          {/* Local LAN IP */}
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-black/30 px-3 py-1.5">
            <Wifi className="size-3.5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">Local LAN</span>
              <span className="font-mono text-xs text-foreground/90">{tunnel.local}</span>
            </div>
            <button
              onClick={() => copyToClipboard(tunnel.local, 'local')}
              title="Copy local IP"
              className="tactile-btn ml-1 rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              {copiedKey === 'local' ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
