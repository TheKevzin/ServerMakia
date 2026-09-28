# 🏰 ServerMakia / Enderlab — Recapitulación Completa del Sistema

> **Actualizado:** Septiembre 2026  
> **Autor:** TheKevzin  
> **Stack:** Next.js 16 + React 19 + Prisma + SQLite + Tailwind CSS + Fabric 1.21.11

---

## 1. ¿Qué es este sistema?

Es una solución integral de **homelab y panel de administración web** profesional para un servidor dedicado de Minecraft **Fabric 1.21.11 (Vanilla Optimizado)** que corre en una máquina Linux Ubuntu Server física. Permite monitorear métricas, controlar el ciclo de vida del servidor (Start/Stop/Restart), ver la consola en vivo con comandos RCON y gestionar archivos desde el navegador.

---

## 2. Arquitectura del Sistema

```mermaid
graph TD
    A["🌐 Internet / Red Local"] -->|HTTP / HTTPS| B["☁️ Cloudflare / Red Local (3000)"]
    B --> C["📊 Panel Next.js (Puerto 3000)"]
    C -->|RCON (Puerto 25575)| D["⛏️ Servidor Minecraft (Puerto 25565)"]
    C -->|Prisma ORM| E["🗄️ SQLite (dev.db)"]
    C -->|googleapis| F["☁️ Google Drive Backups"]
    C -->|Webhook| G["💬 Discord Notificaciones"]
    
    H["🖥️ PM2 Process Manager"] -->|Auto-start| C
```

### Infraestructura Física y de Red
| Componente | Detalle |
|---|---|
| **Máquina** | HP ProDesk Desktop (Intel Core i5-4590 @ 3.30GHz, 16GB DDR3 RAM, 256GB SSD) |
| **Sistema Operativo** | Ubuntu Server 26.04 LTS (Headless, sin interfaz gráfica) |
| **IP Local** | `192.168.101.10` |
| **Puerto Minecraft** | `25565` (TCP/UDP) |
| **Puerto RCON** | `25575` (TCP) |
| **Puerto Panel Web** | `3000` (Next.js) |
| **Gestión de Procesos** | `screen` para Minecraft, `pm2` para el panel web y túneles |

### Estructura de Carpetas en el Servidor Ubuntu
```text
~/servidor/
├── panel/              ← Next.js 16 (panel web de administración)
│   ├── app/            ← Rutas de App Router y APIs
│   ├── components/     ← Componentes de UI (dashboard, consola, etc.)
│   ├── lib/            ← Lógica RCON, server-manager y utilidades
│   ├── prisma/         ← Schema SQLite y migraciones de usuarios
│   ├── drive-config.json  ← Credenciales de Google Drive
│   └── .webhook-url    ← Webhook de Discord
├── server/             ← Minecraft Fabric 1.21.11 (mods, config, world, start.sh)
├── backups/            ← Copias de seguridad locales (.tar.gz)
└── tunnel-start.sh     ← Script de Cloudflare Tunnel con alertas Discord
```

---

## 3. Sistema de Autenticación y Roles

### Login
- **Método:** JWT almacenado en cookie `enderlab_auth` (`httpOnly`, seguro)
- **API:** `POST /api/auth` → valida contraseñas con `bcryptjs`, genera y firma tokens con `jose`

### Roles y Permisos

| Sección | 👑 ADMIN | 🛡️ MODERATOR | 👁️ VIEWER |
|---|:---:|:---:|:---:|
| Dashboard (métricas de CPU/RAM/Disco) | ✅ | ✅ | ✅ |
| Control de Energía (Start/Stop/Restart) | ✅ | ❌ | ❌ |
| Consola (lectura de logs) | ✅ | ✅ | ❌ |
| Consola (envío de comandos RCON) | ✅ | ✅ | ❌ |
| Jugadores (ver conectados) | ✅ | ✅ | ✅ |
| Jugadores (kick/ban/op) | ✅ | ✅ | ❌ |
| Gestor de Archivos (Monaco Editor) | ✅ | ❌ | ❌ |
| Copias de Seguridad (Backups) | ✅ | ❌ | ❌ |
| Configuración del Servidor | ✅ | ❌ | ❌ |
| Gestión de Usuarios del Panel | ✅ | ❌ | ❌ |

---

## 4. Vistas y Módulos del Panel

### 4.1 Dashboard
- **Telemetría en tiempo real:** Uso de CPU, memoria RAM, espacio en disco y tiempo en línea (uptime).
- **Acciones Rápidas:** Encendido, apagado y reinicio con confirmación de estado.

### 4.2 Consola RCON
- Terminal interactiva conectada por socket RCON (puerto 25575) a Minecraft.
- Envío inmediato de comandos (`/gamemode`, `/teleport`, `/spark tps`, `/say`, etc.).

### 4.3 Gestión de Jugadores
- Monitoreo de jugadores online y registro offline.
- Acciones administrativas instantáneas: **Kick**, **Ban**, otorgar o revocar **OP**.

### 4.4 Gestor de Archivos
- Explorador del directorio `~/servidor/server` desde el navegador.
- Editor integrado con **Monaco Editor** para editar `server.properties`, listas o configs de mods.

### 4.5 Backups
- Creación de respaldos comprimidos del mundo (`world`).
- Sincronización automática opcional hacia Google Drive con rotación configurable.

### 4.6 Settings
- Modificación de parámetros de `server.properties` (MOTD, cantidad de slots, dificultad, online-mode).
- Ajuste de argumentos de memoria de la JVM.

---

## 5. Gestión de Procesos (PM2 & Screen)

En el servidor Ubuntu:
```text
┌────┬────────┬──────────┬────────────────────────────────────────┐
│ id │ name   │ status   │ descripción                            │
├────┼────────┼──────────┼────────────────────────────────────────┤
│ 0  │ panel  │ online   │ Panel Web Next.js en puerto 3000       │
│ 1  │ tunnel │ online   │ Túnel Cloudflare para acceso remoto    │
└────┴────────┴──────────┴────────────────────────────────────────┘
```
Minecraft se ejecuta en una sesión desacoplada de `screen`:
```bash
# Ver consola de Minecraft
screen -r minecraft

# Verificar que el screen está vivo
screen -ls
```
