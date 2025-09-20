import { TokenStorage } from '../storage/TokenStorage';
import { TokenResponse } from '../../application/ports/AdminApiPort';

// Interface para el manejo automático de tokens
// ISP: Interface específica para gestión de tokens
export interface ITokenManager {
  // Configurar tokens después del login
  setTokens(tokenResponse: TokenResponse): void;
  
  // Obtener access token válido (renueva automáticamente si es necesario)
  getValidAccessToken(): Promise<string | null>;
  
  // Verificar si necesita renovación
  needsRefresh(): boolean;
  
  // Limpiar todos los tokens
  clearTokens(): void;
  
  // Configurar callback para renovación
  setRefreshCallback(callback: (refreshToken: string) => Promise<TokenResponse>): void;
  
  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean;
  
  // Obtener información del estado actual de los tokens
  getTokenInfo(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    expiresAt: string | null;
    needsRefresh: boolean;
  };
}

// Gestor automático de tokens con renovación inteligente
// SRP: Solo maneja la lógica de renovación automática de tokens
// DIP: Depende de abstracciones (TokenStorage, callback)
export class TokenManager implements ITokenManager {
  private refreshCallback: ((refreshToken: string) => Promise<TokenResponse>) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(private tokenStorage: TokenStorage) {}

  // Configurar tokens después de un login exitoso
  setTokens(tokenResponse: TokenResponse): void {
    try {
      this.tokenStorage.setAccessToken(tokenResponse.access_token);
      this.tokenStorage.setRefreshToken(tokenResponse.refresh_token);
      this.tokenStorage.setTokenExpiration(tokenResponse.expires_at);
      
      console.log('Tokens configured successfully', {
        hasAccessToken: !!tokenResponse.access_token,
        hasRefreshToken: !!tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_at
      });
    } catch (error) {
      console.error('Error setting tokens:', error);
      throw new Error('Failed to configure tokens');
    }
  }

  // Obtener access token válido, renovándolo automáticamente si es necesario
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.tokenStorage.getAccessToken();
    
    // Si no hay access token, retornar null
    if (!accessToken) {
      console.warn('No access token found');
      return null;
    }

    // Si el token no ha expirado, retornarlo
    if (!this.needsRefresh()) {
      return accessToken;
    }

    // Si el token ha expirado, intentar renovarlo
    console.log('Access token expired, attempting refresh...');
    return await this.refreshAccessToken();
  }

  // Verificar si el token necesita renovación
  needsRefresh(): boolean {
    return this.tokenStorage.isAccessTokenExpired();
  }

  // Limpiar todos los tokens
  clearTokens(): void {
    try {
      this.tokenStorage.clearAllTokens();
      this.isRefreshing = false;
      this.refreshPromise = null;
      console.log('All tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Configurar callback para renovación (será llamado desde ApiAdminRepository)
  setRefreshCallback(callback: (refreshToken: string) => Promise<TokenResponse>): void {
    this.refreshCallback = callback;
  }

  // === MÉTODOS PRIVADOS ===

  // Renovar access token usando refresh token
  private async refreshAccessToken(): Promise<string | null> {
    // Si ya se está renovando, esperar el resultado
    if (this.isRefreshing && this.refreshPromise) {
      console.log('Refresh already in progress, waiting...');
      return await this.refreshPromise;
    }

    // Iniciar proceso de renovación
    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Ejecutar la renovación real del token
  private async performRefresh(): Promise<string | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      console.error('No refresh token found');
      this.clearTokens();
      return null;
    }

    if (!this.refreshCallback) {
      console.error('No refresh callback configured');
      this.clearTokens();
      return null;
    }

    try {
      console.log('Calling refresh endpoint...');
      const newTokenResponse = await this.refreshCallback(refreshToken);
      
      // Configurar nuevos tokens
      this.setTokens(newTokenResponse);
      
      console.log('Token refresh successful');
      return newTokenResponse.access_token;
      
    } catch (error: any) {
      console.error('Token refresh failed:', error.message);
      
      // Si falla la renovación, limpiar todos los tokens
      this.clearTokens();
      
      // Re-lanzar el error para que el llamador pueda manejarlo
      throw new Error('Token refresh failed - please login again');
    }
  }

  // === MÉTODOS DE UTILIDAD ===

  // Obtener información del estado actual de los tokens
  getTokenInfo(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    expiresAt: string | null;
    needsRefresh: boolean;
  } {
    return {
      hasAccessToken: !!this.tokenStorage.getAccessToken(),
      hasRefreshToken: !!this.tokenStorage.getRefreshToken(),
      isExpired: this.tokenStorage.isAccessTokenExpired(),
      expiresAt: this.tokenStorage.getTokenExpiration(),
      needsRefresh: this.needsRefresh()
    };
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const hasTokens = !!(this.tokenStorage.getAccessToken() && this.tokenStorage.getRefreshToken());
    return hasTokens;
  }
}