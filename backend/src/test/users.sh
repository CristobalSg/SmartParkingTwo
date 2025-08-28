curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: universidad-nacional" \
  -d '{
    "email": "nuevo.estudiante@universidad.edu",
    "name": "Estudiante Nuevo"
  }'