# 🏗️ Clean Architecture Frontend - Ejemplos Básicos

Este documento contiene ejemplos **muy básicos** de código para entender cómo funciona cada carpeta en Clean Architecture.

---

## 🎯 **DOMAIN** - Capa de Dominio (Corazón del Sistema)

### 📁 `domain/entities/` - Entidades de Negocio

```typescript
// User.ts - Entidad principal con lógica de negocio
export class User {
  constructor(public id: string, public email: string, public name: string) {}

  // Método de negocio: validar si el email es válido
  isValidEmail(): boolean {
    return this.email.includes("@");
  }

  // Método de negocio: obtener nombre completo formateado
  getFormattedName(): string {
    return this.name.toUpperCase();
  }
}
```

### 📁 `domain/value-objects/` - Objetos de Valor

```typescript
// Email.ts - Objeto de valor que representa un email
export class Email {
  private constructor(private value: string) {}

  static create(email: string): Email {
    if (!email.includes("@")) {
      throw new Error("Email inválido");
    }
    return new Email(email);
  }

  getValue(): string {
    return this.value;
  }
}
```

### 📁 `domain/repositories/` - Interfaces de Repositorios

```typescript
// UserRepository.ts - Contrato que define qué operaciones podemos hacer
export interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}
```

---

## 🔧 **APPLICATION** - Capa de Aplicación

### 📁 `application/use-cases/` - Casos de Uso

```typescript
// GetUserUseCase.ts - Caso de uso específico: obtener un usuario
export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  // Ejecuta el caso de uso: buscar usuario por ID
  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }
}
```

### 📁 `application/services/` - Servicios de Aplicación

```typescript
// UserService.ts - Servicio que coordina múltiples casos de uso
export class UserService {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private createUserUseCase: CreateUserUseCase
  ) {}

  // Método que usa un caso de uso
  async getUser(id: string): Promise<User> {
    return this.getUserUseCase.execute(id);
  }
}
```

### 📁 `application/ports/` - Puertos/Interfaces

```typescript
// INotificationService.ts - Interface para servicios externos
export interface INotificationService {
  send(message: string): Promise<void>;
}

// IEmailService.ts - Interface para servicio de email
export interface IEmailService {
  sendEmail(to: string, subject: string): Promise<boolean>;
}
```

---

## 🏗️ **INFRASTRUCTURE** - Capa de Infraestructura

### 📁 `infrastructure/api/` - Adaptadores para APIs

```typescript
// UserApiAdapter.ts - Adapta datos de la API al formato del dominio
export class UserApiAdapter {
  // Convierte datos de API a entidad de dominio
  static toDomain(apiData: any): User {
    return new User(apiData.id, apiData.email, apiData.full_name);
  }

  // Convierte entidad de dominio a formato API
  static toApi(user: User): any {
    return {
      id: user.id,
      email: user.email,
      full_name: user.name,
    };
  }
}
```

### 📁 `infrastructure/repositories/` - Implementaciones de Repositorios

```typescript
// ApiUserRepository.ts - Implementación real del repositorio usando API
export class ApiUserRepository implements UserRepository {
  constructor(private httpClient: HttpClient) {}

  async findById(id: string): Promise<User> {
    const response = await this.httpClient.get(`/users/${id}`);
    return UserApiAdapter.toDomain(response.data);
  }

  async save(user: User): Promise<void> {
    const apiData = UserApiAdapter.toApi(user);
    await this.httpClient.post("/users", apiData);
  }

  async findAll(): Promise<User[]> {
    const response = await this.httpClient.get("/users");
    return response.data.map(UserApiAdapter.toDomain);
  }
}
```

### 📁 `infrastructure/http/` - Configuración HTTP

```typescript
// HttpClient.ts - Cliente HTTP básico
export class HttpClient {
  constructor(private baseUrl: string) {}

  async get(path: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`);
    return response.json();
  }

  async post(path: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

### 📁 `infrastructure/storage/` - Almacenamiento Local

```typescript
// LocalStorageService.ts - Servicio para localStorage
export class LocalStorageService {
  // Guardar datos en localStorage
  save(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Obtener datos de localStorage
  get<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // Eliminar datos de localStorage
  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
```

---

## 🖼️ **PRESENTATION** - Capa de Presentación

### 📁 `presentation/components/` - Componentes Reutilizables

```tsx
// Button.tsx - Componente básico de botón
interface ButtonProps {
  text: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button onClick={onClick} className="btn">
      {text}
    </button>
  );
};
```

### 📁 `presentation/pages/` - Páginas/Vistas

```tsx
// UserPage.tsx - Página que muestra usuarios
import { useUsers } from "../hooks/useUsers";

export const UserPage: React.FC = () => {
  const { users, loading } = useUsers();

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Usuarios</h1>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### 📁 `presentation/hooks/` - Hooks Personalizados

```tsx
// useUsers.ts - Hook para manejar estado de usuarios
import { useState, useEffect } from "react";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuarios al montar el componente
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Aquí iría la llamada al servicio
      const usersList = await userService.getAllUsers();
      setUsers(usersList);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading };
};
```

### 📁 `presentation/contexts/` - Context API

```tsx
// UserContext.tsx - Context para estado global de usuarios
const UserContext = createContext<{
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
}>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};
```

### 📁 `presentation/styles/` - Estilos

```css
/* Button.module.css - Estilos modulares para botón */
.btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}
```

---

## 🤝 **SHARED** - Código Compartido

### 📁 `shared/types/` - Tipos TypeScript Globales

```typescript
// common.ts - Tipos compartidos en toda la aplicación
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export type ID = string;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}
```

### 📁 `shared/constants/` - Constantes

```typescript
// api.ts - Constantes para la API
export const API_ENDPOINTS = {
  USERS: "/users",
  AUTH: "/auth",
  PARKING: "/parking",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
};
```

### 📁 `shared/utils/` - Utilidades

```typescript
// formatters.ts - Funciones utilitarias para formatear datos
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("es-ES");
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

---

## 🔄 **Flujo de Datos en Clean Architecture**

```
1. USER INTERACTION (Presentation)
   ↓
2. HOOK/CONTEXT (Presentation)
   ↓
3. USE CASE (Application)
   ↓
4. REPOSITORY INTERFACE (Domain)
   ↓
5. REPOSITORY IMPLEMENTATION (Infrastructure)
   ↓
6. API/STORAGE (Infrastructure)
```

## 📝 **Resumen Simple**

- **Domain**: Las reglas de negocio puras (entidades, validaciones)
- **Application**: Casos de uso específicos (qué hace la app)
- **Infrastructure**: Cómo se conecta con el mundo exterior (APIs, DB)
- **Presentation**: La interfaz de usuario (componentes, páginas)
- **Shared**: Código que usan todas las capas (tipos, constantes, utils)

**¡Cada capa solo conoce las internas, nunca las externas!**
