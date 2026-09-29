'use client'

import { cn } from '@/lib/utils'

export type StatusType = 'online' | 'offline' | 'live' | 'streaming' | 'idle' | 'warning'

interface StatusDotProps {
  status: StatusType | boolean
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  const isOnline = status === true || status === 'online' || status === 'live' || status === 'streaming'
  const isWarning = status === 'idle' || status === 'warning'

  return (
    <span className={cn('relative flex size-2 shrink-0 items-center justify-center', className)}>
      {isOnline && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 duration-1000" />
      )}
      {isWarning && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400/50 duration-1000" />
      )}
      <span
        className={cn(
          'relative inline-flex size-1.5 rounded-full transition-colors duration-300',
          isOnline && 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
          isWarning && 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
          !isOnline && !isWarning && 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]'
        )}
      />
    </span>
  )
}

interface StatusBadgeProps {
  status: StatusType | boolean
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const isOnline = status === true || status === 'online' || status === 'live' || status === 'streaming'
  const isWarning = status === 'idle' || status === 'warning'

  const defaultLabel = (() => {
    if (typeof status === 'boolean') return status ? 'Online' : 'Offline'
    switch (status) {
      case 'online': return 'Online'
      case 'live': return 'Live'
      case 'streaming': return 'Streaming'
      case 'offline': return 'Offline'
      case 'idle': return 'Idle'
      case 'warning': return 'Warning'
      default: return 'Offline'
    }
  })()

  const displayLabel = label || defaultLabel

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border transition-all duration-300',
        isOnline && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.12)]',
        isWarning && 'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.12)]',
        !isOnline && !isWarning && 'border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        className
      )}
    >
      <StatusDot status={status} />
      <span>{displayLabel}</span>
    </span>
  )
}
