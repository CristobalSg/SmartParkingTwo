# Quick Test Commands

## Create Users
```bash
# Universidad Nacional
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: universidad-nacional" \
  -d '{"email": "nuevo.estudiante@universidad.edu", "name": "Estudiante Nuevo"}'

# Empresa Tech
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: empresa-tech" \
  -d '{"email": "nuevo.developer@techsolutions.com", "name": "Developer Nuevo"}'

# Hospital Central
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: hospital-central" \
  -d '{"email": "enfermero@hospital-central.gov", "name": "Enfermero Nuevo"}'
```

## List Users (Verify Tenant Isolation)
```bash
# Universidad Nacional users
curl -H "X-Tenant-ID: universidad-nacional" http://localhost:3000/api/users

# Empresa Tech users  
curl -H "X-Tenant-ID: empresa-tech" http://localhost:3000/api/users

# Hospital Central users
curl -H "X-Tenant-ID: hospital-central" http://localhost:3000/api/users
```

## Error Tests
```bash
# Should fail - No tenant
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "sin.tenant@test.com", "name": "Usuario Sin Tenant"}'

# Should fail - Invalid tenant
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-inexistente" \
  -d '{"email": "usuario@inexistente.com", "name": "Usuario Inexistente"}'

# Should fail - Duplicate email in same tenant
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: universidad-nacional" \
  -d '{"email": "carlos.rodriguez@estudiante.edu", "name": "Carlos Duplicado"}'
```

## Update User (Replace USER_ID with actual ID from list)
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: universidad-nacional" \
  -d '{"name": "Nombre Actualizado"}'
```

## Get User by ID (Replace USER_ID with actual ID from list)
```bash
curl -H "X-Tenant-ID: universidad-nacional" http://localhost:3000/api/users/USER_ID
```

## Delete User (Replace USER_ID with actual ID from list)
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID \
  -H "X-Tenant-ID: universidad-nacional"
```
