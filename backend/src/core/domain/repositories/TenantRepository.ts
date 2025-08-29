import { Tenant } from '../entities/Tenant';
import { TenantId } from '../value-objects/TenantId';

export interface TenantRepository {
    create: (tenant: Tenant) => Promise<Tenant>
    findAll: () => Promise<Tenant[]>
    findById: (id: string) => Promise<Tenant | null>
    findByTenantId: (tenantId: TenantId) => Promise<Tenant | null>
    findByDomain: (domain: string) => Promise<Tenant | null>
    update: (id: string, data: Partial<Omit<Tenant, 'id' | 'createdAt'>>) => Promise<Tenant | null>
    delete: (id: string) => Promise<boolean>

    // Activar/desactivar tenant
    activate: (id: string) => Promise<boolean>
    deactivate: (id: string) => Promise<boolean>
}
