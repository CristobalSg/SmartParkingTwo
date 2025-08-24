# Smart Parking - Base de Datos

Este módulo contiene toda la configuración y gestión de la base de datos para el sistema Smart Parking.

## 🚀 Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   pnpm run setup
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de PostgreSQL
   ```

3. **Crear y poblar la base de datos:**
   ```bash
   pnpm run db:push
   pnpm run db:seed
   ```

## 📋 Comandos Disponibles

- `pnpm run setup` - Configuración inicial completa
- `pnpm run db:generate` - Genera el cliente de Prisma
- `pnpm run db:push` - Sincroniza el esquema con la base de datos
- `pnpm run db:seed` - Puebla la base de datos con datos de prueba
- `pnpm run db:reset` - Resetea y repuebla la base de datos
- `pnpm run db:studio` - Abre Prisma Studio (GUI para la base de datos)
- `pnpm run dev` - Comando completo para desarrollo

## 🔐 Credenciales de Prueba

**Administradores:**
- Email: `admin@universidad.edu` | Password: `admin123`
- Email: `supervisor@universidad.edu` | Password: `super123`

## 📊 Estructura de la Base de Datos

- **administrators** - Usuarios con acceso al dashboard
- **users** - Usuarios finales (sin login tradicional)
- **parking_zones** - Zonas de estacionamiento (pisos, sectores)
- **parking_spaces** - Espacios individuales
- **reservations** - Reservas de estacionamiento

## 🛠️ Troubleshooting

Si encuentras errores, ejecuta:
```bash
pnpm run db:reset
```

Esto reseteará completamente la base de datos con datos frescos.

## 📦 Usando pnpm

Este proyecto está configurado para usar **pnpm** como gestor de paquetes. Asegúrate de tener pnpm instalado:

```bash
npm install -g pnpm
```

### Ventajas de pnpm:
- ⚡ Instalaciones más rápidas
- 💾 Menos espacio en disco (symlinks)
- 🔒 Mejor gestión de dependencias
- 🚀 Mejor rendimiento general
