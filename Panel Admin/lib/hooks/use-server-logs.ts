'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ConsoleLine } from '@/types'

function parseLogLine(text: string): ConsoleLine {
  let level: 'INFO' | 'WARN' | 'ERROR' = 'INFO'
  if (text.includes('WARN')) level = 'WARN'
  if (
    text.includes('ERROR') ||
    text.includes('Exception') ||
    text.includes('Failed')
  ) {
    level = 'ERROR'
  }

  const timeMatch = text.match(/\[(\d{2}:\d{2}:\d{2})\]/)
  const time = timeMatch
    ? timeMatch[1]
    : new Date().toLocaleTimeString('en-GB', {
        hour12: false,
        timeZone: 'America/Bogota',
      })

  return { time, level, text }
}

export function useServerLogs(maxLines = 500) {
  const [lines, setLines] = useState<ConsoleLine[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const clearedLogsCache = useRef<Set<string>>(new Set())
  const esRef = useRef<EventSource | null>(null)

  const clearLogs = useCallback(() => {
    setLines((prev) => {
      prev.forEach((l) => clearedLogsCache.current.add(l.text))
      return []
    })
  }, [])

  const addCustomLine = useCallback((text: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') => {
    const time = new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      timeZone: 'America/Bogota',
    })
    setLines((prev) => [...prev.slice(-(maxLines - 1)), { time, level, text }])
  }, [maxLines])

  useEffect(() => {
    let fallbackInterval: NodeJS.Timeout | null = null

    const startFallbackPolling = () => {
      if (fallbackInterval) return
      setIsStreaming(false)
      fallbackInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/server/logs')
          if (!res.ok) return
          const data = await res.json()
          if (Array.isArray(data.logs)) {
            setLines((prev) => {
              const parsed = data.logs
                .map(parseLogLine)
                .filter((l: ConsoleLine) => !clearedLogsCache.current.has(l.text))
              const existingSet = new Set(prev.map((p) => p.text))
              const actuallyNew = parsed.filter((l: ConsoleLine) => !existingSet.has(l.text))
              if (actuallyNew.length === 0) return prev
              return [...prev, ...actuallyNew].slice(-maxLines)
            })
          }
        } catch {
          // ignore
        }
      }, 3000)
    }

    if (typeof EventSource !== 'undefined') {
      try {
        const es = new EventSource('/api/server/logs/stream')
        esRef.current = es

        es.onopen = () => {
          setIsStreaming(true)
          if (fallbackInterval) {
            clearInterval(fallbackInterval)
            fallbackInterval = null
          }
        }

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'init' && Array.isArray(data.logs)) {
              const parsed = data.logs
                .map(parseLogLine)
                .filter((l: ConsoleLine) => !clearedLogsCache.current.has(l.text))
              setLines(parsed.slice(-maxLines))
            } else if (data.type === 'append' && Array.isArray(data.lines)) {
              const parsed = data.lines
                .map(parseLogLine)
                .filter((l: ConsoleLine) => !clearedLogsCache.current.has(l.text))
              if (parsed.length > 0) {
                setLines((prev) => {
                  const existingSet = new Set(prev.map((p) => p.text))
                  const fresh = parsed.filter((l: ConsoleLine) => !existingSet.has(l.text))
                  if (fresh.length === 0) return prev
                  return [...prev, ...fresh].slice(-maxLines)
                })
              }
            }
          } catch {
            // non-JSON message, e.g. ping
          }
        }

        es.onerror = () => {
          setIsStreaming(false)
          // If SSE disconnects, fallback polling will ensure continuity
          startFallbackPolling()
        }
      } catch {
        startFallbackPolling()
      }
    } else {
      startFallbackPolling()
    }

    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval)
      }
    }
  }, [maxLines])

  return {
    lines,
    isStreaming,
    clearLogs,
    addCustomLine,
  }
}
