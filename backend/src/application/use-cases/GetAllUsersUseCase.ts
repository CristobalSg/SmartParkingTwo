import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { UserOutput } from '../interfaces/UserInterfaces';

export class GetAllUsersUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(): Promise<UserOutput[]> {
        const users = await this.userRepository.findAll();
        
        return users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            verificationToken: user.verificationToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}
