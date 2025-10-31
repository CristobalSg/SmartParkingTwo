import { CreateUserInput, UpdateUserInput, UserOutput } from '../interfaces/UserInterfaces';
import { CreateUserUseCase } from '../use-cases/CreateUserUseCase';
import { GetAllUsersUseCase } from '../use-cases/GetAllUsersUseCase';
import { GetUserByIdUseCase } from '../use-cases/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../use-cases/DeleteUserUseCase';
import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { TenantContext } from '../../infrastructure/context/TenantContext';

export class UserApplicationService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async createUser(input:CreateUserInput): Promise<UserOutput> {
        console.log("Creating user.. appservice.");
        const createUserUseCase = new CreateUserUseCase(this.userRepository,this.tenantContext);
        return await createUserUseCase.execute(input);
    }


    async getAllUsers(): Promise<UserOutput[]> {
        const getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository,this.tenantContext);
        return await getAllUsersUseCase.execute();
    }

    async getUserById(id: string): Promise<UserOutput | null> {
        const getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository,this.tenantContext);
        return await getUserByIdUseCase.execute(id);
    }

    async updateUser(id: string, input: UpdateUserInput): Promise<UserOutput | null> {
        const updateUserUseCase = new UpdateUserUseCase(this.userRepository,this.tenantContext);
        return await updateUserUseCase.execute(id, input);
    }

    async deleteUser(id: string): Promise<boolean> {
        const deleteUserUseCase = new DeleteUserUseCase(this.userRepository,this.tenantContext);
        return await deleteUserUseCase.execute(id);
    }
}
