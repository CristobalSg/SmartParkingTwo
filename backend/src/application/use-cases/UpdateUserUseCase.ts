import { TenantContext } from '@/infrastructure/context/TenantContext';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { UpdateUserInput, UserOutput } from '../interfaces/UserInterfaces';

export class UpdateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(id: string, input: UpdateUserInput): Promise<UserOutput | null> {
        const tenantUuid = this.tenantContext.getTenantUuid();
        const existingUser = await this.userRepository.findById(id, tenantUuid);

        if (!existingUser) {
            throw new Error('User not found');
        }

        // Verificar que el usuario pertenece al tenant correcto
        if (!existingUser.belongsToTenant(tenantUuid)) {
            throw new Error('Access denied: User belongs to different tenant');
        }

        // Check if email is being updated and if it's already taken IN THE SAME TENANT
        if (input.email && input.email !== existingUser.email) {
            const userWithSameEmail = await this.userRepository.findByEmail(input.email, tenantUuid);
            if (userWithSameEmail) {
                throw new Error('Email already in use by another user in this tenant');
            }
        }

        // Update using repository
        const result = await this.userRepository.update(id, tenantUuid, {
            email: input.email,
            name: input.name,
            emailVerified: input.emailVerified,
            verificationToken: input.verificationToken,
            updatedAt: new Date(),
        });

        if (!result) {
            throw new Error('Failed to update user');
        }

        return {
            id: result.id,
            tenantUuid: result.tenantId, // ← CAMBIAR: result.tenantId es ahora UUID
            email: result.email,
            name: result.name,
            emailVerified: result.emailVerified,
            verificationToken: result.verificationToken,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}
