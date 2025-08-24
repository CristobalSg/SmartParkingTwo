#!/bin/bash

echo "🚀 Configurando Smart Parking Database..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Instalándolo..."
    npm install -g pnpm
fi

# Verificar si PostgreSQL está corriendo
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL no está corriendo. Asegúrate de que esté iniciado."
fi

# Instalar dependencias
echo "📦 Instalando dependencias con pnpm..."
pnpm install

# Verificar archivo .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de base de datos"
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
pnpx prisma generate

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus credenciales de PostgreSQL"
echo "2. Ejecuta: pnpm run db:push"
echo "3. Ejecuta: pnpm run db:seed"
echo "4. Opcional: pnpm run db:studio (para ver la base de datos)"
