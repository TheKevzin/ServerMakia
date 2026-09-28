'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { TerminalSquare, ChevronRight } from 'lucide-react'

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

export function ConsolePreview({ className }: { className?: string }) {
  const [command, setCommand] = useState('')
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
            return [...prev, ...actuallyNew].slice(-50)
          })
        }
      } catch (err) {}
    }

    // Fetch immediately
    fetchLogs()

    // Poll every 2 seconds
    const interval = setInterval(fetchLogs, 2000)

    const handleCustomCommand = (e: CustomEvent) => {
      const msg = e.detail.command
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
      setLines((prev) => {
        const combined = [...prev, { time: now, level: 'INFO', text: `<dashboard> ${msg}` }]
        return combined.length > 50 ? combined.slice(combined.length - 50) : combined
      })
    }
    window.addEventListener('console-action', handleCustomCommand as EventListener)

    return () => {
      clearInterval(interval)
      window.removeEventListener('console-action', handleCustomCommand as EventListener)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLines((prev) => [
      ...prev,
      { time: now, level: 'INFO', text: `<console> issued command: /${command}` },
    ])

    await fetch('/api/server/rcon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    })

    setCommand('')
  }

  return (
    <div className={cn("glass flex flex-col rounded-3xl overflow-hidden max-h-[400px] border-primary/20 shadow-[0_0_40px_-10px_rgba(98,6,191,0.2)] transition-all duration-300 hover:border-primary/40", className)}>
      <div className="flex items-center gap-2 border-b border-border/50 bg-black/20 p-5 backdrop-blur-md">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-end-stone shadow-[0_0_15px_rgba(98,6,191,0.3)]">
          <TerminalSquare className="size-4" />
        </div>
        <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Live Console
        </h2>
        <span className="ml-auto flex items-center gap-2 text-xs font-medium text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Streaming
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed min-h-[16rem] bg-black/40 custom-scrollbar scroll-smooth">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4 py-1 hover:bg-white/[0.04] rounded px-2 -mx-2 transition-colors animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="shrink-0 text-muted-foreground/60 select-none">[{line.time}]</span>
            <span className={cn('shrink-0 font-bold tracking-wider', levelColor(line.level))}>
              {line.level}
            </span>
            <span className="text-foreground/90 break-all">{line.text}</span>
          </div>
        ))}
        {lines.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center font-mono text-sm text-muted-foreground/50 animate-pulse">Waiting for server logs...</p>
          </div>
        )}
      </div>

      <form
        onSubmit={sendCommand}
        className="flex items-center gap-3 border-t border-border/50 bg-black/30 p-3 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <ChevronRight className="size-5 text-end-stone drop-shadow-[0_0_8px_rgba(225,242,189,0.5)]" />
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Ej: /say Hello Enderlab..."
          className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none relative z-10"
        />
        <button
          type="submit"
          className="relative z-10 rounded-xl bg-primary/20 px-4 py-2 text-xs font-bold text-end-stone transition-all hover:bg-primary/40 hover:shadow-[0_0_15px_rgba(98,6,191,0.4)] active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  )
}
