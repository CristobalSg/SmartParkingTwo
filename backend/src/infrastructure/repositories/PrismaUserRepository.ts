import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { User } from '../../core/domain/entities/User';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(user: User): Promise<User> {
        console.log(`Creating user for tenant: ${user.tenantId}`);
        const createdUser = await this.prisma.user.create({
            data: {
                id: user.id,
                tenantId: user.tenantId, // ← user.tenantId ya es UUID
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                verificationToken: user.verificationToken,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });

        return new User(
            createdUser.id,
            createdUser.tenantId, // ← Pasar UUID directamente
            createdUser.email,
            createdUser.name,
            createdUser.emailVerified,
            createdUser.verificationToken,
            createdUser.createdAt,
            createdUser.updatedAt
        );
    }

    async findAll(tenantId: string): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                tenantId: tenantId // ← Usar getValue() del TenantId
            }
        });

        return users.map(user => new User(
            user.id,
            user.tenantId, // ← Pasar UUID directamente
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        ));
    }

    async findById(id: string, tenantId: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                id,
                tenantId: tenantId // ← Usar getValue() del TenantId
            }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.tenantId, // ← Pasar UUID directamente
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        );
    }

    async findByEmail(email: string, tenantId: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                tenantId: tenantId // ← Usar getValue() del TenantId
            }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.tenantId, // ← Pasar UUID directamente
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        );
    }

    async update(id: string, tenantId: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'tenantId'>>): Promise<User | null> {
        try {
            const updatedUser = await this.prisma.user.update({
                where: {
                    id,
                    tenantId: tenantId // ← Usar getValue() del TenantId
                },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });

            return new User(
                updatedUser.id,
                updatedUser.tenantId, // ← Pasar UUID directamente
                updatedUser.email,
                updatedUser.name,
                updatedUser.emailVerified,
                updatedUser.verificationToken,
                updatedUser.createdAt,
                updatedUser.updatedAt
            );
        } catch (error) {
            return null;
        }
    }

    async delete(id: string, tenantId: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: {
                    id,
                    tenantId: tenantId // ← NUEVO: Filtrar por tenant
                }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async countByTenant(tenantId: string): Promise<number> {
        return await this.prisma.user.count({
            where: {
                tenantId: tenantId
            }
        });
    }
}
