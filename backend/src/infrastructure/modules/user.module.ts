import { Module } from '@nestjs/common';
import { UserController } from '../../presentation/controllers/UserController';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { PrismaModule } from '../database/prisma.module';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaTenantRepository } from '../repositories/PrismaTenantRepository';
import { TenantContext } from '../context/TenantContext';

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';
export const TENANT_REPOSITORY_TOKEN = 'TENANT_REPOSITORY_TOKEN';
export const USER_APPLICATION_SERVICE_TOKEN = 'USER_APPLICATION_SERVICE_TOKEN';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [
        // Repositorios
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: PrismaUserRepository,
        },
        {
            provide: TENANT_REPOSITORY_TOKEN,
            useClass: PrismaTenantRepository,
        },
        // Servicio de aplicación con inyección correcta
        {
            provide: USER_APPLICATION_SERVICE_TOKEN,
            useFactory: (userRepository, tenantContext) => {
                return new UserApplicationService(userRepository, tenantContext);
            },
            inject: [USER_REPOSITORY_TOKEN, TenantContext], // ← Usar la clase directamente
        },
    ],
    exports: [USER_APPLICATION_SERVICE_TOKEN],
})
export class UserModule { }
