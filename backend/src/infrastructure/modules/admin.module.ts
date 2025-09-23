import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { AdminRegisterUseCase } from '../../application/use-cases/adminUseCases/AdminRegisterUseCase';
import { CreateAdminUseCase } from '../../application/use-cases/adminUseCases/CreateAdminUseCase';
import { PrismaModule } from '../database/prisma.module';
import { TenantModule } from '../modules/tenant.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';
import { GetAllAdminsUseCase } from '../../application/use-cases/adminUseCases/GetAllAdminUseCase';
import { GetAdminByIdUseCase } from '../../application/use-cases/adminUseCases/GetAdminByIdUseCase';
import { UpdateAdminUseCase } from '../../application/use-cases/adminUseCases/UpdateAdminUseCase';
import { ChangeAdminPasswordUseCase } from '../../application/use-cases/adminUseCases/ChangeAdminPasswordUseCase';
import { AuthenticationEventEmitter } from '../../core/domain/events/AuthenticationEventEmitter';
import { AdminLoginLogger } from '../../application/services/AdminLoginLogger';
import { SimpleEmailService } from '../adapters/SimpleEmailService';

export const ADMIN_REPOSITORY_TOKEN = 'ADMIN_REPOSITORY_TOKEN';
export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';
export const ADMIN_REGISTER_USE_CASE_TOKEN = 'ADMIN_REGISTER_USE_CASE_TOKEN';
export const EMAIL_SERVICE_TOKEN = 'EMAIL_SERVICE_TOKEN';
export const CREATE_ADMIN_USE_CASE_TOKEN = 'CREATE_ADMIN_USE_CASE_TOKEN';
export const GET_ALL_ADMINS_USE_CASE_TOKEN = 'GET_ALL_ADMINS_USE_CASE_TOKEN';
export const GET_ADMIN_BY_ID_USE_CASE_TOKEN = 'GET_ADMIN_BY_ID_USE_CASE_TOKEN';
export const UPDATE_ADMIN_USE_CASE_TOKEN = 'UPDATE_ADMIN_USE_CASE_TOKEN';
export const CHANGE_ADMIN_PASSWORD_USE_CASE_TOKEN = 'CHANGE_ADMIN_PASSWORD_USE_CASE_TOKEN';

@Module({
    imports: [PrismaModule, TenantModule],
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
        // Caso de uso crear admin
        {
            provide: CREATE_ADMIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new CreateAdminUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
        // Caso de uso obtener todos los admins
        {
            provide: GET_ALL_ADMINS_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new GetAllAdminsUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
        // Caso de uso obtener admin por id
        {
            provide: GET_ADMIN_BY_ID_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new GetAdminByIdUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
        // Caso de uso actualizar admin
        {
            provide: UPDATE_ADMIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new UpdateAdminUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
        // Change password use case
        {
            provide: CHANGE_ADMIN_PASSWORD_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new ChangeAdminPasswordUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],
        },
    ],
    exports: [
        ADMIN_REPOSITORY_TOKEN,
        ADMIN_LOGIN_USE_CASE_TOKEN,
        ADMIN_REGISTER_USE_CASE_TOKEN,
        CREATE_ADMIN_USE_CASE_TOKEN,
        GET_ALL_ADMINS_USE_CASE_TOKEN,
        GET_ADMIN_BY_ID_USE_CASE_TOKEN,
        UPDATE_ADMIN_USE_CASE_TOKEN,
        CHANGE_ADMIN_PASSWORD_USE_CASE_TOKEN
    ],
})
export class AdminModule { }