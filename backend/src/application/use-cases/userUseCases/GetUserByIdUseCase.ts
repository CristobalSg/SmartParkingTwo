import { TenantContext } from '@/infrastructure/context/TenantContext';
import { UserRepository } from '@/core/domain/repositories/UserRepository';
import { UserOutput } from '../../interfaces/UserInterfaces';

export class GetUserByIdUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(id: string): Promise<UserOutput | null> {
        const tenantUuid = this.tenantContext.getTenantUuid();
        const user = await this.userRepository.findById(id, tenantUuid);

        if (!user) {
            return null;
        }

        // Verificar que el usuario pertenece al tenant correcto (doble validación)
        if (!user.belongsToTenant(tenantUuid)) {
            return null; // Usuario no pertenece al tenant actual
        }

        return {
            id: user.id,
            tenantUuid: user.tenantId, // ← CAMBIAR: user.tenantId es ahora UUID
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
