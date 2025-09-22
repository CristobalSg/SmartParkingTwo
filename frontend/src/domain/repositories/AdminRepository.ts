import { AdminLoginInput, AdminLoginOutput, AdminOutput, CreateAdminInput } from '../../application/ports/AdminApiPort';

// Interface para el repositorio de Admin 
// Cumple ISP: Interface segregada por responsabilidades
export interface IAdminRepository {
  login(credentials: AdminLoginInput, tenantId: string): Promise<AdminLoginOutput>;
  register(adminData: CreateAdminInput): Promise<AdminOutput>;
  logout(): Promise<void>;
  validateToken(): Promise<AdminOutput>;
  getProfile(): Promise<AdminOutput>;
}

// Interface para operaciones de autenticación
// Cumple ISP: Separada de otras operaciones
export interface IAuthRepository {
  isAuthenticated(): boolean;
  getCurrentToken(): string | null;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  isTokenExpired(): boolean;
}

// Interface combinada para el repositorio completo de Admin
// Cumple ISP: Permite implementación parcial si es necesario
export interface AdminRepository extends IAdminRepository, IAuthRepository { }
