// ── Server & System Types ───────────────────────────────────

export type ServerStatus = {
  isRunning: boolean
  tunnel?: TunnelInfo
  version?: string
}

export type TunnelInfo = {
  domain: string
  directIp: string
  local: string
}

export type SystemMetrics = {
  cpu: number
  ram: { used: number; total: number; percent: number }
  tps: number
  uptime: string
  players: { online: number; max: number }
}

export type ConsoleLine = {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  text: string
}

// ── File Manager Types ─────────────────────────────────────

export type FileNode = {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: string
  modified?: string
  content?: string
  children?: FileNode[]
}

// ── Backup Types ───────────────────────────────────────────

export type Backup = {
  id: string
  name: string
  size: string
  date: string
  type: 'Auto' | 'Manual'
  status: 'Completed' | 'In Progress'
  note?: string
}
