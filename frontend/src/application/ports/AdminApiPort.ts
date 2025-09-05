// Tipos basados en el backend AdminInterfaces.ts
export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminOutput {
  id: string;
  tenantUuid: string;
  email: string;
  name: string;
}

export interface AdminLoginOutput {
  admin: AdminOutput;
  token: string;
  expiresAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Interface para el adaptador de Admin API
 * Implementa ISP: Interface segregada solo para operaciones de admin
 */
export interface AdminApiAdapter {
  login(credentials: AdminLoginInput, tenantId: string): Promise<AdminLoginOutput>;
  logout(): Promise<void>;
  validateToken(): Promise<AdminOutput>;
  getProfile(): Promise<AdminOutput>;
}
