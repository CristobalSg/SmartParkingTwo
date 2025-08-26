import { Module } from '@nestjs/common';
import { UserController } from '../../presentation/controllers/UserController';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { PrismaModule } from '../database/prisma.module';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { USER_APPLICATION_SERVICE_TOKEN } from '../../presentation/controllers/UserController';

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: PrismaUserRepository,
        },
        {
            provide: USER_APPLICATION_SERVICE_TOKEN,
            useFactory: (userRepository) => {
                return new UserApplicationService(userRepository);
            },
            inject: [USER_REPOSITORY_TOKEN],
        },
    ],
    exports: [USER_APPLICATION_SERVICE_TOKEN],
})
export class UserModule { }
