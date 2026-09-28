#!/bin/bash
echo "Iniciando túnel permanente Ngrok para Enderlab Panel..."
echo "URL Permanente: https://dismiss-moody-frown.ngrok-free.dev"
exec ngrok http 3000 --url=https://dismiss-moody-frown.ngrok-free.dev --log=stdout
