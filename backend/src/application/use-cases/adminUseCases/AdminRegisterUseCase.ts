import { AdminRepository } from '../../../core/domain/repositories/AdminRepository';
import { Admin } from '../../../core/domain/entities/Admin';
import { TenantContext } from '../../../infrastructure/context/TenantContext';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

export class AdminRegisterUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext,
        private readonly authService: AuthService
    ) { }

    async execute(input: {
        email: string;
        password: string;
        name: string;
        tenantUuid: string;
    }): Promise<{ admin: any }> {
        // Validar que el email no exista
        const existingAdmin = await this.adminRepository.findByEmailForAuth(
            input.email,
            input.tenantUuid
        );

        if (existingAdmin) {
            throw new Error('Email already registered');
        }

        // Crear nuevo admin (el método create ya hashea la password internamente)
        const newAdmin = await Admin.create(
            uuidv4(),
            input.tenantUuid,
            input.email,
            input.password,
            input.name
        );

        // Guardar en la base de datos
        const savedAdmin = await this.adminRepository.create(newAdmin);

        return {
            admin: {
                id: savedAdmin.id,
                email: savedAdmin.email,
                name: savedAdmin.name,
                tenantUuid: savedAdmin.tenantId
            }
        };
    }
}