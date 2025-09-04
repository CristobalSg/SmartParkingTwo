// Interface para el almacenamiento de tokens
export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  isTokenExpired(): boolean;
}


// Implementación de TokenStorage usando localStorage
// SRP: Solo maneja almacenamiento de tokens

export class LocalStorageTokenStorage implements TokenStorage {
  constructor(private readonly tokenKey: string = 'adminToken') {}

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
      throw new Error('Failed to save authentication token');
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.warn('Error removing token from localStorage:', error);
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      // Si no puede decodificar, asumimos que está expirado
      return true;
    }
  }
}
