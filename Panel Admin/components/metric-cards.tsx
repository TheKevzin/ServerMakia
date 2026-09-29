'use client'

import { Sparkline } from './sparkline'
import { Cpu, MemoryStick, Clock, Users, type LucideIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

/**
 * Hook to smoothly interpolate numerical changes across frames
 */
function useAnimatedNumber(target: number, duration = 650) {
  const [current, setCurrent] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const start = prevRef.current
    prevRef.current = target

    if (start === target) {
      setCurrent(target)
      return
    }

    const startTime = performance.now()
    let frameId: number

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const val = start + (target - start) * ease

      setCurrent(val)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setCurrent(target)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration])

  return current
}

function MetricNumber({ value, decimals = 1, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const animated = useAnimatedNumber(value)
  return (
    <span>
      {animated.toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function MetricCards() {
  const [metricsData, setMetricsData] = useState({ cpu: '0.0', ram: '0.0', tps: '20.0', players: 0 })
  const [cpuHist, setCpuHist] = useState<number[]>(Array(20).fill(0))
  const [ramHist, setRamHist] = useState<number[]>(Array(20).fill(0))
  const [playerHist, setPlayerHist] = useState<number[]>(Array(20).fill(0))
  const [uptime, setUptime] = useState('0d 0h 0m')
  const initialFetchDone = useRef(false)

  useEffect(() => {
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

          const cpuVal = parseFloat(data.metrics.cpu) || 0
          const ramVal = parseFloat(data.metrics.ram) || 0
          const playerVal = data.metrics.players || 0

          if (!initialFetchDone.current) {
            initialFetchDone.current = true
            setCpuHist(Array(20).fill(cpuVal))
            setRamHist(Array(20).fill(ramVal))
            setPlayerHist(Array(20).fill(playerVal))
          } else {
            setCpuHist(prev => [...prev.slice(1), cpuVal])
            setRamHist(prev => [...prev.slice(1), ramVal])
            setPlayerHist(prev => [...prev.slice(1), playerVal])
          }
        }
      } catch (e) {}
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const cpuNumber = parseFloat(metricsData.cpu) || 0
  const ramNumber = parseFloat(metricsData.ram) || 0

  const metrics = [
    {
      label: 'CPU Load',
      numericValue: cpuNumber,
      decimals: 1,
      suffix: '%',
      sub: 'Server Usage',
      icon: Cpu,
      data: cpuHist,
      color: 'var(--neon)',
      trend: 'Live',
      minVal: 0,
      maxVal: Math.max(30, Math.ceil(Math.max(...cpuHist, 10) / 10) * 10),
    },
    {
      label: 'Memory',
      numericValue: ramNumber,
      decimals: 1,
      suffix: ' GB',
      sub: '16 GB Total',
      icon: MemoryStick,
      data: ramHist,
      color: '#e1f2bd',
      trend: 'Live',
      minVal: 0,
      maxVal: 16,
    },
    {
      label: 'Players',
      numericValue: metricsData.players || 0,
      decimals: 0,
      suffix: '',
      sub: 'Online now',
      icon: Users,
      data: playerHist,
      color: '#b06bf0',
      trend: 'Live',
      minVal: 0,
      maxVal: Math.max(10, Math.max(...playerHist) + 2),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className="glass group flex flex-col justify-between gap-3 rounded-3xl p-5 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(98,6,191,0.15)]"
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
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)]">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {m.trend}
            </span>
          </div>

          <div>
            <p className="font-heading text-3xl font-semibold tracking-tight text-foreground neon-text tabular-nums">
              <MetricNumber value={m.numericValue} decimals={m.decimals} suffix={m.suffix} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
          </div>

          {m.data && (
            <Sparkline
              data={m.data}
              color={m.color}
              minVal={m.minVal}
              maxVal={m.maxVal}
            />
          )}
        </div>
      ))}

      {/* Uptime card */}
      <div className="glass group flex flex-col justify-between gap-3 rounded-3xl p-5 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(98,6,191,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/25 text-end-stone group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Clock className="size-4.5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Uptime
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-end-stone border border-primary/30">
            <span className="size-1.5 rounded-full bg-end-stone animate-ping" />
            Active
          </span>
        </div>

        <div>
          <p className="font-heading text-3xl font-semibold tracking-tight text-foreground neon-text">
            {uptime}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">System uptime</p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-[var(--neon)] relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-end-stone">Online</span>
        </div>
      </div>
    </div>
  )
}
