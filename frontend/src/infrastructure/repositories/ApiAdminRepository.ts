import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { AdminApiAdapter as IAdminApiAdapter } from '../../application/ports/AdminApiPort';
import { TokenStorage } from '../storage/TokenStorage';
import { TokenManager, ITokenManager } from '../services/TokenManager';
import { IHttpClient } from '../http/HttpClient';
import { 
  AdminLoginInput, 
  AdminLoginOutput, 
  AdminOutput, 
  TokenResponse 
} from '../../application/ports/AdminApiPort';

// Implementación del repositorio de Admin que integra Dual Token
// SRP: Solo coordina entre adaptadores y gestiona autenticación completa
// DIP: Depende de abstracciones (TokenStorage, TokenManager, HttpClient)

export class ApiAdminRepository implements AdminRepository {
  private tokenManager: ITokenManager;

  constructor(
    private apiAdapter: IAdminApiAdapter,
    private tokenStorage: TokenStorage,
    private httpClient: IHttpClient
  ) {
    // Inicializar TokenManager
    this.tokenManager = new TokenManager(tokenStorage);
    
    // Configurar callback de refresh en TokenManager
    this.setupTokenRefresh();
    
    // Configurar interceptor HTTP para refresh automático
    this.setupHttpInterceptor();
    
    // Restaurar token en HttpClient si existe
    this.restoreAuthToken();
  }

  // === MÉTODOS PÚBLICOS DE AUTENTICACIÓN ===

  // Autentica un administrador con sistema de dual token
  async login(credentials: AdminLoginInput, tenantId: string): Promise<AdminLoginOutput> {
    try {
      const result = await this.apiAdapter.login(credentials, tenantId);
      
      // Configurar tokens en TokenManager
      this.tokenManager.setTokens(result.authentication);
      
      // Configurar información de sesión
      if (result.session) {
        this.tokenStorage.setSessionInfo(result.session.session_id, result.session.login_time);
      }
      
      // Configurar token en HttpClient para peticiones futuras
      this.httpClient.setAuthToken(result.authentication.access_token);
      
      console.log('Login successful with dual token system', {
        adminId: result.admin.id,
        hasAccessToken: !!result.authentication.access_token,
        hasRefreshToken: !!result.authentication.refresh_token,
        expiresAt: result.authentication.expires_at
      });
      
      return result;
    } catch (error: any) {
      console.error('Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Cierra sesión del administrador
  async logout(): Promise<void> {
    try {
      // Intentar logout en backend
      await this.apiAdapter.logout();
    } catch (error: any) {
      console.warn('Backend logout failed, cleaning local tokens anyway:', error.message);
    } finally {
      // Siempre limpiar tokens localmente
      this.clearAllAuthData();
    }
  }

  // Valida el token actual o lo renueva automáticamente
  async validateToken(): Promise<AdminOutput> {
    try {
      // Obtener token válido (renovará automáticamente si es necesario)
      const validToken = await this.tokenManager.getValidAccessToken();
      
      if (!validToken) {
        throw new Error('No valid authentication token');
      }

      // Validar token con backend
      return await this.apiAdapter.validateToken();
    } catch (error: any) {
      console.error('Token validation failed:', error.message);
      
      // Si falla la validación, limpiar tokens
      if (error.message.includes('Token expired') || error.message.includes('invalid')) {
        this.clearAllAuthData();
      }
      throw error;
    }
  }

  // Obtiene el perfil del administrador actual
  async getProfile(): Promise<AdminOutput> {
    try {
      // Obtener token válido (renovará automáticamente si es necesario)
      const validToken = await this.tokenManager.getValidAccessToken();
      
      if (!validToken) {
        throw new Error('Not authenticated');
      }

      return await this.apiAdapter.getProfile();
    } catch (error: any) {
      console.error('Get profile failed:', error.message);
      
      if (error.message.includes('Unauthorized')) {
        this.clearAllAuthData();
      }
      throw error;
    }
  }

  // === MÉTODOS DE ESTADO ===

  // Verifica si hay un token de autenticación válido
  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated();
  }

  getCurrentToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  // Obtiene información del estado actual de autenticación
  getAuthStatus(): {
    isAuthenticated: boolean;
    tokenInfo: any;
    sessionInfo: any;
  } {
    return {
      isAuthenticated: this.isAuthenticated(),
      tokenInfo: this.tokenManager.getTokenInfo(),
      sessionInfo: this.tokenStorage.getSessionInfo()
    };
  }

  // === MÉTODOS LEGACY (compatibilidad) ===

  setAuthToken(token: string): void {
    // Método legacy - ahora se maneja automáticamente
    console.warn('setAuthToken is deprecated - tokens are managed automatically');
  }

  clearAuthToken(): void {
    this.clearAllAuthData();
  }

  isTokenExpired(): boolean {
    return this.tokenManager.needsRefresh();
  }

  // === MÉTODOS PRIVADOS ===

  // Configurar callback de refresh en TokenManager
  private setupTokenRefresh(): void {
    this.tokenManager.setRefreshCallback(async (refreshToken: string): Promise<TokenResponse> => {
      try {
        console.log('ApiAdminRepository: Executing token refresh...');
        const newTokenResponse = await this.apiAdapter.refreshToken(refreshToken);
        
        // Actualizar token en HttpClient
        this.httpClient.setAuthToken(newTokenResponse.access_token);
        
        console.log('ApiAdminRepository: Token refresh completed successfully');
        return newTokenResponse;
      } catch (error: any) {
        console.error('ApiAdminRepository: Token refresh failed:', error.message);
        throw error;
      }
    });
  }

  // Configurar interceptor HTTP para refresh automático
  private setupHttpInterceptor(): void {
    this.httpClient.setTokenRefreshHandler(async (): Promise<string | null> => {
      try {
        console.log('HTTP Interceptor: Attempting token refresh...');
        const validToken = await this.tokenManager.getValidAccessToken();
        
        if (validToken) {
          console.log('HTTP Interceptor: Token refresh successful');
          return validToken;
        } else {
          console.log('HTTP Interceptor: Token refresh failed - no valid token');
          this.clearAllAuthData();
          return null;
        }
      } catch (error: any) {
        console.error('HTTP Interceptor: Token refresh error:', error.message);
        this.clearAllAuthData();
        throw error;
      }
    });
  }

  // Restaurar token en HttpClient al inicializar
  private restoreAuthToken(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken && !this.tokenStorage.isAccessTokenExpired()) {
      this.httpClient.setAuthToken(accessToken);
      console.log('Auth token restored in HttpClient');
    }
  }

  // Limpiar todos los datos de autenticación
  private clearAllAuthData(): void {
    try {
      this.tokenManager.clearTokens();
      this.httpClient.removeAuthToken();
      console.log('All authentication data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
}