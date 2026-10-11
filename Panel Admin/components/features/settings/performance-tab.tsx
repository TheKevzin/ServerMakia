'use client'

import { ChevronDown } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

type PerformanceTabProps = {
  state: any
  updateState: (key: string, value: any) => void
  toggleStateItem: (key: string) => void
}

export function PerformanceTab({ state, updateState, toggleStateItem }: PerformanceTabProps) {
  return (
    <div className="glass rounded-3xl p-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Rendimiento y Parámetros JVM</h2>
        <p className="text-sm text-muted-foreground">Ajusta la asignación de memoria y parámetros de ejecución de Java</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Versión de Java</span>
          <div className="relative">
            <select
              value={state.javaVer}
              onChange={(e) => updateState('javaVer', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140e36]/90 px-4 py-3 pr-10 text-sm text-[#ece9ff] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="17" className="bg-[#140e36] text-[#ece9ff]">Java 17 (LTS)</option>
              <option value="21" className="bg-[#140e36] text-[#ece9ff]">Java 21 (LTS) - Recomendado</option>
              <option value="22" className="bg-[#140e36] text-[#ece9ff]">Java 22</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </label>
        
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-white/5 mt-[28px]">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-bold text-foreground">Transporte Nativo (Native Transport)</p>
            <p className="text-xs text-muted-foreground">Utiliza Epoll (solo Linux) para mayor velocidad de red</p>
          </div>
          <Toggle
            enabled={Boolean(state.nativeTransport)}
            onChange={() => toggleStateItem('nativeTransport')}
            label="Transporte Nativo"
          />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">RAM Mínima (Xms)</span>
          <div className="relative">
            <select
              value={state.ramMin}
              onChange={(e) => updateState('ramMin', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140e36]/90 px-4 py-3 pr-10 text-sm text-[#ece9ff] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="2G" className="bg-[#140e36] text-[#ece9ff]">2 GB</option>
              <option value="4G" className="bg-[#140e36] text-[#ece9ff]">4 GB</option>
              <option value="6G" className="bg-[#140e36] text-[#ece9ff]">6 GB</option>
              <option value="8G" className="bg-[#140e36] text-[#ece9ff]">8 GB</option>
              <option value="10G" className="bg-[#140e36] text-[#ece9ff]">10 GB</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">RAM Máxima (Xmx)</span>
          <div className="relative">
            <select
              value={state.ramMax}
              onChange={(e) => updateState('ramMax', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140e36]/90 px-4 py-3 pr-10 text-sm text-[#ece9ff] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="4G" className="bg-[#140e36] text-[#ece9ff]">4 GB</option>
              <option value="6G" className="bg-[#140e36] text-[#ece9ff]">6 GB</option>
              <option value="8G" className="bg-[#140e36] text-[#ece9ff]">8 GB</option>
              <option value="10G" className="bg-[#140e36] text-[#ece9ff]">10 GB</option>
              <option value="12G" className="bg-[#140e36] text-[#ece9ff]">12 GB</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </label>
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <p className="text-xs text-primary/80 font-mono">Los flags de Aikar se inyectan automáticamente al iniciar según la asignación de RAM para optimizar la recolección de basura.</p>
      </div>
    </div>
  )
}
