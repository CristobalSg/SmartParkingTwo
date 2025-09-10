import { AdminRepository } from '@/core/domain/repositories/AdminRepository';
import { Admin } from '@/core/domain/entities/Admin';
import { UpdateAdminInput, AdminOutput } from '../../interfaces/AdminInterfaces';
import { TenantContext } from '@/infrastructure/context/TenantContext';

export class UpdateAdminUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(adminId: string, input: UpdateAdminInput): Promise<AdminOutput> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.requireTenant();

        // Validar input básico
        if (!adminId || adminId.trim().length === 0) {
            throw new Error('Admin ID is required');
        }

        this.validateInput(input);

        // Verificar que el admin existe
        const existingAdmin = await this.adminRepository.findById(adminId, tenant.id);
        if (!existingAdmin) {
            throw new Error('Administrator not found');
        }

        // Si se está cambiando el email, verificar que no esté en uso
        if (input.email && input.email !== existingAdmin.email) {
            const emailExists = await this.adminRepository.findByEmail(input.email, tenant.id);
            if (emailExists) {
                throw new Error('Email already in use by another administrator');
            }
        }

        // Actualizar
        const updatedAdmin = await this.adminRepository.update(adminId, tenant.id, input);

        if (!updatedAdmin) {
            throw new Error('Failed to update administrator');
        }

        return this.mapToAdminOutput(updatedAdmin);
    }

    private validateInput(input: UpdateAdminInput): void {
        if (input.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                throw new Error('Invalid email format');
            }
        }

        if (input.name && input.name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
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