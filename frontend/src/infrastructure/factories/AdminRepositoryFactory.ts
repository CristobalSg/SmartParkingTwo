import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { ApiAdminRepository } from '../repositories/ApiAdminRepository';
import { AdminApiAdapter } from '../api/AdminApiAdapter';
import { LocalStorageTokenStorage } from '../storage/TokenStorage';
import { createHttpClient } from '../http/HttpClient';
import { AuthErrorHandler } from '../http/ErrorHandler';

// Factory para crear y configurar todas las dependencias de Admin
// DIP: Centraliza la inyección de dependencias
// SRP: Solo se encarga de crear y configurar objetos

export class AdminRepositoryFactory {
  static create(): AdminRepository {
    // Crear storage de tokens
    const tokenStorage = new LocalStorageTokenStorage();

    const errorHandler = new AuthErrorHandler(
      () => {
        // onUnauthorized
        console.warn('User unauthorized');
      },
      () => {
        // onTokenExpired
        tokenStorage.clearToken();
        window.location.href = '/login';
      }
    );

    // Crear cliente HTTP con inyección de dependencias
    const httpClient = createHttpClient(
      {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
        timeout: 15000,
      },
      errorHandler,
      () => tokenStorage.getToken() // función para obtener token
    );

    // Crear adaptador de API
    const apiAdapter = new AdminApiAdapter(httpClient);

    // Crear y retornar repositorio con todas las dependencias
    return new ApiAdminRepository(apiAdapter, tokenStorage);
  }
}

// Instancia singleton del repositorio configurado
export const adminRepository = AdminRepositoryFactory.create();
