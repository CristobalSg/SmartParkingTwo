export class TenantId {
    private readonly value: string;

    constructor(tenantId: string) {
        this.validateTenantId(tenantId);
        this.value = tenantId.toLowerCase().trim();
    }

    private validateTenantId(tenantId: string): void {
        if (!tenantId || tenantId.trim().length === 0) {
            throw new Error('Tenant ID cannot be empty');
        }

        // Solo letras, números y guiones
        const tenantIdRegex = /^[a-zA-Z0-9-]+$/;
        if (!tenantIdRegex.test(tenantId)) {
            throw new Error('Tenant ID can only contain letters, numbers, and hyphens');
        }

        if (tenantId.length < 2 || tenantId.length > 50) {
            throw new Error('Tenant ID must be between 2 and 50 characters');
        }
    }

    getValue(): string {
        return this.value;
    }

    equals(other: TenantId): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
