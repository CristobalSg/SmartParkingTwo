# Database - Sistema de Gestión de Estacionamiento Universitario

Base de datos PostgreSQL del sistema de parking universitario basada en el diagrama entidad-relación específico del proyecto.

## 🗄️ Tecnologías

- **PostgreSQL 15** - Base de datos relacional
- **Docker** - Contenedorización
- **Índices optimizados** - Para consultas de alta frecuencia
- **Constraints y validaciones** - Integridad de datos garantizada

## 📊 Esquema de Base de Datos

### Entidades del Sistema (según Diagrama ER)

#### � **Reservas** - Tabla Principal de Reservas
```sql
id_reserva     INT (PK)        -- ID único de la reserva
id_slot        INT (FK)        -- Referencia al slot reservado
fecha          DATE            -- Fecha de la reserva
hora_inicio    TIME            -- Hora de inicio de la reserva
hora_fin       TIME            -- Hora de finalización de la reserva
estado         VARCHAR         -- Estado: 'pendiente', 'confirmada', 'activa', 'completada', 'cancelada'
validacion_correo BOOLEAN      -- Confirma si el usuario validó por correo
```

#### 🅿️ **Slots** - Espacios de Estacionamiento
```sql
id_slot        INT (PK)        -- ID único del slot de estacionamiento
numero_slot    INT             -- Número visible del espacio (ej: 1, 2, 3...)
estado         VARCHAR         -- Estado: 'disponible', 'ocupado', 'reservado', 'mantenimiento'
```

#### 📊 **ReportesDeteccion** - Eventos de Detección IA
```sql
id_reporte     INT (PK)        -- ID único del reporte
id_slot        INT (FK)        -- Slot donde ocurrió la detección
timestamp      TIMESTAMP       -- Momento exacto de la detección
estado         VARCHAR         -- Estado detectado: 'ocupado', 'libre', 'vehiculo_detectado'
```

#### 👨‍� **Administradores** - Usuarios Administradores
```sql
id_administrador INT (PK)      -- ID único del administrador
nombre         VARCHAR         -- Nombre completo del administrador
correo         VARCHAR         -- Email único del administrador
```

### Relaciones del Modelo

1. **Reservas ↔ Slots** (N:1)
   - Una reserva pertenece a un slot específico
   - Un slot puede tener múltiples reservas (en diferentes horarios)

2. **ReportesDeteccion ↔ Slots** (N:1)
   - Cada reporte de detección está asociado a un slot
   - Un slot puede tener múltiples reportes de detección a lo largo del tiempo

3. **Administradores** (Entidad independiente)
   - Gestiona el sistema pero no tiene relaciones directas en este modelo básico


## 🏗️ Estructura de Archivos

```
database/
├── init/
│   └── 01_schema.sql         # Schema basado en el diagrama ER
├── seeds/
│   └── 02_test_data.sql      # Datos de prueba para las 4 tablas
├── migrations/               # Migraciones futuras del esquema
├── postgresql.conf           # Configuraciones de PostgreSQL
├── Dockerfile               # Imagen PostgreSQL personalizada
└── README.md               # Documentación del esquema
```

## 🐳 Configuración y Ejecución

### Con Docker (Recomendado)

1. **Construir imagen personalizada:**
```bash
docker build -t smart-parking-db .
```

2. **Ejecutar contenedor:**
```bash
docker run -d 
  --name smart-parking-db 
  -e POSTGRES_DB=smart_parking 
  -e POSTGRES_USER=postgres 
  -e POSTGRES_PASSWORD=parking123 
  -p 5432:5432 
  -v postgres_data:/var/lib/postgresql/data 
  smart-parking-db
```

3. **Con Docker Compose (desde la raíz del proyecto):**
```bash
docker-compose up database
```

### Desarrollo Local

Para instalación local de PostgreSQL:

