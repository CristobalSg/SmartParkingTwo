import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { User } from '../../core/domain/entities/User';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(user: User): Promise<User> {
        const createdUser = await this.prisma.user.create({
            data: {
                id: user.id,
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
            createdUser.email,
            createdUser.name,
            createdUser.emailVerified,
            createdUser.verificationToken,
            createdUser.createdAt,
            createdUser.updatedAt
        );
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany();

        return users.map(user => new User(
            user.id,
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        ));
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        );
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.email,
            user.name,
            user.emailVerified,
            user.verificationToken,
            user.createdAt,
            user.updatedAt
        );
    }

    async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            });

            return new User(
                updatedUser.id,
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

    async delete(id: string): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
