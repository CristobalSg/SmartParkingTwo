import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';

export class GetAllUsers {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}