```bash
# Crear base de datos
createdb smart_parking

# Ejecutar scripts en orden
psql -d smart_parking -f init/01_schema.sql
psql -d smart_parking -f seeds/02_test_data.sql
```

## 🔧 Variables de Entorno

```env
# Base de datos
POSTGRES_DB=smart_parking
POSTGRES_USER=postgres
POSTGRES_PASSWORD=parking123
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Para conexión desde aplicaciones
DATABASE_URL=postgresql://postgres:parking123@localhost:5432/smart_parking
```

## 📋 Scripts de Inicialización

### 01_schema.sql - Esquema Principal
- **Tablas**: Reservas, Slots, ReportesDeteccion, Administradores
- **Relaciones**: Foreign keys según diagrama ER
- **Índices**: Optimizados para consultas frecuentes
- **Constraints**: Validaciones de dominio y integridad
- **Triggers**: Timestamps automáticos en reportes

### 02_test_data.sql - Datos de Prueba
- **Administradores**: Usuario admin de prueba
- **Slots**: 20 espacios numerados (1-20)
- **Reservas**: Reservas de ejemplo en diferentes estados
- **ReportesDeteccion**: Eventos simulados de ocupación

## 🎯 Datos de Prueba Incluidos

### 👨‍💼 Administradores
```
admin@parking.cl - Administrador Principal
supervisor@parking.cl - Supervisor de Turno
```

### 🅿️ Slots de Estacionamiento
```
Slots 1-10:  Zona A (Biblioteca)
Slots 11-15: Zona B (Facultades)
Slots 16-20: Zona C (Deportes)
```

### 📅 Reservas de Ejemplo
```
Reservas activas, pendientes y completadas
Horarios variados: mañana, tarde, noche
Diferentes duraciones: 1h, 2h, 4h
```

### 📊 Reportes de Detección
```
Eventos de ocupación y liberación
Timestamps distribuidos en el día
Estados: ocupado, libre, vehiculo_detectado
```

## 🔍 Consultas Útiles para Desarrollo

### Ver disponibilidad de slots
```sql
SELECT 
    s.numero_slot,
    s.estado,
    COUNT(r.id_reserva) as reservas_activas
FROM Slots s
LEFT JOIN Reservas r ON s.id_slot = r.id_slot 
    AND r.estado IN ('confirmada', 'activa')
    AND CURRENT_DATE BETWEEN r.fecha AND r.fecha
GROUP BY s.id_slot, s.numero_slot, s.estado
ORDER BY s.numero_slot;
```

### Reservas del día actual
```sql
SELECT 
    r.id_reserva,
    r.fecha,
    r.hora_inicio,
    r.hora_fin,
    r.estado,
    s.numero_slot
FROM Reservas r
JOIN Slots s ON r.id_slot = s.id_slot
WHERE r.fecha = CURRENT_DATE
ORDER BY r.hora_inicio;
```

### Últimos reportes de detección
```sql
SELECT 
    rd.timestamp,
    rd.estado,
    s.numero_slot,
    s.estado as slot_estado
FROM ReportesDeteccion rd
JOIN Slots s ON rd.id_slot = s.id_slot
ORDER BY rd.timestamp DESC
LIMIT 10;
```

### Estadísticas de ocupación por slot
```sql
SELECT 
    s.numero_slot,
    COUNT(rd.id_reporte) as total_detecciones,
    COUNT(rd.id_reporte) FILTER (WHERE rd.estado = 'ocupado') as detecciones_ocupado,
    COUNT(rd.id_reporte) FILTER (WHERE rd.estado = 'libre') as detecciones_libre
FROM Slots s
LEFT JOIN ReportesDeteccion rd ON s.id_slot = rd.id_slot
GROUP BY s.id_slot, s.numero_slot
ORDER BY s.numero_slot;
```

## 📊 Índices de Rendimiento

### Índices Principales
- **Reservas**: `idx_reservas_fecha_slot` (fecha, id_slot)
- **ReportesDeteccion**: `idx_reportes_timestamp` (timestamp DESC)
- **Slots**: `idx_slots_estado` (estado)
- **Administradores**: `idx_admin_correo` (correo UNIQUE)

