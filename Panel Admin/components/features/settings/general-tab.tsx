'use client'

import { ChevronDown } from 'lucide-react'

type GeneralTabProps = {
  state: any
  updateState: (key: string, value: any) => void
}

export function GeneralTab({ state, updateState }: GeneralTabProps) {
  return (
    <div className="glass rounded-3xl p-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Propiedades del Servidor</h2>
        <p className="text-sm text-muted-foreground">Configuración principal aplicada en el próximo reinicio</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-semibold text-end-stone/90">Mensaje del Día (MOTD)</span>
          <input
            value={state.motd}
            onChange={(e) => updateState('motd', e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Puerto del Servidor</span>
          <input
            type="number"
            value={state.serverPort}
            onChange={(e) => updateState('serverPort', e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Máximo de Jugadores</span>
          <input
            type="number"
            value={state.maxPlayers}
            onChange={(e) => updateState('maxPlayers', e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Dificultad</span>
          <div className="relative">
            <select
              value={state.difficulty}
              onChange={(e) => updateState('difficulty', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140e36]/90 px-4 py-3 pr-10 text-sm text-[#ece9ff] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="peaceful" className="bg-[#140e36] text-[#ece9ff]">Pacífico</option>
              <option value="easy" className="bg-[#140e36] text-[#ece9ff]">Fácil</option>
              <option value="normal" className="bg-[#140e36] text-[#ece9ff]">Normal</option>
              <option value="hard" className="bg-[#140e36] text-[#ece9ff]">Difícil</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Modo de Juego por Defecto</span>
          <div className="relative">
            <select
              value={state.gamemode}
              onChange={(e) => updateState('gamemode', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#140e36]/90 px-4 py-3 pr-10 text-sm text-[#ece9ff] focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors appearance-none cursor-pointer"
            >
              <option value="survival" className="bg-[#140e36] text-[#ece9ff]">Supervivencia</option>
              <option value="creative" className="bg-[#140e36] text-[#ece9ff]">Creativo</option>
              <option value="adventure" className="bg-[#140e36] text-[#ece9ff]">Aventura</option>
              <option value="spectator" className="bg-[#140e36] text-[#ece9ff]">Espectador</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Distancia de Renderizado (Chunks)</span>
          <input
            type="number"
            min="2"
            max="32"
            value={state.viewDistance}
            onChange={(e) => updateState('viewDistance', e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-end-stone/90">Distancia de Simulación (Chunks)</span>
          <input
            type="number"
            min="2"
            max="32"
            value={state.simDistance}
            onChange={(e) => updateState('simDistance', e.target.value)}
            className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </label>
      </div>
    </div>
  )
}
