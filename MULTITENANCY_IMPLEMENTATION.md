# 🏢 Implementación de Multi-Tenancy en SmartParkingTwo

## 📋 Resumen Ejecutivo

Este documento describe la implementación de **arquitectura multi-tenant** en el sistema SmartParkingTwo, permitiendo que múltiples organizaciones (empresas, ciudades, centros comerciales) utilicen la misma aplicación de forma completamente aislada.

## 🎯 ¿Qué es Multi-Tenancy?

**Multi-tenancy** es un patrón arquitectónico donde:
- Una sola instancia de la aplicación sirve a múltiples "inquilinos" (tenants)
- Cada tenant tiene acceso solo a sus propios datos
- Los datos están completamente aislados entre tenants
- La infraestructura es compartida, pero los datos no

### Ejemplo Práctico
```
tenant: "empresa-a" → Solo ve usuarios y parkings de Empresa A
tenant: "ciudad-madrid" → Solo ve usuarios y parkings de Ciudad de Madrid
tenant: "mall-parquesur" → Solo ve usuarios y parkings del Mall Parque Sur
```

## 🏗️ Arquitectura Implementada

### Estrategia Elegida: **Row-Level Tenancy**
- Todas las tablas incluyen un campo `tenant_id`
- Los datos se filtran por tenant en cada consulta
- Aislamiento a nivel de aplicación

### Identificación de Tenant
**Múltiples estrategias soportadas:**

1. **Por Subdominio** (Recomendada)
   ```
   empresa-a.smartparking.com → tenant: "empresa-a"
   madrid.smartparking.com → tenant: "madrid"
   ```

2. **Por Header HTTP**
   ```http
   GET /api/users
   X-Tenant-ID: empresa-a
   ```

3. **Por Path Parameter**
   ```
   GET /api/tenants/empresa-a/users
   ```

## 📁 Cambios en la Estructura del Proyecto

### 🎯 **1. Capa de Dominio (Core)**

#### Value Objects Nuevos
```
src/core/domain/value-objects/
├── TenantId.ts          # ✅ Nuevo - Identificador validado de tenant
```

**TenantId** - Características:
- Validación de formato (solo letras, números, guiones)
- Longitud entre 2-50 caracteres
- Conversión automática a minúsculas
- Inmutable

#### Entidades Modificadas/Nuevas
```
src/core/domain/entities/
├── Tenant.ts            # ✅ Nuevo - Entidad principal de tenant
├── User.ts              # 🔄 Modificado - Ahora incluye tenantId
```

**Entidad Tenant:**
- `id: TenantId` - Identificador único del tenant
- `name: string` - Nombre comercial (ej: "Empresa A S.L.")
- `domain: string` - Dominio único (ej: "empresa-a.smartparking.com")
- `isActive: boolean` - Estado del tenant
- `settings?: TenantSettings` - Configuraciones personalizadas
- `createdAt/updatedAt` - Timestamps

**Entidad User (Modificaciones):**
- ➕ `tenantId: TenantId` - Referencia al tenant propietario
- ➕ `belongsToTenant(tenantId: TenantId): boolean` - Método de validación

#### Repositories Actualizados
```
src/core/domain/repositories/
├── TenantRepository.ts   # ✅ Nuevo - CRUD de tenants
├── UserRepository.ts     # 🔄 Modificado - Métodos tenant-aware
```

**Cambios en UserRepository:**
- Todos los métodos ahora requieren `tenantId`
- `findAll(tenantId)` - Solo usuarios del tenant
- `findByEmail(email, tenantId)` - Email único por tenant
- `create/update/delete` - Operaciones aisladas por tenant

### 🎯 **2. Capa de Aplicación**

#### Interfaces Actualizadas
```
src/application/interfaces/
├── UserInterfaces.ts     # 🔄 Modificado - Incluye tenantId
├── TenantInterfaces.ts   # ✅ Nuevo - Interfaces de tenant
```

#### Use Cases Modificados
```
src/application/use-cases/
├── CreateUserUseCase.ts  # 🔄 Modificado - Tenant-aware
├── GetAllUsersUseCase.ts # 🔄 Modificado - Filtra por tenant
├── GetUserByIdUseCase.ts # 🔄 Modificado - Valida tenant
└── [otros use cases]     # 🔄 Todos modificados
```

**Cambios en Use Cases:**
- Reciben `tenantId` del contexto
- Validan que los recursos pertenezcan al tenant correcto
- Email único solo dentro del tenant (no globalmente)

