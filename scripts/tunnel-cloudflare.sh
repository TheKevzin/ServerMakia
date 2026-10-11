#!/bin/bash

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEBHOOK_FILE="$BASE_DIR/Panel Admin/.webhook-url"

echo "Iniciando Cloudflare Tunnel para Enderlab Panel..."

# Archivo temporal para capturar el log del túnel
LOG_FILE="/tmp/cloudflared_tunnel.log"
rm -f "$LOG_FILE"

# Iniciar cloudflared redirigiendo a localhost:3000
cloudflared tunnel --url http://localhost:3000 > "$LOG_FILE" 2>&1 &
TUNNEL_PID=$!

echo "Túnel iniciado con PID $TUNNEL_PID. Esperando asignación de URL..."

# Esperar hasta 20 segundos a que aparezca la URL en el log
CLOUDFLARE_URL=""
for i in {1..20}; do
    sleep 1
    CLOUDFLARE_URL=$(grep -o 'https://[-a-zA-Z0-9@:%._\+~#=]\+\.trycloudflare\.com' "$LOG_FILE" | head -n 1)
    if [ -n "$CLOUDFLARE_URL" ]; then
        break
    fi
done

if [ -z "$CLOUDFLARE_URL" ]; then
    echo "ERROR: No se pudo obtener la URL de Cloudflare en 20 segundos."
    kill $TUNNEL_PID 2>/dev/null
    exit 1
fi

echo "=========================================================="
echo "  TÚNEL ACTIVO: $CLOUDFLARE_URL"
echo "=========================================================="

# Guardar URL localmente en el panel
echo "$CLOUDFLARE_URL" > "$BASE_DIR/Panel Admin/.tunnel-url"

# Enviar URL por Discord Webhook si existe configuración
if [ -f "$WEBHOOK_FILE" ]; then
    DISCORD_URL=$(cat "$WEBHOOK_FILE" | tr -d '[:space:]')
    if [ -n "$DISCORD_URL" ]; then
        echo "Enviando nueva URL al Webhook de Discord..."
        JSON_PAYLOAD=$(cat <<EOF
{
  "embeds": [{
    "title": "🌐 Panel Web Online (Cloudflare Tunnel)",
    "description": "**URL de Acceso:**\\n[$CLOUDFLARE_URL]($CLOUDFLARE_URL)",
    "color": 3066993,
    "fields": [
      { "name": "Puerto Local", "value": "3000", "inline": true },
      { "name": "PID", "value": "$TUNNEL_PID", "inline": true }
    ],
    "footer": { "text": "Enderlab Cloudflare Auto-Tunnel" }
  }]
}
EOF
)
        curl -s -H "Content-Type: application/json" -X POST -d "$JSON_PAYLOAD" "$DISCORD_URL" > /dev/null
        echo "Notificación enviada a Discord."
    fi
fi

# Mantener proceso vivo
wait $TUNNEL_PID
