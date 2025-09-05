import { Admin } from '../entities/Admin';

export interface AdminRepository {
    // Operaciones básicas CRUD
    create: (admin: Admin) => Promise<Admin>;
    findAll: (tenantId: string) => Promise<Admin[]>; // Solo administradores del tenant
    findById: (id: string, tenantId: string) => Promise<Admin | null>; // Con filtro de tenant
    findByEmail: (email: string, tenantId: string) => Promise<Admin | null>; // Con filtro de tenant
    update: (id: string, tenantId: string, data: Partial<Omit<Admin, 'id' | 'createdAt' | 'tenantId' | 'passwordHash'>>) => Promise<Admin | null>;
    delete: (id: string, tenantId: string) => Promise<boolean>;

    // Operaciones específicas de administradores
    updatePassword: (id: string, tenantId: string, newPasswordHash: string) => Promise<Admin | null>;

    // Verificación de existencia y unicidad
    existsByEmail: (email: string, tenantId: string) => Promise<boolean>;
    existsById: (id: string, tenantId: string) => Promise<boolean>;

    // Conteo para límites y estadísticas
    countByTenant: (tenantId: string) => Promise<number>;

    // Operaciones de autenticación
    findByEmailForAuth: (email: string, tenantId: string) => Promise<Admin | null>; // Incluye passwordHash para autenticación

    // Operaciones para super admin (gestión de tenants)
    findAllAcrossTenants?: () => Promise<Admin[]>; // Opcional: Solo para super admin
    countAcrossTenants?: () => Promise<number>; // Opcional: Solo para super admin

    // Operaciones de filtrado y búsqueda
    findByFilters: (tenantId: string, filters: AdminSearchFilters) => Promise<Admin[]>;

    // Operaciones de auditoría
    findRecentlyCreated: (tenantId: string, days?: number) => Promise<Admin[]>; // Administradores creados recientemente
    findRecentlyUpdated: (tenantId: string, days?: number) => Promise<Admin[]>; // Administradores actualizados recientemente
}

// Filtros para búsqueda de administradores
export interface AdminSearchFilters {
    email?: string; // Búsqueda parcial por email
    name?: string; // Búsqueda parcial por nombre
    createdAfter?: Date; // Creados después de esta fecha
    createdBefore?: Date; // Creados antes de esta fecha
    updatedAfter?: Date; // Actualizados después de esta fecha
    updatedBefore?: Date; // Actualizados antes de esta fecha
    limit?: number; // Límite de resultados
    offset?: number; // Offset para paginación
    orderBy?: 'email' | 'name' | 'createdAt' | 'updatedAt'; // Campo de ordenamiento
    orderDirection?: 'asc' | 'desc'; // Dirección del ordenamiento
}
