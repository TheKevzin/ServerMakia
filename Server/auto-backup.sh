#!/bin/bash
# ========================================================
# Script de Backup Automático - ServerMakia Fabric 1.21.11
# ========================================================

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUPS_DIR="$(cd "$SERVER_DIR/../backups" 2>/dev/null && pwd)"
PANEL_DIR="$(cd "$SERVER_DIR/../panel" 2>/dev/null && pwd)"

if [ -z "$BACKUPS_DIR" ]; then
    BACKUPS_DIR="$SERVER_DIR/../backups"
    mkdir -p "$BACKUPS_DIR"
fi

# Configuración de retención (modificada dinámicamente desde el panel web)
MAX_BACKUPS=7

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="auto-${TIMESTAMP}.tar.gz"
BACKUP_PATH="${BACKUPS_DIR}/${BACKUP_NAME}"
LOCK_FILE="${BACKUPS_DIR}/.backup-in-progress"

# Evitar múltiples backups simultáneos
if [ -f "$LOCK_FILE" ]; then
    echo "[$(date)] Backup en progreso actualmente. Omitiendo ejecución programada."
    exit 0
fi

echo "$BACKUP_NAME" > "$LOCK_FILE"

cd "$SERVER_DIR" || exit 1

# Elementos esenciales a respaldar
INCLUDES=(
    "./world"
    "./config"
    "./server.properties"
    "./whitelist.json"
    "./banned-players.json"
    "./banned-ips.json"
    "./ops.json"
    "./usercache.json"
)

echo "[$(date)] Iniciando backup: $BACKUP_NAME"
tar -czf "$BACKUP_PATH" "${INCLUDES[@]}" 2>/dev/null || tar -czf "$BACKUP_PATH" $(ls -d "${INCLUDES[@]}" 2>/dev/null)

rm -f "$LOCK_FILE"

if [ -f "$BACKUP_PATH" ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    echo "[$(date)] Backup generado con éxito ($BACKUP_SIZE): $BACKUP_PATH"
else
    echo "[$(date)] Error al comprimir el backup."
    exit 1
fi

# Rotación de copias locales antiguas
cd "$BACKUPS_DIR" || exit 1
CURRENT_COUNT=$(ls -1 auto-*.tar.gz 2>/dev/null | wc -l)
if [ "$CURRENT_COUNT" -gt "$MAX_BACKUPS" ]; then
    DELETE_COUNT=$((CURRENT_COUNT - MAX_BACKUPS))
    echo "[$(date)] Purgando $DELETE_COUNT backups antiguos locales..."
    ls -t auto-*.tar.gz | tail -n "$DELETE_COUNT" | xargs -r rm -f
fi

# Subida automática a Google Drive (5 TB) mediante rclone
if command -v rclone &> /dev/null; then
    echo "[$(date)] Subiendo backup a Google Drive (5 TB) con rclone..."
    rclone copy "$BACKUP_PATH" "gdrive:Backups Servidor" --drive-chunk-size 64M > /dev/null 2>&1 &
fi

echo "[$(date)] Proceso de backup concluido."
