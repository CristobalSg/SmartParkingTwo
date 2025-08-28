# 🧪 Pruebas de API Multi-Tenancy

Este directorio contiene pruebas manuales para verificar que la funcionalidad de multi-tenancy está funcionando correctamente.

## Requisitos Previos

1. **Servidor ejecutándose**: El backend debe estar corriendo en `http://localhost:3000`
2. **Base de datos poblada**: Ejecutar el seed para tener tenants de prueba
3. **curl instalado**: Para ejecutar las pruebas HTTP

### Preparar el entorno:

```bash
# 1. Ejecutar el servidor (en terminal separado)
cd backend/
pnpm run start:dev

# 2. Poblar la base de datos con tenants de prueba
pnpm run db:seed

# 3. Hacer ejecutable el script de pruebas
chmod +x tests/multitenancy-api-tests.sh
```

## Ejecutar las Pruebas

### Ejecutar todas las pruebas:
```bash
cd tests/
./multitenancy-api-tests.sh
```

### Ejecutar una prueba específica:
```bash
./multitenancy-api-tests.sh 1    # Solo la prueba 1
./multitenancy-api-tests.sh 5    # Solo la prueba 5
```

## Catálogo de Pruebas

### ✅ Pruebas de Creación (1-3)
- **Test 1**: Crear usuario en Universidad Nacional
- **Test 2**: Crear usuario en Empresa Tech  
- **Test 3**: Crear usuario en Hospital Central

### 🔒 Pruebas de Aislamiento (4-6)
- **Test 4**: Listar usuarios de Universidad Nacional
- **Test 5**: Listar usuarios de Empresa Tech
- **Test 6**: Listar usuarios de Hospital Central

### ❌ Pruebas de Validación de Errores (7-9)
- **Test 7**: Crear usuario sin tenant (debe fallar)
- **Test 8**: Crear usuario con tenant inexistente (debe fallar) 
- **Test 9**: Listar usuarios sin tenant (debe fallar)

### 📧 Pruebas de Emails Únicos por Tenant (10-11)
- **Test 10**: Email duplicado en mismo tenant (debe fallar)
- **Test 11**: Mismo email en diferentes tenants (debe funcionar)

### 🔍 Pruebas CRUD por ID (12-13)
- **Test 12**: Obtener usuario específico por ID
- **Test 13**: Actualizar usuario por ID

### 🚫 Pruebas Cross-Tenant (14)
- **Test 14**: Intentar acceder a usuario de otro tenant (debe fallar)

### 🏥 Pruebas de Rutas Públicas (15)
- **Test 15**: Health check sin tenant requerido

## Tenants de Prueba

Los siguientes tenants están disponibles después de ejecutar el seed:

| Tenant ID | Nombre | Dominio | Usuarios Iniciales |
|-----------|--------|---------|-------------------|
| `universidad-nacional` | Universidad Nacional | universidad.edu | 3 estudiantes/profesores |
| `empresa-tech` | Empresa Tech Solutions | techsolutions.com | 2 desarrolladores |  
| `hospital-central` | Hospital Central | hospital-central.gov | 1 doctor |

## Interpretación de Resultados

### ✅ Respuestas Exitosas
```json
{
  "status": "success",
  "data": { /* datos del usuario */ },
  "message": "User created successfully"
}
```

### ❌ Errores Esperados
```json
{
  "message": "Tenant information is required",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 🔒 Aislamiento Correcto
- Los usuarios solo aparecen en las listas de su propio tenant
- Los IDs de un tenant no son accesibles desde otro tenant
- Los emails pueden repetirse entre diferentes tenants

## Comandos Útiles Adicionales

```bash
# Verificar que el servidor esté ejecutándose
curl http://localhost:3000/health

# Ver logs del servidor mientras se ejecutan pruebas
# (en el terminal donde corre pnpm run start:dev)

# Limpiar y repoblar base de datos
cd backend/
pnpm run db:reset
pnpm run db:seed
```

## Solución de Problemas

### El servidor no responde
- Verificar que esté corriendo en puerto 3000
- Verificar conexión a la base de datos

### Tenant not found
- Ejecutar `pnpm run db:seed` para crear los tenants de prueba
- Verificar que los nombres de tenant en las pruebas coincidan

### Errores de CORS
- Las pruebas usan curl directamente, no deberían tener problemas de CORS
- Si usas un navegador, habilita CORS en el backend

---

## 🎯 Objetivo de las Pruebas

Estas pruebas verifican que:

1. ✅ **Aislamiento perfecto**: Los datos están separados por tenant
2. ✅ **Identificación automática**: El middleware detecta el tenant correctamente
3. ✅ **Validaciones de dominio**: Los emails son únicos por tenant
4. ✅ **Seguridad**: No hay acceso cross-tenant
5. ✅ **Clean Architecture**: Las capas funcionan correctamente juntas
