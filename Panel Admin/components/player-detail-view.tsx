'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Skull,
  Heart,
  Drumstick,
  Shield,
  Wifi,
  MapPin,
  Compass,
  Crosshair,
  RotateCcw,
  Clock,
  Swords,
  Gauge,
  Check,
  X,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PackageOpen,
  Info,
  Box,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

function HelmetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12a6 6 0 0 1 12 0v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5Z" />
      <path d="M9 13h6" />
      <path d="M12 13v4" />
    </svg>
  )
}

function ChestplateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h4l4 4 4-4h4v6l-2 3v7H6v-7L4 10V4Z" />
    </svg>
  )
}

function LeggingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h14v7l-2 9h-3l-2-7-2 7H7l-2-9V4Z" />
    </svg>
  )
}

function BootsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h5v8l3 2v4H4v-6l1-8Z" />
      <path d="M14 4h5l1 8v6h-9v-4l3-2V4Z" />
    </svg>
  )
}

type ItemSlot = {
  slot: number
  id: string
  name: string
  customName?: string | null
  count: number
  damage: number | null
  maxDamage: number | null
  durabilityPct: number | null
  textureUrl: string
  enchantments?: { id: string; name: string; level: number; formatted: string }[]
  isEnchanted?: boolean
  trim?: { pattern: string; material: string } | null
  repairCost?: number | null
  lore?: string[]
}

type DetailedPlayer = {
  name: string
  uuid: string
  avatar: string
  isActive: boolean
  lastSeen: string
  gamemode: 'survival' | 'creative' | 'adventure' | 'spectator'
  gamemodeIndex: number
  isOp: boolean
  isWhitelisted: boolean
  isBanned: boolean
  health: number
  food: number
  xpLevel: number
  xpP: number
  currentPos: { x: number; y: number; z: number; dimension: string }
  respawnPos: { x: number; y: number; z: number; dimension: string } | null
  lastDeathPos: { x: number; y: number; z: number; dimension: string } | null
  inventorySlots: Record<number, ItemSlot>
  enderItems: ItemSlot[]
  stats: {
    playTimeFormatted: string
    playerKills: number
    mobKills: number
    deaths: number
    kdRatio: string
    distances: {
      total: number
      walk: number
      sprint: number
      boat: number
      fall: number
      horse: number
      swim: number
      crouch: number
      climb: number
      fly: number
    }
    mined: {
      total: number
      items: { id: string; name: string; count: number; textureUrl: string }[]
    }
    used: {
      total: number
      items: { id: string; name: string; count: number; textureUrl: string }[]
    }
    killed: {
      total: number
      items: { id: string; name: string; count: number; headUrl: string }[]
    }
  }
}

// Minecraft Heart component (each heart = 2 HP)
function MinecraftHeart({ state }: { state: 'full' | 'half' | 'empty' }) {
  return (
    <svg className="size-4 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" viewBox="0 0 9 9" fill="none">
      {/* Background outline */}
      <rect x="1" y="0" width="7" height="1" fill="#1b0000" />
      <rect x="0" y="1" width="9" height="5" fill="#1b0000" />
      <rect x="1" y="6" width="7" height="1" fill="#1b0000" />
      <rect x="2" y="7" width="5" height="1" fill="#1b0000" />
      <rect x="3" y="8" width="3" height="1" fill="#1b0000" />
      <rect x="4" y="1" width="1" height="1" fill="#1b0000" />
      {/* Fill */}
      {state === 'full' && (
        <>
          <rect x="1" y="1" width="3" height="4" fill="#e71837" />
          <rect x="5" y="1" width="3" height="4" fill="#e71837" />
          <rect x="1" y="5" width="7" height="1" fill="#e71837" />
          <rect x="2" y="6" width="5" height="1" fill="#e71837" />
          <rect x="3" y="7" width="3" height="1" fill="#e71837" />
          {/* Highlight */}
          <rect x="2" y="2" width="1" height="1" fill="#ffffff" />
          <rect x="6" y="2" width="1" height="1" fill="#ffffff" />
        </>
      )}
      {state === 'half' && (
        <>
          <rect x="1" y="1" width="3" height="4" fill="#e71837" />
          <rect x="1" y="5" width="4" height="1" fill="#e71837" />
          <rect x="2" y="6" width="3" height="1" fill="#e71837" />
          <rect x="3" y="7" width="2" height="1" fill="#e71837" />
          <rect x="2" y="2" width="1" height="1" fill="#ffffff" />
          {/* Empty right half */}
          <rect x="5" y="1" width="3" height="4" fill="#4a151b" />
          <rect x="5" y="5" width="3" height="1" fill="#4a151b" />
          <rect x="5" y="6" width="2" height="1" fill="#4a151b" />
        </>
      )}
      {state === 'empty' && (
        <>
          <rect x="1" y="1" width="3" height="4" fill="#4a151b" />
          <rect x="5" y="1" width="3" height="4" fill="#4a151b" />
          <rect x="1" y="5" width="7" height="1" fill="#4a151b" />
          <rect x="2" y="6" width="5" height="1" fill="#4a151b" />
          <rect x="3" y="7" width="3" height="1" fill="#4a151b" />
        </>
      )}
    </svg>
  )
}

