import { User } from '../entities/User';

export interface UserRepository {
    create: (resource: User) => Promise<User>
    findAll: (tenantId: string) => Promise<User[]> // ← Solo usuarios del tenant
    findById: (id: string, tenantId: string) => Promise<User | null> // ← Con filtro de tenant
    findByEmail: (email: string, tenantId: string) => Promise<User | null> // ← Con filtro de tenant
    update: (id: string, tenantId: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'tenantId'>>) => Promise<User | null>
    delete: (id: string, tenantId: string) => Promise<boolean>

    // ← NUEVO: Contar usuarios por tenant (para límites)
    countByTenant: (tenantId: string) => Promise<number>
}