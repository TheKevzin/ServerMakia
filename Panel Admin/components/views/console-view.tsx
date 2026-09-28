'use client'

import { cn } from '@/lib/utils'
import { type ConsoleLine } from '@/lib/data'
import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { 
  ChevronRight, Trash2, Download, Save, RefreshCw, Power, 
  Sun, Sunrise, Moon, Activity, Zap, Users, Cloud, 
  CloudRain, CloudLightning, Clock, MoonStar, ChevronDown, MonitorPlay, Database, Gauge
} from 'lucide-react'

type Level = 'ALL' | 'INFO' | 'WARN' | 'ERROR'

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

// ─── TOOLBAR COMPONENTS ────────────────────────────────────────────────────────

function ToolbarDropdown({ icon: Icon, label, options, send }: { icon: any, label: string, options: {label: string, cmd: string, icon: any}[], send: (cmd: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
          open ? "bg-primary/20 border-primary/40 text-end-stone" : "bg-white/5 border-border text-muted-foreground hover:bg-white/10 hover:text-foreground"
        )}
      >
        <Icon className="size-3.5" />
        {label}
        <ChevronDown className="size-3 opacity-50" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-40 rounded-xl border border-border bg-[#1a0f14]/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2">
          {options.map(opt => (
            <button
              key={opt.cmd}
              onClick={() => { send(opt.cmd); setOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/20 hover:text-end-stone transition-colors"
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function parseLogLine(text: string): ConsoleLine {
  let level: Level = 'INFO'
  if (text.includes('WARN')) level = 'WARN'
  if (text.includes('ERROR') || text.includes('Exception') || text.includes('Failed')) level = 'ERROR'
  
  const timeMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]/)
  const time = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('en-GB', { hour12: false })
  
  return { time, level, text }
}

// ─── MAIN VIEW ─────────────────────────────────────────────────────────────────

export function ConsoleView({ role }: { role?: string | null }) {
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const [command, setCommand] = useState('')
  const [filter, setFilter] = useState<Level>('ALL')
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState({ cpu: '0.0', ram: '0.0', tps: '20.0' })
  const scrollRef = useRef<HTMLDivElement>(null)
  const clearedLogsCache = useRef<Set<string>>(new Set())

  const clearLogs = () => {
    setLines(prev => {
      prev.forEach(l => clearedLogsCache.current.add(l.text))
      return []
    })
  }

  const exportLogs = () => {
    const text = filtered.map(l => `${l.time} [${l.level}] ${l.text}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `server-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Command History
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const filtered = filter === 'ALL' ? lines : lines.filter((l) => l.level === filter)

  useEffect(() => {
    // Polling para Logs
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/server/logs')
        const data = await res.json()
        if (data.logs && data.logs.length > 0) {
          setLines(prev => {
            const newParsed = data.logs.map(parseLogLine).filter((l: ConsoleLine) => !clearedLogsCache.current.has(l.text))
            
            // Check if there are truly new lines to add before triggering a re-render
            const existingTextSet = new Set(prev.map(p => p.text))
            const actuallyNew = newParsed.filter((l: ConsoleLine) => !existingTextSet.has(l.text))
            
            if (actuallyNew.length === 0) return prev
            return [...prev, ...actuallyNew].slice(-500)
          })
        }
      } catch (err) {}
    }

    fetchLogs()
    const logsInterval = setInterval(fetchLogs, 2000)
    
    // Polling de Status
    const fetchStatus = () => {
      fetch('/api/server/status')
        .then((res) => res.json())
        .then((data) => {
          setIsRunning(data.isRunning)
          if (data.metrics) {
            setMetrics({
              cpu: data.metrics.cpu,
              ram: data.metrics.ram,
              tps: data.metrics.tps,
            })
          }
        })
    }

    fetchStatus()
    const statusInterval = setInterval(fetchStatus, 5000)

    return () => {
      clearInterval(logsInterval)
      clearInterval(statusInterval)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const send = async (cmd: string) => {
    if (!cmd.trim()) return
    
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLines((prev) => [
      ...prev,
      { time: now, level: 'INFO', text: `<console> issued command: /${cmd}` },
    ])

    if (cmd === 'stop-process') {
      fetch('/api/server/stop', { method: 'POST' })
    } else if (cmd === 'start-process') {
      fetch('/api/server/start', { method: 'POST' })
    } else {
      fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && typeof data.response === 'string' && data.response.trim().length > 0) {
          setLines(prev => [...prev, { 
            time: new Date().toLocaleTimeString('en-GB', { hour12: false }), 
            level: 'INFO', 
            text: data.response 
          }])
        }
      })
      .catch(() => {})
    }

    setHistory(prev => [cmd, ...prev])
    setHistoryIndex(-1)
    setCommand('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const next = historyIndex + 1
        setHistoryIndex(next)
        setCommand(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const next = historyIndex - 1
        setHistoryIndex(next)
        setCommand(history[next])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  const counts = {
    INFO: lines.filter((l) => l.level === 'INFO').length,
    WARN: lines.filter((l) => l.level === 'WARN').length,
    ERROR: lines.filter((l) => l.level === 'ERROR').length,
  }

  return (
    <div className="flex flex-col gap-4">
      
      {/* ─── TOP TOOLBAR & METRICS ─── */}
      <div className="glass relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl p-3 px-4 shrink-0">
        
        {/* Quick Actions (Horizontal) */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => send('save-all')} className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors">
            <Save className="size-3.5" /> Save
          </button>
          <button onClick={() => send('reload')} className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors">
            <RefreshCw className="size-3.5" /> Reload
          </button>
          
          <div className="h-4 w-px bg-border mx-1" />

          <ToolbarDropdown 
            icon={Cloud} label="Weather" send={send}
            options={[
              { label: 'Clear', cmd: 'weather clear', icon: Sun },
              { label: 'Rain', cmd: 'weather rain', icon: CloudRain },
              { label: 'Thunder', cmd: 'weather thunder', icon: CloudLightning },
            ]} 
          />
          <ToolbarDropdown 
            icon={Clock} label="Time" send={send}
            options={[
              { label: 'Day', cmd: 'time set day', icon: Sunrise },
              { label: 'Noon', cmd: 'time set noon', icon: Sun },
              { label: 'Night', cmd: 'time set night', icon: Moon },
              { label: 'Midnight', cmd: 'time set midnight', icon: MoonStar },
            ]} 
          />

          {role !== 'MODERATOR' && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              {isRunning ? (
                <button onClick={() => send('stop-process')} className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-destructive hover:text-white transition-colors">
                  <Power className="size-3.5" /> Stop Server
                </button>
              ) : (
                <button onClick={() => send('start-process')} className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors">
                  <MonitorPlay className="size-3.5" /> Start Server
                </button>
              )}
            </>
          )}
        </div>

        {/* Live Metrics Header */}
        <div className="flex items-center gap-5 text-xs font-semibold">
          <div className="flex items-center gap-2 text-emerald-400">
            <MonitorPlay className="size-4 opacity-70" />
            TPS: <span className="font-mono">{metrics.tps}</span>
          </div>
          <div className="flex items-center gap-2 text-chart-4">
            <Gauge className="size-4 opacity-70" />
            CPU: <span className="font-mono">{metrics.cpu}%</span>
          </div>
          <div className="flex items-center gap-2 text-rose-300">
            <Database className="size-4 opacity-70" />
            RAM: <span className="font-mono">{metrics.ram}GB</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT GRID ─── */}
      <div className="grid lg:grid-cols-4 gap-4 lg:h-[600px] items-stretch">
        
        {/* Left Column (Filters & Mini Graph) */}
        <div className="flex flex-col gap-4 lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Mini Graph */}
          <div className="glass rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold text-foreground">CPU Usage</h2>
              <span className="flex size-2 rounded-full bg-chart-4 animate-pulse" />
            </div>
            <div className="text-center py-6">
              <p className="font-heading text-3xl font-bold text-chart-4">{metrics.cpu}%</p>
              <p className="text-xs text-muted-foreground mt-1">CPU Load</p>
            </div>
          </div>

          {/* Filters */}
          <div className="glass flex flex-col gap-4 rounded-3xl p-5">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Log Filters
            </h2>
            <div className="flex flex-col gap-2">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as Level[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter(lvl)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                    filter === lvl
                      ? 'neon-ring border-primary/50 bg-primary/25 text-end-stone'
                      : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span>{lvl}</span>
                  {lvl !== 'ALL' && (
                    <span className="tabular-nums opacity-70">
                      {counts[lvl as keyof typeof counts]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-4">
              <button onClick={clearLogs} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-rose-300">
                <Trash2 className="size-3.5" />
                Clear
              </button>
              <button onClick={exportLogs} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <Download className="size-3.5" />
                Export
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Terminal) */}
        <div className="glass flex flex-col rounded-3xl lg:col-span-3 h-[500px] lg:h-auto min-h-[500px] lg:min-h-0 max-h-[700px]">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4 shrink-0">
            <span className="flex gap-1.5">
              <span className="size-3 rounded-full bg-rose-400/70" />
              <span className="size-3 rounded-full bg-amber-400/70" />
              <span className="size-3 rounded-full bg-emerald-400/70" />
            </span>
            <span className="ml-2 font-mono text-sm text-muted-foreground">
              thekevzin@servermakia ~ console
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-300">
              <span className={cn("size-1.5 rounded-full", isRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-500")} />
              {isRunning ? 'Streaming' : 'Offline'}
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed">
            {filtered.map((line, i) => (
              <div key={i} className="flex gap-3 py-1 hover:bg-white/[0.02] rounded px-2 -mx-2 transition-colors">
                <span className="shrink-0 text-muted-foreground">{line.time}</span>
                <span className={cn('shrink-0 font-semibold', levelColor(line.level))}>
                  [{line.level}]
                </span>
                <span className="text-foreground/80 break-all">
                  {line.text}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-muted-foreground">
                No logs for this filter.
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(command) }}
            className="flex items-center gap-3 border-t border-border p-4 bg-black/20 shrink-0 rounded-b-3xl"
          >
            <ChevronRight className="size-5 text-end-stone" />
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command and press Enter... (Use Up/Down for history)"
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <button type="submit" className="rounded-xl bg-primary/25 px-4 py-2 text-xs font-medium text-end-stone transition-colors hover:bg-primary/40">
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
