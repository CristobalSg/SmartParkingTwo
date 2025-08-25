# Guía de PNPM para Smart Parking Database

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm prisma generate
```

## 🗃️ Comandos de Base de Datos

```bash
# Configurar base de datos
pnpm run setup

# Push schema a la base de datos
pnpm run db:push

# Ejecutar migraciones
pnpm run db:migrate

# Poblar base de datos con datos de prueba
pnpm run db:seed

# Abrir Prisma Studio
pnpm run db:studio

# Reset completo de la base de datos
pnpm run db:reset

# Validar schema
pnpm run db:validate
```

## 🚀 Desarrollo

```bash
# Configurar todo para desarrollo
pnpm run dev
```