import { BadRequestException, Injectable, Logger, NestMiddleware, Inject } from "@nestjs/common";
import { TenantContext } from "../context/TenantContext";
import { TenantRepository } from "@/core/domain/repositories/TenantRepository";
import { NextFunction, Request, Response } from "express";
import { TenantId } from "@/core/domain/value-objects/TenantId";

declare module 'express' { interface Request { tenant?: TenantId; } }

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TenantMiddleware.name);

    constructor(
        private readonly tenantContext: TenantContext,
        @Inject('TenantRepository')
        private readonly tenantRepository: TenantRepository // inyectar el repo
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            let tenantId: TenantId | null = null;

            // --- Estrategia 1: Subdominio
            const host = req.get('host');
            if (host) {
                const subdomain = host.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'api' && !subdomain.includes('localhost')) {
                    tenantId = new TenantId(subdomain);
                    this.logger.log(`Tenant extracted from subdomain: ${subdomain}`);
                }
            }

            // --- Estrategia 2: Header
            if (!tenantId) {
                const tenantHeader = req.get('X-Tenant-ID');
                if (tenantHeader) {
                    tenantId = new TenantId(tenantHeader);
                    this.logger.log(`Tenant extracted from header: ${tenantHeader}`);
                }
            }

            // --- Estrategia 3: Path param
            if (!tenantId && req.params.tenantId) {
                tenantId = new TenantId(req.params.tenantId);
                this.logger.log(`Tenant extracted from path: ${req.params.tenantId}`);
            }

            // --- Validación
            if (!tenantId && !this.isPublicRoute(req.path)) {
                this.logger.error(`No tenant found for request: ${req.method} ${req.path}`);
                throw new BadRequestException({
                    message: 'Tenant information is required',
                    code: 'TENANT_REQUIRED',
                    details: 'Please provide tenant information via subdomain, X-Tenant-ID header, or path parameter'
                });
            }

            // --- Cargar el Tenant de la base
            if (tenantId) {
                const tenant = await this.tenantRepository.findByTenantId(tenantId);
                this.logger.log(`Tenant ${tenant.tenantId.toString()} loaded from repository`);
                if (!tenant) {
                    throw new BadRequestException({
                        message: 'Tenant not found',
                        code: 'TENANT_NOT_FOUND',
                        details: `No tenant exists with id ${tenantId.toString()}`
                    });
                }

                if (!tenant.isActive) {
                    throw new BadRequestException({
                        message: 'Tenant is inactive',
                        code: 'TENANT_INACTIVE',
                        details: `Tenant ${tenantId.toString()} is deactivated`
                    });
                }
                req.tenant = tenantId;
                // Guardar en contexto
                this.tenantContext.setTenant(tenant);
                this.logger.log(`Tenant ${this.tenantContext.requireTenant().tenantId.toString()} loaded and set in context`);
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
