import { TenantId } from '../value-objects/TenantId';

export class User {
    constructor(
        readonly id: string,
        readonly tenantId: string, // ← CAMBIAR: Usar UUID del tenant directamente
        readonly email: string,
        readonly name: string,
        readonly emailVerified: boolean,
        readonly verificationToken: string | null,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {
        this.validateEmail(email);
        this.validateName(name);
        this.validateTenantId(tenantId);
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('User name cannot be empty');
        }
        if (name.length > 255) {
            throw new Error('User name cannot exceed 255 characters');
        }
    }

    private validateTenantId(tenantId: string): void {
        if (!tenantId || tenantId.trim().length === 0) {
            throw new Error('Tenant ID cannot be empty');
        }
        // Validar que es un UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tenantId)) {
            throw new Error('Tenant ID must be a valid UUID');
        }
    }

    // ← ACTUALIZAR: Verificar si el usuario pertenece a un tenant específico
    belongsToTenant(tenantUuid: string): boolean {
        return this.tenantId === tenantUuid;
    }

    // Para compatibilidad con TenantId value object
    belongsToTenantByTenantId(tenantId: TenantId, tenantUuid: string): boolean {
        return this.tenantId === tenantUuid;
    }

    // ← NUEVO: Cambiar email del usuario
    changeEmail(newEmail: string): User {
        return new User(
            this.id,
            this.tenantId,
            newEmail,
            this.name,
            false, // Email cambió, necesita verificación
            null,  // Token de verificación se resetea
            this.createdAt,
            new Date()
        );
    }

    // ← NUEVO: Verificar email
    verifyEmail(): User {
        return new User(
            this.id,
            this.tenantId,
            this.email,
            this.name,
            true,
            null,
            this.createdAt,
            new Date()
        );
    }
}

