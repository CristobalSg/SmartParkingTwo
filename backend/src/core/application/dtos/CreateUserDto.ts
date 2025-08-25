import { IsEmail, IsString, IsBoolean, IsOptional, IsNotEmpty, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @MinLength(2, { message: 'Name must have at least 2 characters' })
    name: string;

    @IsOptional()
    @IsBoolean({ message: 'EmailVerified must be a boolean' })
    emailVerified?: boolean;

    @IsOptional()
    @IsString({ message: 'VerificationToken must be a string' })
    verificationToken?: string | null;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }

export class UserResponseDto {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    verificationToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
