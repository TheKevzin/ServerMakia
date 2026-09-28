'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastData = { id: number; message: string; type: 'success' | 'error' | 'info' }

export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe((t) => {
      const id = Date.now() + Math.random()
      setToasts(prev => [...prev, { ...t, id }])
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== id))
      }, 3000)
    })
    return unsubscribe
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-4 fade-in duration-300 pointer-events-auto",
          t.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          t.type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
          "bg-blue-500/10 border-blue-500/20 text-blue-400"
        )}>
          {t.type === 'success' && <CheckCircle2 className="size-5" />}
          {t.type === 'error' && <AlertCircle className="size-5" />}
          {t.type === 'info' && <Info className="size-5" />}
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-2 hover:opacity-70 transition-opacity">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
