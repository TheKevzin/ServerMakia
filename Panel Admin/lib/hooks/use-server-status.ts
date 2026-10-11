'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { TunnelInfo } from '@/types/server'

export type ServerStatusResponse = {
  isRunning: boolean
  tunnel?: TunnelInfo
  version?: string
  metrics?: {
    cpu: string
    ram: string
    tps: string
  }
}

const DEFAULT_TUNNEL: TunnelInfo = {
  domain: '...',
  directIp: '...',
  local: '...',
}

/**
 * Reusable hook backed by SWR for real-time server health, metrics, and tunnel tracking.
 * Automatically dedupes requests, handles background polling, and revalidates on focus.
 */
export function useServerStatus(intervalMs = 10_000) {
  const { data, error, isLoading, mutate } = useSWR<ServerStatusResponse>(
    '/api/server/status',
    fetcher,
    {
      refreshInterval: intervalMs,
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  )

  return {
    isRunning: Boolean(data?.isRunning),
    tunnel: data?.tunnel ?? DEFAULT_TUNNEL,
    metrics: data?.metrics,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error checking status') : null,
    refresh: mutate,
  }
}