### 🎯 **3. Capa de Infraestructura**

#### Context y Middleware
```
src/infrastructure/
├── context/
│   └── TenantContext.ts  # ✅ Nuevo - Context request-scoped
├── middleware/
│   └── TenantMiddleware.ts # ✅ Nuevo - Extrae tenant de requests
```

**TenantContext:**
- Scope: `REQUEST` - Una instancia por request
- Almacena el `TenantId` actual
- Disponible por inyección de dependencias

**TenantMiddleware:**
- Se ejecuta en cada request
- Extrae tenant de subdomain/header/path
- Configura el `TenantContext`
- Valida que el tenant existe y está activo

#### Base de Datos (Prisma)
```
src/infrastructure/database/prisma/
├── schema.prisma         # 🔄 Modificado - Tablas multi-tenant
```

## 🗄️ Cambios en Base de Datos

### Nueva Tabla: `tenants`
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) UNIQUE,     -- 'empresa-a', 'madrid'
    name VARCHAR(255),                -- 'Empresa A S.L.', 'Ciudad de Madrid'
    domain VARCHAR(255) UNIQUE,       -- 'empresa-a.smartparking.com'
    is_active BOOLEAN DEFAULT true,
    settings JSONB,                   -- Configuraciones personalizadas
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `users` Modificada
```sql
-- Antes
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,        -- ❌ Único globalmente
    name VARCHAR(255),
    -- ...
);

-- Después  
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id), -- ✅ Nuevo campo
    email VARCHAR(255),               -- ❌ Ya no es unique global
    name VARCHAR(255),
    -- ...
    UNIQUE(tenant_id, email)          -- ✅ Email único POR TENANT
);
```

### Índices Multi-tenant
```sql
-- Índices optimizados para consultas por tenant
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_parking_zones_tenant ON parking_zones(tenant_id);
```

## 🔄 Flujo de Datos Multi-tenant

### Request Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Context
    participant UseCase
    participant Repository
    participant Database

    Client->>Middleware: Request to empresa-a.smartparking.com
    Middleware->>Middleware: Extract "empresa-a" from subdomain
    Middleware->>Context: setTenantId("empresa-a")
    Middleware->>UseCase: Forward request
    UseCase->>Context: getTenantId()
    Context->>UseCase: "empresa-a"
    UseCase->>Repository: findAll(tenantId: "empresa-a")
    Repository->>Database: SELECT * FROM users WHERE tenant_id = 'uuid-empresa-a'
    Database->>Repository: Results for empresa-a only
    Repository->>UseCase: Filtered results
    UseCase->>Client: Response with empresa-a data only
```

### Ejemplo de Consulta
```typescript
// Antes (Sin multi-tenancy)
const users = await userRepository.findAll();
// SELECT * FROM users;

// Después (Con multi-tenancy)  
const tenantId = tenantContext.getTenantId();
const users = await userRepository.findAll(tenantId);
// SELECT * FROM users WHERE tenant_id = $1;
```

## 🛡️ Seguridad y Aislamiento

### Garantías de Aislamiento

1. **Nivel de Aplicación**
   - Todos los repositories filtran por `tenant_id`
   - Use cases validan pertenencia al tenant
   - Middleware impide acceso cruzado

2. **Nivel de Base de Datos**
   - Constraints de integridad referencial
   - Índices únicos por tenant
   - Triggers de auditoría (futuro)

3. **Nivel de Middleware**
   - Validación de tenant antes de cada request
   - Logs de acceso por tenant
   - Rate limiting por tenant

### Validaciones Implementadas
```typescript
// En Use Cases
if (!user.belongsToTenant(currentTenantId)) {
    throw new Error('Access denied: Resource belongs to different tenant');
}

// En Repositories
async findById(id: string, tenantId: TenantId): Promise<User | null> {
    return await this.prisma.user.findFirst({
        where: { 
            id,
            tenantId: tenantId.getValue() // ✅ Siempre filtrado
        }
    });
}
```

## 🎨 Configuración Personalizada por Tenant

### TenantSettings Interface
```typescript
export interface TenantSettings {
    maxUsers?: number;              // Límite de usuarios
    maxParkingSpaces?: number;      // Límite de espacios
    allowedFeatures: string[];      // Features habilitadas
    customBranding?: {
        logo?: string;
        colors?: {
            primary: string;
            secondary: string;
        };
    };
}
```

### Uso en la Aplicación
```typescript
const tenant = await tenantRepository.findById(tenantId);
const maxUsers = tenant.settings?.maxUsers || 1000;

