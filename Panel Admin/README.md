# 🌐 Panel Admin - Servidor Minecraft

Panel web de administración desarrollado en **Next.js 16 + React 19 + Tailwind CSS**, diseñado para controlar y monitorizar el servidor de Minecraft Fabric de forma remota y visual.

## 🚀 Características
- **Control en Tiempo Real**: Iniciar, detener y reiniciar el servidor mediante comandos RCON.
- **Consola y Logs**: Visualización y ejecución de comandos directamente en la consola de Minecraft.
- **Gestor de Archivos**: Editor integrado (Monaco Editor) para modificar `server.properties` y configuraciones.
- **Métricas del Sistema**: Monitoreo de uso de CPU, memoria RAM, almacenamiento y estado del servidor.
- **Autenticación**: Sistema de usuarios con roles y credenciales seguras (Bcrypt + Jose JWT).
- **Copia de Seguridad**: Integración con Google Drive para backups automáticos del mundo.

## 🛠️ Tecnologías
- **Framework**: Next.js 16 (App Router)
- **UI & Estilos**: React 19, Tailwind CSS v4, Lucide Icons, Shadcn UI
- **Conectividad con Minecraft**: `rcon-client`
- **Base de Datos / ORM**: Prisma ORM
- **Métricas del Servidor**: `systeminformation`

## 📦 Cómo Ejecutar Localmente o en el Servidor
```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente de base de datos Prisma
npx prisma generate
npx prisma db push

# 3. Modo desarrollo
npm run dev

# 4. Modo producción (compilado)
npm run build
npm run start
```
