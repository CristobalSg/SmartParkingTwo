import { Injectable, Scope } from '@nestjs/common';
import { TenantId } from '../../core/domain/value-objects/TenantId';
import { Tenant } from '../../core/domain/entities/Tenant';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
    private _tenant: Tenant | null = null;

    setTenant(tenant: Tenant): void {
        this._tenant = tenant;
    }

    getTenant(): Tenant | null {
        return this._tenant;
    }

    requireTenant(): Tenant {
        if (!this._tenant) {
            throw new Error('Tenant is required but not set in context');
        }
        return this._tenant;
    }

    getTenantId(): TenantId {
        return this.requireTenant().tenantId;
    }

    getTenantUuid(): string {
        return this.requireTenant().id; // UUID interno
    }
}
