# 🎨 Auditoría Visual y Mejoras — Panel Admin ServerMakia

> Revisión de las vistas del panel web Next.js en el nuevo ecosistema Fabric 1.21.11.

---

## Resumen de Vistas

| Vista | Estado | Observación |
| :--- | :--- | :--- |
| **Dashboard** | ✅ Excelente | Métricas de CPU, RAM y disco en tiempo real, botones de energía funcionales. |
| **Consola RCON** | ✅ Funcional | Socket conectado al puerto 25575. Permite enviar comandos a Minecraft. |
| **Jugadores** | ✅ Funcional | Muestra avatares mediante API de Mojang y acciones de ban/kick/op. |
| **Gestor de Archivos** | ✅ Excelente | Monaco Editor integrado para modificar `server.properties` y configs. |
| **Backups** | ✅ Operativo | Generación de archivos comprimidos con soporte para Google Drive. |
| **Ajustes (Settings)** | ✅ Excelente | Configuración de slots, MOTD y parámetros del servidor. |
| **Usuarios del Panel** | ✅ Seguro | Roles `ADMIN`, `MODERATOR` y `VIEWER` con autenticación JWT. |
| **Mapa 3D (Live Map)** | ⚠️ Pendiente | Estaba configurado para el mod *BlueMap* del servidor anterior. En el servidor vanilla actual no está activo salvo que se decida instalar BlueMap para 1.21.11. |

---

## Hoja de Ruta de Pulido UI

1. **Unificación de Idioma:** Mantener una única convención en la interfaz (español o inglés consistente en etiquetas y modales).
2. **Selector de Tema:** Asegurar que todos los dropdowns (`<select>`) utilicen el componente estilizado de Shadcn UI con efecto glassmorphism.
3. **Pestaña de Mapa 3D:** Si no se requiere mapa web 3D en el juego, se puede ocultar la opción del sidebar para mantener el menú limpio.
