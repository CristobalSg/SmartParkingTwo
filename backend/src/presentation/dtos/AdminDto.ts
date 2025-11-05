import { IsEmail, IsString, IsOptional, IsNotEmpty, MinLength, IsUUID } from 'class-validator';

// DTOs for NestJS validation - Presentation layer

export class AdminRegisterDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must have at least 8 characters' })
    password: string;

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must have at least 2 characters' })
    name: string;

    @IsOptional()
    @IsUUID(4, { message: 'TenantUuid must be a valid UUID' })
    tenantUuid?: string;
}

export class AdminLoginDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(1, { message: 'Password is required' })
    password: string;

    @IsOptional()
    @IsUUID(4, { message: 'TenantUuid must be a valid UUID' })
    tenantUuid?: string;
}

export class CreateAdminDto {
    @IsUUID(4, { message: 'TenantUuid must be a valid UUID' })
    @IsNotEmpty({ message: 'TenantUuid is required' })
    tenantUuid: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must have at least 8 characters' })
    password: string;

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must have at least 2 characters' })
    name: string;
}

export class UpdateAdminDto {
    @IsOptional()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must have at least 2 characters' })
    name?: string;
}

export class ChangeAdminPasswordDto {
    @IsString({ message: 'Current password must be a string' })
    @IsNotEmpty({ message: 'Current password is required' })
    currentPassword: string;

    @IsString({ message: 'New password must be a string' })
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(8, { message: 'New password must have at least 8 characters' })
    newPassword: string;
}

export class AdminResponseDto {
    id: string;
    tenantUuid: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    // passwordHash NO se incluye nunca
}

export class AdminAuthResponseDto {
    admin: AdminResponseDto;
    token: string;
    expiresAt: Date;
}

// DTO para respuestas de API
export class ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message: string;
    error?: string;
}
