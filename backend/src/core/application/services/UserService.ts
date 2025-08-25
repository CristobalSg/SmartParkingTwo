import { Injectable, Inject } from '@nestjs/common';
import { CreateUser } from '../use-cases/user/CreateUser';
import { GetAllUsers } from '../use-cases/user/GetAllUsers';
import { GetUserById } from '../use-cases/user/GetUserById';
import { UpdateUser } from '../use-cases/user/UpdateUser';
import { DeleteUser } from '../use-cases/user/DeleteUser';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/CreateUserDto';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY_TOKEN';

@Injectable()
export class UserService {
    private createUserUseCase: CreateUser;
    private getAllUsersUseCase: GetAllUsers;
    private getUserByIdUseCase: GetUserById;
    private updateUserUseCase: UpdateUser;
    private deleteUserUseCase: DeleteUser;

    constructor(@Inject(USER_REPOSITORY_TOKEN) private readonly userRepository: UserRepository) {
        this.createUserUseCase = new CreateUser(userRepository);
        this.getAllUsersUseCase = new GetAllUsers(userRepository);
        this.getUserByIdUseCase = new GetUserById(userRepository);
        this.updateUserUseCase = new UpdateUser(userRepository);
        this.deleteUserUseCase = new DeleteUser(userRepository);
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.createUserUseCase.create({
            id: this.generateId(),
            email: createUserDto.email,
            name: createUserDto.name,
            emailVerified: createUserDto.emailVerified ?? false,
            verificationToken: createUserDto.verificationToken ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.mapToResponseDto(user);
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        const users = await this.getAllUsersUseCase.execute();
        return users.map(user => this.mapToResponseDto(user));
    }

    async getUserById(id: string): Promise<UserResponseDto | null> {
        const user = await this.getUserByIdUseCase.execute(id);
        return user ? this.mapToResponseDto(user) : null;
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto | null> {
        const user = await this.updateUserUseCase.execute({
            id,
            ...updateUserDto,
        });
        return user ? this.mapToResponseDto(user) : null;
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.deleteUserUseCase.execute(id);
    }

    private mapToResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
