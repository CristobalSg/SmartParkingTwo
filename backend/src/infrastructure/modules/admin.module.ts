import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { PrismaModule } from '../database/prisma.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';
import { AuthenticationEventEmitter } from '../../core/domain/events/AuthenticationEventEmitter';
import { AdminLoginLogger } from '../../application/services/AdminLoginLogger';

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
        // Event Emitter para autenticación
        {
            provide: AuthenticationEventEmitter,
            useFactory: () => {
                const emitter = new AuthenticationEventEmitter();
                emitter.addObserver(new AdminLoginLogger()); // Registrar el observador
                return emitter;
            },
        },
        // Caso de uso de login
        {
            provide: ADMIN_LOGIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext, authEventEmitter) => {
                return new AdminLoginUseCase(adminRepository, tenantContext, authEventEmitter);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext, AuthenticationEventEmitter],
        },
    ],
    exports: [ADMIN_REPOSITORY_TOKEN, ADMIN_LOGIN_USE_CASE_TOKEN],
})
export class AdminModule { }