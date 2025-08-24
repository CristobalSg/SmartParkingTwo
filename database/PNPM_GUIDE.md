# Configuración pnpm para Smart Parking Database

Este proyecto usa **pnpm** como gestor de paquetes para mejor rendimiento y gestión de dependencias.

## Instalación inicial

```bash
# Instalar pnpm globalmente si no lo tienes
npm install -g pnpm

# Configurar el proyecto
pnpm run setup
```

## Comandos pnpm específicos

```bash
# Instalar dependencias
pnpm install

# Instalar dependencia nueva
pnpm add <package>
pnpm add -D <package>  # como devDependency

# Ejecutar comandos de prisma
pnpm prisma generate
pnpm prisma studio
pnpm prisma migrate dev

# Ejecutar scripts del proyecto
pnpm run db:push
pnpm run db:seed
pnpm run dev
```

## Configuración del workspace

El archivo `pnpm-workspace.yaml` define este directorio como un workspace de pnpm, permitiendo mejor gestión de dependencias en proyectos monorepo.

## Configuración adicional (.npmrc)

- `shamefully-hoist=true`: Permite hoisting de dependencias para compatibilidad
- `auto-install-peers=true`: Instala automáticamente peer dependencies
- `strict-peer-dependencies=false`: No falla con peer dependencies incompatibles