### Índices Compuestos
- **Reservas activas**: `idx_reservas_activas` (estado, fecha, hora_inicio)
- **Detecciones recientes**: `idx_detecciones_slot_timestamp` (id_slot, timestamp)

## 🔒 Constraints y Validaciones

### Reservas
- Estado válido: `CHECK (estado IN ('pendiente', 'confirmada', 'activa', 'completada', 'cancelada'))`
- Horarios lógicos: `CHECK (hora_inicio < hora_fin)`
- Fechas futuras: `CHECK (fecha >= CURRENT_DATE)`

### Slots
- Estado válido: `CHECK (estado IN ('disponible', 'ocupado', 'reservado', 'mantenimiento'))`
- Número único: `UNIQUE (numero_slot)`

### ReportesDeteccion
- Estado válido: `CHECK (estado IN ('ocupado', 'libre', 'vehiculo_detectado'))`

### Administradores
- Email único: `UNIQUE (correo)`
- Formato email: Validación mediante trigger

## 🔄 Triggers del Sistema

### Timestamps Automáticos
```sql
-- Actualización automática de timestamp en ReportesDeteccion
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.timestamp = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Validación de Estados
```sql
-- Validar que slot esté disponible antes de reservar
-- Actualizar estado de slot según detección
-- Verificar conflictos de horarios en reservas
```

## 📈 Consideraciones de Escalabilidad

### Particionamiento Futuro
- **ReportesDeteccion**: Por fecha (mensual)
- **Reservas**: Por año para historial

### Archivado de Datos
- Mover reportes > 1 año a tabla histórica
- Compresión de datos antiguos

### Optimizaciones
- Índices parciales para consultas específicas
- Vistas materializadas para estadísticas
- Connection pooling en aplicaciones

## 🎛️ Monitoreo y Mantenimiento

### Estadísticas de Uso
```sql
-- Ver actividad por tabla
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables;

-- Tamaño de tablas
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass))
FROM pg_tables WHERE schemaname = 'public';
```

### Backup y Recuperación
```bash
# Backup completo
pg_dump smart_parking > backup_$(date +%Y%m%d).sql

# Backup solo datos
pg_dump --data-only smart_parking > data_backup.sql

# Restauración
psql smart_parking < backup_file.sql
```

---

**Nota**: Este esquema está diseñado específicamente según el diagrama entidad-relación proporcionado. Para modificaciones, actualizar primero el diagrama ER y luego reflejar cambios en el código.


## 🐳 Configuración y Ejecución

### Con Docker

1. **Construir imagen personalizada:**
```bash
docker build -t smart-parking-db .
```

2. **Ejecutar contenedor:**
```bash
docker run -d \
  --name smart-parking-db \
  -e POSTGRES_DB=smart_parking \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=parking123 \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  smart-parking-db
```

3. **Con Docker Compose (recomendado):**
```bash
# Desde la raíz del proyecto
docker-compose up database
```

### Desarrollo Local

Si prefieres PostgreSQL local:

```bash
# Crear base de datos
createdb smart_parking

