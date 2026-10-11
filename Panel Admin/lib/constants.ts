// ── Navigation ─────────────────────────────────────────────
// Clean constants — NO mock data, NO types (those live in /types)

export type NavIcon =
  | 'dashboard'
  | 'console'
  | 'players'
  | 'settings'
  | 'files'
  | 'backups'
  | 'users'

export type NavItem = {
  id: string
  label: string
  icon: NavIcon
  href: string
}

export type NavGroup = {
  group: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    group: 'General',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    ],
  },
  {
    group: 'Management',
    items: [
      { id: 'console', label: 'Console', icon: 'console', href: '/console' },
      { id: 'players', label: 'Players', icon: 'players', href: '/players' },
      { id: 'users', label: 'Users', icon: 'users', href: '/users' },
    ],
  },
  {
    group: 'Server',
    items: [
      { id: 'files', label: 'Files', icon: 'files', href: '/files' },
      { id: 'backups', label: 'Backups', icon: 'backups', href: '/backups' },
      { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
    ],
  },
]

// Flat list for title lookups
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items)

// ── Page Metadata ──────────────────────────────────────────

export const pageSubtitles: Record<string, string> = {
  dashboard: 'Real-time overview of your server status and system resources',
  console: 'Live log stream and RCON command execution',
  players: 'Active player monitoring and permission management',
  files: 'Server configuration file explorer and editor',
  backups: 'Create, restore, and synchronize backups with Google Drive',
  settings: 'Game rules, memory allocation, and server properties',
  users: 'Panel user management and permissions',
}

// ── Settings ───────────────────────────────────────────────

export type SettingGroup = {
  group: string
  items: {
    id: string
    label: string
    description: string
    enabled: boolean
  }[]
}

export const settingGroups: SettingGroup[] = [
  {
    group: 'Access & Security',
    items: [
      { id: 'whitelist', label: 'Whitelist', description: 'Only approved players may join', enabled: true },
      { id: 'cracked', label: 'Cracked Mode', description: 'Allow non-premium (offline) accounts', enabled: false },
      { id: 'flight', label: 'Allow Flight', description: 'Permit flying without being kicked', enabled: false },
      { id: 'secureprofile', label: 'Enforce Secure Profile', description: 'Require valid public keys for chat signatures', enabled: true },
    ],
  },
  {
    group: 'Gameplay',
    items: [
      { id: 'pvp', label: 'PVP', description: 'Allow player versus player combat', enabled: true },
      { id: 'hardcore', label: 'Hardcore Mode', description: 'Players cannot respawn after dying', enabled: false },
      { id: 'keepinventory', label: 'Keep Inventory', description: 'Players keep items upon death', enabled: false },
      { id: 'mobgriefing', label: 'Mob Griefing', description: 'Creepers and Endermen can destroy blocks', enabled: true },
    ],
  },
  {
    group: 'World Generation & Entities',
    items: [
      { id: 'commandblocks', label: 'Command Blocks', description: 'Enable command block execution', enabled: true },
      { id: 'nether', label: 'Allow Nether', description: 'Players can travel to the Nether', enabled: true },
      { id: 'mobs', label: 'Spawn Monsters', description: 'Hostile mobs spawn at night', enabled: true },
      { id: 'animals', label: 'Spawn Animals', description: 'Passive mobs will spawn naturally', enabled: true },
      { id: 'npcs', label: 'Spawn NPCs', description: 'Villagers will spawn in villages', enabled: true },
    ],
  },
]
