# ⛏️ ServerMakia — Servidor Minecraft Fabric 1.21.11 & Panel Admin

Servidor dedicado de **Minecraft Vanilla** sobre **Fabric 1.21.11**, optimizado para máximo rendimiento y auto-hospedado en **Ubuntu Server** con un panel de control web integral en **Next.js 16 + React 19**.

---

## 🎯 ¿Qué es este proyecto?

Un proyecto completo de **homelab** que transforma una PC dedicada (HP Intel Core i5 de 4ta Gen) en un servidor de Minecraft 100% autónomo, estable y con **20.0 TPS continuos**. Migrado exitosamente desde Aternos para eliminar colas de espera, mejorar las distancias de renderizado y dar control total al administrador.

- 🐧 **Ubuntu Server** como base (headless, sin entorno gráfico para mínimo consumo de recursos).
- ⚙️ **Fabric 1.21.11** con stack de optimización pura (Lithium, FerriteCore, Krypton, C2ME, Spark, etc.).
- 🌐 **Panel Web Profesional** en Next.js 16 para monitorear métricas, gestionar archivos con Monaco Editor, ver logs y ejecutar comandos vía RCON.
- 👥 **Soporte Híbrido**: Permite el ingreso de jugadores tanto Premium como No-Premium (`online-mode=false`).
- ⚡ **Rendimiento Extremo**: Arranque del mundo en 1.43 segundos y latencia por tick de ~0.7 ms (sobre 50 ms disponibles).

---

## 🖥️ Arquitectura del Sistema

```text
PC Servidor HP (i5-4590 @ 3.30GHz / 16GB DDR3 / 256GB SSD)
│
├── 🐧 Ubuntu Server (IP Local: 192.168.101.10)
│   │
│   ├── ⛏️ Minecraft Fabric 1.21.11 (Puerto 25565)
│   │   ├── Gestión en segundo plano con GNU Screen (screen -dmS minecraft)
│   │   ├── Java 21 LTS + Aikar's Flags (6GB - 8GB RAM asignados)
│   │   └── Protocolo RCON habilitado (Puerto 25575)
│   │
│   └── 🌐 Panel Web Next.js (Puerto 3000)
│       ├── Orquestado con PM2 (auto-reinicio)
│       ├── SQLite + Prisma ORM para roles y autenticación
│       └── Cliente RCON conectado a Minecraft en localhost:25575
│
└── 🌐 Red & Conectividad
    ├── Acceso local: 192.168.101.10:25565
    ├── Panel Web: http://192.168.101.10:3000
    └── Opciones públicas: Cloudflare Tunnels / Playit.gg
```

---

## 📂 Estructura del Repositorio

```text
ServerMakia/
├── 📂 Panel Admin/       → Proyecto completo del panel web (Next.js 16, React 19, Tailwind CSS, Prisma)
├── 📂 Server/            → Archivos de configuración del servidor (mods, configs, scripts, propiedades)
├── 📂 docs/              → Documentación técnica, arquitectura y lista de mods
├── 📂 scripts/           → Scripts auxiliares de automatización y copias de seguridad
├── 📜 tunnel-start.sh    → Script para túnel de Cloudflare con notificación a Discord
├── 🌍 world.zip          → Copia de respaldo original del mundo migrado de Aternos
└── 📜 README.md          → Esta documentación
```

---

## 📦 Stack de Mods de Rendimiento (Fabric 1.21.11)

El servidor es **Vanilla puro** a nivel de jugabilidad (no añade ítems ni bloques modificados), pero incorpora los mejores módulos de optimización técnica:

| Mod | Versión | Propósito en el Servidor |
| :--- | :--- | :--- |
| **Fabric API** | `0.141.6` | Interfaz fundamental para el ecosistema Fabric. |
| **Lithium** | `0.21.4` | Optimiza físicas de bloques, IA de mobs y ticking general. |
| **FerriteCore** | `8.2.0` | Reduce sustancialmente el consumo de memoria RAM. |
| **Krypton** | `0.2.10` | Optimiza la pila de red y el envío de paquetes. |
| **C2ME** | `0.4.0-alpha` | Generación y lectura de chunks en multihilo (3 núcleos paralelos del i5). |
| **Clumps** | `29.0.0.1` | Agrupa orbes de experiencia en paquetes únicos (evita lag en granjas). |
| **Alternate Current** | `1.9.0` | Motor de redstone ultrarrápido y altamente eficiente. |
| **Chunky** | `1.4.55` | Herramienta para pre-generar chunks de mapa en frío. |
| **Spark** | `1.10.170` | Diagnóstico de rendimiento, perfilado de CPU y medición de TPS en tiempo real. |

---

## 🚀 Guía de Operación y Comandos

### Comandos en el Servidor Ubuntu (`thekevzin@192.168.101.10`)
```bash
# Entrar a la consola de Minecraft interactiva:
screen -r minecraft

# Salir de la consola sin apagar el servidor:
# Presionar: Ctrl + A y luego la tecla D

# Ver el rendimiento en tiempo real (TPS y ticks):
screen -S minecraft -X stuff 'spark tps^M'

# Apagar el servidor de forma segura:
screen -S minecraft -X stuff 'stop^M'

# Encender el servidor en segundo plano:
cd ~/servidor/server
screen -dmS minecraft bash start.sh
```

### Ejecutar el Panel Web en Modo Desarrollo (PC Local)
```bash
cd "Panel Admin"
npm install
npx prisma generate
npx prisma db push
npm run dev
# Abrir en el navegador: http://localhost:3000
```

---

## 📊 Métricas de Rendimiento en Producción

* **TPS Promedio:** `20.0 / 20.0`
* **Tiempo de Tick (MSPT):** `~0.7 ms` (98.6% de margen libre por tick).
* **Consumo de CPU:** `~2% - 4%` en reposo.
* **Tiempo de Inicio:** `1.43 segundos` para cargar todas las dimensiones.

---

## 👤 Autor & Créditos
**TheKevzin** — Homelab auto-hospedado y administración de servidores dedicados de Minecraft.
