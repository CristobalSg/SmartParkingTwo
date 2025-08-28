// Application layer interfaces - Framework agnostic
export interface CreateUserInput {
    tenantUuid: string; // ← CAMBIAR: Usar UUID del tenant directamente
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
    // tenantId NO se puede cambiar
}

export interface UserOutput {
    id: string;
    tenantUuid: string; // ← CAMBIAR: UUID del tenant
    email: string;
    name: string;
    emailVerified: boolean;
    verificationToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