// Minecraft Food Shank component (each shank = 2 Food)
function MinecraftShank({ state }: { state: 'full' | 'half' | 'empty' }) {
  return (
    <svg className="size-4 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" viewBox="0 0 9 9" fill="none">
      {/* Background outline */}
      <rect x="2" y="0" width="6" height="1" fill="#1f1000" />
      <rect x="1" y="1" width="8" height="5" fill="#1f1000" />
      <rect x="0" y="5" width="6" height="3" fill="#1f1000" />
      <rect x="1" y="8" width="4" height="1" fill="#1f1000" />
      {/* Fill */}
      {state === 'full' && (
        <>
          <rect x="2" y="1" width="6" height="4" fill="#c07128" />
          <rect x="1" y="4" width="7" height="2" fill="#995015" />
          <rect x="1" y="6" width="4" height="2" fill="#d99955" />
          <rect x="3" y="2" width="2" height="1" fill="#f5c282" />
        </>
      )}
      {state === 'half' && (
        <>
          <rect x="4" y="1" width="4" height="4" fill="#c07128" />
          <rect x="3" y="4" width="5" height="2" fill="#995015" />
          <rect x="2" y="1" width="2" height="3" fill="#3d2615" />
          <rect x="1" y="6" width="3" height="2" fill="#3d2615" />
        </>
      )}
      {state === 'empty' && (
        <>
          <rect x="2" y="1" width="6" height="4" fill="#3d2615" />
          <rect x="1" y="4" width="7" height="2" fill="#2d1c10" />
          <rect x="1" y="6" width="4" height="2" fill="#2d1c10" />
        </>
      )}
    </svg>
  )
}

