import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { TenantRepository } from '../../core/domain/repositories/TenantRepository';
import { User } from '../../core/domain/entities/User';
import { TenantId } from '../../core/domain/value-objects/TenantId';
import { CreateUserInput, UserOutput } from '../interfaces/UserInterfaces';
import { v4 as uuidv4 } from 'uuid';

export class CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantRepository: TenantRepository // ← NUEVO: Para validar tenant
    ) { }

    async execute(input: CreateUserInput): Promise<UserOutput> {
        // ← NUEVO: Validar que el tenant existe y está activo
        const tenantId = new TenantId(input.tenantId);
        const tenant = await this.tenantRepository.findByTenantId(tenantId);

        if (!tenant) {
            throw new Error('Tenant does not exist');
        }

        if (!tenant.isActive) {
            throw new Error('Tenant is not active');
        }

        // ← MODIFICADO: Buscar usuario por email dentro del tenant
        const existingUser = await this.userRepository.findByEmail(input.email, tenantId);
        if (existingUser) {
            throw new Error('User with this email already exists in this tenant');
        }

        // ← NUEVO: Verificar límites del tenant (si están configurados)
        if (tenant.settings?.maxUsers) {
            const currentUserCount = await this.userRepository.countByTenant(tenantId);
            if (currentUserCount >= tenant.settings.maxUsers) {
                throw new Error(`Tenant has reached the maximum number of users (${tenant.settings.maxUsers})`);
            }
        }

        // ← MODIFICADO: Crear entidad con tenant
        const user = new User(
            uuidv4(),
            tenantId, // ← NUEVO: Asociar con tenant
            input.email,
            input.name,
            input.emailVerified ?? false,
            input.verificationToken ?? null,
            new Date(),
            new Date()
        );

        // Save through repository
        const savedUser = await this.userRepository.create(user);

        // Return application output
        return this.mapToOutput(savedUser);
    }

    private mapToOutput(user: User): UserOutput {
        return {
            id: user.id,
            tenantId: user.tenantId.getValue(), // ← NUEVO: Incluir tenant en output
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
