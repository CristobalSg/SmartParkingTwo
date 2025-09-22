import { PrismaClient, ParkingSpecialType, ReservationStatus } from '@prisma/client'
import { hashPassword } from '../../../shared/utils/crypto-utils'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando semilla de datos para Smart Parking con Multitenancy...')

    // Limpiar datos existentes
    await prisma.reservation.deleteMany()
    await prisma.parkingSpace.deleteMany()
    await prisma.parkingZone.deleteMany()
    await prisma.user.deleteMany()
    await prisma.administrator.deleteMany()
    await prisma.tenant.deleteMany()

    console.log('🧹 Base de datos limpiada')

    // Crear tenants primero
    const tenants = await Promise.all([
        prisma.tenant.create({
            data: {
                tenantId: 'universidad-nacional',
                name: 'Universidad Nacional',
                domain: 'universidad.edu',
                isActive: true,
                settings: JSON.stringify({
                    maxUsers: 1000,
                    maxParkingSpaces: 500,
                    features: ['reservations', 'reports', 'notifications']
                })
            }
        }),
        prisma.tenant.create({
            data: {
                tenantId: 'empresa-tech',
                name: 'Empresa Tech Solutions',
                domain: 'techsolutions.com',
                isActive: true,
                settings: JSON.stringify({
                    maxUsers: 200,
                    maxParkingSpaces: 100,
                    features: ['reservations', 'electric-charging']
                })
            }
        }),
        prisma.tenant.create({
            data: {
                tenantId: 'hospital-central',
                name: 'Hospital Central',
                domain: 'hospital-central.gov',
                isActive: true,
                settings: JSON.stringify({
                    maxUsers: 500,
                    maxParkingSpaces: 300,
                    features: ['reservations', 'emergency-access', '24-7-support']
                })
            }
        })
    ])

    console.log(`🏢 ${tenants.length} tenants creados: ${tenants.map(t => t.name).join(', ')}`)

    // Crear administradores para cada tenant
    const adminPassword = hashPassword('admin123')
    const admins = await Promise.all([
        prisma.administrator.create({
            data: {
                email: 'admin@universidad.edu',
                passwordHash: adminPassword,
                name: 'Juan Pérez - Administrador Principal',
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        prisma.administrator.create({
            data: {
                email: 'benjamintwo2002@gmail.com',
                passwordHash: adminPassword,
                name: 'Benjamin - Super Admin',
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        prisma.administrator.create({
            data: {
                email: 'supervisor@universidad.edu',
                passwordHash: hashPassword('super123'),
                name: 'María García - Supervisora',
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        prisma.administrator.create({
            data: {
                email: 'admin@techsolutions.com',
                passwordHash: adminPassword,
                name: 'Carlos Tech - Admin IT',
                tenant: { connect: { id: tenants[1].id } }
            },
        }),
        prisma.administrator.create({
            data: {
                email: 'admin@hospital-central.gov',
                passwordHash: adminPassword,
                name: 'Dra. Ana Médica - Admin Hospital',
                tenant: { connect: { id: tenants[2].id } }
            },
        })
    ])

    console.log(`👤 ${admins.length} administradores creados`)

    // Crear usuarios para diferentes tenants
    const users = await Promise.all([
        // Usuarios Universidad Nacional
        prisma.user.create({
            data: {
                email: 'carlos.rodriguez@estudiante.edu',
                name: 'Carlos Rodríguez',
                emailVerified: true,
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        prisma.user.create({
            data: {
                email: 'ana.martinez@profesor.edu',
                name: 'Ana Martínez',
                emailVerified: true,
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        prisma.user.create({
            data: {
                email: 'pedro.lopez@estudiante.edu',
                name: 'Pedro López',
                emailVerified: false,
                verificationToken: 'token_123',
                tenant: { connect: { id: tenants[0].id } }
            },
        }),
        // Usuarios Empresa Tech
        prisma.user.create({
            data: {
                email: 'developer@techsolutions.com',
                name: 'Luis Developer',
                emailVerified: true,
                tenant: { connect: { id: tenants[1].id } }
            },
        }),
        prisma.user.create({
            data: {
                email: 'manager@techsolutions.com',
                name: 'Sofia Manager',
                emailVerified: true,
                tenant: { connect: { id: tenants[1].id } }
            },
        }),
        // Usuarios Hospital
        prisma.user.create({
            data: {
                email: 'doctor@hospital-central.gov',
                name: 'Dr. Miguel Cirujano',
                emailVerified: true,
                tenant: { connect: { id: tenants[2].id } }
            },
        }),
    ])

    console.log(`👥 ${users.length} usuarios creados`)

    // Crear zonas de estacionamiento para cada tenant
    const zones = await Promise.all([
        // Zonas Universidad Nacional
        prisma.parkingZone.create({
            data: {
                name: 'Piso 1 - Subterráneo',
                description: 'Zona principal subterránea',
                capacity: 50,
                tenant: { connect: { id: tenants[0].id } }
            }
        }),
        prisma.parkingZone.create({
            data: {
                name: 'Piso 2 - Subterráneo',
                description: 'Segundo nivel subterráneo',
                capacity: 45,
                tenant: { connect: { id: tenants[0].id } }
            }
        }),
        prisma.parkingZone.create({
            data: {
                name: 'Zona A - Exterior',
                description: 'Estacionamiento exterior',
                capacity: 30,
                tenant: { connect: { id: tenants[0].id } }
            }
        }),
        // Zonas Empresa Tech
        prisma.parkingZone.create({
            data: {
                name: 'Edificio Principal',
                description: 'Estacionamiento empleados',
                capacity: 60,
                tenant: { connect: { id: tenants[1].id } }
            }
        }),
        prisma.parkingZone.create({
            data: {
                name: 'Zona Visitantes',
                description: 'Para clientes y visitantes',
                capacity: 25,
                tenant: { connect: { id: tenants[1].id } }
            }
        }),
        // Zonas Hospital
        prisma.parkingZone.create({
            data: {
                name: 'Emergencias',
                description: 'Zona de emergencias 24/7',
                capacity: 40,
                tenant: { connect: { id: tenants[2].id } }
            }
        }),
        prisma.parkingZone.create({
            data: {
                name: 'Personal Médico',
                description: 'Exclusivo para doctores y enfermeros',
                capacity: 80,
                tenant: { connect: { id: tenants[2].id } }
            }
        }),
    ])

    console.log(`🏢 ${zones.length} zonas creadas`)

    // Crear espacios de estacionamiento para las primeras 3 zonas (Universidad)
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

    // Agregar espacios para Empresa Tech (Edificio Principal - algunos espacios)
    for (let i = 1; i <= 20; i++) {
        parkingSpaces.push({
            zoneId: zones[3].id,
            spaceNumber: `EP-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.regular,
        })
    }
    for (let i = 21; i <= 25; i++) {
        parkingSpaces.push({
            zoneId: zones[3].id,
            spaceNumber: `EP-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.electric,
        })
    }

    // Agregar algunos espacios para Hospital
    for (let i = 1; i <= 15; i++) {
        parkingSpaces.push({
            zoneId: zones[5].id,
            spaceNumber: `EM-${i.toString().padStart(2, '0')}`,
            specialType: ParkingSpecialType.regular,
        })
    }

    await prisma.parkingSpace.createMany({ data: parkingSpaces })
    console.log(`🅿️  ${parkingSpaces.length} espacios creados`)

    // Crear algunas reservas de ejemplo (solo para Universidad)
    const universitySpaces = await prisma.parkingSpace.findMany({
        where: { zone: { tenantId: tenants[0].id } },
        take: 5
    })
    const universityUsers = users.filter(u => [0, 1, 2].includes(users.indexOf(u)))
    const now = new Date()

    const reservations = [
        {
            userId: universityUsers[0].id,
            parkingSpaceId: universitySpaces[0].id,
            status: ReservationStatus.confirmed,
            reservedFrom: new Date(now.getTime() + 2 * 60 * 60 * 1000),
            reservedUntil: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        },
        {
            userId: universityUsers[1].id,
            parkingSpaceId: universitySpaces[1].id,
            status: ReservationStatus.active,
            reservedFrom: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            reservedUntil: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        },
    ]

    await prisma.reservation.createMany({ data: reservations })
    console.log(`📅 ${reservations.length} reservas de ejemplo creadas`)

    // Resumen final por tenant
    for (const tenant of tenants) {
        const counts = {
            tenant: tenant.name,
            administradores: await prisma.administrator.count({ where: { tenantId: tenant.id } }),
            usuarios: await prisma.user.count({ where: { tenantId: tenant.id } }),
            zonas: await prisma.parkingZone.count({ where: { tenantId: tenant.id } }),
            espacios: await prisma.parkingSpace.count({ where: { zone: { tenantId: tenant.id } } }),
            reservas: await prisma.reservation.count({
                where: { parkingSpace: { zone: { tenantId: tenant.id } } }
            }),
        }

        console.log(`\n📊 ${tenant.name} (${tenant.tenantId}):`, counts)
    }

    console.log('\n✅ Semilla con Multitenancy completada exitosamente!')
}

main()
    .catch((e) => {
        console.error('❌ Error al ejecutar la semilla:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
