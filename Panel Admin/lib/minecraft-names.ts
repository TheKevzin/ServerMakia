export const MINECRAFT_TRANSLATIONS_ES: Record<string, string> = {
  // Blocks
  sand: 'Arena',
  grass_block: 'Césped',
  stone: 'Piedra',
  deepslate: 'Pizarra profunda',
  dirt: 'Tierra',
  cherry_log: 'Tronco de cerezo',
  acacia_log: 'Tronco de acacia',
  short_grass: 'Hierba corta',
  deepslate_iron_ore: 'Mena de hierro de pizarra profunda',
  coal_ore: 'Mena de carbón',
  deepslate_diamond_ore: 'Mena de diamante de pizarra profunda',
  cherry_leaves: 'Hojas de cerezo',
  sugar_cane: 'Caña de azúcar',
  cobblestone: 'Roca',
  iron_ore: 'Mena de hierro',
  oak_log: 'Tronco de roble',
  birch_log: 'Tronco de abedul',
  spruce_log: 'Tronco de abeto',
  torch: 'Antorcha',
  chest: 'Cofre',
  crafting_table: 'Mesa de crafteo',
  furnace: 'Horno',
  gravel: 'Grava',
  sandstone: 'Arenisca',
  glass: 'Vidrio',
  obsidian: 'Obsidiana',
  netherrack: 'Netherrack',
  nether_quartz_ore: 'Mena de cuarzo del Nether',
  soul_sand: 'Arena de almas',
  basalt: 'Basalto',
  blackstone: 'Piedra negra',
  end_stone: 'Piedra del End',
  oak_planks: 'Tablones de roble',
  birch_planks: 'Tablones de abedul',
  spruce_planks: 'Tablones de abeto',
  cherry_planks: 'Tablones de cerezo',
  deepslate_bricks: 'Ladrillos de pizarra profunda',

  // Items / Tools
  diamond_shovel: 'Pala de diamante',
  diamond_pickaxe: 'Pico de diamante',
  diamond_axe: 'Hacha de diamante',
  diamond_sword: 'Espada de diamante',
  diamond_hoe: 'Azadón de diamante',
  netherite_pickaxe: 'Pico de inframundita',
  netherite_axe: 'Hacha de inframundita',
  netherite_sword: 'Espada de inframundita',
  netherite_shovel: 'Pala de inframundita',
  iron_pickaxe: 'Pico de hierro',
  iron_axe: 'Hacha de hierro',
  iron_sword: 'Espada de hierro',
  iron_shovel: 'Pala de hierro',
  shield: 'Escudo',
  bone_meal: 'Polvo de hueso',
  acacia_sapling: 'Brote de acacia',
  cherry_sapling: 'Brote de cerezo',
  shears: 'Tijeras',
  crossbow: 'Ballesta',
  bow: 'Arco',
  arrow: 'Flecha',
  golden_apple: 'Manzana dorada',
  enchanted_golden_apple: 'Manzana dorada encantada',
  golden_carrot: 'Zanahoria dorada',
  baked_potato: 'Patata asada',
  cooked_porkchop: 'Chuleta de cerdo cocinada',
  cooked_beef: 'Filete',
  cooked_mutton: 'Cordero cocinado',
  bread: 'Pan',
  bundle: 'Saco',
  flint_and_steel: 'Mechero',
  water_bucket: 'Cubo con agua',
  lava_bucket: 'Cubo con lava',
  bucket: 'Cubo',
  diamond_helmet: 'Casco de diamante',
  diamond_chestplate: 'Pechera de diamante',
  diamond_leggings: 'Pantalones de diamante',
  diamond_boots: 'Botas de diamante',
  netherite_helmet: 'Casco de inframundita',
  netherite_chestplate: 'Pechera de inframundita',
  netherite_leggings: 'Pantalones de inframundita',
  netherite_boots: 'Botas de inframundita',
  iron_helmet: 'Casco de hierro',
  iron_chestplate: 'Pechera de hierro',
  iron_leggings: 'Pantalones de hierro',
  iron_boots: 'Botas de hierro',
  elytra: 'Élitros',
  ender_chest: 'Cofre de Ender',
  ender_pearl: 'Perla de Ender',
  totem_of_undying: 'Tótem de la inmortalidad',

  // Entities
  skeleton: 'Esqueleto',
  spider: 'Araña',
  cave_spider: 'Araña de cueva',
  zombie: 'Zombi',
  sheep: 'Oveja',
  cow: 'Vaca',
  pig: 'Cerdo',
  chicken: 'Pollo',
  slime: 'Slime',
  pillager: 'Saqueador',
  vindicator: 'Vindicador',
  breeze: 'Breeze',
  creeper: 'Creeper',
  enderman: 'Enderman',
  phantom: 'Fantasma',
  witch: 'Bruja',
  drowned: 'Ahogado',
  husk: 'Momia',
  stray: 'Errante',
  silverfish: 'Lepisma',
  blaze: 'Blaze',
  ghast: 'Ghast',
  magma_cube: 'Cubo de magma',
  wither_skeleton: 'Esqueleto del Wither',
  piglin: 'Piglin',
  zombified_piglin: 'Piglin zombificado',
  hoglin: 'Hoglin',
  zoglin: 'Zoglin',
  warden: 'Warden',
  ravager: 'Devastador',
  iron_golem: 'Gólem de hierro',
  villager: 'Aldeano',
  wolf: 'Lobo',
  cat: 'Gato',
  horse: 'Caballo',
  donkey: 'Burro',
  mule: 'Mula',
  llama: 'Llama',
  bat: 'Murciélago',
  parrot: 'Loro',
  axolotl: 'Ajolote',
  bee: 'Abeja',
}

