import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { AdminRegisterUseCase } from '../../application/use-cases/adminUseCases/AdminRegisterUseCase';
import { PrismaModule } from '../database/prisma.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

export const ADMIN_REPOSITORY_TOKEN = 'ADMIN_REPOSITORY_TOKEN';
export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';
export const ADMIN_REGISTER_USE_CASE_TOKEN = 'ADMIN_REGISTER_USE_CASE_TOKEN';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [AdminController],
    providers: [
        // Repositorio de administradores
        {
            provide: ADMIN_REPOSITORY_TOKEN,
            useClass: PrismaAdminRepository,
        },
        // Caso de uso de login
        {
            provide: ADMIN_LOGIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext, authService) => {
                return new AdminLoginUseCase(adminRepository, tenantContext, authService);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext, AuthService],
        },
        {
            provide: ADMIN_REGISTER_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext, authService) => {
                return new AdminRegisterUseCase(adminRepository, tenantContext, authService);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext, AuthService],
        },
    ],
    exports: [ADMIN_REPOSITORY_TOKEN, ADMIN_LOGIN_USE_CASE_TOKEN, ADMIN_REGISTER_USE_CASE_TOKEN],
})
export class AdminModule { }
