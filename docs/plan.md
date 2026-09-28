# 🎮 Plan de Arquitectura y Decisiones Técnicas — ServerMakia

## 📋 Descripción General

Servidor dedicado de **Minecraft Fabric 1.21.11 (Vanilla Optimizado)** para un grupo de jugadores amigos, migrado desde un hosting limitado en Aternos a un servidor local dedicado en hardware físico.

El objetivo central es garantizar **20.0 TPS constantes**, permitir el libre ingreso de jugadores Premium y No-Premium, ampliar las distancias de visión y simulación, y contar con un panel de control web accesible tanto en la red local como vía internet.

---

## 🖥️ Topología de Hardware

| Equipo | Especificaciones | Rol | Notas |
| :--- | :--- | :--- | :--- |
| **PC HP (Servidor Dedicado)** | Intel Core i5-4590 (4C/4T @ 3.30GHz)<br>16 GB RAM DDR3<br>256 GB SSD | Servidor Minecraft + Panel Web | Ubuntu Server 26.04 LTS (Headless). Sin entorno gráfico para ahorrar CPU y RAM. |
| **Clientes (Jugadores)** | PCs de los usuarios (Windows / Linux / Mac) | Cliente de Juego | Se conectan con clientes Vanilla 1.21.11 o Fabric con mods cliente (Sodium, Iris, etc.). |

---

## ⚙️ Decisiones Técnicas Clave

### 1. Sistema Operativo: Ubuntu Server (Headless)
- **Cero sobrecarga gráfica:** Consume menos de 600 MB de RAM en reposo total del sistema.
- **Rendimiento de Java:** Manejo superior de hilos y memoria virtual en Linux comparado con Windows para procesos de larga duración.

### 2. Versión de Juego: Minecraft 1.21.11 en Fabric Loader
- Permite mantener la experiencia 100% fiel a **Vanilla** (sin ítems ni mecánicas invasivas de mods complejos).
- Permite la inyección de optimizadores de bajo nivel a través de Mixins (Lithium, FerriteCore, C2ME, Krypton).

### 3. Asignación de Memoria: 6 GB a 8 GB con Java 21 LTS
- Con 16 GB de RAM física instalada, asignar entre 6 GB y 8 GB a Java garantiza espacio suficiente para el heap del juego y evita el temido *OutOfMemoryError*.
- Dejar los 8 GB restantes libres permite que el kernel de Linux mantenga una caché de página de disco (Page Cache) masiva, lo que hace que la carga de regiones y chunks sea casi instantánea desde el SSD.
- Se implementan las **Aikar's Flags** para el recolector de basura G1GC:
  ```bash
  -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:InitiatingHeapOccupancyPercent=15
  ```

### 4. Mitigación del Cuello de Botella Mononúcleo (CPU Haswell)
- Minecraft ejecuta el bucle de tick principal en un solo hilo.
- Para evitar que la generación o lectura de terreno congele el hilo principal en el i5-4590, se utiliza **C2ME (Concurrent Chunk Management Engine)**, que distribuye los cálculos matemáticos de ruido, iluminación y guardado de chunks entre los **3 núcleos restantes** del procesador.

---

## 🌐 Conectividad y Puertos

| Servicio | Puerto | Protocolo | Uso |
| :--- | :--- | :--- | :--- |
| **Minecraft Server** | `25565` | TCP / UDP | Conexión de jugadores del juego |
| **Panel Web Next.js** | `3000` | TCP (HTTP) | Interfaz web de administración |
| **RCON Minecraft** | `25575` | TCP | Comunicación de comandos entre el panel y el juego |
