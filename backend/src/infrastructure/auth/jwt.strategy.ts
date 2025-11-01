import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../database/prisma.service';

export interface JwtPayload {
    sub: string; // Admin ID
    email: string;
    tenantId: string;
    type: 'admin' | 'user';
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        });
    }

    async validate(payload: JwtPayload) {
        // Verificar que el admin/user aún existe y está activo
        if (payload.type === 'admin') {
            const admin = await this.prismaService.administrator.findUnique({
                where: { id: payload.sub },
                include: { tenant: true }
            });

            if (!admin || !admin.tenant.isActive) {
                throw new UnauthorizedException('Invalid token or inactive account');
            }

            return {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                tenantId: admin.tenantId,
                type: 'admin' as const
            };
        } else {
            const user = await this.prismaService.user.findUnique({
                where: { id: payload.sub },
                include: { tenant: true }
            });

            if (!user || !user.tenant.isActive) {
                throw new UnauthorizedException('Invalid token or inactive account');
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                tenantId: user.tenantId,
                type: 'user' as const
            };
        }
    }
}
