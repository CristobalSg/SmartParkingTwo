import { Controller, Post, Body, HttpStatus, HttpException, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import {
    AdminLoginDto,
    ApiResponse
} from '../dtos/AdminDto';
import { AdminLoginInput } from '../../application/interfaces/AdminInterfaces';
import { TenantContext } from '../../infrastructure/context/TenantContext';
import { AuthService } from '../../infrastructure/auth/auth.service';

export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';

@Controller('api/admin')
export class AdminController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE_TOKEN)
        private readonly adminLoginUseCase: AdminLoginUseCase,
        private readonly tenantContext: TenantContext,
        private readonly authService: AuthService
    ) { }

    @Post('login')
    async login(@Body() loginDto: AdminLoginDto, @Res() response: Response): Promise<void> {
        try {
            // Convert DTO to Application Input
            const input: AdminLoginInput = {
                email: loginDto.email,
                password: loginDto.password,
                tenantUuid: loginDto.tenantUuid || this.tenantContext.getTenantUuid(),
            };

            const authResult = await this.adminLoginUseCase.execute(input);

            // Headers de seguridad
            response.setHeader('Cache-Control', 'no-store');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('X-Content-Type-Options', 'nosniff');
            response.setHeader('X-Frame-Options', 'DENY');

            // Headers informativos
            response.setHeader('X-Token-Expires', authResult.authentication.expires_at);
            response.setHeader('X-Rate-Limit-Remaining', '10');

            response.status(200).json({
                status: 'success',
                data: authResult,
                message: 'Login successful'
            });
        } catch (error) {
            // Por seguridad, usar un código de estado específico para autenticación fallida
            const statusCode = error.message.includes('Invalid email or password')
                ? HttpStatus.UNAUTHORIZED
                : HttpStatus.BAD_REQUEST;

            throw new HttpException(
                {
                    status: 'error',
                    message: 'Authentication failed',
                    error: error.message
                },
                statusCode
            );
        }
    }

    // Endpoint para validar token JWT
    @Post('validate-token')
    async validateToken(@Body() body: { token: string }): Promise<ApiResponse<{ valid: boolean; admin?: any }>> {
        try {
            const tokenData = await this.authService.verifyToken(body.token);

            if (!tokenData) {
                return {
                    status: 'success',
                    data: { valid: false },
                    message: 'Token is invalid or expired'
                };
            }

            return {
                status: 'success',
                data: {
                    valid: true,
                    admin: {
                        id: tokenData.sub,
                        tenantId: tokenData.tenantId,
                        email: tokenData.email
                    }
                },
                message: 'Token is valid'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to validate token',
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // Endpoint para logout (invalidar token)
    @Post('logout')
    async logout(): Promise<ApiResponse<null>> {
        try {
            // TODO: Implementar invalidación de token en producción (blacklist de tokens)
            return {
                status: 'success',
                data: null,
                message: 'Logout successful'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to logout',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Endpoint para renovar access token usando refresh token
    @Post('refresh-token')
    async refreshToken(@Body() body: { refresh_token: string }): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number; expires_at: string }>> {
        try {
            const tokenData = await this.authService.verifyToken(body.refresh_token);

            if (!tokenData) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: 'Invalid refresh token',
                        error: 'Token is not valid'
                    },
                    HttpStatus.UNAUTHORIZED
                );
            }

            // Generar nuevo access token (preservando el tipo original)
            const newAccessToken = this.authService.generateAccessToken({
                sub: tokenData.sub,
                email: tokenData.email,
                tenantId: tokenData.tenantId,
                type: tokenData.type
            });

            const expiresIn = 3600; // 1 hora
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            return {
                status: 'success',
                data: {
                    access_token: newAccessToken,
                    token_type: 'Bearer',
                    expires_in: expiresIn,
                    expires_at: expiresAt.toISOString()
                },
                message: 'Token refreshed successfully'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Token refresh failed',
                    error: error.message
                },
                HttpStatus.UNAUTHORIZED
            );
        }
    }
}
