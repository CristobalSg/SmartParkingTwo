# Smart Parking - Base de Datos

Este módulo contiene toda la configuración y gestión de la base de datos para el sistema Smart Parking.

## 🚀 Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   npm run setup
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de PostgreSQL
   ```

3. **Crear y poblar la base de datos:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## 📋 Comandos Disponibles

- `npm run setup` - Configuración inicial completa
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:push` - Sincroniza el esquema con la base de datos
- `npm run db:seed` - Puebla la base de datos con datos de prueba
- `npm run db:reset` - Resetea y repuebla la base de datos
- `npm run db:studio` - Abre Prisma Studio (GUI para la base de datos)
- `npm run dev` - Comando completo para desarrollo

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
npm run db:reset
```

Esto reseteará completamente la base de datos con datos frescos.
