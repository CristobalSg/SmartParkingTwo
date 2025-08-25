import { PrismaClient, ParkingSpecialType, ReservationStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando semilla de datos para Smart Parking...')

    // Limpiar datos existentes
    await prisma.reservation.deleteMany()
    await prisma.parkingSpace.deleteMany()
    await prisma.parkingZone.deleteMany()
    await prisma.user.deleteMany()
    await prisma.administrator.deleteMany()

    console.log('🧹 Base de datos limpiada')

    // Crear administradores
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin1 = await prisma.administrator.create({
        data: {
            email: 'admin@universidad.edu',
            passwordHash: adminPassword,
            name: 'Juan Pérez - Administrador Principal',
        },
    })

    const admin2 = await prisma.administrator.create({
        data: {
            email: 'supervisor@universidad.edu',
            passwordHash: await bcrypt.hash('super123', 10),
            name: 'María García - Supervisora',
        },
    })

    console.log(`👤 Administradores creados: ${admin1.email}, ${admin2.email}`)

    // Crear usuarios de ejemplo
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'carlos.rodriguez@estudiante.edu',
                name: 'Carlos Rodríguez',
                emailVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: 'ana.martinez@profesor.edu',
                name: 'Ana Martínez',
                emailVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: 'pedro.lopez@estudiante.edu',
                name: 'Pedro López',
                emailVerified: false,
                verificationToken: 'token_123',
            },
        }),
    ])

    console.log(`👥 ${users.length} usuarios creados`)

    // Crear zonas de estacionamiento
    const zones = await Promise.all([
        prisma.parkingZone.create({
            data: { name: 'Piso 1 - Subterráneo', description: 'Zona principal subterránea', capacity: 50 }
        }),
        prisma.parkingZone.create({
            data: { name: 'Piso 2 - Subterráneo', description: 'Segundo nivel subterráneo', capacity: 45 }
        }),
        prisma.parkingZone.create({
            data: { name: 'Zona A - Exterior', description: 'Estacionamiento exterior', capacity: 30 }
        }),
    ])

    console.log(`🏢 ${zones.length} zonas creadas`)

    // Crear espacios de estacionamiento
    const parkingSpaces = []

    // Piso 1: 45 regulares + 3 discapacitados + 2 embarazadas
    for (let i = 1; i <= 45; i++) {
        parkingSpaces.push({
            zoneId: zones[0].id,
            spaceNumber: `S1-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.regular,
        })
    }
    for (let i = 46; i <= 48; i++) {
        parkingSpaces.push({
            zoneId: zones[0].id,
            spaceNumber: `S1-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.disabled,
        })
    }
    for (let i = 49; i <= 50; i++) {
        parkingSpaces.push({
            zoneId: zones[0].id,
            spaceNumber: `S1-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.pregnant,
        })
    }

    // Piso 2: 42 regulares + 3 eléctricos
    for (let i = 1; i <= 42; i++) {
        parkingSpaces.push({
            zoneId: zones[1].id,
            spaceNumber: `S2-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.regular,
        })
    }
    for (let i = 43; i <= 45; i++) {
        parkingSpaces.push({
            zoneId: zones[1].id,
            spaceNumber: `S2-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.electric,
        })
    }

    // Zona A: 25 regulares + 5 visitantes
    for (let i = 1; i <= 25; i++) {
        parkingSpaces.push({
            zoneId: zones[2].id,
            spaceNumber: `A-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.regular,
        })
    }
    for (let i = 26; i <= 30; i++) {
        parkingSpaces.push({
            zoneId: zones[2].id,
            spaceNumber: `A-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.visitor,
        })
    }

    await prisma.parkingSpace.createMany({ data: parkingSpaces })
    console.log(`🅿️  ${parkingSpaces.length} espacios creados`)

    // Crear algunas reservas de ejemplo
    const spaces = await prisma.parkingSpace.findMany({ take: 5 })
    const now = new Date()

    const reservations = [
        {
            userId: users[0].id,
            parkingSpaceId: spaces[0].id,
            status: ReservationStatus.confirmed,
            reservedFrom: new Date(now.getTime() + 2 * 60 * 60 * 1000),
            reservedUntil: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        },
        {
            userId: users[1].id,
            parkingSpaceId: spaces[1].id,
            status: ReservationStatus.active,
            reservedFrom: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            reservedUntil: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        },
    ]

    await prisma.reservation.createMany({ data: reservations })
    console.log(`📅 ${reservations.length} reservas de ejemplo creadas`)

    // Resumen final
    const counts = {
        administradores: await prisma.administrator.count(),
        usuarios: await prisma.user.count(),
        zonas: await prisma.parkingZone.count(),
        espacios: await prisma.parkingSpace.count(),
        reservas: await prisma.reservation.count(),
    }

    console.log('\n✅ Semilla completada exitosamente!')
    console.log('📊 Resumen:', counts)
}

main()
    .catch((e) => {
        console.error('❌ Error al ejecutar la semilla:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
