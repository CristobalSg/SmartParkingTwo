import { TenantId } from '../value-objects/TenantId';
import * as bcrypt from 'bcrypt';

export class Admin {
    constructor(
        readonly id: string,
        readonly tenantId: string, // UUID del tenant directamente
        readonly email: string,
        readonly passwordHash: string,
        readonly name: string,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {
        this.validateEmail(email);
        this.validateName(name);
        this.validateTenantId(tenantId);
        this.validatePasswordHash(passwordHash);
    }

    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Admin name cannot be empty');
        }
        if (name.length > 255) {
            throw new Error('Admin name cannot exceed 255 characters');
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

    private validatePasswordHash(passwordHash: string): void {
        if (!passwordHash || passwordHash.trim().length === 0) {
            throw new Error('Password hash cannot be empty');
        }
        // Bcrypt hashes start with $2a$, $2b$, or $2y$ and have a specific length
        // Just validate it's not empty, bcrypt will handle validation when comparing
    }

    // Verificar si el administrador pertenece a un tenant específico
    belongsToTenant(tenantUuid: string): boolean {
        return this.tenantId === tenantUuid;
    }

    // Para compatibilidad con TenantId value object
    belongsToTenantByTenantId(tenantId: TenantId, tenantUuid: string): boolean {
        return this.tenantId === tenantUuid;
    }

    // Cambiar email del administrador
    changeEmail(newEmail: string): Admin {
        return new Admin(
            this.id,
            this.tenantId,
            newEmail,
            this.passwordHash,
            this.name,
            this.createdAt,
            new Date()
        );
    }

    // Cambiar nombre del administrador
    changeName(newName: string): Admin {
        return new Admin(
            this.id,
            this.tenantId,
            this.email,
            this.passwordHash,
            newName,
            this.createdAt,
            new Date()
        );
    }

    // Cambiar contraseña del administrador
    changePassword(newPasswordHash: string): Admin {
        return new Admin(
            this.id,
            this.tenantId,
            this.email,
            newPasswordHash,
            this.name,
            this.createdAt,
            new Date()
        );
    }

    // Verificar si una contraseña coincide con el hash almacenado (async ahora con bcrypt)
    async verifyPassword(plainPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, this.passwordHash);
        } catch (error) {
            return false;
        }
    }

    // Método estático para crear un hash de contraseña (async ahora con bcrypt)
    static async hashPassword(plainPassword: string): Promise<string> {
        if (!plainPassword || plainPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Validaciones adicionales de seguridad de contraseña
        const hasUpperCase = /[A-Z]/.test(plainPassword);
        const hasLowerCase = /[a-z]/.test(plainPassword);
        const hasNumbers = /\d/.test(plainPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(plainPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }

        return await bcrypt.hash(plainPassword, 12);
    }

    // Método estático para crear un nuevo administrador (async ahora)
    static async create(
        id: string,
        tenantId: string,
        email: string,
        plainPassword: string,
        name: string
    ): Promise<Admin> {
        const passwordHash = await Admin.hashPassword(plainPassword);
        const now = new Date();

        return new Admin(
            id,
            tenantId,
            email,
            passwordHash,
            name,
            now,
            now
        );
    }

    // Convertir a objeto plano (para serialización)
    toPlainObject(): AdminPlainObject {
        return {
            id: this.id,
            tenantId: this.tenantId,
            email: this.email,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            // passwordHash NO se incluye por seguridad
        };
    }

    // Verificar si el administrador es válido para operaciones
    isValid(): boolean {
        try {
            this.validateEmail(this.email);
            this.validateName(this.name);
            this.validateTenantId(this.tenantId);
            this.validatePasswordHash(this.passwordHash);
            return true;
        } catch {
            return false;
        }
    }

    // Verificar si el administrador puede realizar acciones administrativas
    // (En el futuro se podrían agregar roles o permisos más específicos)
    canAdministrate(tenantUuid: string): boolean {
        return this.belongsToTenant(tenantUuid);
    }

    // Método para logging/auditoría (sin datos sensibles)
    getAuditInfo(): AdminAuditInfo {
        return {
            adminId: this.id,
            tenantId: this.tenantId,
            email: this.email,
            name: this.name,
        };
    }
}

// Tipos auxiliares
export interface AdminPlainObject {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminAuditInfo {
    adminId: string;
    tenantId: string;
    email: string;
    name: string;
}