export function translateMinecraft(rawId: string): string {
  if (!rawId) return 'Desconocido'
  const clean = rawId.replace(/^minecraft:/, '').toLowerCase()
  if (MINECRAFT_TRANSLATIONS_ES[clean]) {
    return MINECRAFT_TRANSLATIONS_ES[clean]
  }
  // Title case fallback
  return clean
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export function getItemTextureUrl(rawId: string): string {
  if (!rawId) return ''
  const clean = rawId.replace(/^minecraft:/, '').toLowerCase()
  return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/${clean}.png`
}

export function getBlockTextureUrl(rawId: string): string {
  if (!rawId) return ''
  const clean = rawId.replace(/^minecraft:/, '').toLowerCase()
  return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${clean}.png`
}

// Known max durabilities for vanilla items
export const ITEM_MAX_DURABILITY: Record<string, number> = {
  // Netherite
  'minecraft:netherite_sword': 2031,
  'minecraft:netherite_pickaxe': 2031,
  'minecraft:netherite_axe': 2031,
  'minecraft:netherite_shovel': 2031,
  'minecraft:netherite_hoe': 2031,
  'minecraft:netherite_helmet': 407,
  'minecraft:netherite_chestplate': 592,
  'minecraft:netherite_leggings': 555,
  'minecraft:netherite_boots': 481,

  // Diamond
  'minecraft:diamond_sword': 1561,
  'minecraft:diamond_pickaxe': 1561,
  'minecraft:diamond_axe': 1561,
  'minecraft:diamond_shovel': 1561,
  'minecraft:diamond_hoe': 1561,
  'minecraft:diamond_helmet': 363,
  'minecraft:diamond_chestplate': 528,
  'minecraft:diamond_leggings': 495,
  'minecraft:diamond_boots': 429,

  // Iron
  'minecraft:iron_sword': 250,
  'minecraft:iron_pickaxe': 250,
  'minecraft:iron_axe': 250,
  'minecraft:iron_shovel': 250,
  'minecraft:iron_hoe': 250,
  'minecraft:iron_helmet': 165,
  'minecraft:iron_chestplate': 240,
  'minecraft:iron_leggings': 225,
  'minecraft:iron_boots': 195,

  // Misc
  'minecraft:bow': 384,
  'minecraft:crossbow': 465,
  'minecraft:shield': 336,
  'minecraft:flint_and_steel': 64,
  'minecraft:shears': 238,
  'minecraft:fishing_rod': 64,
  'minecraft:elytra': 432,
}
