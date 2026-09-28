<#
.SYNOPSIS
  Script de backup automático y subida a Google Drive.
.DESCRIPTION
  Este script comprime el mundo y lo sube a Google Drive usando rclone o curl.
#>

param (
    [string]$WorldPath = "..\server\world",
    [string]$BackupDir = "..\server\backups"
)

$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = "$BackupDir\world_backup_$Date.zip"

Write-Host "Iniciando compresión de $WorldPath a $BackupFile..."
Compress-Archive -Path $WorldPath -DestinationPath $BackupFile -Force
Write-Host "Compresión completada."

Write-Host "Subiendo a Google Drive..."
# PREPARADO: Para integrar Google Drive, configura rclone ejecutando 'rclone config'
# Y luego descomenta la siguiente línea:
# rclone copy $BackupFile "gdrive:MinecraftBackups/" --progress

Write-Host "Backup finalizado exitosamente."
