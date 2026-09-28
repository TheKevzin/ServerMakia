export type NavIcon =
  | 'dashboard'
  | 'map'
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
}

export type NavGroup = {
  group: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'map', label: 'Live Map', icon: 'map' }
    ],
  },
  {
    group: 'Manage',
    items: [
      { id: 'console', label: 'Console', icon: 'console' },
      { id: 'players', label: 'Players', icon: 'players' },
    ],
  },
  {
    group: 'Server',
    items: [
      { id: 'files', label: 'File Manager', icon: 'files' },
      { id: 'backups', label: 'Backups', icon: 'backups' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
      { id: 'users', label: 'Panel Users', icon: 'users' },
    ],
  },
]

// Flat list for title lookups
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items)

export type Player = {
  id: string
  name: string
  avatar: string
  latency: number
  role: 'Admin' | 'Mod' | 'Member'
  playtime: string
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

export const players: Player[] = [
  {
    id: '1',
    name: 'V0idWalker',
    avatar: '/avatars/avatar-5.png',
    latency: 24,
    role: 'Admin',
    playtime: '142h',
    joined: 'Jan 12, 2026',
    lastSeen: 'Online now',
    health: 20,
    food: 18,
    xpLevel: 47,
    gamemode: 'Survival',
    dimension: 'The End',
    coords: { x: 124, y: 64, z: -892 },
    deaths: 14,
    blocksMined: 48210,
    mobKills: 1893,
    inventory: [
      { item: 'Elytra', qty: 1 },
      { item: 'Ender Pearl', qty: 16 },
      { item: 'Netherite Sword', qty: 1 },
      { item: 'Golden Apple', qty: 8 },
      { item: 'Shulker Box', qty: 3 },
    ],
  },
  {
    id: '2',
    name: 'CreeperKing',
    avatar: '/avatars/avatar-2.png',
    latency: 58,
    role: 'Mod',
    playtime: '88h',
    joined: 'Feb 03, 2026',
    lastSeen: 'Online now',
    health: 16,
    food: 20,
    xpLevel: 31,
    gamemode: 'Survival',
    dimension: 'Overworld',
    coords: { x: -340, y: 72, z: 210 },
    deaths: 22,
    blocksMined: 31044,
    mobKills: 940,
    inventory: [
      { item: 'TNT', qty: 32 },
      { item: 'Gunpowder', qty: 64 },
      { item: 'Diamond Pickaxe', qty: 1 },
      { item: 'Bread', qty: 12 },
    ],
  },
  {
    id: '3',
    name: 'GoldDigger99',
    avatar: '/avatars/avatar-3.png',
    latency: 112,
    role: 'Member',
    playtime: '34h',
    joined: 'Mar 18, 2026',
    lastSeen: 'Online now',
    health: 20,
    food: 14,
    xpLevel: 19,
    gamemode: 'Survival',
    dimension: 'Overworld',
    coords: { x: 880, y: 12, z: 451 },
    deaths: 8,
    blocksMined: 19877,
    mobKills: 312,
    inventory: [
      { item: 'Gold Ingot', qty: 64 },
      { item: 'Gold Block', qty: 18 },
      { item: 'Iron Pickaxe', qty: 1 },
      { item: 'Torch', qty: 48 },
    ],
  },
  {
    id: '4',
    name: 'DiamondFox',
    avatar: '/avatars/avatar-4.png',
    latency: 41,
    role: 'Member',
    playtime: '67h',
    joined: 'Feb 22, 2026',
    lastSeen: 'Online now',
    health: 18,
    food: 20,
    xpLevel: 38,
    gamemode: 'Survival',
    dimension: 'Nether',
    coords: { x: 64, y: 88, z: -120 },
    deaths: 11,
    blocksMined: 27650,
    mobKills: 651,
    inventory: [
      { item: 'Diamond', qty: 27 },
      { item: 'Diamond Armor', qty: 4 },
      { item: 'Blaze Rod', qty: 9 },
      { item: 'Cooked Beef', qty: 20 },
    ],
  },
  {
    id: '5',
    name: 'PixelNomad',
    avatar: '/avatars/avatar-1.png',
    latency: 203,
    role: 'Member',
    playtime: '12h',
    joined: 'Apr 02, 2026',
    lastSeen: 'Online now',
    health: 12,
    food: 9,
    xpLevel: 7,
    gamemode: 'Adventure',
    dimension: 'Overworld',
    coords: { x: -1204, y: 65, z: 3302 },
    deaths: 3,
    blocksMined: 4120,
    mobKills: 88,
    inventory: [
      { item: 'Map', qty: 2 },
      { item: 'Compass', qty: 1 },
      { item: 'Oak Boat', qty: 1 },
      { item: 'Apple', qty: 6 },
    ],
  },
]

export type ConsoleLine = {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  text: string
}

export const consoleLines: ConsoleLine[] = [
  { time: '12:04:21', level: 'INFO', text: 'Server thread/INFO: Done (8.214s)! For help, type "help"' },
  { time: '12:05:02', level: 'INFO', text: 'V0idWalker joined the game' },
  { time: '12:06:17', level: 'INFO', text: 'CreeperKing joined the game' },
  { time: '12:07:44', level: 'WARN', text: "Can't keep up! Is the server overloaded? Running 2134ms behind" },
  { time: '12:08:10', level: 'INFO', text: 'GoldDigger99 earned the achievement [Diamonds!]' },
  { time: '12:09:33', level: 'INFO', text: 'Saving the world to disk...' },
  { time: '12:10:01', level: 'ERROR', text: 'Failed to load chunk [12, -4]: retrying' },
  { time: '12:10:48', level: 'INFO', text: 'DiamondFox joined the game' },
]

// Sparkline-friendly metric history (0-100 normalized)
export const cpuHistory = [38, 42, 35, 50, 47, 61, 55, 49, 58, 52, 64, 60]
export const ramHistory = [55, 58, 60, 57, 63, 66, 64, 70, 68, 72, 71, 74]
export const playerHistory = [3, 4, 4, 6, 5, 7, 8, 7, 9, 8, 10, 12]
export const tpsHistory = [20, 19.8, 20, 19.9, 18.4, 19.6, 20, 19.9, 19.7, 20, 19.8, 20]
export const netHistory = [12, 18, 14, 22, 19, 28, 24, 31, 26, 35, 30, 38]

// Extended console log for the dedicated Console view
export const consoleLog: ConsoleLine[] = [
  { time: '12:00:01', level: 'INFO', text: 'Starting minecraft server version 1.20.4' },
  { time: '12:00:02', level: 'INFO', text: 'Loading properties' },
  { time: '12:00:03', level: 'INFO', text: 'Default game type: SURVIVAL' },
  { time: '12:00:05', level: 'INFO', text: 'Preparing level "world"' },
  { time: '12:00:07', level: 'WARN', text: 'Ambiguity between arguments detected' },
  { time: '12:00:08', level: 'INFO', text: 'Preparing spawn area: 84%' },
  { time: '12:00:12', level: 'INFO', text: 'Done (8.214s)! For help, type "help"' },
  { time: '12:05:02', level: 'INFO', text: 'V0idWalker[/192.168.1.4:51234] logged in' },
  { time: '12:05:02', level: 'INFO', text: 'V0idWalker joined the game' },
  { time: '12:06:17', level: 'INFO', text: 'CreeperKing joined the game' },
  { time: '12:07:44', level: 'WARN', text: "Can't keep up! Running 2134ms behind, skipping 42 ticks" },
  { time: '12:08:10', level: 'INFO', text: 'GoldDigger99 earned the achievement [Diamonds!]' },
  { time: '12:09:33', level: 'INFO', text: 'Saving the world to disk...' },
  { time: '12:09:35', level: 'INFO', text: 'Saved the world' },
  { time: '12:10:01', level: 'ERROR', text: 'Failed to load chunk [12, -4]: java.io.IOException' },
  { time: '12:10:02', level: 'INFO', text: 'Retrying chunk load [12, -4]... success' },
  { time: '12:10:48', level: 'INFO', text: 'DiamondFox joined the game' },
  { time: '12:12:09', level: 'INFO', text: 'PixelNomad joined the game' },
  { time: '12:14:55', level: 'WARN', text: 'PixelNomad moved too quickly! 8.42,0.0,1.13' },
  { time: '12:16:30', level: 'INFO', text: '<V0idWalker> anyone want to raid the End?' },
]

export type BannedPlayer = {
  id: string
  name: string
  reason: string
  date: string
}

export const bannedPlayers: BannedPlayer[] = [
  { id: 'b1', name: 'GriefLord', reason: 'Griefing spawn', date: 'Apr 18, 2026' },
  { id: 'b2', name: 'xX_Hacker_Xx', reason: 'Fly hacks', date: 'Apr 14, 2026' },
  { id: 'b3', name: 'SpamBot42', reason: 'Chat spam', date: 'Apr 09, 2026' },
]

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
      { id: 'pvp', label: 'PVP', description: 'Allow player versus player combat', enabled: false },
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

// ── File Manager ──────────────────────────────────────────────
export type FileNode = {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: string
  modified?: string
  // file contents for the editor (only for text files)
  content?: string
  children?: FileNode[]
}

export const fileTree: FileNode[] = [
  { 
    id: 'd1', name: 'world', type: 'folder', modified: 'Apr 20, 2026',
    children: [
      { id: 'f-world-1', name: 'level.dat', type: 'file', size: '2.3 KB', modified: 'Apr 20, 2026' },
      { id: 'f-world-2', name: 'session.lock', type: 'file', size: '12 B', modified: 'Apr 20, 2026' }
    ]
  },
  { 
    id: 'd2', name: 'plugins', type: 'folder', modified: 'Apr 19, 2026',
    children: [
      { id: 'f-plug-1', name: 'EssentialsX.jar', type: 'file', size: '2.5 MB', modified: 'Apr 15, 2026' },
      { id: 'f-plug-2', name: 'WorldEdit.jar', type: 'file', size: '1.2 MB', modified: 'Apr 16, 2026' }
    ]
  },
  { 
    id: 'd3', name: 'logs', type: 'folder', modified: 'Apr 20, 2026',
    children: [
      { id: 'f-log-1', name: 'latest.log', type: 'file', size: '14.2 KB', modified: 'Apr 20, 2026', content: '[12:00:01] [Server thread/INFO]: Starting minecraft server version 1.20.4\\n[12:00:02] [Server thread/INFO]: Loading properties' },
      { id: 'f-log-2', name: '2026-04-19-1.log.gz', type: 'file', size: '3.1 KB', modified: 'Apr 19, 2026' }
    ]
  },
  {
    id: 'f1',
    name: 'server.properties',
    type: 'file',
    size: '1.4 KB',
    modified: 'Apr 20, 2026',
    content: `# Minecraft server properties
# Generated by Enderlab
level-name=world
gamemode=survival
difficulty=hard
max-players=20
motd=\\u00A75Enderlab \\u00A77| \\u00A7dSurvival SMP
white-list=true
pvp=false
online-mode=true
view-distance=10
spawn-protection=16
allow-nether=true
enable-command-block=true`,
  },
  {
    id: 'f2',
    name: 'ops.json',
    type: 'file',
    size: '312 B',
    modified: 'Apr 18, 2026',
    content: `[
  {
    "uuid": "a1b2c3d4-0000-0000-0000-000000000001",
    "name": "V0idWalker",
    "level": 4,
    "bypassesPlayerLimit": true
  }
]`,
  },
  {
    id: 'f3',
    name: 'whitelist.json',
    type: 'file',
    size: '486 B',
    modified: 'Apr 17, 2026',
    content: `[
  { "uuid": "a1b2c3d4-0000-0000-0000-000000000001", "name": "V0idWalker" },
  { "uuid": "a1b2c3d4-0000-0000-0000-000000000002", "name": "CreeperKing" },
  { "uuid": "a1b2c3d4-0000-0000-0000-000000000003", "name": "DiamondFox" }
]`,
  },
  {
    id: 'f4',
    name: 'banned-players.json',
    type: 'file',
    size: '724 B',
    modified: 'Apr 18, 2026',
    content: `[
  { "name": "GriefLord", "reason": "Griefing spawn", "source": "V0idWalker" },
  { "name": "xX_Hacker_Xx", "reason": "Fly hacks", "source": "Console" }
]`,
  },
  {
    id: 'f5',
    name: 'eula.txt',
    type: 'file',
    size: '154 B',
    modified: 'Jan 12, 2026',
    content: `# By changing the setting below to TRUE you agree to the Minecraft EULA.
eula=true`,
  },
]

// ── Backups ───────────────────────────────────────────────────
export type Backup = {
  id: string
  name: string
  size: string
  date: string
  type: 'Auto' | 'Manual'
  status: 'Completed' | 'In Progress'
  note?: string
}

export const backups: Backup[] = [
  { id: 'bk1', name: 'world-2026-04-20-1200', size: '482 MB', date: 'Apr 20, 2026 · 12:00', type: 'Auto', status: 'Completed' },
  { id: 'bk2', name: 'pre-update-snapshot', size: '478 MB', date: 'Apr 19, 2026 · 22:14', type: 'Manual', status: 'Completed', note: 'Antes de actualizar el mod de Mobs' },
  { id: 'bk3', name: 'world-2026-04-19-0000', size: '471 MB', date: 'Apr 19, 2026 · 00:00', type: 'Auto', status: 'Completed' },
  { id: 'bk4', name: 'world-2026-04-18-0000', size: '465 MB', date: 'Apr 18, 2026 · 00:00', type: 'Auto', status: 'Completed' },
  { id: 'bk5', name: 'before-end-raid', size: '460 MB', date: 'Apr 17, 2026 · 18:42', type: 'Manual', status: 'Completed' },
]
