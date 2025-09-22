import { TenantContext } from '@/infrastructure/context/TenantContext';
import { UserRepository } from '@/core/domain/repositories/UserRepository';

export class DeleteUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(id: string): Promise<boolean> {
        const tenantUuid = this.tenantContext.getTenantUuid();
        const existingUser = await this.userRepository.findById(id, tenantUuid);

        if (!existingUser) {
            throw new Error('User not found');
        }

        // Verificar que el usuario pertenece al tenant correcto
        if (!existingUser.belongsToTenant(tenantUuid)) {
            throw new Error('Access denied: User belongs to different tenant');
        }

        return await this.userRepository.delete(id, tenantUuid);
    }
}
