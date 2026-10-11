// ── Player Types ───────────────────────────────────────────

export type Player = {
  id: string
  name: string
  avatar: string
  latency: number
  role: 'Admin' | 'Mod' | 'Member'
  playtime: string
  isActive?: boolean
  // Profile details
  joined: string
  lastSeen: string
  health: number
  food: number
  xpLevel: number
  gamemode: 'Survival' | 'Creative' | 'Adventure'
  dimension: 'Overworld' | 'Nether' | 'The End'
  coords: { x: number; y: number; z: number }
  deaths: number
  blocksMined: number
  mobKills: number
  inventory: { item: string; qty: number }[]
}

export type BannedPlayer = {
  id: string
  name: string
  reason: string
  date: string
}
