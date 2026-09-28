'use client'

import { MetricCards } from '@/components/metric-cards'
import { PlayersTable } from '@/components/players-table'
import { MapView } from '@/components/views/map-view'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { TerminalSquare, Eye, Shield } from 'lucide-react'

type ConsoleLine = {
  time: string
  level: string
  text: string
}

function levelColor(level: string) {
  switch (level) {
    case 'WARN':
      return 'text-amber-300'
    case 'ERROR':
      return 'text-rose-300'
    default:
      return 'text-emerald-300'
  }
}

function parseLogLine(text: string): ConsoleLine {
  let level = 'INFO'
  if (text.includes('WARN')) level = 'WARN'
  if (text.includes('ERROR') || text.includes('Exception') || text.includes('Failed')) level = 'ERROR'
  const timeMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]/)
  const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-GB', { hour12: false })
  return { time, level, text }
}

function ReadOnlyConsole() {
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/server/logs')
        const data = await res.json()
        if (data.logs && data.logs.length > 0) {
          setLines(prev => {
            const newParsed = data.logs.map(parseLogLine)
            const existingTextSet = new Set(prev.map(p => p.text))
            const actuallyNew = newParsed.filter((l: ConsoleLine) => !existingTextSet.has(l.text))
            if (actuallyNew.length === 0) return prev
            return [...prev, ...actuallyNew].slice(-80)
          })
        }
      } catch (err) {}
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="glass flex flex-col rounded-3xl overflow-hidden h-[400px]">
      <div className="flex items-center gap-2 border-b border-border/50 bg-black/20 p-4 backdrop-blur-md shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-end-stone">
          <TerminalSquare className="size-4" />
        </div>
        <h2 className="font-heading text-sm font-bold text-foreground">
          Live Console
        </h2>
        <span className="ml-auto flex items-center gap-2 text-xs font-medium text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
          <Eye className="size-3" />
          Read-Only
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed bg-black/40 custom-scrollbar">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 py-0.5 hover:bg-white/[0.03] rounded px-2 -mx-2 transition-colors">
            <span className="shrink-0 text-muted-foreground/60 select-none">[{line.time}]</span>
            <span className={cn('shrink-0 font-bold tracking-wider', levelColor(line.level))}>
              {line.level}
            </span>
            <span className="text-foreground/80 break-all">{line.text}</span>
          </div>
        ))}
        {lines.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center font-mono text-sm text-muted-foreground/50 animate-pulse">Waiting for server logs...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border/50 bg-black/30 p-3 shrink-0">
        <Shield className="size-4 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/50 font-mono">Command input is disabled for viewer accounts</span>
      </div>
    </div>
  )
}

export function ViewerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <MetricCards />

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column — Console + Map */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <ReadOnlyConsole />
          <div className="glass rounded-3xl overflow-hidden h-[500px]">
            <MapView />
          </div>
        </div>

        {/* Right Column — Players */}
        <div className="lg:col-span-1">
          <PlayersTable className="w-full" role="VIEWER" />
        </div>
      </div>
    </div>
  )
}
