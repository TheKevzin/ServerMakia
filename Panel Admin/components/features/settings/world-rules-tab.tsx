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
        <div key={g.group} className="glass flex flex-col rounded-3xl h-fit">
          <div className="border-b border-border p-5">
            <h2 className="font-heading text-sm font-semibold text-foreground">{g.group}</h2>
          </div>
          <ul className="divide-y divide-border">
            {g.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-bold text-foreground mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
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
