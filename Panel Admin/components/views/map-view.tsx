'use client'

import { Map as MapIcon, MonitorX } from 'lucide-react'
import { useEffect, useState } from 'react'

export function MapView() {
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
      <div className="glass flex-1 rounded-3xl overflow-hidden border border-border/50 relative group flex flex-col items-center justify-center bg-background/50">
        {isServerOnline === null ? (
          <div className="animate-pulse flex flex-col items-center gap-4 text-muted-foreground">
            <MapIcon className="size-12 opacity-50" />
            <p>Loading map status...</p>
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
          <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in fade-in">
            <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-rose-500">
              <MonitorX className="size-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-heading font-bold text-foreground">Map Unavailable</h2>
              <p className="text-sm mt-2 max-w-md mx-auto">The live map is currently offline. Please ensure the Minecraft server is running and the map plugin is properly configured.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
