import { NextRequest } from 'next/server'
import { ServerManager } from '@/lib/server-manager'
import { SERVER_DIR } from '@/lib/server-config'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const logPath = path.join(SERVER_DIR, 'logs', 'latest.log')

  let lastSize = 0
  if (fs.existsSync(logPath)) {
    try {
      const stats = fs.statSync(logPath)
      lastSize = stats.size
    } catch {
      lastSize = 0
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial heartbeat and historical logs
      try {
        const initialLogs = ServerManager.getLogs()
        const initPayload = JSON.stringify({
          type: 'init',
          logs: initialLogs,
        })
        controller.enqueue(encoder.encode(`data: ${initPayload}\n\n`))
      } catch (err) {
        // Fallback
      }

      // 2. Poll for file append updates
      const checkInterval = setInterval(() => {
        try {
          if (!fs.existsSync(logPath)) return

          const currentStats = fs.statSync(logPath)
          if (currentStats.size > lastSize) {
            const streamReader = fs.createReadStream(logPath, {
              start: lastSize,
              end: currentStats.size,
              encoding: 'utf8',
            })

            let chunk = ''
            streamReader.on('data', (d) => {
              chunk += d
            })

            streamReader.on('end', () => {
              lastSize = currentStats.size
              const lines = chunk
                .split('\n')
                .filter(
                  (l) =>
                    l.trim() !== '' &&
                    !l.includes('RCON Client') &&
                    !l.includes('RCON Listener')
                )

              if (lines.length > 0) {
                const payload = JSON.stringify({ type: 'append', lines })
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              }
            })
          } else if (currentStats.size < lastSize) {
            // File was truncated/rotated
            lastSize = currentStats.size
          }
        } catch {
          // File read error, retry next tick
        }
      }, 750)

      // 3. Keep-alive heartbeat every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(pingInterval)
        }
      }, 15000)

      // 4. Abort listener
      req.signal.addEventListener('abort', () => {
        clearInterval(checkInterval)
        clearInterval(pingInterval)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
