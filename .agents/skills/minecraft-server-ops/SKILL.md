---
name: minecraft-server-ops
description: >-
  Use this skill when managing the Minecraft server lifecycle, RCON commands,
  backup routines, player NBT inspection, or server configuration files in ServerMakia.
---

# Minecraft Server Operations Skill

This skill details operational procedures for controlling the ServerMakia Minecraft Fabric server, executing commands, and handling data storage.

## Core Services & Configuration

1. **Server Directory**:
   - Always resolve via `@/lib/server-config`: `SERVER_DIR` and `WORLD_DIR`.
   - Never hardcode relative paths like `../server` or `../Server`.
   - Supported environment variable override: `MINECRAFT_SERVER_DIR`.

2. **RCON Execution**:
   - Connection manager: `ServerManager.getRcon()`.
   - Command dispatch: `ServerManager.sendCommand(cmd)`.
   - Validated commands:
     - `list`: Get online players.
     - `kick <player> [reason]`: Kick player.
     - `ban <player> [reason]`: Ban player.
     - `op <player>` / `deop <player>`: Modify operator level.
     - `say <msg>` / `tellraw @a <json>`: Broadcast alerts.

3. **Backup Operations**:
   - Backups are stored as `.tar.gz` archives in the `backups/` directory.
   - Dual storage:
     - Local filesystem retention policy.
     - Google Drive API upload via `uploadAndManageDrive()` with retention cap (max 3 files in cloud).
   - Use atomic lock files (`.backup-in-progress`) to prevent concurrent backup jobs.

4. **Player NBT & Stats**:
   - Player data files reside in `world/playerdata/<uuid>.dat`.
   - NBT decompressed and parsed via `@/lib/nbt`.
   - Translations for item IDs and textures provided by `@/lib/minecraft-names`.
