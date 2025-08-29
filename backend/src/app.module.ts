import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserModule } from './infrastructure/modules/user.module';
import { TenantModule } from './infrastructure/modules/tenant.module';
import { TenantMiddleware } from './infrastructure/middleware/TenantMiddleware';

@Module({
    imports: [
        TenantModule, // ← Módulo global para TenantContext
        UserModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .forRoutes('*'); // Aplicar a todas las rutas
    }
}