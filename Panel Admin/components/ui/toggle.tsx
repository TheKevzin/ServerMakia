'use client'

import { cn } from '@/lib/utils'

export function Toggle({
  enabled,
  checked,
  onChange,
  label,
  disabled = false,
}: {
  enabled?: boolean
  checked?: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) {
  const isChecked = enabled ?? checked ?? false

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'group relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5',
        'transition-[background-color,border-color,box-shadow] duration-200 ease-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-40',
        isChecked
          ? 'border-primary/60 bg-primary/90 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
          : 'border-white/10 bg-white/[0.08] hover:bg-white/[0.12] hover:border-white/20'
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 rounded-full bg-white shadow-md',
          'transition-[transform,width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'group-active:w-5.5', // Emil Kowalski tactile stretch on press
          isChecked
            ? 'w-4.5 translate-x-5 group-active:translate-x-4'
            : 'w-4.5 translate-x-0.5'
        )}
      />
    </button>
  )
}
