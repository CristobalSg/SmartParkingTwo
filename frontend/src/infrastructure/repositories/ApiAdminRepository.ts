import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { AdminApiAdapter as IAdminApiAdapter } from '../../application/ports/AdminApiPort';
import { TokenStorage } from '../storage/TokenStorage';
import { AdminLoginInput, AdminLoginOutput, AdminOutput } from '../../application/ports/AdminApiPort';

// Implementación del repositorio de Admin que se comunica con la API
// SRP: Solo coordina entre adaptadores, no maneja detalles de implementación

export class ApiAdminRepository implements AdminRepository {
  constructor(
    private apiAdapter: IAdminApiAdapter,
    private tokenStorage: TokenStorage
  ) {}

  // Autentica un administrador
  async login(credentials: AdminLoginInput, tenantId: string): Promise<AdminLoginOutput> {
    try {
      const result = await this.apiAdapter.login(credentials, tenantId);
      
      // Guardar token automáticamente después del login exitoso
      this.setAuthToken(result.token);
      
      return result;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Cierra sesión del administrador
  async logout(): Promise<void> {
    try {
      await this.apiAdapter.logout();
      this.clearAuthToken();
    } catch (error: any) {
      // Incluso si falla la petición, limpiar localmente
      this.clearAuthToken();
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Valida el token actual
  async validateToken(): Promise<AdminOutput> {
    if (!this.isAuthenticated()) {
      throw new Error('No authentication token found');
    }

    try {
      return await this.apiAdapter.validateToken();
    } catch (error: any) {
      // Si el token no es válido, limpiarlo
      if (error.message.includes('Token expired') || error.message.includes('invalid')) {
        this.clearAuthToken();
      }
      throw error;
    }
  }

  // Obtiene el perfil del administrador actual
  async getProfile(): Promise<AdminOutput> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      return await this.apiAdapter.getProfile();
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        this.clearAuthToken();
      }
      throw error;
    }
  }

  // Verifica si hay un token de autenticación válido
  isAuthenticated(): boolean {
    const token = this.getCurrentToken();
    return token !== null && token.length > 0;
  }

  getCurrentToken(): string | null {
    return this.tokenStorage.getToken();
  }

  // Guarda el token de autenticación usando TokenStorage
  setAuthToken(token: string): void {
    this.tokenStorage.setToken(token);
  }

  // Limpia el token de autenticación usando TokenStorage
  clearAuthToken(): void {
    this.tokenStorage.clearToken();
  }

  // Verifica si el token ha expirado usando TokenStorage
  isTokenExpired(): boolean {
    return this.tokenStorage.isTokenExpired();
  }
}