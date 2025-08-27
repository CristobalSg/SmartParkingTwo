import { User } from '../entities/User';
import { TenantId } from '../value-objects/TenantId';

export interface UserRepository {
    create: (resource: User) => Promise<User>
    findAll: (tenantId: TenantId) => Promise<User[]> // ← Solo usuarios del tenant
    findById: (id: string, tenantId: TenantId) => Promise<User | null> // ← Con filtro de tenant
    findByEmail: (email: string, tenantId: TenantId) => Promise<User | null> // ← Con filtro de tenant
    update: (id: string, tenantId: TenantId, data: Partial<Omit<User, 'id' | 'createdAt' | 'tenantId'>>) => Promise<User | null>
    delete: (id: string, tenantId: TenantId) => Promise<boolean>

    // ← NUEVO: Contar usuarios por tenant (para límites)
    countByTenant: (tenantId: TenantId) => Promise<number>
}