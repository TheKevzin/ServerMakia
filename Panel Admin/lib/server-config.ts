import path from 'path'
import fs from 'fs'

/**
 * Returns the resolved path to the Minecraft server directory.
 * Prioritizes MINECRAFT_SERVER_DIR environment variable,
 * then checks for '../Server' (capitalized), then '../server'.
 */
export function getServerDir(): string {
  if (process.env.MINECRAFT_SERVER_DIR) {
    return path.resolve(process.env.MINECRAFT_SERVER_DIR)
  }
  const capitalServer = path.resolve(process.cwd(), '../Server')
  if (fs.existsSync(capitalServer)) {
    return capitalServer
  }
  return path.resolve(process.cwd(), '../server')
}

export const SERVER_DIR = getServerDir()
export const WORLD_DIR = path.join(SERVER_DIR, 'world')
