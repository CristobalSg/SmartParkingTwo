import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';

interface UpdateInput {
    id: string;
    email?: string;
    name?: string;
    emailVerified?: boolean;
    verificationToken?: string | null;
}

export class UpdateUser {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(input: UpdateInput): Promise<User | null> {
        return await this.userRepository.update(input.id, input);
    }
}
