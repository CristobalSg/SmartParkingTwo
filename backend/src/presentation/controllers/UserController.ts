import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { UserService } from '../../core/application/services/UserService';
import { CreateUserDto, UpdateUserDto } from '../../core/application/dtos/CreateUserDto';

@Controller('api/users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.userService.createUser(createUserDto);
            return {
                status: 'success',
                data: user,
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
            const users = await this.userService.getAllUsers();
            return {
                status: 'success',
                data: users,
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
            const user = await this.userService.getUserById(id);
            if (!user) {
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
                data: user,
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
            const user = await this.userService.updateUser(id, updateUserDto);
            if (!user) {
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
                data: user,
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
            const deleted = await this.userService.deleteUser(id);
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
