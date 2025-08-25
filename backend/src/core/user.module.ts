import { Module } from '@nestjs/common';
import { UserController } from '../presentation/controllers/UserController';
import { UserService, USER_REPOSITORY_TOKEN } from './application/services/UserService';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository';

@Module({
    imports: [PrismaModule],
    controllers: [UserController],
    providers: [
        UserService,
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: PrismaUserRepository,
        },
    ],
    exports: [UserService],
})
export class UserModule { }
