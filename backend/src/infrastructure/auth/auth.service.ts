import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    /**
     * Hash password using bcrypt (industry standard)
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12; // Más seguro que el anterior
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify password using bcrypt
     */
    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Generate JWT access token
     */
    generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        return this.jwtService.sign(payload as any, {
            expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
        });
    }

    /**
     * Generate JWT refresh token (longer expiration)
     */
    generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        return this.jwtService.sign(
            { ...payload, type: 'refresh' } as any,
            {
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
            }
        );
    }

    /**
     * Verify and decode JWT token
     */
    async verifyToken(token: string): Promise<JwtPayload | null> {
        try {
            return this.jwtService.verify<JwtPayload>(token);
        } catch (error) {
            return null;
        }
    }

    /**
     * Decode JWT without verification (useful for debugging)
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return this.jwtService.decode(token) as JwtPayload;
        } catch (error) {
            return null;
        }
    }
}
