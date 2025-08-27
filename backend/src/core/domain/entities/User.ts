import { TenantId } from '../value-objects/TenantId';

export class User {
    constructor(
        readonly id: string,
        readonly tenantId: TenantId, // ← NUEVO: Asociación con tenant
        readonly email: string,
        readonly name: string,
        readonly emailVerified: boolean,
        readonly verificationToken: string | null,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {
        this.validateEmail(email);
        this.validateName(name);
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

    // ← NUEVO: Verificar si el usuario pertenece a un tenant específico
    belongsToTenant(tenantId: TenantId): boolean {
        return this.tenantId.equals(tenantId);
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

