# ⛏️ Servidor Minecraft Fabric 1.21.11 (Optimizado)

Estructura completa de configuración y mods para el servidor de Minecraft en **Ubuntu Server** (HP i5-4590, 16GB RAM).

## 📁 Contenido del Directorio

- **`start.sh`**: Script de ejecución optimizado con **Aikar's Flags (G1GC)** y asignación de 6GB a 8GB de RAM en Java 21 LTS.
- **`fabric-server-launch.jar`**: Lanzador oficial de Fabric Loader 0.19.5 para Minecraft 1.21.11.
- **`server.properties`**: Archivo de propiedades afinado (puerto 25565, `online-mode=false`, distancias de visión 10 / simulación 8, RCON habilitado en puerto 25575).
- **`ops.json`**: Administradores del servidor (incluye a `TheKevzin` nivel 4).
- **`eula.txt`**: EULA aceptado (`eula=true`).
- **`config/`**: Archivos de configuración de los mods (C2ME, Lithium, FerriteCore, Spark, Chunky).
- **`mods/`**: Mods de rendimiento instalados:
  - `fabric-api-0.141.6+1.21.11.jar`: Base para Fabric.
  - `lithium-fabric-0.21.4+mc1.21.11.jar`: Optimización de físicas, mobs y chunks.
  - `ferritecore-8.2.0-fabric.jar`: Reductor de huella de memoria RAM.
  - `krypton-0.2.10.jar`: Optimización de paquetes y red.
  - `c2me-fabric-mc1.21.11-0.4.0-alpha.0.27.jar`: Generación de chunks multihilo.
  - `Chunky-Fabric-1.4.55.jar`: Pre-generación de terreno.
  - `spark-1.10.170-fabric.jar`: Diagnóstico y medición de TPS en tiempo real.
  - `alternate-current-mc1.21.11-1.9.0.jar`: Redstone ultrarrápido y sin lag.
  - `Clumps-fabric-1.21.11-29.0.0.1.jar`: Agrupación de orbes de experiencia.
  - `servercore-fabric-1.5.15+1.21.11.jar`: Distancia de simulación dinámica y optimización de entidades/granjas.
  - `graves-3.10.2+1.21.11.jar`: Sistema de tumbas de muerte (Universal Graves) 100% server-side.
  - `polymer-bundled-0.15.2+1.21.11.jar`: Motor de compatibilidad server-side para que jugadores vanilla vean las tumbas sin mods.

## 🌐 Conexión y Accesos Públicos

- **Minecraft Java (Público)**: `carolyn-canine.tun.ply.gg:57814` (o IP directa `147.185.221.215:57814`)
- **Panel Web Admin (Público)**: `https://dismiss-moody-frown.ngrok-free.dev`
- **Red Local (LAN)**: `192.168.101.10:25565` (Minecraft) / `http://192.168.101.10:3000` (Panel Web)

## 🚀 Cómo Iniciar el Servidor en Ubuntu
```bash
# Iniciar en segundo plano dentro de screen:
screen -dmS minecraft bash start.sh

# Ver la consola:
screen -r minecraft

# Salir de la consola sin apagar:
# Presionar Ctrl + A, luego soltar y presionar D
```

