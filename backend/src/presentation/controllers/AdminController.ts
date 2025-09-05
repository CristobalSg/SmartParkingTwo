import { Controller, Post, Body, Get, HttpStatus, HttpException, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { AdminLoginUseCase } from '../../application/use-cases/adminUseCases/AdminLoginUseCase';
import {
    AdminLoginDto,
    ApiResponse,
    CreateAdminDto
} from '../dtos/AdminDto';
import { AdminLoginInput, CreateAdminInput } from '../../application/interfaces/AdminInterfaces';
import { TenantContext } from '../../infrastructure/context/TenantContext';
import { validateSimpleToken } from '../../shared/utils/crypto-utils';
import { CreateAdminUseCase } from '../../application/use-cases/adminUseCases/CreateAdminUseCase';
import { GetAllAdminsUseCase } from '../../application/use-cases/adminUseCases/GetAllAdminUseCase';

export const ADMIN_LOGIN_USE_CASE_TOKEN = 'ADMIN_LOGIN_USE_CASE_TOKEN';
export const CREATE_ADMIN_USE_CASE_TOKEN = 'CREATE_ADMIN_USE_CASE_TOKEN'
export const GET_ALL_ADMINS_USE_CASE_TOKEN = 'GET_ALL_ADMINS_USE_CASE_TOKEN'

@Controller('api/admin')
export class AdminController {
    constructor(
        @Inject(ADMIN_LOGIN_USE_CASE_TOKEN)
        private readonly adminLoginUseCase: AdminLoginUseCase,
        @Inject(CREATE_ADMIN_USE_CASE_TOKEN)
        private readonly createAdminUseCase: CreateAdminUseCase,
        @Inject(GET_ALL_ADMINS_USE_CASE_TOKEN)
        private readonly getAllAdminUseCase: GetAllAdminsUseCase,
        private readonly tenantContext: TenantContext
    ) { }

    @Post('login')
    async login(@Body() loginDto: AdminLoginDto, @Res() response: Response): Promise<void> {
        console.log('AdminController.login called with:', JSON.stringify(loginDto, null, 2));
        try {
            // Convert DTO to Application Input
            const input: AdminLoginInput = {
                email: loginDto.email,
                password: loginDto.password,
                tenantUuid: loginDto.tenantUuid || this.tenantContext.getTenantUuid(),
            };
            console.log('Input to AdminLoginUseCase:', JSON.stringify(input, null, 2));

            const authResult = await this.adminLoginUseCase.execute(input);

            // Debug temporal - ver qué estructura se está devolviendo
            console.log('AuthResult structure:', JSON.stringify(authResult, null, 2));

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
                data: authResult, // Devolver toda la estructura nueva con authentication y session
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

    //Crear Admins

    @Post()
    async create(@Body() createDto: CreateAdminDto): Promise<ApiResponse<any>> {
        try {
            const tenantUuid = this.tenantContext.requireTenant().id
            const input: CreateAdminInput = {
                tenantUuid: tenantUuid,
                email: createDto.email,
                password: createDto.password,
                name: createDto.name,
            };

            const admin = await this.createAdminUseCase.execute(input);

            return {
                status: 'success',
                data: admin,
                message: 'Administrator created successfully'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to create administrator',
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    //Obtener todos los Admins

    @Get()
    async getAll(): Promise<ApiResponse<any[]>> {
        try {
            const admins = await this.getAllAdminUseCase.execute()

            return {
                status: 'success',
                data: admins,
                message: 'Administrators retrieved successfully'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to retrieve administrators',
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    // Endpoint para validar token (opcional)
    @Post('validate-token')
    async validateToken(@Body() body: { token: string }): Promise<ApiResponse<{ valid: boolean; admin?: any }>> {
        try {
            // TODO: Implementar validación de token JWT
            // Por ahora, validación simple de token base64
            const isValid = this.validateSimpleToken(body.token);

            if (!isValid) {
                return {
                    status: 'success',
                    data: { valid: false },
                    message: 'Token is invalid or expired'
                };
            }

            // Decodificar información básica del token
            const tokenData = this.decodeSimpleToken(body.token);

            return {
                status: 'success',
                data: {
                    valid: true,
                    admin: {
                        id: tokenData.adminId,
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
    async logout(@Body() body: { token: string }): Promise<ApiResponse<null>> {
        try {
            // TODO: Implementar invalidación de token en producción
            // Por ahora, simplemente retornamos éxito
            // En el futuro, body.token se usará para invalidar el token específico
            console.log('Logout request for token:', body.token ? 'provided' : 'missing');

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

    // Métodos privados para validación de token usando nuestra utilidad
    private validateSimpleToken(token: string): boolean {
        const tokenData = validateSimpleToken(token);
        return tokenData !== null;
    }

    private decodeSimpleToken(token: string): any {
        const tokenData = validateSimpleToken(token);
        if (!tokenData) {
            throw new Error('Invalid token format');
        }
        return tokenData;
    }
}
