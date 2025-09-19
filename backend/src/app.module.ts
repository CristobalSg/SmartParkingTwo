import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { TenantModule } from './infrastructure/modules/tenant.module'
import { AdminModule } from './infrastructure/modules/admin.module'
import { TenantMiddleware } from './infrastructure/middleware/TenantMiddleware'

@Module({
    imports: [
        TenantModule, // ← Módulo global para TenantContext
        AdminModule, // ← Nuevo módulo de administradores
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