# Ejecutar scripts
psql -d smart_parking -f init/01_schema.sql
psql -d smart_parking -f seeds/02_test_data.sql
```

## 🔧 Variables de Entorno

```env
POSTGRES_DB=smart_parking
POSTGRES_USER=postgres
POSTGRES_PASSWORD=parking123
POSTGRES_PORT=5432
```

## 📋 Scripts de Inicialización

### 01_schema.sql
- **Extensiones**: UUID, pg_trgm para búsquedas
- **Tablas principales** con relaciones y constraints
- **Índices optimizados** para consultas frecuentes
- **Triggers** para timestamps automáticos
- **Comentarios** de documentación

### 02_test_data.sql
- **Usuarios de prueba**: admin, guardia, estudiantes
- **Zonas de campus**: Biblioteca, Facultades, Deportes, Residencia
- **Espacios variados**: regulares, discapacitados, eléctricos
- **Vehículos registrados**: autos y motos
- **Reservas activas** para pruebas
- **Eventos de IA** simulados
- **Historial de ocupación** de ejemplo

## 🎯 Datos de Prueba Incluidos

### 👤 Usuarios
- **Admin**: admin@universidad.cl / admin123
- **Guardia**: guardia@universidad.cl / guard123
- **Estudiantes**: juan.perez@estudiante.cl, maria.gonzalez@estudiante.cl, ana.silva@estudiante.cl
- **Contraseña por defecto**: parking123

### 🅿️ Espacios
- **Zona A**: 50 espacios (Biblioteca)
- **Zona B**: 75 espacios (Facultades) 
- **Zona C**: 30 espacios (Deportes)
- **Zona D**: 40 espacios (Residencia)

### 🚗 Vehículos de Prueba
- ABCD12 (Toyota Corolla - Juan)
- EFGH34 (Nissan Sentra - María)
- IJKL56 (Honda Civic - Ana)
- MNOP78 (Yamaha MT-07 - Juan)

## 🔍 Consultas Útiles para Desarrollo

### Ver espacios disponibles por zona
```sql
SELECT z.name, 
       COUNT(*) as total_spaces,
       COUNT(*) FILTER (WHERE s.is_available) as available_spaces
FROM parking_zones z
JOIN parking_spaces s ON z.id = s.zone_id
WHERE z.is_active = true AND s.is_active = true
GROUP BY z.id, z.name;
```

### Reservas activas con detalles
```sql
SELECT u.first_name, u.last_name, v.license_plate,
       z.name as zone_name, s.space_number,
       b.start_time, b.end_time, b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN parking_spaces s ON b.space_id = s.id
JOIN parking_zones z ON s.zone_id = z.id
WHERE b.status = 'active';
```

### Eventos de detección recientes
```sql
SELECT c.name as camera_name, de.event_type, 
       de.license_plate, de.confidence_score,
       de.created_at
FROM detection_events de
JOIN cameras c ON de.camera_id = c.id
ORDER BY de.created_at DESC
LIMIT 10;
```

## 📊 Índices de Rendimiento

- **Búsquedas por email/patente**: Índices únicos
- **Consultas de disponibilidad**: Índices compuestos
- **Filtros de tiempo**: Índices en rangos de fecha
- **Joins frecuentes**: Índices en llaves foráneas

## 🔒 Seguridad

- **Constraints de dominio**: Validación a nivel BD
- **Foreign Keys**: Integridad referencial
- **Triggers de auditoría**: Registro automático de cambios
- **Roles y permisos**: Separación de privilegios (futuro)

## 📈 Escalabilidad

- **Particionamiento**: Por fecha en tablas grandes (futuro)
- **Archivado**: Mover datos históricos (futuro) 
- **Réplicas de lectura**: Para reportes (futuro)
- **Conexión pooling**: Optimización de conexiones

## 🔄 Migraciones

Para cambios futuros del esquema:

```bash
# Crear nueva migración
echo "-- Migración: $(date)" > migrations/$(date +%Y%m%d_%H%M%S)_descripcion.sql

# Aplicar migraciones
for file in migrations/*.sql; do
    psql -d smart_parking -f "$file"
done
```

## 🎛️ Monitoreo y Mantenimiento

### Comandos útiles de mantenimiento
```sql
-- Ver estadísticas de tablas
SELECT schemaname, tablename, n_live_tup, n_dead_tup
FROM pg_stat_user_tables;

-- Analizar rendimiento de consultas
SELECT query, total_time, calls, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC;

-- Información de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes;
```

---

**Nota**: Esta base de datos está diseñada para desarrollo y pruebas. Para producción, considerar configuraciones adicionales de seguridad, backup y monitoreo.
