'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TerminalSquare, ChevronRight, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from './status-badge'

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

function parseLogLine(raw: string): ConsoleLine {
  let level = 'INFO'
  if (raw.includes('WARN')) level = 'WARN'
  if (raw.includes('ERROR') || raw.includes('Exception') || raw.includes('Failed')) level = 'ERROR'

  const timeMatch = raw.match(/\[(\d{2}:\d{2}:\d{2})\]/)
  const time = timeMatch ? timeMatch[1] : '--:--:--'

  return { time, level, text: raw }
}

export function ConsolePreview({ className }: { className?: string }) {
  const [command, setCommand] = useState('')
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isRunning, setIsRunning] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  // Keep track of the last raw text we've seen from the API so we only
  // append truly new lines.  We use a ref so it persists across polls
  // without triggering re-renders.
  const lastSeenLineRef = useRef<string | null>(null)
  const clearedAtRef = useRef<number>(0) // timestamp of last "clear"

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60
  }, [])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/server/logs')
        const data = await res.json()
        if (typeof data.isRunning === 'boolean') {
          setIsRunning(data.isRunning)
        }
        if (!data.logs || data.logs.length === 0) return

        const apiLines: string[] = data.logs

        setLines(prev => {
          // Find the index of the last line we already displayed in the
          // new API payload.  Everything after that index is new.
          const lastSeen = lastSeenLineRef.current
          let startIdx = 0

          if (lastSeen !== null) {
            // Search from the end for efficiency – the last seen line
            // is usually near the tail of the 150-line window.
            const idx = apiLines.lastIndexOf(lastSeen)
            if (idx !== -1) {
              startIdx = idx + 1
            } else {
              // The previously seen line has scrolled out of the 150-line
              // window entirely.  That means ALL lines are new relative
              // to what we had.  Replace everything.
              startIdx = 0
            }
          } else {
            // First load – show last 40 lines
            startIdx = Math.max(0, apiLines.length - 40)
          }

          // Nothing new
          if (startIdx >= apiLines.length) return prev

          const newRaw = apiLines.slice(startIdx)
          const newParsed = newRaw.map(parseLogLine)

          // Update the "last seen" marker
          lastSeenLineRef.current = apiLines[apiLines.length - 1]

          // If the user hit "Clear", only show lines that arrived
          // after the clear action.
          if (prev.length === 0 && clearedAtRef.current > 0) {
            return newParsed.slice(-60)
          }

          const combined = [...prev, ...newParsed]
          return combined.length > 60 ? combined.slice(-60) : combined
        })
      } catch (_) {}
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2500)

    const handleCustomCommand = (e: CustomEvent) => {
      const msg = e.detail.command
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const timeStr = `${hh}:${mm}:${ss}`

      setLines(prev => {
        const entry: ConsoleLine = {
          time: timeStr,
          level: 'INFO',
          text: `<dashboard> ${msg}`,
        }
        const combined = [...prev, entry]
        return combined.length > 60 ? combined.slice(-60) : combined
      })
    }
    window.addEventListener('console-action', handleCustomCommand as EventListener)

    return () => {
      clearInterval(interval)
      window.removeEventListener('console-action', handleCustomCommand as EventListener)
    }
  }, [])

  // Auto-scroll only when already at bottom
  useEffect(() => {
    if (scrollRef.current && shouldAutoScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isSending) return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const timeStr = `${hh}:${mm}:${ss}`
    const userCmd = command.trim()

    setLines(prev => [
      ...prev,
      {
        time: timeStr,
        level: 'INFO',
        text: `<console> issued command: /${userCmd}`,
      },
    ])

    setCommand('')
    setIsSending(true)

    try {
      await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userCmd }),
      })
    } finally {
      setIsSending(false)
    }
  }

  const clearPreview = () => {
    setLines([])
    clearedAtRef.current = Date.now()
    lastSeenLineRef.current = null
  }

  return (
    <div
      className={cn(
        'glass flex flex-col rounded-3xl overflow-hidden max-h-[420px] border-primary/20 shadow-[0_0_40px_-10px_rgba(98,6,191,0.2)] transition-all duration-300 hover:border-primary/40',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 bg-black/25 px-5 py-3.5 backdrop-blur-md">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-end-stone shadow-[0_0_15px_rgba(98,6,191,0.3)]">
          <TerminalSquare className="size-4" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-wide">
            Live Console
          </h2>
          <StatusBadge status={isRunning ? 'streaming' : 'offline'} />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={clearPreview}
            title="Clear preview"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <Trash2 className="size-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <Link
            href="/console"
            title="Open full console"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-end-stone bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Full Console</span>
          </Link>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed min-h-[16rem] bg-black/45 custom-scrollbar"
      >
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.time}`}
            className="flex gap-3 py-0.5 hover:bg-white/[0.03] rounded px-1.5 -mx-1.5 transition-colors"
          >
            <span className="shrink-0 text-muted-foreground/60 select-none">
              [{line.time}]
            </span>
            <span
              className={cn(
                'shrink-0 font-bold tracking-wider',
                levelColor(line.level),
              )}
            >
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
              Waiting for server logs...
            </p>
          </div>
        )}
      </div>

      {/* Command Input */}
      <form
        onSubmit={sendCommand}
        className="flex items-center gap-2 border-t border-border/50 bg-black/30 p-2.5 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <ChevronRight className="size-4 text-end-stone ml-1 drop-shadow-[0_0_8px_rgba(225,242,189,0.5)] shrink-0" />
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. say Welcome to the server! or time set day..."
          disabled={isSending}
          className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none relative z-10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !command.trim()}
          className="relative z-10 rounded-xl bg-primary/25 px-3 py-1.5 text-xs font-bold text-end-stone transition-all hover:bg-primary/40 hover:shadow-[0_0_15px_rgba(98,6,191,0.4)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
