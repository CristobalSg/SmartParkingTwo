import { AdminRepository } from '../../../core/domain/repositories/AdminRepository';
import { Admin } from '../../../core/domain/entities/Admin';
import { AdminLoginInput, AdminAuthOutput, AdminOutput } from '../../interfaces/AdminInterfaces';
import { TenantContext } from '../../../infrastructure/context/TenantContext';
import { generateSecureId, generateSimpleToken, generateRefreshToken } from '../../../shared/utils/crypto-utils';
import { AuthenticationEventEmitter } from '@/core/domain/events/AuthenticationEventEmitter';

export class AdminLoginUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext,
            private readonly authEventEmitter: AuthenticationEventEmitter,

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
        const isPasswordValid = admin.verifyPassword(input.password);

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

        this.authEventEmitter.notifyAdminLogin(admin);
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
        const expiresInSeconds = 24 * 60 * 60; // 24 horas
        const expiresAt = new Date(Date.now() + (expiresInSeconds * 1000));

        // Generar tokens mejorados
        const accessToken = this.generateSimpleToken(admin);
        const refreshToken = generateRefreshToken({
            adminId: admin.id,
            tenantId: admin.tenantId,
            email: admin.email
        });

        return {
            admin: this.mapToAdminOutput(admin),
            authentication: {
                access_token: accessToken,
                token_type: "Bearer",
                expires_in: expiresInSeconds,
                expires_at: expiresAt.toISOString(),
                scope: this.getAdminScope(admin),
                refresh_token: refreshToken
            },
            session: {
                session_id: generateSecureId(),
                login_time: new Date().toISOString(),
                // ip_address se puede capturar del request
            }
        };
    }

    private getAdminScope(admin: Admin): string {
        // Definir scope basado en el rol del admin y su tenant
        const baseScope = "admin:full read:all write:all";
        const tenantScope = `tenant:${admin.tenantId}`;
        return `${baseScope} ${tenantScope}`;
    }

    private generateSimpleToken(admin: Admin): string {
        // Usar la nueva utilidad crypto para generar tokens
        const payload = {
            sub: admin.id,
            tenantId: admin.tenantId,
            email: admin.email,
            role: "admin",
            permission: ["read", "write", "admin"],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400,
            jti: generateSecureId(),
            scope: "admin:full"
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
