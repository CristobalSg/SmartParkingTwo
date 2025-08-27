// Application layer interfaces - Framework agnostic
export interface CreateUserInput {
    tenantId: string; // ← NUEVO: Se requiere tenant
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
    tenantId: string; // ← NUEVO: Incluir en la respuesta
    email: string;
    name: string;
    emailVerified: boolean;
    verificationToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}
