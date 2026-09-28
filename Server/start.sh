#!/bin/bash
# ========================================================
# Servidor Minecraft Fabric 1.21.11 - HP i5-4590 (16GB RAM)
# ========================================================

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SERVER_DIR"

# Seleccionar Java 21 LTS
if [ -f "/usr/lib/jvm/java-1.21.0-openjdk-amd64/bin/java" ]; then
    JAVA_BIN="/usr/lib/jvm/java-1.21.0-openjdk-amd64/bin/java"
else
    JAVA_BIN="java"
fi

# Configuración de memoria RAM (6GB inicial, 8GB máxima para dejar 8GB al SO y cache de chunks)
RAM_MIN="6G"
RAM_MAX="8G"

# Aikar's Flags optimizadas para G1GC
AIKAR_FLAGS="-XX:+UseG1GC \
-XX:+ParallelRefProcEnabled \
-XX:MaxGCPauseMillis=200 \
-XX:+UnlockExperimentalVMOptions \
-XX:+DisableExplicitGC \
-XX:+AlwaysPreTouch \
-XX:G1NewSizePercent=30 \
-XX:G1MaxNewSizePercent=40 \
-XX:G1HeapRegionSize=8M \
-XX:G1ReservePercent=20 \
-XX:G1HeapWastePercent=5 \
-XX:G1MixedGCCountTarget=4 \
-XX:InitiatingHeapOccupancyPercent=15 \
-XX:G1MixedGCLiveThresholdPercent=90 \
-XX:G1RSetUpdatingPauseTimePercent=5 \
-XX:SurvivorRatio=32 \
-XX:+PerfDisableSharedMem \
-XX:MaxTenuringThreshold=1"

echo "============================================================"
echo " Iniciando Servidor Fabric 1.21.11 (Vanilla)"
echo " RAM: ${RAM_MIN} - ${RAM_MAX} | Java: $($JAVA_BIN -version 2>&1 | head -n1)"
echo "============================================================"

$JAVA_BIN -Xms${RAM_MIN} -Xmx${RAM_MAX} ${AIKAR_FLAGS} -jar fabric-server-launch.jar nogui
