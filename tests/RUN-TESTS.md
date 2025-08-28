# 🚀 EJECUTAR PRUEBAS COMPLETAS

## Opción 1: Ejecutar todas las pruebas
```bash
cd tests/
./multitenancy-api-tests.sh
```

## Opción 2: Ejecutar prueba específica
```bash
./multitenancy-api-tests.sh 1    # Crear usuario Universidad
./multitenancy-api-tests.sh 4    # Listar usuarios Universidad  
./multitenancy-api-tests.sh 7    # Probar error sin tenant
./multitenancy-api-tests.sh 10   # Probar email duplicado
```

## Opción 3: Comandos curl directos (copiar/pegar)

### Crear usuarios diferentes tenants:
```bash
# Universidad
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -H "X-Tenant-ID: universidad-nacional" -d '{"email": "test1@universidad.edu", "name": "Test Usuario 1"}'

# Empresa  
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -H "X-Tenant-ID: empresa-tech" -d '{"email": "test2@techsolutions.com", "name": "Test Usuario 2"}'
```

### Verificar aislamiento:
```bash
curl -H "X-Tenant-ID: universidad-nacional" http://localhost:3000/api/users
curl -H "X-Tenant-ID: empresa-tech" http://localhost:3000/api/users  
```

### Probar errores:
```bash
# Sin tenant (debe fallar)
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"email": "sin@tenant.com", "name": "Sin Tenant"}'

# Tenant inexistente (debe fallar) 
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -H "X-Tenant-ID: inexistente" -d '{"email": "test@inexistente.com", "name": "Inexistente"}'
```

---
✅ **Las pruebas están listas para usar** 
⚡ **Ejecuta el servidor primero**: `cd backend && pnpm run start:dev`
🗄️ **Popula la base**: `cd backend && pnpm run db:seed`
