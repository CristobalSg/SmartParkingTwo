import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { PrismaModule } from '../database/prisma.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';

export const ADMIN_REPOSITORY_TOKEN = 'ADMIN_REPOSITORY_TOKEN';
export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';

@Module({
    imports: [PrismaModule],
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
            useFactory: (adminRepository, tenantContext) => {
                return new AdminLoginUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
    ],
    exports: [ADMIN_REPOSITORY_TOKEN, ADMIN_LOGIN_USE_CASE_TOKEN],
})
export class AdminModule { }
