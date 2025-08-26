import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { UpdateUserInput, UserOutput } from '../interfaces/UserInterfaces';

export class UpdateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string, input: UpdateUserInput): Promise<UserOutput | null> {
        const existingUser = await this.userRepository.findById(id);
        
        if (!existingUser) {
            throw new Error('User not found');
        }

        // Check if email is being updated and if it's already taken
        if (input.email && input.email !== existingUser.email) {
            const userWithSameEmail = await this.userRepository.findByEmail(input.email);
            if (userWithSameEmail) {
                throw new Error('Email already in use by another user');
            }
        }

        // Update using repository
        const result = await this.userRepository.update(id, {
            email: input.email,
            name: input.name,
            emailVerified: input.emailVerified,
            verificationToken: input.verificationToken,
            updatedAt: new Date(),
        });

        if (!result) {
            throw new Error('Failed to update user');
        }

        return {
            id: result.id,
            email: result.email,
            name: result.name,
            emailVerified: result.emailVerified,
            verificationToken: result.verificationToken,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        };
    }
}
