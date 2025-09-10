import { AdminRepository } from '@/core/domain/repositories/AdminRepository';
import { Admin } from "@/core/domain/entities/Admin";
import { ChangeAdminPasswordInput } from '../../interfaces/AdminInterfaces';
import { TenantContext } from '@/infrastructure/context/TenantContext';

export class ChangeAdminPasswordUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(adminId: string, input: ChangeAdminPasswordInput): Promise<boolean> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.requireTenant();

        // Validar input
        this.validateInput(input);

        // Buscar admin
        const admin = await this.adminRepository.findByIdForAuth(adminId, tenant.id);
        if (!admin) {
            throw new Error('Administrator not found');
        }

        // Verificar contraseña actual
        const isCurrentPasswordValid = admin.verifyPassword(input.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Generar hash de nueva contraseña
        const newPasswordHash = Admin.hashPassword(input.newPassword);

        // Actualizar contraseña
        const updatedAdmin = await this.adminRepository.updatePassword(adminId, tenant.id, newPasswordHash);

        return updatedAdmin !== null;
    }

    private validateInput(input: ChangeAdminPasswordInput): void {
        if (!input.currentPassword || input.currentPassword.length === 0) {
            throw new Error('Current password is required');
        }

        if (!input.newPassword || input.newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters long');
        }

        if (input.currentPassword === input.newPassword) {
            throw new Error('New password must be different from current password');
        }
    }
}