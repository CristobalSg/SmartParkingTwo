import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';

export class GetUserById {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }
}
