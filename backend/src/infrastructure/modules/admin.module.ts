import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { AdminRegisterUseCase } from '../../application/use-cases/adminUseCases/AdminRegisterUseCase';
import { PrismaModule } from '../database/prisma.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';
import { AuthenticationEventEmitter } from '../../core/domain/events/AuthenticationEventEmitter';
import { AdminLoginLogger } from '../../application/services/AdminLoginLogger';
import { SimpleEmailService } from '../adapters/SimpleEmailService';

export const ADMIN_REPOSITORY_TOKEN = 'ADMIN_REPOSITORY_TOKEN';
export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';
export const ADMIN_REGISTER_USE_CASE_TOKEN = 'ADMIN_REGISTER_USE_CASE_TOKEN';
export const EMAIL_SERVICE_TOKEN = 'EMAIL_SERVICE_TOKEN';

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
        // 📧 Servicio de Email con Brevo
        {
            provide: EMAIL_SERVICE_TOKEN,
            useClass: SimpleEmailService,
        },
        // Caso de uso de login
        {
            provide: ADMIN_LOGIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext, authEventEmitter, emailService) => {
                return new AdminLoginUseCase(adminRepository, tenantContext, authEventEmitter, emailService);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext, AuthenticationEventEmitter, EMAIL_SERVICE_TOKEN],
        },
        // Caso de uso de registro
        {
            provide: ADMIN_REGISTER_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new AdminRegisterUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
    ],
    exports: [ADMIN_REPOSITORY_TOKEN, ADMIN_LOGIN_USE_CASE_TOKEN, ADMIN_REGISTER_USE_CASE_TOKEN],
})
export class AdminModule { }