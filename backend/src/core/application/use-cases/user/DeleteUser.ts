import { UserRepository } from '../../../domain/repositories/UserRepository';

export class DeleteUser {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string): Promise<boolean> {
        return await this.userRepository.delete(id);
    }
}
