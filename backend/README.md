# Backend API - Sistema de Gestión de Estacionamiento Universitario

API RESTful del sistema de parking universitario, desarrollada con Node.js, TypeScript y Express.

## 🚀 Tecnologías

- **Node.js 18** - Runtime de JavaScript
- **TypeScript** - Tipado estático
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Hash de contraseñas

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/       # Controladores de rutas
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── middleware/       # Middlewares personalizados
│   ├── models/          # Modelos de datos
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── utils/           # Utilidades y helpers
│   └── server.ts        # Archivo principal del servidor
├── dist/                # Código compilado
├── tests/               # Pruebas unitarias e integración
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🎯 Funcionalidades de la API

### Módulos Principales

- **Autenticación**: Login, registro, gestión de tokens
- **Espacios**: Gestión de espacios de estacionamiento
- **Reservas**: Sistema de reservas con validaciones
- **Cámaras**: Integración con sistema de monitoreo
- **Reportes**: Estadísticas y reportes administrativos

## 🛠️ Configuración y Ejecución

### Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (ver `.env.example`)

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Con Docker

1. Construir imagen:
```bash
docker build -t smart-parking-backend .
```

2. Ejecutar contenedor:
```bash
docker run -p 3001:3001 --env-file .env smart-parking-backend
```

## 🔧 Variables de Entorno

```env
# Servidor
NODE_ENV=development
PORT=3001

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_parking
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# APIs externas
PYTHON_MODELS_API_URL=http://localhost:8000

# Límites de tasa
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión


### Espacios
- `GET /api/spaces` - Listar espacios
- `GET /api/spaces/:id` - Obtener espacio
- `POST /api/spaces` - Crear espacio
- `PUT /api/spaces/:id` - Actualizar espacio
- `DELETE /api/spaces/:id` - Eliminar espacio

### Reservas
- `GET /api/bookings` - Listar reservas
- `GET /api/bookings/:id` - Obtener reserva
- `POST /api/bookings` - Crear reserva
- `PUT /api/bookings/:id` - Actualizar reserva
- `DELETE /api/bookings/:id` - Cancelar reserva


## 🔒 Autenticación y Autorización

- **JWT Tokens**: Autenticación basada en tokens
- **Middleware de Auth**: Verificación automática de tokens
- **Rate Limiting**: Protección contra ataques de fuerza bruta

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con recarga automática
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Ejecutar servidor de producción
- `npm test` - Ejecutar pruebas
- `npm run lint` - Verificar código con ESLint
- `npm run lint:fix` - Corregir errores de linting automáticamente

## 🏗️ Arquitectura

### Principios SOLID
- **Single Responsibility**: Cada módulo tiene una responsabilidad única
- **Open/Closed**: Extensible pero cerrado para modificación
- **Liskov Substitution**: Interfaces consistentes
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Inversión de dependencias

### Patrones de Diseño
- **Repository Pattern**: Abstracción de acceso a datos
- **Service Layer**: Separación de lógica de negocio
- **Middleware Pattern**: Procesamiento de requests
- **Error Handling**: Manejo centralizado de errores

## 🔗 Integración con Otros Servicios

- **Frontend**: Servicio de APIs para React
- **Database**: Conexión directa con PostgreSQL
- **Python Models**: Cliente HTTP para servicios de IA
- **Cámaras**: Integración para recibir eventos de detección

## 📊 Monitoreo y Logs

- **Morgan**: Logs HTTP detallados
- **Error Logging**: Registro de errores centralizados
- **Health Check**: Endpoint de salud del servicio

---

**Nota**: Este es el servicio backend del sistema distribuido. Requiere PostgreSQL y opcionalmente el servicio python-models para funcionalidad completa.
