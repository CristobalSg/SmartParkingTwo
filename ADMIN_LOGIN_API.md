# 🔐 API Login de Administradores

## Endpoint Principal

### **POST** `/api/admin/login`

```http
Content-Type: application/json
X-Tenant-ID: universidad-nacional
```

```json
{
  "email": "admin@universidad.edu",
  "password": "admin123"
}
```

## Respuesta Exitosa (201)
```json
{
  "status": "success",
  "data": {
    "admin": {
      "id": "361b99a6-774a-428d-8e65-0fd71a6b15ce",
      "tenantUuid": "cef16d2b-218d-4e9e-adbb-9280213b4b05",
      "email": "admin@universidad.edu", 
      "name": "Juan Pérez - Administrador Principal"
    },
    "token": "eyJkYXRhIjp7ImFkbWluSWQiOi...",
    "expiresAt": "2025-08-30T19:44:29.605Z"
  }
}
```

## Respuesta de Error (401/400)
```json
{
  "status": "error",
  "message": "Authentication failed",
  "error": "Invalid email or password"
}
```

## Credenciales de Prueba

| Email | Password | Tenant-ID |
|-------|----------|-----------|
| `admin@universidad.edu` | `admin123` | `universidad-nacional` |
| `admin@techsolutions.com` | `admin123` | `empresa-tech` |
| `supervisor@universidad.edu` | `super123` | `universidad-nacional` |

## Ejemplo JavaScript

```javascript
const loginAdmin = async (email, password, tenantId) => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    localStorage.setItem('adminToken', data.data.token);
    return data.data;
  } else {
    throw new Error(data.error);
  }
};
```

## Notas Importantes

- **Header obligatorio:** `X-Tenant-ID` 
- **Token expira:** en 24 horas
- **Multitenancy:** Cada tenant tiene sus propios admins
- **Almacenar token:** en localStorage o sessionStorage

## Testing con cURL

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: universidad-nacional" \
  -d '{"email": "admin@universidad.edu", "password": "admin123"}'
```
