import { Module, Global } from '@nestjs/common';
import { TenantContext } from '../context/TenantContext';
import { PrismaTenantRepository } from '../repositories/PrismaTenantRepository';
import { PrismaModule } from '../database/prisma.module';

@Global() // ← Hace que este módulo esté disponible globalmente
@Module({
    imports: [PrismaModule], // ← Importar PrismaModule para usar PrismaService
    providers: [
        TenantContext,
        {
            provide: 'TenantRepository',
            useClass: PrismaTenantRepository,
        },
    ],
    exports: [TenantContext, 'TenantRepository'],
})
export class TenantModule { }