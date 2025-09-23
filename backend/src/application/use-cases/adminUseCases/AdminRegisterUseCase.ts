import { AdminRepository } from '../../../core/domain/repositories/AdminRepository';
import { Admin } from '../../../core/domain/entities/Admin';
import { CreateAdminInput, AdminOutput } from '../../interfaces/AdminInterfaces';
import { TenantContext } from '../../../infrastructure/context/TenantContext';
import { hashPassword } from '../../../shared/utils/crypto-utils';

export class AdminRegisterUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext,
    ) { }

    async execute(input: CreateAdminInput): Promise<AdminOutput> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.requireTenant();

        // Obtener el UUID del tenant (siempre del contexto, ya que el middleware lo resuelve)
        const tenantUuid = tenant.id;

        // Validar input
        this.validateInput(input);

        // Verificar que el email no esté ya registrado en este tenant
        const existingAdmin = await this.adminRepository.existsByEmail(input.email, tenantUuid);
        if (existingAdmin) {
            throw new Error('Email already registered for this tenant');
        }

        // Generar hash de la contraseña
        const passwordHash = await hashPassword(input.password);

        // Crear el administrador con ID generado por crypto.randomUUID()
        const admin = new Admin(
            crypto.randomUUID(), // Generate proper UUID
            tenantUuid, // tenantId
            input.email,
            passwordHash,
            input.name,
            new Date(), // createdAt
            new Date(), // updatedAt
        );

        // Guardar en el repositorio
        const savedAdmin = await this.adminRepository.create(admin);

        // Retornar la salida
        return this.mapToAdminOutput(savedAdmin);
    }

    private validateInput(input: CreateAdminInput): void {
        if (!input.email || input.email.trim().length === 0) {
            throw new Error('Email is required');
        }

        if (!input.password || input.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        if (!input.name || input.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new Error('Invalid email format');
        }
    }

    private mapToAdminOutput(admin: Admin): AdminOutput {
        return {
            id: admin.id,
            tenantUuid: admin.tenantId,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
        };
    }
}
