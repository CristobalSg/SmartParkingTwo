import { TenantContext } from '@/infrastructure/context/TenantContext';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { UserOutput } from '../interfaces/UserInterfaces';

export class GetAllUsersUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(): Promise<UserOutput[]> {
        const tenantId = this.tenantContext.getTenantUuid();
        const users = await this.userRepository.findAll(tenantId);
        return users.map(user => ({
            id: user.id,
            tenantUuid: user.tenantId, // ← CAMBIAR: tenantId es ahora UUID
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}
