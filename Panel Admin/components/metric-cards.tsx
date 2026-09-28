'use client'

import { Sparkline } from './sparkline'
import { Cpu, MemoryStick, Clock, Users, type LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

type Metric = {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  data?: number[]
  color: string
  trend: string
}

export function MetricCards() {
  const [metricsData, setMetricsData] = useState({ cpu: '0.0', ram: '0.0', tps: '20.0', players: 0 })
  const [cpuHist, setCpuHist] = useState<number[]>(Array(20).fill(0))
  const [ramHist, setRamHist] = useState<number[]>(Array(20).fill(0))
  const [playerHist, setPlayerHist] = useState<number[]>(Array(20).fill(0))
  const [uptime, setUptime] = useState('0d 0h 0m')

  useEffect(() => {
    // Polling de metrics
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/server/status')
        const data = await res.json()
        if (data.metrics) {
          setMetricsData(data.metrics)
          
          if (data.metrics.uptime) {
            const uptimeSecs = parseInt(data.metrics.uptime)
            const d = Math.floor(uptimeSecs / 86400)
            const h = Math.floor((uptimeSecs % 86400) / 3600)
            const m = Math.floor((uptimeSecs % 3600) / 60)
            setUptime(`${d}d ${h}h ${m}m`)
          }
          
          setCpuHist(prev => {
            const next = [...prev, parseFloat(data.metrics.cpu)]
            if (next.length > 20) next.shift()
            return next
          })
          
          setRamHist(prev => {
            const next = [...prev, parseFloat(data.metrics.ram)]
            if (next.length > 20) next.shift()
            return next
          })
          
          setPlayerHist(prev => {
            const next = [...prev, data.metrics.players || 0]
            if (next.length > 20) next.shift()
            return next
          })
        }
      } catch (e) {}
    }

    const interval = setInterval(fetchStatus, 2000)
    fetchStatus()

    return () => clearInterval(interval)
  }, [])

  const metrics: Metric[] = [
    {
      label: 'CPU Load',
      value: `${metricsData.cpu}%`,
      sub: 'Server Usage',
      icon: Cpu,
      data: cpuHist,
      color: 'var(--neon)',
      trend: 'Live',
    },
    {
      label: 'Memory',
      value: `${metricsData.ram} GB`,
      sub: 'System RAM',
      icon: MemoryStick,
      data: ramHist,
      color: '#e1f2bd',
      trend: 'Live',
    },
    {
      label: 'Players',
      value: `${metricsData.players}`,
      sub: 'Online now',
      icon: Users,
      data: playerHist,
      color: '#b06bf0',
      trend: 'Live',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`glass group flex flex-col gap-3 rounded-3xl p-5 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(98,6,191,0.15)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both`}
          // eslint-disable-next-line react/forbid-dom-props
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/25 text-end-stone group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <m.icon className="size-4.5" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {m.label}
              </span>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              {m.trend}
            </span>
          </div>
          <div>
            <p className="font-heading text-3xl font-semibold tracking-tight text-foreground neon-text">
              {m.value}
            </p>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </div>
          {m.data && <Sparkline data={m.data} color={m.color} />}
        </div>
      ))}

      {/* Uptime card without chart */}
      <div 
        className="glass group flex flex-col justify-between gap-3 rounded-3xl p-5 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(98,6,191,0.15)] animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
        // eslint-disable-next-line react/forbid-dom-props
        style={{ animationDelay: `${metrics.length * 100}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/25 text-end-stone group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Clock className="size-4.5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Uptime
            </span>
          </div>
        </div>
        <div>
          <p className="font-heading text-3xl font-semibold tracking-tight text-foreground neon-text">
            {uptime}
          </p>
          <p className="text-xs text-muted-foreground">
            System uptime
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[100%] rounded-full bg-gradient-to-r from-primary to-[var(--neon)] relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <span className="text-xs font-medium text-end-stone">Active</span>
        </div>
      </div>
    </div>
  )
}
