import { AdminRepository } from '../../../core/domain/repositories/AdminRepository';
import { Admin } from '../../../core/domain/entities/Admin';
import { AdminLoginInput, AdminAuthOutput, AdminOutput } from '../../interfaces/AdminInterfaces';
import { TenantContext } from '../../../infrastructure/context/TenantContext';
import { generateSimpleToken } from '../../../shared/utils/crypto-utils';

export class AdminLoginUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(input: AdminLoginInput): Promise<AdminAuthOutput> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.requireTenant();

        // Obtener el UUID del tenant (puede venir del input o del contexto)
        const tenantUuid = input.tenantUuid || tenant.id;

        // Validar input
        this.validateInput(input);

        // Buscar el administrador por email en el tenant específico
        const admin = await this.adminRepository.findByEmailForAuth(input.email, tenantUuid);

        if (!admin) {
            // Por seguridad, no especificar si el email existe o no
            throw new Error('Invalid email or password');
        }

        // Verificar que el administrador pertenece al tenant correcto
        if (!admin.belongsToTenant(tenantUuid)) {
            throw new Error('Invalid email or password');
        }

        // Verificar la contraseña
        const isPasswordValid = await admin.verifyPassword(input.password);

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Verificar que el administrador sea válido
        if (!admin.isValid()) {
            throw new Error('Administrator account is invalid');
        }

        // Verificar que puede administrar este tenant
        if (!admin.canAdministrate(tenantUuid)) {
            throw new Error('Administrator does not have permissions for this tenant');
        }

        // Generar token y respuesta de autenticación
        const authOutput = await this.generateAuthResponse(admin);

        return authOutput;
    }

    private validateInput(input: AdminLoginInput): void {
        if (!input.email || input.email.trim().length === 0) {
            throw new Error('Email is required');
        }

        if (!input.password || input.password.length === 0) {
            throw new Error('Password is required');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new Error('Invalid email format');
        }
    }

    private async generateAuthResponse(admin: Admin): Promise<AdminAuthOutput> {
        // TODO: Implementar generación de JWT token
        // Por ahora, generar un token simple para propósitos de desarrollo
        const token = this.generateSimpleToken(admin);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token válido por 24 horas

        return {
            admin: this.mapToAdminOutput(admin),
            token,
            expiresAt
        };
    }

    private generateSimpleToken(admin: Admin): string {
        // Usar la nueva utilidad crypto para generar tokens
        const payload = {
            adminId: admin.id,
            tenantId: admin.tenantId,
            email: admin.email,
        };

        return generateSimpleToken(payload);
    } private mapToAdminOutput(admin: Admin): AdminOutput {
        return {
            id: admin.id,
            tenantUuid: admin.tenantId,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            // passwordHash NO se incluye nunca
        };
    }
}
