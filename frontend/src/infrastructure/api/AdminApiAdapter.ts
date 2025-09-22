import { IHttpClient, HttpResponse } from '../http/HttpClient';
import { 
  AdminApiAdapter as IAdminApiAdapter,
  AdminLoginInput, 
  AdminLoginOutput, 
  AdminOutput,
  ApiResponse,
  TokenResponse 
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
   * @returns Promise con los datos del admin, authentication y session
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
        // Procesar la respuesta completa del backend
        const backendData = response.data.data;
        
        // Verificar que la estructura sea la esperada
        if (!this.isValidLoginResponse(backendData)) {
          throw new Error('Invalid response structure from backend');
        }

        return backendData;
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

  /**
   * Refrescar access token usando refresh token
   * @param refreshToken - Token de renovación
   * @returns Promise con nueva respuesta de tokens
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response: HttpResponse<ApiResponse<{ authentication: TokenResponse }>> = await this.httpClient.post(
        `${this.basePath}/refresh`,
        { refresh_token: refreshToken }
      );

      if (response.data.status === 'success' && response.data.data?.authentication) {
        return response.data.data.authentication;
      } else {
        throw new Error(response.data.error || response.data.message || 'Token refresh failed');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Refresh token expired or invalid');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Token refresh failed');
      }
    }
  }

  // Logout del administrador
  async logout(): Promise<void> {
    try {
      await this.httpClient.post(`${this.basePath}/logout`);
    } catch (error) {
      console.warn('Logout request failed:', error);
      // No lanzar error aquí, logout debe funcionar incluso si falla la petición
    }
  }

  // Verificar si el token actual es válido
  async validateToken(): Promise<AdminOutput> {
    try {
      const response: HttpResponse<ApiResponse<{ valid: boolean; admin?: AdminOutput }>> = await this.httpClient.post(
        `${this.basePath}/validate-token`
      );

      if (response.data.status === 'success' && response.data.data?.valid && response.data.data.admin) {
        return response.data.data.admin;
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

  // MÉTODOS PRIVADOS

  /**
   * Valida que la respuesta del login tenga la estructura esperada
   * @param data - Datos de respuesta del backend
   * @returns boolean indicando si la estructura es válida
   */
  private isValidLoginResponse(data: any): data is AdminLoginOutput {
    // Verificar estructura básica
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Verificar que tenga admin
    if (!data.admin || typeof data.admin !== 'object') {
      return false;
    }

    // Verificar que admin tenga las propiedades requeridas
    const admin = data.admin;
    if (!admin.id || !admin.tenantUuid || !admin.email || !admin.name) {
      return false;
    }

    // Verificar que tenga authentication
    if (!data.authentication || typeof data.authentication !== 'object') {
      return false;
    }

    // Verificar que authentication tenga las propiedades requeridas
    const auth = data.authentication;
    if (!auth.access_token || !auth.refresh_token || !auth.token_type || !auth.expires_at) {
      return false;
    }

    // Verificar que expires_in sea un número
    if (typeof auth.expires_in !== 'number') {
      return false;
    }

    // Session es opcional, pero si existe debe tener estructura válida
    if (data.session) {
      if (!data.session.session_id || !data.session.login_time) {
        return false;
      }
    }

    return true;
  }

  /**
   * Log de debugging para respuestas del backend
   * @param data - Datos recibidos
   * @param operation - Operación realizada
   */
  private logResponse(data: any, operation: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`AdminApiAdapter.${operation} response:`, {
        hasAdmin: !!data?.admin,
        hasAuthentication: !!data?.authentication,
        hasSession: !!data?.session,
        structure: Object.keys(data || {})
      });
    }
  }
}