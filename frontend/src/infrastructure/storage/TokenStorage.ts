// Interface mejorada para el almacenamiento de tokens duales
export interface TokenStorage {
  // Métodos para Access Token
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  clearAccessToken(): void;
  
  // Métodos para Refresh Token
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  clearRefreshToken(): void;
  
  // Métodos para manejo de expiración
  setTokenExpiration(expiresAt: string): void;
  getTokenExpiration(): string | null;
  isAccessTokenExpired(): boolean;
  
  // Métodos para información de sesión
  setSessionInfo(sessionId: string, loginTime: string): void;
  getSessionInfo(): { sessionId: string | null; loginTime: string | null };
  
  // Método para limpiar todo
  clearAllTokens(): void;
}


// Implementación mejorada de TokenStorage usando localStorage
// SRP: Solo maneja almacenamiento seguro de tokens duales
export class LocalStorageTokenStorage implements TokenStorage {
  private readonly accessTokenKey: string;
  private readonly refreshTokenKey: string;
  private readonly expirationKey: string;
  private readonly sessionIdKey: string;
  private readonly loginTimeKey: string;

  constructor(tokenPrefix: string = 'admin') {
    this.accessTokenKey = `${tokenPrefix}_access_token`;
    this.refreshTokenKey = `${tokenPrefix}_refresh_token`;
    this.expirationKey = `${tokenPrefix}_expires_at`;
    this.sessionIdKey = `${tokenPrefix}_session_id`;
    this.loginTimeKey = `${tokenPrefix}_login_time`;
  }

  // ACCESS TOKEN METHODS
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.accessTokenKey);
    } catch (error) {
      console.warn('Error accessing localStorage for access token:', error);
      return null;
    }
  }

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(this.accessTokenKey, token);
    } catch (error) {
      console.error('Error saving access token to localStorage:', error);
      throw new Error('Failed to save access token');
    }
  }

  clearAccessToken(): void {
    try {
      localStorage.removeItem(this.accessTokenKey);
    } catch (error) {
      console.warn('Error removing access token from localStorage:', error);
    }
  }

  // === REFRESH TOKEN METHODS ===
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch (error) {
      console.warn('Error accessing localStorage for refresh token:', error);
      return null;
    }
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.refreshTokenKey, token);
    } catch (error) {
      console.error('Error saving refresh token to localStorage:', error);
      throw new Error('Failed to save refresh token');
    }
  }

  clearRefreshToken(): void {
    try {
      localStorage.removeItem(this.refreshTokenKey);
    } catch (error) {
      console.warn('Error removing refresh token from localStorage:', error);
    }
  }

  // === EXPIRATION METHODS ===
  setTokenExpiration(expiresAt: string): void {
    try {
      localStorage.setItem(this.expirationKey, expiresAt);
    } catch (error) {
      console.error('Error saving token expiration to localStorage:', error);
      throw new Error('Failed to save token expiration');
    }
  }

  getTokenExpiration(): string | null {
    try {
      return localStorage.getItem(this.expirationKey);
    } catch (error) {
      console.warn('Error accessing localStorage for token expiration:', error);
      return null;
    }
  }

  isAccessTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;

    try {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      
      // Considerar expirado si faltan menos de 5 minutos (buffer de seguridad)
      const bufferTime = 5 * 60 * 1000; // 5 minutos en millisegundos
      return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
      console.warn('Error parsing token expiration date:', error);
      return true;
    }
  }

  // === SESSION INFO METHODS ===
  setSessionInfo(sessionId: string, loginTime: string): void {
    try {
      localStorage.setItem(this.sessionIdKey, sessionId);
      localStorage.setItem(this.loginTimeKey, loginTime);
    } catch (error) {
      console.error('Error saving session info to localStorage:', error);
      throw new Error('Failed to save session info');
    }
  }

  getSessionInfo(): { sessionId: string | null; loginTime: string | null } {
    try {
      return {
        sessionId: localStorage.getItem(this.sessionIdKey),
        loginTime: localStorage.getItem(this.loginTimeKey)
      };
    } catch (error) {
      console.warn('Error accessing localStorage for session info:', error);
      return { sessionId: null, loginTime: null };
    }
  }

  // === CLEANUP METHODS ===
  clearAllTokens(): void {
    try {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.expirationKey);
      localStorage.removeItem(this.sessionIdKey);
      localStorage.removeItem(this.loginTimeKey);
    } catch (error) {
      console.warn('Error clearing tokens from localStorage:', error);
    }
  }

  // === LEGACY SUPPORT (mantenemos compatibilidad temporalmente) ===
  // Estos métodos son para compatibilidad con código existente
  getToken(): string | null {
    return this.getAccessToken();
  }

  setToken(token: string): void {
    this.setAccessToken(token);
  }

  clearToken(): void {
    this.clearAccessToken();
  }

  isTokenExpired(): boolean {
    return this.isAccessTokenExpired();
  }
}