'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { AuthState } from '@/types/auth'

/**
 * Hook that fetches and caches the current user's auth state from /api/auth/me via SWR.
 * Prevents redundant fetches across layout and pages.
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthState>(
    '/api/auth/me',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  )

  return {
    user: data ?? null,
    loading: isLoading,
    isAuthenticated: Boolean(data?.authenticated),
    role: data?.role ?? null,
    username: data?.username ?? '',
    minecraftName: data?.minecraftName ?? '',
    error: error ?? null,
    refresh: mutate,
  }
}
