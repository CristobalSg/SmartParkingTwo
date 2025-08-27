import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantId } from '../../core/domain/value-objects/TenantId';
import { TenantContext } from '../context/TenantContext';

// Extender el Request para incluir tenant
declare module 'express' {
    interface Request {
        tenant?: TenantId;
    }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);

    constructor(private readonly tenantContext: TenantContext) { }

    use(req: Request, res: Response, next: NextFunction) {
        try {
            let tenantId: TenantId | null = null;

            // Estrategia 1: Por subdominio (empresa-a.smartparking.com)
            const host = req.get('host');
            if (host) {
                const subdomain = host.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
                    tenantId = new TenantId(subdomain);
                    this.logger.log(`Tenant extracted from subdomain: ${subdomain}`);
                }
            }

            // Estrategia 2: Por header X-Tenant-ID (para desarrollo/testing)
            if (!tenantId) {
                const tenantHeader = req.get('X-Tenant-ID');
                if (tenantHeader) {
                    tenantId = new TenantId(tenantHeader);
                    this.logger.log(`Tenant extracted from header: ${tenantHeader}`);
                }
            }

            // Estrategia 3: Por path parameter (para algunos endpoints específicos)
            if (!tenantId && req.params.tenantId) {
                tenantId = new TenantId(req.params.tenantId);
                this.logger.log(`Tenant extracted from path: ${req.params.tenantId}`);
            }

            // Si no se encontró tenant y no es una ruta pública
            if (!tenantId && !this.isPublicRoute(req.path)) {
                this.logger.error(`No tenant found for request: ${req.method} ${req.path}`);
                throw new BadRequestException({
                    message: 'Tenant information is required',
                    code: 'TENANT_REQUIRED',
                    details: 'Please provide tenant information via subdomain, X-Tenant-ID header, or path parameter'
                });
            }

            // Configurar el contexto si se encontró un tenant
            if (tenantId) {
                req.tenant = tenantId;
                this.tenantContext.setTenantId(tenantId);
            }

            next();
        } catch (error) {
            this.logger.error(`Tenant middleware error: ${error.message}`);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException({
                message: 'Invalid tenant information',
                code: 'INVALID_TENANT',
                details: error.message
            });
        }
    }

    // Rutas que no requieren tenant (health check, docs, etc.)
    private isPublicRoute(path: string): boolean {
        const publicRoutes = [
            '/health',
            '/api/health',
            '/docs',
            '/api/docs',
            '/api-docs',
            '/swagger',
            '/favicon.ico'
        ];

        return publicRoutes.some(route => path.startsWith(route));
    }
}
