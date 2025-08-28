import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantRepository } from '../../core/domain/repositories/TenantRepository';
import { Tenant } from '../../core/domain/entities/Tenant';
import { TenantId } from '../../core/domain/value-objects/TenantId';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenant: Tenant): Promise<Tenant> {
        const createdTenant = await this.prisma.tenant.create({
            data: {
                id: tenant.id, // UUID
                tenantId: tenant.tenantId.getValue(), // tenant identifier string
                name: tenant.name,
                domain: tenant.domain,
                isActive: tenant.isActive,
                settings: tenant.settings ? JSON.stringify(tenant.settings) : null,
                createdAt: tenant.createdAt,
                updatedAt: tenant.updatedAt,
            }
        });

        return new Tenant(
            createdTenant.id,
            new TenantId(createdTenant.tenantId),
            createdTenant.name,
            createdTenant.domain,
            createdTenant.isActive,
            createdTenant.createdAt,
            createdTenant.updatedAt,
            createdTenant.settings ? JSON.parse(createdTenant.settings as string) : undefined
        );
    }

    async findAll(): Promise<Tenant[]> {
        const tenants = await this.prisma.tenant.findMany({
            where: { isActive: true }
        });

        return tenants.map(tenant => new Tenant(
            tenant.id,
            new TenantId(tenant.tenantId),
            tenant.name,
            tenant.domain,
            tenant.isActive,
            tenant.createdAt,
            tenant.updatedAt,
            tenant.settings ? JSON.parse(tenant.settings as string) : undefined
        ));
    }

    async findById(id: string): Promise<Tenant | null> {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id }
        });

        if (!tenant) return null;

        return new Tenant(
            tenant.id,
            new TenantId(tenant.tenantId),
            tenant.name,
            tenant.domain,
            tenant.isActive,
            tenant.createdAt,
            tenant.updatedAt,
            tenant.settings ? JSON.parse(tenant.settings as string) : undefined
        );
    }

    async findByTenantId(tenantId: TenantId): Promise<Tenant | null> {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                tenantId: tenantId.getValue(),
                isActive: true
            }
        });

        if (!tenant) return null;

        return new Tenant(
            tenant.id,
            new TenantId(tenant.tenantId),
            tenant.name,
            tenant.domain,
            tenant.isActive,
            tenant.createdAt,
            tenant.updatedAt,
            tenant.settings ? JSON.parse(tenant.settings as string) : undefined
        );
    }

    async findByDomain(domain: string): Promise<Tenant | null> {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                domain,
                isActive: true
            }
        });

        if (!tenant) return null;

        return new Tenant(
            tenant.id,
            new TenantId(tenant.tenantId),
            tenant.name,
            tenant.domain,
            tenant.isActive,
            tenant.createdAt,
            tenant.updatedAt,
            tenant.settings ? JSON.parse(tenant.settings as string) : undefined
        );
    }

    async update(id: string, data: Partial<Omit<Tenant, 'id' | 'createdAt'>>): Promise<Tenant | null> {
        try {
            const updateData: any = {};

            if (data.name !== undefined) updateData.name = data.name;
            if (data.domain !== undefined) updateData.domain = data.domain;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;
            if (data.settings !== undefined) {
                updateData.settings = data.settings ? JSON.stringify(data.settings) : null;
            }
            if (data.tenantId !== undefined) {
                updateData.tenantId = data.tenantId.getValue();
            }

            updateData.updatedAt = new Date();

            const updatedTenant = await this.prisma.tenant.update({
                where: { id },
                data: updateData
            });

            return new Tenant(
                updatedTenant.id,
                new TenantId(updatedTenant.tenantId),
                updatedTenant.name,
                updatedTenant.domain,
                updatedTenant.isActive,
                updatedTenant.createdAt,
                updatedTenant.updatedAt,
                updatedTenant.settings ? JSON.parse(updatedTenant.settings as string) : undefined
            );
        } catch (error) {
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Soft delete - marcar como inactivo en lugar de eliminar
            await this.prisma.tenant.update({
                where: { id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async activate(id: string): Promise<boolean> {
        try {
            await this.prisma.tenant.update({
                where: { id },
                data: {
                    isActive: true,
                    updatedAt: new Date()
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async deactivate(id: string): Promise<boolean> {
        try {
            await this.prisma.tenant.update({
                where: { id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
