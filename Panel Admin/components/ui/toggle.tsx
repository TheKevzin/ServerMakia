'use client'

import { cn } from '@/lib/utils'

export function Toggle({
  enabled,
  onChange,
  label,
  disabled = false,
}: {
  enabled: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        enabled
          ? 'neon-ring border-primary/50 bg-primary'
          : 'border-border bg-white/10',
      )}
    >
      <span
        className={cn(
          'inline-block size-4 transform rounded-full bg-foreground shadow-sm transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
