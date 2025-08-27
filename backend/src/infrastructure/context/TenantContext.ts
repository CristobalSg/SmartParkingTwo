import { Injectable, Scope } from '@nestjs/common';
import { TenantId } from '../../core/domain/value-objects/TenantId';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
    private tenantId: TenantId | null = null;

    setTenantId(tenantId: TenantId): void {
        this.tenantId = tenantId;
    }

    getTenantId(): TenantId {
        if (!this.tenantId) {
            throw new Error('Tenant context not initialized. Make sure TenantMiddleware is properly configured.');
        }
        return this.tenantId;
    }

    hasTenant(): boolean {
        return this.tenantId !== null;
    }

    clearTenant(): void {
        this.tenantId = null;
    }

    // Helper para obtener el valor string del tenant
    getTenantIdValue(): string {
        return this.getTenantId().getValue();
    }
}