if (currentUserCount >= maxUsers) {
    throw new Error('User limit exceeded for this tenant');
}
```

## 🚀 Beneficios Obtenidos

### ✅ **Escalabilidad**
- Un solo deployment sirve a múltiples organizaciones
- Recursos compartidos eficientemente
- Crecimiento horizontal simple

### ✅ **Aislamiento Total**
- Imposible ver datos de otros tenants
- Seguridad a nivel de aplicación y BD
- Compliance y privacidad garantizadas

### ✅ **Personalización**
- Cada tenant puede tener su branding
- Features habilitadas por tenant
- Límites configurables

### ✅ **Mantenimiento**
- Un solo código base para todos
- Updates simultáneos para todos los tenants
- Monitoreo centralizado

## 📊 Métricas y Monitoreo

### Métricas por Tenant
```typescript
// Ejemplos de métricas que se pueden trackear
- users_per_tenant
- parking_spaces_per_tenant  
- reservations_per_tenant
- api_calls_per_tenant
- storage_usage_per_tenant
```

### Logs Multi-tenant
```json
{
    "timestamp": "2025-08-27T10:30:00Z",
    "level": "INFO",
    "tenantId": "empresa-a",
    "userId": "uuid-user",
    "action": "create_reservation",
    "resource": "parking_space_123"
}
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```env
# Multi-tenancy
DEFAULT_TENANT_ID=development
TENANT_HEADER_NAME=X-Tenant-ID
ENABLE_TENANT_SUBDOMAIN=true

# Base de datos
DATABASE_URL="postgresql://user:pass@localhost:5432/smart_parking?schema=public"
```

### Scripts de Base de Datos
```json
{
    "scripts": {
        "db:seed:tenants": "pnpm ts-node scripts/seed-tenants.ts",
        "db:migrate:tenant": "pnpm ts-node scripts/migrate-tenant.ts",
        "db:backup:tenant": "pnpm ts-node scripts/backup-tenant.ts"
    }
}
```

## 🧪 Testing Multi-tenant

### Estructura de Tests
```typescript
describe('Multi-tenant User Operations', () => {
    let tenantA: TenantId;
    let tenantB: TenantId;
    
    beforeEach(() => {
        tenantA = new TenantId('tenant-a');
        tenantB = new TenantId('tenant-b');
    });

    it('should isolate users between tenants', async () => {
        // Crear usuario en tenant A
        const userA = await createUserUseCase.execute({
            tenantId: tenantA,
            email: 'test@example.com',
            name: 'User A'
        });

        // Buscar desde tenant B - no debe encontrarlo
        const foundUser = await userRepository.findByEmail('test@example.com', tenantB);
        expect(foundUser).toBeNull();
    });
});
```

## 🔮 Roadmap Futuro

### Fase 2: Mejoras Adicionales
- [ ] **Database per Tenant** - Para máximo aislamiento
- [ ] **Tenant-specific Features** - A/B testing por tenant
- [ ] **Advanced Analytics** - Dashboards por tenant
- [ ] **Backup/Restore** - Por tenant individual
- [ ] **API Rate Limiting** - Límites por tenant

### Fase 3: Operaciones
- [ ] **Tenant Onboarding** - Proceso automatizado
- [ ] **Billing Integration** - Facturación por uso
- [ ] **Self-service Portal** - Gestión de tenant
- [ ] **Performance Monitoring** - Métricas avanzadas

## ⚠️ Consideraciones y Limitaciones

### Actuales
- **Query Performance**: Cada consulta incluye filtro por tenant
- **Data Migration**: Migraciones deben considerar todos los tenants
- **Testing Complexity**: Tests más complejos con múltiples tenants

### Mitigaciones
- Índices optimizados para consultas multi-tenant
- Scripts de migración tenant-aware
- Helpers de testing para multi-tenancy

---

## 📚 Referencias Técnicas

- **Documentación interna**: `/docs/architecture/`
- **Schemas de BD**: `/src/infrastructure/database/prisma/schema.prisma`
- **Value Objects**: `/src/core/domain/value-objects/`
- **Use Cases**: `/src/application/use-cases/`

---

*Documento actualizado: 27 de agosto de 2025*  
*Versión: 1.0*  
*Autor: Sistema SmartParkingTwo*
