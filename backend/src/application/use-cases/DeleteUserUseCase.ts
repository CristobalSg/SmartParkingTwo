import { UserRepository } from '../../core/domain/repositories/UserRepository';

export class DeleteUserUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(id: string): Promise<boolean> {
        const existingUser = await this.userRepository.findById(id);
        
        if (!existingUser) {
            throw new Error('User not found');
        }

        return await this.userRepository.delete(id);
    }
}
