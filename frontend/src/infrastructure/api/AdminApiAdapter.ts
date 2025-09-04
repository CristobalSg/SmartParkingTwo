import { IHttpClient, HttpResponse } from '../http/HttpClient';
import { 
  AdminApiAdapter as IAdminApiAdapter,
  AdminLoginInput, 
  AdminLoginOutput, 
  AdminOutput,
  ApiResponse 
} from '../../application/ports/AdminApiPort';

// Implementación del adaptador de Admin API (Implementacion de puerto)
// SRP: Solo adapta llamadas de API
// DIP: Depende de abstracciones, no de implementaciones concretas

export class AdminApiAdapter implements IAdminApiAdapter {
  private readonly basePath = '/admin';

  constructor(private httpClient: IHttpClient) {}

  /**
   * Realiza login de administrador
   * @param credentials - Email y password del admin
   * @param tenantId - ID del tenant (universidad-nacional, empresa-tech, etc.)
   * @returns Promise con los datos del admin y token
   */
  async login(
    credentials: AdminLoginInput,
    tenantId: string
  ): Promise<AdminLoginOutput> {
    try {
      // Header de tenant específico para esta petición
      this.httpClient.setHeader('X-Tenant-ID', tenantId);

      // Realizar la petición de login
      const response: HttpResponse<ApiResponse<AdminLoginOutput>> = await this.httpClient.post(
        `${this.basePath}/login`,
        credentials
      );

      // Limpiar header después de la petición
      this.httpClient.removeHeader('X-Tenant-ID');

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // Asegurar que el header se limpia incluso en caso de error
      this.httpClient.removeHeader('X-Tenant-ID');
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Network error or invalid response');
      }
    }
  }

  // Logout del administrador (opcional, para limpiar estado)
  async logout(): Promise<void> {
    try {
      // Si hay endpoint de logout en backend, descomentar linea de codigo
      // await this.httpClient.post(`${this.basePath}/logout`);
    } catch (error) {
      console.warn('Logout request failed:', error);
    }
  }

  // Verificar si el token actual es válido
  async validateToken(): Promise<AdminOutput> {
    try {
      const response: HttpResponse<ApiResponse<AdminOutput>> = await this.httpClient.get(
        `${this.basePath}/validate`
      );

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token expired or invalid');
      }
      throw error;
    }
  }

  // Obtener perfil del administrador actual
  async getProfile(): Promise<AdminOutput> {
    try {
      const response: HttpResponse<ApiResponse<AdminOutput>> = await this.httpClient.get(
        `${this.basePath}/profile`
      );

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Failed to get admin profile');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please login again');
      }
      throw error;
    }
  }
}