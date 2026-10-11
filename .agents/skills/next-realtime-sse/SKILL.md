---
name: next-realtime-sse
description: >-
  Use this skill when implementing or maintaining Server-Sent Events (SSE)
  or real-time streaming in Next.js 16 App Router (such as console log streaming,
  live CPU/RAM server metrics, and player activity events).
---

# Real-Time Streaming & Server-Sent Events in Next.js App Router

This skill defines reliable patterns for streaming real-time data from backend services to Next.js clients using standard web streams.

## API Route Architecture (`app/api/.../stream/route.ts`)

In Next.js App Router, SSE endpoints use the Web Streams API (`ReadableStream`):

```typescript
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(': connected\n\n'))

      const interval = setInterval(() => {
        try {
          const data = JSON.stringify({ timestamp: Date.now() })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          clearInterval(interval)
        }
      }, 1000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering (Nginx / Cloudflare)
    },
  })
}
```

## Client Consumer Pattern

Clients should handle connection drops, backoff, and event parsing gracefully:

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'

export function useEventStream<T>(url: string) {
  const [data, setData] = useState<T[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setIsConnected(true)
    es.onerror = () => setIsConnected(false)
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        setData((prev) => [...prev.slice(-200), parsed])
      } catch (err) {
        console.error('Failed to parse SSE line', err)
      }
    }

    return () => {
      es.close()
    }
  }, [url])

  return { data, isConnected }
}
```
