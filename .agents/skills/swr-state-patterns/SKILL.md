---
name: swr-state-patterns
description: >-
  Use this skill when implementing client-side data fetching, caching,
  revalidation, or optimistic mutations with SWR in the Next.js admin panel.
---

# SWR State Management & Data Fetching Patterns

This skill establishes patterns for client-side data synchronization in the ServerMakia admin panel using SWR.

## Core Rules

1. **Centralized Fetcher**:
   Always use a shared fetcher function that handles JSON parsing and HTTP errors:
   ```typescript
   export const fetcher = async <T>(url: string): Promise<T> => {
     const res = await fetch(url)
     if (!res.ok) {
       const err = await res.json().catch(() => ({}))
       throw new Error(err.message || 'API request failed')
     }
     return res.json()
   }
   ```

2. **Custom Hook Encapsulation**:
   Never call `useSWR('/api/...')` directly inside presentational views. Wrap in domain hooks:
   - `useServerStatus()` for server heartbeat and tunnel URL.
   - `usePlayers()` for online/offline player listings.
   - `useBackups()` for local and remote Google Drive backup lists.

3. **Revalidation & Deduping**:
   - Status / health checks: `refreshInterval: 5000`, `dedupingInterval: 2000`.
   - Static lists (files, backups): revalidate on user interaction or after mutations (`mutate('/api/files')`).
   - Pause when offline or window blurred when appropriate.
