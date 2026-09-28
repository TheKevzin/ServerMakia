#!/bin/bash

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBHOOK_FILE="$BASE_DIR/panel/.webhook-url"

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

if [ -n "$CLOUDFLARE_URL" ]; then
    echo "=================================================="
    echo "¡Túnel Cloudflare activo con éxito!"
    echo "URL del Panel Web: $CLOUDFLARE_URL"
    echo "=================================================="

    # Enviar notificación a Discord si el webhook existe
    if [ -f "$WEBHOOK_FILE" ]; then
        WEBHOOK_URL=$(cat "$WEBHOOK_FILE" | tr -d '\r\n')
        if [ -n "$WEBHOOK_URL" ]; then
            JSON_PAYLOAD=$(cat <<EOF
{
  "embeds": [{
    "title": "🏰 Panel Enderlab En Línea",
    "description": "El panel de administración del servidor de Minecraft ya está accesible públicamente.",
    "color": 9568959,
    "fields": [
      {
        "name": "🌐 URL del Panel",
        "value": "[$CLOUDFLARE_URL]($CLOUDFLARE_URL)"
      },
      {
        "name": "⚡ Estado",
        "value": "Online (Cloudflare Tunnel)"
      }
    ],
    "footer": {
      "text": "Enderlab System Status"
    }
  }]
}
EOF
)
            curl -H "Content-Type: application/json" -X POST -d "$JSON_PAYLOAD" "$WEBHOOK_URL" > /dev/null 2>&1
            echo "Notificación enviada a Discord."
        fi
    fi
else
    echo "No se pudo obtener la URL de trycloudflare. Revisa los logs en $LOG_FILE"
fi

# Mantener el proceso del túnel corriendo
wait $TUNNEL_PID
