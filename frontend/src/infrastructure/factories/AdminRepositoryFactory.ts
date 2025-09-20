import { ApiAdminRepository } from '../repositories/ApiAdminRepository';
import { AdminRepository } from '../../domain/repositories/AdminRepository';
import { AdminApiAdapter } from '../api/AdminApiAdapter';
import { LocalStorageTokenStorage } from '../storage/TokenStorage';
import { httpClient } from '../http/HttpClient'; // Importar instancia global
import { AuthErrorHandler } from '../http/ErrorHandler';

// Factory para crear y configurar todas las dependencias de Admin
// SRP: Solo responsable de crear y configurar el repositorio de Admin
// DIP: Permite inyectar dependencias y cambiar implementaciones fácilmente

export class AdminRepositoryFactory {
  
  /**
   * Crea una instancia completamente configurada de AdminRepository
   * con todas sus dependencias inyectadas y configuradas
   * @param tokenKey - Clave para almacenamiento de tokens (opcional)
   * @returns AdminRepository configurado y listo para usar
   */
  static create(tokenKey: string = 'admin'): AdminRepository {
    
    // Crear almacenamiento de tokens
    const tokenStorage = new LocalStorageTokenStorage(tokenKey);
    
    // Crear adaptador de API usando el cliente HTTP global
    const apiAdapter = new AdminApiAdapter(httpClient);
    
    // Crear manejador de errores de autenticación (opcional)
    const errorHandler = new AuthErrorHandler();
    
    // Configurar manejador de errores en el cliente HTTP (si es necesario)
    // httpClient.setErrorHandler(errorHandler); // Descomentar si es necesario
    
    // Crear y retornar repositorio con todas las dependencias
    return new ApiAdminRepository(apiAdapter, tokenStorage, httpClient);
  }
  
  /**
   * Crea una instancia con configuración personalizada
   * @param config - Configuración personalizada
   * @returns AdminRepository configurado
   */
  static createWithConfig(config: {
    tokenKey?: string;
    baseUrl?: string;
    timeout?: number;
  }): AdminRepository {
    
    const tokenStorage = new LocalStorageTokenStorage(config.tokenKey || 'admin');
    
    // Si se necesita configuración personalizada del HTTP client,
    // se puede crear una nueva instancia aquí
    const apiAdapter = new AdminApiAdapter(httpClient);
    
    return new ApiAdminRepository(apiAdapter, tokenStorage, httpClient);
  }
}