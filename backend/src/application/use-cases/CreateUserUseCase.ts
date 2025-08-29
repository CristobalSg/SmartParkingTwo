import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { User } from '../../core/domain/entities/User';
import { CreateUserInput, UserOutput } from '../interfaces/UserInterfaces';
import { v4 as uuidv4 } from 'uuid';
import { TenantContext } from '@/infrastructure/context/TenantContext';

export class CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(input: CreateUserInput): Promise<UserOutput> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.getTenant();
        const tenantUuid = input.tenantUuid; // UUID del input

        if (!tenant || !tenant.isActive) {
            throw new Error(`Tenant ${tenant.tenantId.getValue() || 'unknown'} does not exist or is inactive`);
        }

        // El tenantId (value object) para verificaciones de repositorio
        const tenantId = tenant.tenantId;

        // Verificar que no existe un usuario con este email en el tenant
        const existingUser = await this.userRepository.findByEmail(input.email, tenantUuid);

        if (existingUser) {
            throw new Error(`User with email ${input.email} already exists in tenant ${tenantId.getValue()}`);
        }

        // Opcional: Verificar límites del tenant (número máximo de usuarios)
        const userCount = await this.userRepository.countByTenant(tenantUuid);
        if (tenant.settings?.maxUsers && userCount >= tenant.settings.maxUsers) {
            throw new Error(`Tenant ${tenantId.getValue()} has reached the maximum number of users (${tenant.settings.maxUsers})`);
        }

        // Crear la entidad User usando el UUID del tenant
        const user = new User(
            uuidv4(),
            input.tenantUuid, // ← USAR UUID directamente del input
            input.email,
            input.name,
            input.emailVerified ?? false,
            input.verificationToken ?? null,
            new Date(),
            new Date()
        );

        // Guardar en el repository
        const savedUser = await this.userRepository.create(user);

        // Convertir a UserOutput
        return this.mapToOutput(savedUser);
    }

    private mapToOutput(user: User): UserOutput {
        return {
            id: user.id,
            tenantUuid: user.tenantId, // ← CAMBIAR: UUID del tenant
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
