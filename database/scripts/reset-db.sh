#!/bin/bash

echo "🔄 Reseteando base de datos Smart Parking..."

echo "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos existentes."
read -p "¿Estás seguro? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "💥 Reseteando base de datos..."
    pnpx prisma migrate reset --force
    
    echo "🌱 Ejecutando semilla..."
    pnpm run db:seed
    
    echo "✅ Base de datos reseteada y poblada exitosamente!"
else
    echo "❌ Operación cancelada."
fi
