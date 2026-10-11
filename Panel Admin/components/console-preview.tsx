'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TerminalSquare, ChevronRight, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from './status-badge'
import { useServerLogs, useServerStatus } from '@/lib/hooks'

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

export function ConsolePreview({ className }: { className?: string }) {
  const [command, setCommand] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { lines, isStreaming, clearLogs, addCustomLine } = useServerLogs(75)
  const { isRunning } = useServerStatus()
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60
  }, [])

  // Auto-scroll only when user is near bottom
  useEffect(() => {
    if (scrollRef.current && shouldAutoScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  // Listen to actions dispatched by dashboard controls
  useEffect(() => {
    const handleCustomCommand = (e: CustomEvent<{ command: string }>) => {
      if (e.detail?.command) {
        addCustomLine(`<dashboard> ${e.detail.command}`, 'INFO')
      }
    }
    window.addEventListener('console-action', handleCustomCommand as EventListener)
    return () => window.removeEventListener('console-action', handleCustomCommand as EventListener)
  }, [addCustomLine])

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    const userCmd = command.trim()
    if (!userCmd || isSending) return

    addCustomLine(`<console> issued command: /${userCmd}`, 'INFO')
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

  return (
    <div
      className={cn(
        'glass animate-enter flex flex-col rounded-3xl overflow-hidden max-h-[420px] border-primary/20 shadow-[0_0_35px_-8px_rgba(98,6,191,0.2)] transition-[border-color,box-shadow] duration-200 hover:border-primary/40',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-black/25 px-5 py-3.5 backdrop-blur-md">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-end-stone shadow-[0_0_12px_rgba(98,6,191,0.25)]">
          <TerminalSquare className="size-4" />
        </div>
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-tight">
            Consola en Vivo
          </h2>
          <StatusBadge status={isStreaming ? 'streaming' : isRunning ? 'online' : 'offline'} />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={clearLogs}
            title="Limpiar vista previa"
            className="tactile-btn flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/10 hover:text-foreground"
          >
            <Trash2 className="size-3" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
          <Link
            href="/console"
            title="Abrir consola completa"
            className="tactile-btn flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-end-stone bg-primary/20 hover:bg-primary/30"
          >
            <ExternalLink className="size-3" />
            <span className="hidden sm:inline">Consola Completa</span>
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
              Esperando registros del servidor...
            </p>
          </div>
        )}
      </div>

      {/* Command Input */}
      <form
        onSubmit={sendCommand}
        className="flex items-center gap-2 border-t border-border/40 bg-black/30 p-2.5 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <ChevronRight className="size-4 text-end-stone ml-1 drop-shadow-[0_0_8px_rgba(225,242,189,0.5)] shrink-0" />
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="ej. say ¡Bienvenidos! o time set day..."
          disabled={isSending}
          className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none relative z-10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !command.trim()}
          className="tactile-btn relative z-10 rounded-xl bg-primary/25 px-3 py-1.5 text-xs font-bold text-end-stone hover:bg-primary/40 hover:shadow-[0_0_15px_rgba(98,6,191,0.3)] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
