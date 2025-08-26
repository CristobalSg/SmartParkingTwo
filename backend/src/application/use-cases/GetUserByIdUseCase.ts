import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { UserOutput } from '../interfaces/UserInterfaces';

export class GetUserByIdUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string): Promise<UserOutput | null> {
        const user = await this.userRepository.findById(id);
        
        if (!user) {
            return null;
        }

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
}
