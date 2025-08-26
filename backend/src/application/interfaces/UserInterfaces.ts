// Application layer interfaces - Framework agnostic
export interface CreateUserInput {
    email: string;
    name: string;
    emailVerified?: boolean;
    verificationToken?: string | null;
}

export interface UpdateUserInput {
    email?: string;
    name?: string;
    emailVerified?: boolean;
    verificationToken?: string | null;
}

export interface UserOutput {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    verificationToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
