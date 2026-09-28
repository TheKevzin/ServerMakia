'use client'

import { Map as MapIcon, MonitorX } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MapPage() {
  const [mapUrl, setMapUrl] = useState('')
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/server/status')
      .then(res => res.json())
      .then(data => setIsServerOnline(data.isRunning))
      .catch(() => setIsServerOnline(false))

    setMapUrl('/map-api/')
  }, [])

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground neon-text">
          Live World Map
        </h1>
        <div className="rounded-full bg-primary/20 px-4 py-1 text-sm font-medium text-end-stone shadow-[0_0_15px_rgba(98,6,191,0.3)]">
          Powered by BlueMap
        </div>
      </div>

      <div className="glass flex-1 rounded-3xl overflow-hidden border border-border/50 relative group flex flex-col items-center justify-center bg-background/50">
        {isServerOnline === null ? (
          <div className="animate-pulse flex flex-col items-center gap-4 text-muted-foreground">
            <MapIcon className="size-12 opacity-50" />
            <p>Comprobando estado del servidor...</p>
          </div>
        ) : isServerOnline ? (
          <>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
            {mapUrl && (
              <iframe
                src={mapUrl}
                className="w-full h-full border-0 animate-in fade-in duration-500 absolute inset-0 z-0 bg-[#0b0c10]"
                title="Minecraft BlueMap"
                allow="fullscreen"
                onError={() => setIsServerOnline(false)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in p-6 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <MonitorX className="size-10" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground">El Servidor está Apagado</h2>
              <p className="text-sm mt-2 max-w-md mx-auto text-muted-foreground">
                El mapa 3D en vivo requiere que el servidor de Minecraft esté encendido para renderizar el mundo. Inicia el servidor desde el Dashboard para ver el mapa.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
