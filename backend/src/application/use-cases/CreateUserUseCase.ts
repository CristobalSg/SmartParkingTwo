import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { User } from '../../core/domain/entities/User';
import { CreateUserInput, UserOutput } from '../interfaces/UserInterfaces';
import { v4 as uuidv4 } from 'uuid';

export class CreateUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(input: CreateUserInput): Promise<UserOutput> {
        // Business logic validation
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Create domain entity
        const user = new User(
            uuidv4(),
            input.email,
            input.name,
            input.emailVerified ?? false,
            input.verificationToken ?? null,
            new Date(),
            new Date()
        );

        // Save through repository
        const savedUser = await this.userRepository.create(user);

        // Return application output
        return this.mapToOutput(savedUser);
    }

    private mapToOutput(user: User): UserOutput {
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