function ItemSlotBox({
  item,
  placeholderIcon: Placeholder,
  isSelected,
  onClick,
  onHover,
}: {
  item?: ItemSlot
  placeholderIcon?: any
  isSelected?: boolean
  onClick?: () => void
  onHover?: (item: ItemSlot | null) => void
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover?.(item || null)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group size-10 sm:size-11 rounded-md border p-1 flex items-center justify-center relative select-none transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/20 ring-2 ring-primary/40 z-10"
          : item
          ? "border-[#3b4252] bg-[#1a1f26] hover:border-primary/60 hover:bg-[#222933]"
          : "border-[#2b303c]/60 bg-[#14181f]/60 opacity-60 hover:opacity-80"
      )}
    >
      {item ? (
        <>
          <img
            src={item.textureUrl}
            alt={item.customName || item.name}
            className="size-8 object-contain drop-shadow"
            onError={(e) => {
              // Try fallback to block texture or placeholder
              const target = e.currentTarget
              if (!target.src.includes('/block/')) {
                const clean = item.id.replace(/^minecraft:/, '')
                target.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${clean}.png`
              } else {
                target.style.display = 'none'
              }
            }}
          />
          {item.isEnchanted && (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/25 via-pink-500/15 to-indigo-500/25 rounded pointer-events-none animate-pulse" />
              <Sparkles className="size-2 text-purple-300 absolute top-0.5 right-0.5 drop-shadow pointer-events-none" />
            </>
          )}
          {item.count > 1 && (
            <span className="absolute bottom-0.5 right-1 font-mono text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] z-10">
              {item.count}
            </span>
          )}
          {item.durabilityPct !== null && (
            <div className="absolute bottom-0.5 left-1 right-1 h-1 rounded-full bg-black/60 overflow-hidden z-10">
              <div
                className={cn(
                  "h-full transition-all",
                  item.durabilityPct > 50 ? "bg-emerald-400" : item.durabilityPct > 20 ? "bg-amber-400" : "bg-rose-500"
                )}
                style={{ width: `${item.durabilityPct}%` }}
              />
            </div>
          )}
        </>
      ) : Placeholder ? (
        <Placeholder className="size-4 text-muted-foreground/30" />
      ) : null}
    </div>
  )
}

export function PlayerDetailView({
  playerName,
  onBack,
  role,
}: {
  playerName: string
  onBack: () => void
  role?: string | null
}) {
  const [data, setData] = useState<DetailedPlayer | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllStats, setShowAllStats] = useState(false)
  const [actionPending, setActionPending] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemSlot | null>(null)
  const [hoveredItem, setHoveredItem] = useState<ItemSlot | null>(null)
  const [showEnderChestModal, setShowEnderChestModal] = useState(false)

  // Fetch player details
  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/server/players/${encodeURIComponent(playerName)}`)
      if (res.ok) {
        const json = await res.json()
        if (json.player) {
          setData(json.player)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
    const timer = setInterval(fetchDetails, 3500)
    return () => clearInterval(timer)
  }, [playerName])

  const sendRcon = async (cmd: string, successMsg?: string) => {
    setActionPending(true)
    try {
      const res = await fetch('/api/server/rcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      })
      const r = await res.json()
      if (r.success) {
        if (successMsg) toast.success(successMsg)
        fetchDetails()
      } else {
        toast.error(r.response || 'Error ejecutando comando')
      }
    } catch {
      toast.error('Error de conexión con RCON')
    } finally {
      setActionPending(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando detalles de {playerName}...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-4">
        <p className="text-destructive font-medium">No se pudo cargar la información del jugador {playerName}.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
        >
          <ArrowLeft className="size-4" /> Volver a Jugadores
        </button>
      </div>
    )
  }

  const isViewer = role === 'VIEWER'

  // Hearts logic (10 hearts total, 2 HP per heart)
  const hearts = Array.from({ length: 10 }, (_, i) => {
    const hp = data.health
    if (hp >= (i + 1) * 2) return 'full'
    if (hp >= i * 2 + 1) return 'half'
    return 'empty'
  })

  // Food logic (10 shanks total, 2 Food per shank)
  const shanks = Array.from({ length: 10 }, (_, i) => {
    const fd = data.food
    if (fd >= (i + 1) * 2) return 'full'
    if (fd >= i * 2 + 1) return 'half'
    return 'empty'
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header / Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-2xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-white/10 hover:border-primary/40"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Jugadores</span>
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">Detalles del jugador</h1>
      </div>

      {/* Main Player Identification Card */}
      <div className="glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={data.avatar}
            alt={data.name}
            className="size-14 rounded-2xl border border-border bg-black/40 p-1 object-contain shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-xl font-bold text-foreground truncate">{data.name}</h2>
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  data.isActive
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "border-border bg-white/5 text-muted-foreground"
                )}
              >
                {data.lastSeen}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="truncate">{data.uuid.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Gamemode Selector */}
        {!isViewer && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={data.gamemode}
                disabled={actionPending}
                onChange={(e) => sendRcon(`gamemode ${e.target.value} ${data.name}`, `Modo de juego cambiado a ${e.target.value}`)}
                className="appearance-none rounded-xl border border-border bg-white/5 py-2 pl-9 pr-8 text-sm font-medium text-foreground transition-colors hover:bg-white/10 focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="survival" className="bg-[#181c22]">Supervivencia</option>
                <option value="creative" className="bg-[#181c22]">Creativo</option>
                <option value="adventure" className="bg-[#181c22]">Aventura</option>
                <option value="spectator" className="bg-[#181c22]">Espectador</option>
              </select>
              <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary pointer-events-none" />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column (Health/XP + Inventory) & Right Column (Control + Location) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Card: Salud y experiencia */}
          <div className="glass flex flex-col rounded-3xl p-5 gap-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Salud y experiencia</h3>

            {/* XP Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-400 font-heading">Nivel {data.xpLevel}</span>
                <span className="text-muted-foreground font-mono">{Math.round(data.xpP * 100)}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/40 border border-white/5 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, data.xpP * 100))}%` }}
                />
              </div>
            </div>

            {/* Health Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => sendRcon(`kill ${data.name}`, `Jugador ${data.name} eliminado`)}
                disabled={actionPending || isViewer || !data.isActive}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25 disabled:opacity-40"
              >
                <Skull className="size-3.5" /> Matar
              </button>

              <div className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                {hearts.map((st, i) => (
                  <MinecraftHeart key={`heart-${i}`} state={st} />
                ))}
              </div>

              <button
                onClick={() => sendRcon(`effect give ${data.name} instant_health 1 255`, `Salud restaurada a ${data.name}`)}
                disabled={actionPending || isViewer || !data.isActive}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-40"
              >
                <Heart className="size-3.5" /> Curar
              </button>
            </div>

            {/* Hunger Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => sendRcon(`effect give ${data.name} hunger 10 255`, `Hambre aplicada a ${data.name}`)}
                disabled={actionPending || isViewer || !data.isActive}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25 disabled:opacity-40"
              >
                <Drumstick className="size-3.5" /> Hambre
              </button>

              <div className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                {shanks.map((st, i) => (
                  <MinecraftShank key={`shank-${i}`} state={st} />
                ))}
              </div>

              <button
                onClick={() => sendRcon(`effect give ${data.name} saturation 5 255`, `Comida restaurada a ${data.name}`)}
                disabled={actionPending || isViewer || !data.isActive}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:opacity-40"
              >
                <Drumstick className="size-3.5" /> Alimentar
              </button>
            </div>
          </div>

          {/* Card: Inventario (Exact Minecraft Layout) */}
          <div className="glass flex flex-col rounded-3xl p-5 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold text-foreground">Inventario y Armadura</h3>
              <span className="text-xs text-muted-foreground">
                {Object.keys(data.inventorySlots).length} objetos equipados
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start justify-center p-3 rounded-2xl bg-black/40 border border-white/5 overflow-x-auto">
              {/* Armor column + Offhand / Ender */}
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                {/* Armor (103: Helmet, 102: Chest, 101: Legs, 100: Boots) */}
                <ItemSlotBox
                  item={data.inventorySlots[103]}
                  placeholderIcon={HelmetIcon}
                  isSelected={selectedItem?.slot === 103}
                  onClick={() => data.inventorySlots[103] && setSelectedItem(data.inventorySlots[103])}
                  onHover={setHoveredItem}
                />
                <ItemSlotBox
                  item={data.inventorySlots[102]}
                  placeholderIcon={ChestplateIcon}
                  isSelected={selectedItem?.slot === 102}
                  onClick={() => data.inventorySlots[102] && setSelectedItem(data.inventorySlots[102])}
                  onHover={setHoveredItem}
                />
                <ItemSlotBox
                  item={data.inventorySlots[101]}
                  placeholderIcon={LeggingsIcon}
                  isSelected={selectedItem?.slot === 101}
                  onClick={() => data.inventorySlots[101] && setSelectedItem(data.inventorySlots[101])}
                  onHover={setHoveredItem}
                />
                <ItemSlotBox
                  item={data.inventorySlots[100]}
                  placeholderIcon={BootsIcon}
                  isSelected={selectedItem?.slot === 100}
                  onClick={() => data.inventorySlots[100] && setSelectedItem(data.inventorySlots[100])}
                  onHover={setHoveredItem}
                />
              </div>

              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                {/* Ender Chest slot */}
                <ItemSlotBox
                  item={
                    data.enderItems.length > 0
                      ? {
                          slot: 999,
                          id: 'minecraft:ender_chest',
                          name: `Cofre de Ender (${data.enderItems.length} objetos)`,
                          count: data.enderItems.length,
                          damage: null,
                          maxDamage: null,
                          durabilityPct: null,
                          textureUrl: 'https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/ender_chest_top.png',
                        }
                      : undefined
                  }
                  placeholderIcon={Box}
                  isSelected={showEnderChestModal}
                  onClick={() => setShowEnderChestModal(true)}
                  onHover={setHoveredItem}
                />
                {/* Offhand slot (-106) */}
                <ItemSlotBox
                  item={data.inventorySlots[-106]}
                  placeholderIcon={Shield}
                  isSelected={selectedItem?.slot === -106}
                  onClick={() => data.inventorySlots[-106] && setSelectedItem(data.inventorySlots[-106])}
                  onHover={setHoveredItem}
                />
              </div>

              {/* Main inventory (9x3) + Hotbar (9x1) */}
              <div className="flex flex-col gap-3">
                {/* 9x3 Main Inventory */}
                <div className="grid grid-cols-9 gap-1.5">
                  {Array.from({ length: 27 }, (_, i) => {
                    const slotNum = 9 + i
                    const item = data.inventorySlots[slotNum]
                    return (
                      <ItemSlotBox
                        key={`inv-${slotNum}`}
                        item={item}
                        isSelected={selectedItem?.slot === slotNum}
                        onClick={() => item && setSelectedItem(item)}
                        onHover={setHoveredItem}
                      />
                    )
                  })}
                </div>

                {/* Hotbar 9x1 */}
                <div className="grid grid-cols-9 gap-1.5 pt-1 border-t border-white/10">
                  {Array.from({ length: 9 }, (_, i) => {
                    const item = data.inventorySlots[i]
                    return (
                      <ItemSlotBox
                        key={`hotbar-${i}`}
                        item={item}
                        isSelected={selectedItem?.slot === i}
                        onClick={() => item && setSelectedItem(item)}
                        onHover={setHoveredItem}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Inspector de Objeto Seleccionado / Activo */}
            {(() => {
              const active =
                hoveredItem ||
                selectedItem ||
                data.inventorySlots[103] ||
                data.inventorySlots[0] ||
                Object.values(data.inventorySlots)[0] ||
                null

              return (
                <div className="rounded-2xl border border-white/10 bg-[#12151c]/90 p-4 transition-all">
                  {active ? (
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="relative size-14 shrink-0 rounded-xl bg-black/50 border border-white/10 p-2 flex items-center justify-center">
                        <img
                          src={active.textureUrl}
                          alt={active.customName || active.name}
                          className="size-10 object-contain drop-shadow"
                          onError={(e) => {
                            const target = e.currentTarget
                            if (!target.src.includes('/block/')) {
                              target.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${active.id.replace(/^minecraft:/, '')}.png`
                            }
                          }}
                        />
                        {active.isEnchanted && (
                          <Sparkles className="size-3.5 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={cn(
                              "text-base font-semibold",
                              active.customName
                                ? "text-amber-300 italic"
                                : active.isEnchanted
                                ? "text-[#d8b8f7]"
                                : "text-foreground"
                            )}
                          >
                            {active.customName || active.name}
                          </h4>
                          {active.customName && (
                            <span className="text-xs text-muted-foreground">({active.name})</span>
                          )}
                          <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {active.id}
                          </span>
                          {active.count > 1 && (
                            <span className="rounded-md bg-primary/20 border border-primary/30 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                              x{active.count}
                            </span>
                          )}
                        </div>

                        {/* Durability */}
                        {active.durabilityPct !== null && (
                          <div className="mt-2 flex items-center gap-3 max-w-sm">
                            <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden border border-white/5">
                              <div
                                className={cn(
                                  "h-full transition-all",
                                  active.durabilityPct > 50
                                    ? "bg-emerald-400"
                                    : active.durabilityPct > 20
                                    ? "bg-amber-400"
                                    : "bg-rose-500"
                                )}
                                style={{ width: `${active.durabilityPct}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono tabular-nums text-muted-foreground">
                              {active.maxDamage && active.damage !== null
                                ? `Durabilidad: ${active.maxDamage - active.damage} / ${active.maxDamage}`
                                : `${active.durabilityPct}%`}
                            </span>
                          </div>
                        )}

                        {/* Enchantments List */}
                        {active.enchantments && active.enchantments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1.5 flex items-center gap-1.5">
                              <Sparkles className="size-3.5" />
                              Encantamientos ({active.enchantments.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {active.enchantments.map((ench, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-xs font-medium text-purple-200"
                                >
                                  ✦ {ench.formatted}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trim */}
                        {active.trim && (
                          <p className="mt-2 text-xs text-amber-300/90">
                            ✦ Herrería: Material {active.trim.material} con diseño {active.trim.pattern}
                          </p>
                        )}

                        {/* Lore */}
                        {active.lore && active.lore.length > 0 && (
                          <div className="mt-2 space-y-0.5 border-l-2 border-purple-500/40 pl-2">
                            {active.lore.map((line, li) => (
                              <p key={li} className="text-xs italic text-muted-foreground">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground py-1">
                      <Info className="size-4 text-primary shrink-0" />
                      <span>
                        Pasa el cursor o haz clic en cualquier casilla de la armadura o del inventario para inspeccionar sus detalles, encantamientos y durabilidad.
                      </span>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Right Column (1 span): Control & Location */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Card: Control */}
          <div className="glass flex flex-col rounded-3xl p-5 gap-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Control</h3>

            <div className="flex flex-col divide-y divide-border">
              {/* Whitelist Toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">En la lista blanca</span>
                <button
                  onClick={() =>
                    sendRcon(
                      data.isWhitelisted
                        ? `whitelist remove ${data.name}`
                        : `whitelist add ${data.name}`,
                      data.isWhitelisted ? 'Removido de la lista blanca' : 'Agregado a la lista blanca'
                    )
                  }
                  disabled={actionPending || isViewer}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl font-bold transition-all disabled:opacity-40",
                    data.isWhitelisted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                  )}
                >
                  {data.isWhitelisted ? <Check className="size-4" /> : <X className="size-4" />}
                </button>
              </div>

              {/* Banned Toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">Baneado</span>
                <button
                  onClick={() =>
                    sendRcon(
                      data.isBanned ? `pardon ${data.name}` : `ban ${data.name} Banned by admin`,
                      data.isBanned ? 'Jugador desbaneado' : 'Jugador baneado'
                    )
                  }
                  disabled={actionPending || isViewer}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl font-bold transition-all disabled:opacity-40",
                    data.isBanned
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                  )}
                >
                  {data.isBanned ? <Check className="size-4" /> : <X className="size-4" />}
                </button>
              </div>

              {/* OP Toggle */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">Operador</span>
                <button
                  onClick={() =>
                    sendRcon(
                      data.isOp ? `deop ${data.name}` : `op ${data.name}`,
                      data.isOp ? 'Permisos de operador retirados' : 'Operador otorgado'
                    )
                  }
                  disabled={actionPending || isViewer}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl font-bold transition-all disabled:opacity-40",
                    data.isOp
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                  )}
                >
                  {data.isOp ? <Check className="size-4" /> : <X className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Card: Información (Locations) */}
          <div className="glass flex flex-col rounded-3xl p-5 gap-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Información</h3>

            {/* Current Position */}
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/[0.02] border border-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <MapPin className="size-3.5 text-primary" /> Posición actual
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                X <span className="text-foreground">{data.currentPos.x}</span> Y{' '}
                <span className="text-foreground">{data.currentPos.y}</span> Z{' '}
                <span className="text-foreground">{data.currentPos.z}</span>
              </div>
              <span className="text-[11px] text-muted-foreground/70">{data.currentPos.dimension}</span>
            </div>

            {/* Respawn Position */}
            {data.respawnPos && (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Compass className="size-3.5 text-primary" /> Ubicación de reaparición
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  X <span className="text-foreground">{data.respawnPos.x}</span> Y{' '}
                  <span className="text-foreground">{data.respawnPos.y}</span> Z{' '}
                  <span className="text-foreground">{data.respawnPos.z}</span>
                </div>
                <span className="text-[11px] text-muted-foreground/70">{data.respawnPos.dimension}</span>

                {!isViewer && (
                  <button
                    onClick={() =>
                      sendRcon(
                        `tp ${data.name} ${data.respawnPos?.x} ${data.respawnPos?.y} ${data.respawnPos?.z}`,
                        'Teletransportado a reaparición'
                      )
                    }
                    disabled={actionPending || !data.isActive}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white/5 py-1.5 text-xs font-medium text-foreground hover:bg-white/10 disabled:opacity-40"
                  >
                    <RotateCcw className="size-3" /> Teletransportar de regreso
                  </button>
                )}
              </div>
            )}

            {/* Last Death Position */}
            {data.lastDeathPos && (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/[0.02] border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Skull className="size-3.5 text-rose-400" /> Última ubicación de muerte
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  X <span className="text-foreground">{data.lastDeathPos.x}</span> Y{' '}
                  <span className="text-foreground">{data.lastDeathPos.y}</span> Z{' '}
                  <span className="text-foreground">{data.lastDeathPos.z}</span>
                </div>
                <span className="text-[11px] text-muted-foreground/70">{data.lastDeathPos.dimension}</span>

                {!isViewer && (
                  <button
                    onClick={() =>
                      sendRcon(
                        `tp ${data.name} ${data.lastDeathPos?.x} ${data.lastDeathPos?.y} ${data.lastDeathPos?.z}`,
                        'Teletransportado a ubicación de muerte'
                      )
                    }
                    disabled={actionPending || !data.isActive}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
                  >
                    <Crosshair className="size-3" /> Teletransportar a la muerte
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Section: Estadísticas */}
      <div className="glass flex flex-col rounded-3xl p-5 gap-6">
        <h3 className="font-heading text-base font-semibold text-foreground">Estadísticas</h3>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-border">
            <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Tiempo jugado</p>
              <p className="font-heading text-sm font-bold text-foreground truncate">{data.stats.playTimeFormatted}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-border">
            <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Swords className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Muertes del Jugador</p>
              <p className="font-heading text-sm font-bold text-foreground truncate">{data.stats.playerKills}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-border">
            <div className="size-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Skull className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Muertes</p>
              <p className="font-heading text-sm font-bold text-foreground truncate">{data.stats.deaths}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-border">
            <div className="size-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Gauge className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">Razón de muertes y asesinatos</p>
              <p className="font-heading text-sm font-bold text-foreground truncate">{data.stats.kdRatio}</p>
            </div>
          </div>
        </div>

        {/* 4 Columns Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* Column 1: Distancias */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
            <h4 className="font-semibold text-foreground border-b border-border pb-2">
              Distancia recorrida (en bloques)
            </h4>
            <div className="flex justify-between py-1 font-bold text-foreground border-b border-white/5">
              <span>Total</span>
              <span className="font-mono">{data.stats.distances.total.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Distancia caminada</span>
                <span className="font-mono text-foreground">{data.stats.distances.walk.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia corriendo</span>
                <span className="font-mono text-foreground">{data.stats.distances.sprint.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia en barca</span>
                <span className="font-mono text-foreground">{data.stats.distances.boat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia caída</span>
                <span className="font-mono text-foreground">{data.stats.distances.fall.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia a caballo</span>
                <span className="font-mono text-foreground">{data.stats.distances.horse.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia nadada</span>
                <span className="font-mono text-foreground">{data.stats.distances.swim.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia agachado</span>
                <span className="font-mono text-foreground">{data.stats.distances.crouch.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Distancia escalada</span>
                <span className="font-mono text-foreground">{data.stats.distances.climb.toLocaleString()}</span>
              </div>
              {data.stats.distances.fly > 0 && (
                <div className="flex justify-between">
                  <span>Distancia volada</span>
                  <span className="font-mono text-foreground">{data.stats.distances.fly.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Bloques destruidos */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
            <h4 className="font-semibold text-foreground border-b border-border pb-2">Bloques destruidos</h4>
            <div className="flex justify-between py-1 font-bold text-foreground border-b border-white/5">
              <span>Total</span>
              <span className="font-mono">{data.stats.mined.total.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {(showAllStats ? data.stats.mined.items : data.stats.mined.items.slice(0, 10)).map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={it.textureUrl} alt={it.name} className="size-4 shrink-0 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="truncate">{it.name}</span>
                  </div>
                  <span className="font-mono text-foreground shrink-0">{it.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Objetos usados */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
            <h4 className="font-semibold text-foreground border-b border-border pb-2">Objetos usados</h4>
            <div className="flex justify-between py-1 font-bold text-foreground border-b border-white/5">
              <span>Total</span>
              <span className="font-mono">{data.stats.used.total.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {(showAllStats ? data.stats.used.items : data.stats.used.items.slice(0, 10)).map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={it.textureUrl} alt={it.name} className="size-4 shrink-0 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="truncate">{it.name}</span>
                  </div>
                  <span className="font-mono text-foreground shrink-0">{it.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Entidades eliminadas */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-black/20 border border-white/5">
            <h4 className="font-semibold text-foreground border-b border-border pb-2">Entidades eliminadas</h4>
            <div className="flex justify-between py-1 font-bold text-foreground border-b border-white/5">
              <span>Total</span>
              <span className="font-mono">{data.stats.killed.total.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              {(showAllStats ? data.stats.killed.items : data.stats.killed.items.slice(0, 10)).map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={it.headUrl} alt={it.name} className="size-4 shrink-0 rounded object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="truncate">{it.name}</span>
                  </div>
                  <span className="font-mono text-foreground shrink-0">{it.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Show All / Show Less button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAllStats(!showAllStats)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-6 py-2 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/30"
          >
            {showAllStats ? (
              <>
                <ChevronUp className="size-4" /> Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="size-4" /> Mostrar todo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal: Cofre de Ender */}
      {showEnderChestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass flex w-full max-w-xl flex-col gap-4 rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <Box className="size-5 text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Cofre de Ender — {playerName}
                </h3>
              </div>
              <button
                onClick={() => setShowEnderChestModal(false)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Contiene {data.enderItems.length} objetos almacenados en el cofre interdimensional. Haz clic en cualquiera para inspeccionar sus encantamientos.
            </p>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10">
              {data.enderItems.length > 0 ? (
                <div className="grid grid-cols-9 gap-1.5 justify-center">
                  {Array.from({ length: 27 }, (_, i) => {
                    const enderItem = data.enderItems.find((e) => e.slot === i)
                    return (
                      <ItemSlotBox
                        key={`ender-${i}`}
                        item={enderItem}
                        isSelected={selectedItem === enderItem && selectedItem !== null}
                        onClick={() => enderItem && setSelectedItem(enderItem)}
                        onHover={setHoveredItem}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  El cofre de Ender está vacío.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEnderChestModal(false)}
                className="rounded-xl border border-border bg-white/5 px-4 py-2 text-xs font-medium text-foreground hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
