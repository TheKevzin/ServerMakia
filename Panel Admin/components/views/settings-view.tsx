'use client'

import { cn } from '@/lib/utils'
import { settingGroups } from '@/lib/constants'
import { useState, useEffect } from 'react'
import {
  Save,
  RotateCcw,
  Settings,
  Globe,
  Cpu,
  Link2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { toast } from '@/lib/toast'
import { useServerStatus } from '@/lib/hooks'
import {
  GeneralTab,
  WorldRulesTab,
  PerformanceTab,
  IntegrationsTab,
  DangerZoneTab,
} from '@/components/features/settings'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState('general')
  const { isRunning: isServerOnline } = useServerStatus()

  // Initial State Data
  const initialToggles: Record<string, boolean> = {}
  settingGroups.forEach((g) => g.items.forEach((i) => (initialToggles[i.id] = i.enabled)))

  const [state, setState] = useState<any>(null)
  const [savedState, setSavedState] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Drive & Danger state
  const [driveState, setDriveState] = useState({ enabled: false, folderId: '', serviceAccount: '' })
  const [driveProcessing, setDriveProcessing] = useState(false)
  const [dangerModal, setDangerModal] = useState<'reset' | 'delete' | null>(null)
  const [dangerConfirm, setDangerConfirm] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setState(data)
          setSavedState(data)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))

    fetch('/api/settings/drive')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.enabled) {
          setDriveState({ enabled: true, folderId: data.folderId, serviceAccount: data.serviceAccount || '' })
        }
      })
      .catch(() => {})
  }, [])

  const updateState = (key: string, value: any) => {
    setState((prev: any) => {
      const next = { ...prev, [key]: value }
      setIsDirty(JSON.stringify(next) !== JSON.stringify(savedState))
      return next
    })
  }

  const toggleStateItem = (key: string) => {
    updateState(key, !state[key])
  }

  const toggleGroupItem = (id: string) => {
    setState((prev: any) => {
      const nextToggles = { ...prev.toggles, [id]: !prev.toggles[id] }
      const next = { ...prev, toggles: nextToggles }
      setIsDirty(JSON.stringify(next) !== JSON.stringify(savedState))
      return next
    })
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      if (res.ok) {
        setSavedState(state)
        setIsDirty(false)
        toast.success('¡Configuración guardada con éxito!')
      } else {
        toast.error('Error al guardar la configuración')
      }
    } catch {
      toast.error('Error de red al intentar guardar')
    }
  }

  const handleReset = () => {
    setState(savedState)
    setIsDirty(false)
    toast.info('Se restauraron los ajustes guardados')
  }

  const saveDriveSettings = async () => {
    setDriveProcessing(true)
    try {
      const res = await fetch('/api/settings/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          driveState.enabled
            ? { folderId: driveState.folderId, serviceAccount: driveState.serviceAccount }
            : { enabled: false }
        ),
      })
      if (res.ok) {
        toast.success(driveState.enabled ? '¡Google Drive vinculado!' : 'Google Drive desactivado')
      } else {
        toast.error('Error al guardar configuración de Drive')
      }
    } catch {
      toast.error('Error de red al guardar Drive')
    }
    setDriveProcessing(false)
  }

  const handleDangerAction = async () => {
    if (!dangerModal) return
    setProcessing(true)
    try {
      const res = await fetch('/api/server/danger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: dangerModal }),
      })
      if (res.ok) {
        toast.success(dangerModal === 'reset' ? 'Reinicio de mundo iniciado' : 'Borrado total de servidor iniciado')
        setDangerModal(null)
        setDangerConfirm('')
      } else {
        const data = await res.json()
        toast.error(`Error: ${data.error}`)
      }
    } catch {
      toast.error('Error al ejecutar la acción de peligro')
    }
    setProcessing(false)
  }

  const tabs = [
    { id: 'general', label: 'Propiedades Generales', icon: Settings },
    { id: 'rules', label: 'Reglas del Mundo', icon: Globe },
    { id: 'performance', label: 'Rendimiento y RAM', icon: Cpu },
    { id: 'integrations', label: 'Integraciones', icon: Link2 },
    { id: 'danger', label: 'Zona de Peligro', icon: AlertTriangle, danger: true },
  ]

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative min-h-[500px] pb-24">
      {isLoading || !state ? (
        <div className="flex w-full items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Pestañas de Navegación */}
          <div className="flex flex-col gap-2 lg:w-64 shrink-0">
            <h2 className="font-heading text-lg font-bold text-foreground mb-2 px-2">Configuración</h2>
            <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'tactile-btn flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer',
                    activeTab === t.id
                      ? t.danger
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : 'bg-primary/20 text-end-stone border border-primary/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'text-muted-foreground hover:bg-white/5 border border-transparent hover:text-foreground',
                  )}
                >
                  <t.icon className="size-4" />
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Contenido */}
          <div className="flex-1 max-w-4xl">
            {isServerOnline && activeTab !== 'danger' && (
              <div className="mb-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 animate-in fade-in">
                <p className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  Nota: El servidor está en línea. Los cambios de configuración se aplicarán en el próximo reinicio.
                </p>
              </div>
            )}

            {activeTab === 'general' && (
              <GeneralTab state={state} updateState={updateState} />
            )}

            {activeTab === 'rules' && (
              <WorldRulesTab toggles={state.toggles} onToggle={toggleGroupItem} />
            )}

            {activeTab === 'performance' && (
              <PerformanceTab
                state={state}
                updateState={updateState}
                toggleStateItem={toggleStateItem}
              />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsTab
                state={state}
                updateState={updateState}
                toggleStateItem={toggleStateItem}
                driveState={driveState}
                setDriveState={setDriveState}
                saveDriveSettings={saveDriveSettings}
                driveProcessing={driveProcessing}
              />
            )}

            {activeTab === 'danger' && (
              <DangerZoneTab
                isServerOnline={isServerOnline}
                dangerModal={dangerModal}
                setDangerModal={setDangerModal}
                dangerConfirm={dangerConfirm}
                setDangerConfirm={setDangerConfirm}
                processing={processing}
                handleDangerAction={handleDangerAction}
              />
            )}
          </div>

          {/* Barra Flotante Inferior de Guardado */}
          {isDirty && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-2xl border border-primary/40 bg-[#140e36]/95 px-6 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
              <span className="text-xs font-semibold text-end-stone flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Cambios sin guardar
              </span>
              <div className="h-4 w-px bg-white/10" />
              <button
                type="button"
                onClick={handleReset}
                className="tactile-btn flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="tactile-btn flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg cursor-pointer"
              >
                <Save className="size-3.5" />
                Guardar Cambios
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
