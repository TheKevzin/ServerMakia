// ── Navegación del Panel ────────────────────────────────────

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
      { id: 'dashboard', label: 'Panel Principal', icon: 'dashboard', href: '/dashboard' },
    ],
  },
  {
    group: 'Gestión',
    items: [
      { id: 'console', label: 'Consola', icon: 'console', href: '/console' },
      { id: 'players', label: 'Jugadores', icon: 'players', href: '/players' },
      { id: 'users', label: 'Usuarios', icon: 'users', href: '/users' },
    ],
  },
  {
    group: 'Servidor',
    items: [
      { id: 'files', label: 'Archivos', icon: 'files', href: '/files' },
      { id: 'backups', label: 'Copias de Seguridad', icon: 'backups', href: '/backups' },
      { id: 'settings', label: 'Configuración', icon: 'settings', href: '/settings' },
    ],
  },
]

// Lista aplanada para consulta de títulos
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items)

// ── Subtítulos de Página ─────────────────────────────────────

export const pageSubtitles: Record<string, string> = {
  dashboard: 'Vista en tiempo real del estado del servidor y recursos del sistema',
  console: 'Transmisión de registros en vivo y ejecución de comandos RCON',
  players: 'Monitoreo de jugadores conectados, inventarios y permisos',
  files: 'Explorador y editor de archivos de configuración del servidor',
  backups: 'Crear, restaurar y sincronizar copias de seguridad con Google Drive',
  settings: 'Reglas del mundo, asignación de memoria y propiedades del servidor',
  users: 'Administración de usuarios y niveles de acceso del panel',
}

// ── Reglas y Ajustes del Mundo ──────────────────────────────

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
    group: 'Acceso y Seguridad',
    items: [
      { id: 'whitelist', label: 'Lista Blanca (Whitelist)', description: 'Solo los jugadores autorizados pueden ingresar al servidor', enabled: true },
      { id: 'cracked', label: 'Modo No-Premium (Offline)', description: 'Permitir conexiones de jugadores sin cuenta oficial de Mojang', enabled: false },
      { id: 'flight', label: 'Permitir Vuelo', description: 'Permitir que los jugadores vuelen sin ser expulsados', enabled: false },
      { id: 'secureprofile', label: 'Exigir Perfil Seguro', description: 'Requerir firmas criptográficas válidas en el chat de los jugadores', enabled: true },
    ],
  },
  {
    group: 'Reglas de Juego',
    items: [
      { id: 'pvp', label: 'Combate PVP', description: 'Permitir daño y combate entre jugadores en el mundo', enabled: true },
      { id: 'hardcore', label: 'Modo Hardcore', description: 'Los jugadores no pueden revivir tras morir en el mundo', enabled: false },
      { id: 'keepinventory', label: 'Conservar Inventario (Keep Inventory)', description: 'Los jugadores mantienen sus ítems al morir', enabled: false },
      { id: 'mobgriefing', label: 'Destrucción por Criaturas (Mob Griefing)', description: 'Creepers y Endermen pueden alterar o destruir bloques', enabled: true },
    ],
  },
  {
    group: 'Generación y Criaturas',
    items: [
      { id: 'commandblocks', label: 'Bloques de Comandos', description: 'Permitir la ejecución de bloques de comandos en el mundo', enabled: true },
      { id: 'nether', label: 'Permitir el Nether', description: 'Los jugadores pueden viajar a la dimensión del Nether', enabled: true },
      { id: 'mobs', label: 'Generar Monstruos', description: 'Las criaturas hostiles aparecen de noche y en lugares oscuros', enabled: true },
      { id: 'animals', label: 'Generar Animales', description: 'Los animales pacíficos se generan naturalmente en el mundo', enabled: true },
      { id: 'npcs', label: 'Generar Aldeanos (NPCs)', description: 'Los aldeanos aparecen y comercian en las aldeas', enabled: true },
    ],
  },
]
