// ── Auth Types ──────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MODERATOR' | 'VIEWER'

export type UserSession = {
  id: string
  username: string
  role: UserRole
  minecraftName?: string
}

export type AuthState = {
  authenticated: boolean
  role?: UserRole
  username?: string
  minecraftName?: string
}

// Extend next-auth types (legacy support)
declare module "next-auth" {
  interface User {
    role?: string
  }

  interface Session {
    user: {
      role?: string
    } & DefaultSession["user"]
  }
}
