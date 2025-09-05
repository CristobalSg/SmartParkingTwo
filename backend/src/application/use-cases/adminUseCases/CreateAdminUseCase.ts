import { AdminRepository } from "../../../core/domain/repositories/AdminRepository";
import { TenantContext } from "../../../infrastructure/context/TenantContext";
import { Admin } from "../../../core/domain/entities/Admin";
import { CreateAdminInput, AdminOutput } from "../../../application/interfaces/AdminInterfaces";
import { randomUUID } from 'crypto';

export class CreateAdminUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(input: CreateAdminInput): Promise<AdminOutput> {
        const contextTenant = this.tenantContext.requireTenant();

        if (input.tenantUuid !== contextTenant.id) {
            throw new Error('Tenant mismatch: Cannot create admin for different tenant');
        }
        // Validar input
        this.validateInput(input);

        // Verificar que no exista un admin con el mismo email en el tenant
        const existingAdmin = await this.adminRepository.findByEmail(input.email, input.tenantUuid);
        if (existingAdmin) {
            throw new Error('Administrator with this email already exists in this tenant');
        }

        // Crear nueva entidad Admin
        const admin = Admin.create(
            randomUUID(),
            input.tenantUuid,
            input.email,
            input.password,
            input.name
        );

        // Guardar en repositorio
        const savedAdmin = await this.adminRepository.create(admin);

        return this.mapToAdminOutput(savedAdmin);
    }

    private validateInput(input: CreateAdminInput): void {
        if (!input.tenantUuid || input.tenantUuid.trim().length === 0) {
            throw new Error('TenantUuid is required');
        }

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

