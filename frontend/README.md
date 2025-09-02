# Frontend - Sistema de Gestión de Estacionamiento Universitario

Esta es la aplicación frontend del sistema de parking universitario, desarrollada con React y TypeScript.

## 🚀 Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **React Router Dom** - Navegación entre páginas
- **Axios** - Cliente HTTP para API calls
- **CSS Modules** - Estilos modulares

## 📁 Estructura del Proyecto (FRONTEND)

```
src/
├── application/          # Capa de Aplicación
│   ├── use-cases/       # Casos de uso específicos
│   ├── ports/           # Interfaces/contratos
│   └── services/        # Servicios de aplicación
├── domain/              # Capa de Dominio (corazón)
│   ├── entities/        # Entidades de negocio
│   ├── value-objects/   # Objetos de valor
│   └── repositories/    # Interfaces de repositorios
├── infrastructure/      # Capa de Infraestructura
│   ├── api/            # Adaptadores para APIs
│   ├── repositories/   # Implementaciones de repositorios
│   ├── storage/        # LocalStorage, SessionStorage
│   └── http/           # Configuración de HTTP
├── presentation/        # Capa de Presentación
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas/vistas principales
│   ├── hooks/          # Hooks personalizados
│   ├── contexts/       # Context API de React
│   └── styles/         # Estilos y temas
├── shared/             # Código compartido
│   ├── types/          # Tipos TypeScript globales
│   ├── constants/      # Constantes
│   └── utils/          # Utilidades
├── App.tsx
└── index.tsx
```

## 🎯 Funcionalidades Principales

- **Panel de Administración**: Gestión de espacios y usuarios
- **Sistema de Reservas**: Interfaz para reservar espacios
- **Monitoreo de Cámaras**: Vista en tiempo real del estacionamiento
- **Gestión de Usuarios**: Autenticación y perfiles

## 🛠️ Configuración y Ejecución

### Desarrollo Local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Con Docker

1. Construir imagen:
```bash
docker build -t smart-parking-frontend .
```

2. Ejecutar contenedor:
```bash
docker run -p 3000:3000 smart-parking-frontend
```

## 🔧 Variables de Entorno

Crear archivo `.env.local` con:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_MODELS_API_URL=http://localhost:8000/api
```

## 🌐 Endpoints de API

El frontend se comunica con:

- **Backend API**: `http://localhost:3001/api` - Gestión de datos principales
- **Python Models API**: `http://localhost:8000/api` - Servicios de IA y detección

## 📋 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone configuración de Webpack

## 🎨 Arquitectura de Componentes

- **Componentes de UI**: Elementos reutilizables (botones, formularios, tablas)
- **Páginas**: Vistas principales de la aplicación
- **Servicios**: Lógica de comunicación con APIs
- **Types**: Definiciones de tipos compartidas

## 🔄 Estado y Datos

- **Context API** para estado global
- **Axios** para llamadas HTTP
- **React Query** para cache y sincronización de datos (futuro)

## 📱 Diseño Responsive

La aplicación está optimizada para:
- Escritorio (Panel de administración)
- Tablet (Gestión intermedia)
- Móvil (Reservas rápidas)

---

**Nota**: Este es el servicio frontend del sistema distribuido. Asegúrate de que los servicios backend y python-models estén ejecutándose para funcionalidad completa.
