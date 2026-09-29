'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { TerminalSquare, ChevronRight, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type ConsoleLine = {
  id: string
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

let lineCounter = 0

function parseLogLine(text: string): ConsoleLine {
  let level = 'INFO'
  if (text.includes('WARN')) level = 'WARN'
  if (text.includes('ERROR') || text.includes('Exception') || text.includes('Failed')) level = 'ERROR'
  
  const timeMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]/)
  const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-GB', { hour12: false })
  
  lineCounter += 1
  return { 
    id: `log-${lineCounter}-${Date.now().toString(36)}`, 
    time, 
    level, 
    text 
  }
}

export function ConsolePreview({ className }: { className?: string }) {
  const [command, setCommand] = useState('')
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  // Track if user is scrolled near bottom
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60
  }

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/server/logs')
        const data = await res.json()
        if (data.logs && data.logs.length > 0) {
          setLines(prev => {
            const existingTextSet = new Set(prev.map(p => p.text))
            const rawNew = data.logs.filter((raw: string) => !existingTextSet.has(raw))
            if (rawNew.length === 0) return prev

            const newParsed = rawNew.map(parseLogLine)
            const combined = [...prev, ...newParsed]
            return combined.length > 60 ? combined.slice(combined.length - 60) : combined
          })
        }
      } catch (err) {}
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)

    const handleCustomCommand = (e: CustomEvent) => {
      const msg = e.detail.command
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
      lineCounter += 1
      setLines((prev) => {
        const entry: ConsoleLine = {
          id: `cmd-${lineCounter}-${Date.now().toString(36)}`,
          time: now,
          level: 'INFO',
          text: `<dashboard> ${msg}`
        }
        const combined = [...prev, entry]
        return combined.length > 60 ? combined.slice(combined.length - 60) : combined
      })
    }
    window.addEventListener('console-action', handleCustomCommand as EventListener)

    return () => {
      clearInterval(interval)
      window.removeEventListener('console-action', handleCustomCommand as EventListener)
    }
  }, [])

  // Auto-scroll instantly without animation jitter/bouncing
  useEffect(() => {
    if (scrollRef.current && shouldAutoScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isSending) return

    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    lineCounter += 1
    const userCmd = command.trim()
    
    setLines((prev) => [
      ...prev,
      { 
        id: `user-${lineCounter}-${Date.now().toString(36)}`, 
        time: now, 
        level: 'INFO', 
        text: `<console> issued command: /${userCmd}` 
      },
    ])

    setCommand('')
    setIsSending(true)

    try {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userCmd })
      })
    } finally {
      setIsSending(false)
    }
  }

  const clearPreview = () => {
    setLines([])
  }

  return (
    <div className={cn("glass flex flex-col rounded-3xl overflow-hidden max-h-[420px] border-primary/20 shadow-[0_0_40px_-10px_rgba(98,6,191,0.2)] transition-all duration-300 hover:border-primary/40", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 bg-black/25 px-5 py-3.5 backdrop-blur-md">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-end-stone shadow-[0_0_15px_rgba(98,6,191,0.3)]">
          <TerminalSquare className="size-4" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
            Live Console
          </h2>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Streaming
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={clearPreview}
            title="Limpiar vista previa"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <Trash2 className="size-3" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
          <Link
            href="/console"
            title="Abrir consola completa"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-end-stone bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Consola Completa</span>
          </Link>
        </div>
      </div>

      {/* Terminal Viewport - 100% flicker-free */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed min-h-[16rem] bg-black/45 custom-scrollbar"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className="flex gap-3 py-0.5 hover:bg-white/[0.03] rounded px-1.5 -mx-1.5 transition-colors"
          >
            <span className="shrink-0 text-muted-foreground/60 select-none">
              [{line.time}]
            </span>
            <span className={cn('shrink-0 font-bold tracking-wider', levelColor(line.level))}>
              {line.level}
            </span>
            <span className="text-foreground/90 break-all select-text">
              {line.text}
            </span>
          </div>
        ))}

        {lines.length === 0 && (
          <div className="flex h-full min-h-[14rem] items-center justify-center">
            <p className="font-mono text-xs text-muted-foreground/50 animate-pulse">
              Esperando registros del servidor...
            </p>
          </div>
        )}
      </div>

      {/* Command Input Form */}
      <form
        onSubmit={sendCommand}
        className="flex items-center gap-2 border-t border-border/50 bg-black/30 p-2.5 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <ChevronRight className="size-4 text-end-stone ml-1 drop-shadow-[0_0_8px_rgba(225,242,189,0.5)] shrink-0" />
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Ej: say ¡Bienvenidos al server! o time set day..."
          disabled={isSending}
          className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none relative z-10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !command.trim()}
          className="relative z-10 rounded-xl bg-primary/25 px-3 py-1.5 text-xs font-bold text-end-stone transition-all hover:bg-primary/40 hover:shadow-[0_0_15px_rgba(98,6,191,0.4)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
