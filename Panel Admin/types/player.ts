// ── Player Types ───────────────────────────────────────────

export type PlayerItemSummary = {
  item: string
  qty: number
  id?: string
  textureUrl?: string
  enchantments?: string[]
  durabilityPct?: number | null
  isEnchanted?: boolean
  customName?: string | null
}

export type PlayerEquipmentSummary = {
  head?: PlayerItemSummary | null
  chest?: PlayerItemSummary | null
  legs?: PlayerItemSummary | null
  feet?: PlayerItemSummary | null
  offhand?: PlayerItemSummary | null
}

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
  inventory: PlayerItemSummary[]
  equipment?: PlayerEquipmentSummary
}

export type BannedPlayer = {
  id: string
  name: string
  reason: string
  date: string
}
