import { User } from '../entities/User'

export interface UserRepository {
    create: (resource: User) => Promise<User>
    findAll: () => Promise<User[]>
    findById: (id: string) => Promise<User | null>
    findByEmail: (email: string) => Promise<User | null>
    update: (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User | null>
    delete: (id: string) => Promise<boolean>
}