import { CreateUserInput, UpdateUserInput, UserOutput } from '../interfaces/UserInterfaces';
import { CreateUserUseCase } from '../use-cases/CreateUserUseCase';
import { GetAllUsersUseCase } from '../use-cases/GetAllUsersUseCase';
import { GetUserByIdUseCase } from '../use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../use-cases/DeleteUserUseCase';
import { UserRepository } from '../../core/domain/repositories/UserRepository';

export class UserApplicationService {
    private createUserUseCase: CreateUserUseCase;
    private getAllUsersUseCase: GetAllUsersUseCase;
    private getUserByIdUseCase: GetUserByIdUseCase;
    private updateUserUseCase: UpdateUserUseCase;
    private deleteUserUseCase: DeleteUserUseCase;

    constructor(userRepository: UserRepository) {
        this.createUserUseCase = new CreateUserUseCase(userRepository);
        this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
        this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
        this.updateUserUseCase = new UpdateUserUseCase(userRepository);
        this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    }

    async createUser(input: CreateUserInput): Promise<UserOutput> {
        return await this.createUserUseCase.execute(input);
    }

    async getAllUsers(): Promise<UserOutput[]> {
        return await this.getAllUsersUseCase.execute();
    }

    async getUserById(id: string): Promise<UserOutput | null> {
        return await this.getUserByIdUseCase.execute(id);
    }

    async updateUser(id: string, input: UpdateUserInput): Promise<UserOutput | null> {
        return await this.updateUserUseCase.execute(id, input);
    }

    async deleteUser(id: string): Promise<boolean> {
        return await this.deleteUserUseCase.execute(id);
    }
}
