import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/AdminController';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import { CreateAdminUseCase } from '../../application/use-cases/adminUseCases/CreateAdminUseCase';
import { PrismaModule } from '../database/prisma.module';
import { TenantModule } from '../modules/tenant.module';
import { PrismaAdminRepository } from '../repositories/PrismaAdminRepository';
import { TenantContext } from '../context/TenantContext';
import { GetAllAdminsUseCase } from '../../application/use-cases/adminUseCases/GetAllAdminUseCase';
import { GetAdminByIdUseCase } from '../../application/use-cases/adminUseCases/GetAdminByIdUseCase';


export const ADMIN_REPOSITORY_TOKEN = 'ADMIN_REPOSITORY_TOKEN';
export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';
export const CREATE_ADMIN_USE_CASE_TOKEN = 'CREATE_ADMIN_USE_CASE_TOKEN';
export const GET_ALL_ADMINS_USE_CASE_TOKEN = 'GET_ALL_ADMINS_USE_CASE_TOKEN';
export const GET_ADMIN_BY_ID_USE_CASE_TOKEN = 'GET_ADMIN_BY_ID_USE_CASE_TOKEN'
@Module({
    imports: [PrismaModule, TenantModule],
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
        //Caso de uso crear admin
        {
            provide: CREATE_ADMIN_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new CreateAdminUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],

        },
        //Caso de uso obtener todos los admins
        {
            provide: GET_ALL_ADMINS_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new GetAllAdminsUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],

        },

        //Caso de uso obtener admin por id
        {
            provide: GET_ADMIN_BY_ID_USE_CASE_TOKEN,
            useFactory: (adminRepository, tenantContext) => {
                return new GetAdminByIdUseCase(adminRepository, tenantContext);
            },
            inject: [ADMIN_REPOSITORY_TOKEN, TenantContext],

        },
    ],
    exports: [
        ADMIN_REPOSITORY_TOKEN,
        ADMIN_LOGIN_USE_CASE_TOKEN,
        CREATE_ADMIN_USE_CASE_TOKEN,
        GET_ALL_ADMINS_USE_CASE_TOKEN,
        GET_ADMIN_BY_ID_USE_CASE_TOKEN
    ],
})
export class AdminModule { }
