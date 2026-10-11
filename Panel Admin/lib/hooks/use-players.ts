'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Player } from '@/types/player'

type PlayersResponse = {
  players: Player[]
}

/**
 * Reusable hook for player data using SWR.
 * Caches player inventory, stats, and online status with background revalidation.
 */
export function usePlayers(refreshInterval = 10_000) {
  const { data, error, isLoading, mutate } = useSWR<PlayersResponse>(
    '/api/server/players',
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 4000,
    }
  )

  const players = data?.players ?? []
  const onlinePlayers = players.filter((p) => p.isActive)
  const offlinePlayers = players.filter((p) => !p.isActive)

  return {
    players,
    onlinePlayers,
    offlinePlayers,
    count: players.length,
    onlineCount: onlinePlayers.length,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load players') : null,
    refresh: mutate,
  }
}
