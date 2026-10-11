'use client'

import { cn } from '@/lib/utils'
import { CalendarClock, Plus, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type BackupScheduleCardProps = {
  autoBackup: boolean
  setAutoBackup: React.Dispatch<React.SetStateAction<boolean>>
  frequency: string
  setFrequency: (f: string) => void
  retention: string
  setRetention: (r: string) => void
  onSaveSchedule: () => void
  savingSchedule: boolean
  onOpenCreateModal: () => void
  creating: boolean
}

export function BackupScheduleCard({
  autoBackup,
  setAutoBackup,
  frequency,
  setFrequency,
  retention,
  setRetention,
  onSaveSchedule,
  savingSchedule,
  onOpenCreateModal,
  creating,
}: BackupScheduleCardProps) {
  return (
    <div className="glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-end-stone mt-1">
          <CalendarClock className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <p className="font-heading text-sm font-semibold text-foreground">
              Automatic Backups
            </p>
            <button
              type="button"
              role="switch"
              title="Toggle Auto Backup"
              aria-checked={autoBackup}
              onClick={() => setAutoBackup((v) => !v)}
              className={cn(
                'relative h-5 w-9 shrink-0 rounded-full border transition-colors cursor-pointer',
                autoBackup ? 'border-primary/50 bg-primary/40' : 'border-border bg-white/5'
              )}
            >
              <span
                className={cn(
                  'absolute top-[1px] size-4 rounded-full bg-foreground transition-all',
                  autoBackup ? 'left-[17px] bg-end-stone shadow-[0_0_10px_rgba(98,6,191,0.8)]' : 'left-[1px]'
                )}
              />
            </button>
          </div>
          {autoBackup && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger title="Backup frequency" className="w-[180px] bg-white/5 border-border text-foreground">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                  <SelectItem value="Daily at 00:00">Daily at 00:00</SelectItem>
                  <SelectItem value="Weekly on Sunday">Weekly on Sunday</SelectItem>
                </SelectContent>
              </Select>
              <span>keep last</span>
              <Select value={retention} onValueChange={setRetention}>
                <SelectTrigger title="Retention policy" className="w-[120px] bg-white/5 border-border text-foreground">
                  <SelectValue placeholder="Retention" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3 days">3 days</SelectItem>
                  <SelectItem value="7 days">7 days</SelectItem>
                  <SelectItem value="14 days">14 days</SelectItem>
                  <SelectItem value="30 days">30 days</SelectItem>
                </SelectContent>
              </Select>

              <button
                type="button"
                onClick={onSaveSchedule}
                disabled={savingSchedule}
                className="ml-2 rounded-lg bg-primary/20 border border-primary/40 px-3 py-1.5 text-xs font-semibold text-end-stone hover:bg-primary/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingSchedule ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCreateModal}
        disabled={creating}
        className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 shadow-[0_0_20px_rgba(98,6,191,0.3)] cursor-pointer"
      >
        {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Create Backup Now
      </button>
    </div>
  )
}
