'use client'

import { settingGroups } from '@/lib/constants'
import { Toggle } from '@/components/ui/toggle'

type WorldRulesTabProps = {
  toggles: Record<string, boolean>
  onToggle: (id: string) => void
}

export function WorldRulesTab({ toggles, onToggle }: WorldRulesTabProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-right-4 transition-opacity">
      {settingGroups.map((g) => (
        <div key={g.group} className="glass flex flex-col rounded-3xl h-fit border border-white/10 shadow-lg transition-[border-color] duration-150 hover:border-primary/30">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">{g.group}</h2>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {g.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white/[0.02]">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-medium text-foreground tracking-tight mb-0.5">{item.label}</p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.description}</p>
                </div>
                <Toggle
                  enabled={Boolean(toggles[item.id])}
                  onChange={() => onToggle(item.id)}
                  label={item.label}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
