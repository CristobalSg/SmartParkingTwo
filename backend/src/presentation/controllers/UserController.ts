import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/UserDto';
import { CreateUserInput, UpdateUserInput } from '../../application/interfaces/UserInterfaces';
import { TenantContext } from '../../infrastructure/context/TenantContext';

export const USER_APPLICATION_SERVICE_TOKEN = 'USER_APPLICATION_SERVICE_TOKEN';

@Controller('api/users')
export class UserController {
    constructor(
        @Inject(USER_APPLICATION_SERVICE_TOKEN)
        private readonly userApplicationService: UserApplicationService,
        private readonly tenantContext: TenantContext
    ) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            // Convert DTO to Application Input
            const input: CreateUserInput = {
                email: createUserDto.email,
                name: createUserDto.name,
                tenantUuid: this.tenantContext.getTenantUuid(), // ← CAMBIAR: Usar UUID
                emailVerified: createUserDto.emailVerified,
                verificationToken: createUserDto.verificationToken,
            };

            const user = await this.userApplicationService.createUser(input);

            // Convert to Response DTO
            const response: UserResponseDto = {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                verificationToken: user.verificationToken,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return {
                status: 'success',
                data: response,
                message: 'User created successfully'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to create user',
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get()
    async getAllUsers() {
        try {
            const users = await this.userApplicationService.getAllUsers();

            // Convert to Response DTOs
            const responses: UserResponseDto[] = users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                verificationToken: user.verificationToken,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));

            return {
                status: 'success',
                data: responses,
                message: 'Users retrieved successfully'
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to retrieve users',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        try {
            const user = await this.userApplicationService.getUserById(id);

            if (!user) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: 'User not found'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Convert to Response DTO
            const response: UserResponseDto = {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                verificationToken: user.verificationToken,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return {
                status: 'success',
                data: response,
                message: 'User retrieved successfully'
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to retrieve user',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        try {
            // Convert DTO to Application Input
            const input: UpdateUserInput = {
                email: updateUserDto.email,
                name: updateUserDto.name,
                emailVerified: updateUserDto.emailVerified,
                verificationToken: updateUserDto.verificationToken,
            };

            const user = await this.userApplicationService.updateUser(id, input);

            if (!user) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: 'User not found'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            // Convert to Response DTO
            const response: UserResponseDto = {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                verificationToken: user.verificationToken,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return {
                status: 'success',
                data: response,
                message: 'User updated successfully'
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to update user',
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        try {
            const deleted = await this.userApplicationService.deleteUser(id);

            if (!deleted) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: 'User not found'
                    },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                status: 'success',
                message: 'User deleted successfully'
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                {
                    status: 'error',
                    message: 'Failed to delete user',
                    error: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
