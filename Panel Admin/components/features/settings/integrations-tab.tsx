'use client'

import { cn } from '@/lib/utils'
import { Loader2, Save } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

type IntegrationsTabProps = {
  state: any
  updateState: (key: string, value: any) => void
  toggleStateItem: (key: string) => void
  driveState: { enabled: boolean; folderId: string; serviceAccount: string }
  setDriveState: React.Dispatch<React.SetStateAction<{ enabled: boolean; folderId: string; serviceAccount: string }>>
  saveDriveSettings: () => void
  driveProcessing: boolean
}

export function IntegrationsTab({
  state,
  updateState,
  toggleStateItem,
  driveState,
  setDriveState,
  saveDriveSettings,
  driveProcessing,
}: IntegrationsTabProps) {
  return (
    <div className="grid gap-6 animate-in fade-in slide-in-from-right-4 transition-opacity">
      {/* Configuración de RCON */}
      <div className="glass rounded-3xl p-6 border border-white/10 shadow-lg">
        <div className="mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Consola Remota (RCON)
            </h2>
            <p className="text-sm text-muted-foreground/80">
              Permite que el panel y herramientas externas ejecuten comandos en el servidor
            </p>
          </div>
          <Toggle
            enabled={Boolean(state.rconEnabled)}
            onChange={() => toggleStateItem('rconEnabled')}
            label="Activar RCON"
          />
        </div>
        <div className={cn("grid gap-6 sm:grid-cols-2 transition-opacity", !state.rconEnabled && "opacity-50 pointer-events-none")}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Puerto RCON</span>
            <input
              type="number"
              value={state.rconPort}
              onChange={(e) => updateState('rconPort', e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Contraseña RCON</span>
            <input
              type="password"
              value={state.rconPass}
              onChange={(e) => updateState('rconPass', e.target.value)}
              placeholder="Introduce una contraseña segura"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Copias de Seguridad en Google Drive */}
      <div className="glass rounded-3xl p-6 border border-white/10 shadow-lg">
        <div className="mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Copias en Google Drive (Nube)
            </h2>
            <p className="text-sm text-muted-foreground/80">
              Sube y sincroniza automáticamente las copias de seguridad a tu unidad de Google Drive
            </p>
          </div>
          <Toggle
            enabled={driveState.enabled}
            onChange={() => setDriveState(d => ({ ...d, enabled: !d.enabled }))}
            label="Activar Google Drive"
          />
        </div>
        <div className={cn("grid gap-6 transition-opacity", !driveState.enabled && "opacity-50 pointer-events-none")}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">ID de Carpeta en Google Drive</span>
            <input
              value={driveState.folderId}
              onChange={(e) => setDriveState(d => ({ ...d, folderId: e.target.value }))}
              placeholder="Ej. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              El identificador único de la carpeta de Google Drive donde se almacenarán los backups. Debe estar compartida con el correo de la Cuenta de Servicio.
            </p>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-end-stone/90">Credenciales JSON de Cuenta de Servicio</span>
            <textarea
              value={driveState.serviceAccount}
              onChange={(e) => setDriveState(d => ({ ...d, serviceAccount: e.target.value }))}
              placeholder='{"type": "service_account", ...}'
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors min-h-[100px] font-mono text-xs"
            />
          </label>
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={saveDriveSettings}
              disabled={driveProcessing || (driveState.enabled && (!driveState.folderId || !driveState.serviceAccount))}
              className="tactile-btn flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {driveProcessing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar Configuración de Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
