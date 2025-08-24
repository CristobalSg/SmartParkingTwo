# Guía de Desarrollo Backend - Smart Parking System

## 📋 Índice
1. [Arquitectura y Estructura del Proyecto](#arquitectura)
2. [Base de Datos y Entidades](#base-de-datos)
3. [División del Trabajo](#división-trabajo)
4. [Configuración Inicial](#configuración)
5. [Implementación por Fases](#fases)
6. [Mejoras Sugeridas](#mejoras)
7. [Estadísticas Recomendadas](#estadísticas)

---

## 🏗️ Arquitectura y Estructura del Proyecto {#arquitectura}

### Estructura de Carpetas (Onion Architecture)
```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── core/                           # Capa más interna
│   ├── domain/
│   │   ├── entities/              # Entidades del negocio
│   │   ├── repositories/          # Interfaces de repositorios
│   │   └── value-objects/         # Objetos de valor
│   └── application/
│       ├── use-cases/             # Casos de uso del negocio
│       ├── services/              # Servicios de aplicación
│       └── dtos/                  # DTOs para casos de uso
├── infrastructure/                 # Capa externa
│   ├── database/
│   │   ├── entities/              # Entidades de TypeORM
│   │   ├── repositories/          # Implementaciones de repositorios
│   │   └── migrations/
│   ├── external-services/         # APIs externas, email, etc.
│   └── config/                    # Configuraciones
└── presentation/                   # Capa de presentación
    ├── controllers/               # Controladores REST
    ├── dtos/                     # DTOs de entrada/salida
    ├── middlewares/
    └── websockets/               # Para notificaciones en tiempo real
```

### Principios SOLID Aplicados
- **Single Responsibility**: Cada clase/módulo tiene una responsabilidad específica
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Las implementaciones son intercambiables
- **Interface Segregation**: Interfaces específicas y pequeñas
- **Dependency Inversion**: Dependencias hacia abstracciones, no implementaciones

---

## 🗄️ Base de Datos y Entidades {#base-de-datos}

### Esquema de Base de Datos Propuesto

```sql
-- Administradores
CREATE TABLE administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Zonas de estacionamiento
CREATE TABLE parking_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- Ej: "Piso 1", "Zona A"
    description TEXT,
    capacity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tipos especiales de estacionamiento
CREATE TYPE parking_special_type AS ENUM ('regular', 'disabled', 'pregnant', 'electric', 'visitor');

-- Estacionamientos
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES parking_zones(id) ON DELETE CASCADE,
    space_number VARCHAR(10) NOT NULL, -- Ej: "A-01", "B-15"
    special_type parking_special_type DEFAULT 'regular',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(zone_id, space_number)
);

-- Estados de reserva
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired');

-- Reservas
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parking_space_id UUID REFERENCES parking_spaces(id) ON DELETE CASCADE,
    status reservation_status DEFAULT 'pending',
    reserved_from TIMESTAMP NOT NULL,
    reserved_until TIMESTAMP NOT NULL,
    special_needs parking_special_type DEFAULT 'regular', -- Para validar uso correcto
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints para evitar solapamiento
    CONSTRAINT check_reservation_dates CHECK (reserved_until > reserved_from)
);

-- Índices para performance
CREATE INDEX idx_reservations_dates ON reservations(reserved_from, reserved_until);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_users_email ON users(email);
```

### **Datos Adicionales Sugeridos para Usuarios:**
1. **Teléfono**: Para notificaciones SMS opcionales
2. **Patente del vehículo**: Para integración futura con cámaras
3. **Necesidades especiales**: Si requiere estacionamiento para discapacitados/embarazadas

---

## 👥 División del Trabajo {#división-trabajo}

### **Carlos: Core & Users**
**Responsabilidades:**
- Configuración inicial del proyecto y arquitectura base
- Módulo de Usuarios (User Management)
- Sistema de verificación por email
- Casos de uso de reservas


**Tareas específicas:**
```typescript
// Módulos asignados
src/core/domain/entities/user.entity.ts
src/core/domain/entities/reservation.entity.ts
src/core/application/use-cases/user/
src/core/application/use-cases/reservation/
src/infrastructure/database/
src/infrastructure/external-services/email/
src/presentation/controllers/user.controller.ts
src/presentation/controllers/reservation.controller.ts
```

### **Benjamín: Admin & Parking Management**
**Responsabilidades:**
- Módulo de Administradores
- Gestión de estacionamientos y zonas
- Sistema de notificaciones
- Dashboard de estadísticas
- WebSockets para tiempo real

**Tareas específicas:**
```typescript
// Módulos asignados
src/core/domain/entities/administrator.entity.ts
src/core/domain/entities/parking-space.entity.ts
src/core/domain/entities/parking-zone.entity.ts
src/core/application/use-cases/admin/
src/core/application/use-cases/parking/
src/infrastructure/external-services/notifications/
src/presentation/controllers/admin.controller.ts
src/presentation/controllers/parking.controller.ts
src/presentation/websockets/
```

---

## ⚙️ Configuración Inicial {#configuración}

### Dependencias Principales
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0"
  }
}
```

### Variables de Entorno
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=smart_parking
DATABASE_PASSWORD=your_password
DATABASE_NAME=smart_parking_db

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
PORT=3000
FRONTEND_URL=http://localhost:3001
```

---

## 🚀 Implementación por Fases {#fases}

### **Fase 1: Configuración Base (Semana 1)**
**Desarrollador 1:**
- Configurar proyecto NestJS con arquitectura onion
- Configurar TypeORM con PostgreSQL
- Crear entidades base (User, Reservation)
- Configurar sistema de email

**Desarrollador 2:**
- Configurar autenticación JWT para admins
- Crear entidades (Administrator, ParkingSpace, ParkingZone)
- Configurar WebSockets base
- Crear middleware de validación

### **Fase 2: Funcionalidad Core (Semana 2-3)**
**Desarrollador 1:**
- Implementar registro de usuarios sin login
- Sistema de verificación por email
- CRUD de reservas
- Validaciones de negocio (fechas, disponibilidad)

**Desarrollador 2:**
- Dashboard de administración
- CRUD de estacionamientos y zonas
- Sistema de notificaciones en tiempo real
- Gestión de usuarios por admin

### **Fase 3: Lógica Avanzada (Semana 4)**
**Desarrollador 1:**
- Validación de estacionamientos especiales
- Manejo de reservas expiradas
- Optimizaciones de queries
- Testing unitario

**Desarrollador 2:**
- Estadísticas avanzadas
- Filtros y búsquedas complejas
- Notificaciones por email a admins
- Testing de integración

### **Fase 4: Refinamiento (Semana 5)**
**Ambos desarrolladores:**
- Optimización de rendimiento
- Manejo de errores robusto
- Documentación API (Swagger)
- Testing E2E

---

## 📊 Estadísticas Recomendadas {#estadísticas}

### **Dashboard Principal**
1. **Ocupación en Tiempo Real**
   - Porcentaje de ocupación total
   - Ocupación por zona/piso
   - Espacios disponibles vs reservados

2. **Estadísticas de Reservas**
   - Reservas por día/semana/mes
   - Tiempo promedio de uso
   - Tasa de cancelación
   - Reservas no utilizadas (no-shows)

3. **Análisis de Usuarios**
   - Usuarios más activos
   - Nuevos registros por período
   - Distribución por necesidades especiales

4. **Eficiencia del Sistema**
   - Espacios más/menos utilizados
   - Horarios pico de demanda
   - Tiempo promedio de permanencia

### **Reportes Especializados**
1. **Uso de Espacios Especiales**
   - Utilización de espacios para discapacitados
   - Uso de espacios para embarazadas
   - Cumplimiento de regulaciones

2. **Tendencias Temporales**
   - Patrones de uso por hora del día
   - Comparativas mensuales
   - Proyecciones de demanda

---

## 💡 Mejoras Sugeridas {#mejoras}

### **Datos Adicionales Recomendados:**
1. **Para Usuarios:**
   - Número de teléfono (notificaciones SMS)
   - Patente del vehículo (integración con cámaras futuras)
   - Tipo de necesidad especial (discapacidad, embarazo)

2. **Para el Sistema:**
   - Historial de cambios en reservas
   - Log de acciones administrativas
   - Sistema de calificaciones/feedback

### **Funcionalidades Futuras:**
1. **Notificaciones Push** para móvil
2. **Integración con calendario** (Google Calendar, Outlook)
3. **Sistema de penalizaciones** por no-shows
4. **API para integración con cámaras** de reconocimiento de patentes
5. **Modo offline robusto** para el frontend
6. **Sistema de pagos** para reservas premium

### **Consideraciones de Seguridad:**
1. Rate limiting en endpoints públicos
2. Validación de emails contra spam
3. Logs de auditoría para acciones administrativas
4. Encriptación de datos sensibles
5. Implementación de CORS apropiado

---

## 🔧 Comandos Útiles

```bash
# Instalación inicial
npm install

# Generar migración
npm run typeorm:generate-migration -- AddNewTable

# Ejecutar migraciones
npm run typeorm:migrate

# Desarrollo
npm run start:dev

# Testing
npm run test
npm run test:e2e

# Build
npm run build
```

Esta guía te permitirá desarrollar un sistema robusto, escalable y mantenible siguiendo las mejores prácticas de NestJS y arquitectura limpia.