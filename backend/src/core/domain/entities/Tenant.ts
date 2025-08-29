import { TenantId } from '../value-objects/TenantId';

export class Tenant {
    constructor(
        readonly id: string, // UUID del registro
        readonly tenantId: TenantId, // Identificador único del tenant (empresa-a, ciudad-b)
        readonly name: string, // Nombre completo (Empresa A S.L., Ciudad B)
        readonly domain: string, // Subdominio (empresa-a.smartparking.com)
        readonly isActive: boolean,
        readonly createdAt: Date,
        readonly updatedAt: Date,
        readonly settings?: TenantSettings
    ) {
        this.validateName(name);
        this.validateDomain(domain);
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Tenant name cannot be empty');
        }
        if (name.length > 255) {
            throw new Error('Tenant name cannot exceed 255 characters');
        }
    }

    private validateDomain(domain: string): void {
        if (!domain || domain.trim().length === 0) {
            throw new Error('Tenant domain cannot be empty');
        }

        const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+$/;
        if (!domainRegex.test(domain)) {
            throw new Error('Invalid domain format');
        }
    }

    isAccessibleBy(requestDomain: string): boolean {
        return this.domain === requestDomain && this.isActive;
    }

    deactivate(): Tenant {
        return new Tenant(
            this.id,
            this.tenantId,
            this.name,
            this.domain,
            false,
            this.createdAt,
            new Date(),
            this.settings
        );
    }

    updateSettings(newSettings: TenantSettings): Tenant {
        return new Tenant(
            this.id,
            this.tenantId,
            this.name,
            this.domain,
            this.isActive,
            this.createdAt,
            new Date(),
            newSettings
        );
    }
}

export interface TenantSettings {
    maxUsers?: number;
    maxParkingSpaces?: number;
    allowedFeatures: string[];
    customBranding?: {
        logo?: string;
        colors?: {
            primary: string;
            secondary: string;
        };
    };
    timeZone?: string;
    currency?: string;
}
