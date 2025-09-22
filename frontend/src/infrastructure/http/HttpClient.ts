import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface IHttpClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  setHeader(key: string, value: string): void;
  removeHeader(key: string): void;
  setAuthToken(token: string): void;
  removeAuthToken(): void;
  // Nuevo método para configurar interceptor de refresh
  setTokenRefreshHandler(handler: () => Promise<string | null>): void;
}

// Cliente HTTP con interceptor automático para refresh de tokens
// SRP: Solo maneja comunicación HTTP y refresh automático
// DIP: Depende de abstracciones para el refresh handler
export class HttpClient implements IHttpClient {
  private axiosInstance: AxiosInstance;
  private tokenRefreshHandler: (() => Promise<string | null>) | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3000/api') {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // === MÉTODOS HTTP PÚBLICOS ===
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config);
    return this.transformResponse(response);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return this.transformResponse(response);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return this.transformResponse(response);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return this.transformResponse(response);
  }

  // === MÉTODOS DE CONFIGURACIÓN ===
  setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // Configurar handler para refresh de tokens
  setTokenRefreshHandler(handler: () => Promise<string | null>): void {
    this.tokenRefreshHandler = handler;
  }

  // === MÉTODOS PRIVADOS ===

  // Configurar interceptors de request y response
  private setupInterceptors(): void {
    // Interceptor de request (opcional - para logging)
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`HTTP ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de response - maneja refresh automático
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Si es error 401 y no es un retry y tenemos handler de refresh
        if (error.response?.status === 401 && !originalRequest._retry && this.tokenRefreshHandler) {
          
          // Evitar refresh loops en endpoints de auth
          if (this.isAuthEndpoint(originalRequest.url)) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // Si ya hay un refresh en progreso, agregar a cola
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              if (token) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('HTTP Client: Attempting token refresh...');
            const newToken = await this.tokenRefreshHandler();

            if (newToken) {
              // Actualizar token en headers por defecto
              this.setAuthToken(newToken);
              
              // Actualizar token en la petición original
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

              // Procesar cola de peticiones fallidas
              this.processQueue(null, newToken);

              console.log('HTTP Client: Token refresh successful, retrying original request');
              
              // Reintentar petición original
              return this.axiosInstance(originalRequest);
            } else {
              // Refresh falló
              throw new Error('Token refresh returned null');
            }

          } catch (refreshError) {
            console.error('HTTP Client: Token refresh failed:', refreshError);
            
            // Procesar cola con error
            this.processQueue(refreshError, null);
            
            // Limpiar auth token
            this.removeAuthToken();
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Procesar cola de peticiones que esperaban el refresh
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Verificar si es un endpoint de autenticación (evitar refresh loops)
  private isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    
    const authEndpoints = [
      '/admin/login',
      '/admin/refresh',
      '/admin/logout'
    ];
    
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  // Transformar respuesta de Axios a nuestra interfaz
  private transformResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }
}

// Instancia global del cliente HTTP
export const httpClient = new HttpClient();