
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { User } from '../../../domain/entities/User'
interface Input {
    id: string
    email: string
    name: string
    emailVerified: boolean
    verificationToken: string | null
    createdAt: Date
    updatedAt: Date
}

export class CreateUser {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async create(input: Input): Promise<User> {
        return await this.userRepository.create(new User(
            input.id,
            input.email,
            input.name,
            input.emailVerified,
            input.verificationToken,
            input.createdAt,
            input.updatedAt,
        ))
    }
}