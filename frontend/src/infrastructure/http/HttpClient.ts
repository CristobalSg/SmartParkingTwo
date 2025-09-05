import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpErrorHandler, NoOpErrorHandler } from './ErrorHandler';

// Configuración del cliente HTTP
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

// Respuesta del cliente HTTP
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// Interfaz para el cliente HTTP
export interface IHttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  setHeader(key: string, value: string): void;
  removeHeader(key: string): void;
}

// Cliente HTTP que cumple SRP: Solo maneja comunicación HTTP
export class HttpClient implements IHttpClient {
  private axiosInstance: AxiosInstance;

  constructor(
    config: HttpClientConfig,
    private errorHandler: HttpErrorHandler = new NoOpErrorHandler(),
    private getAuthToken?: () => string | null
  ) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - agregar token si está disponible
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.getAuthToken) {
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - delegar manejo de errores
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Delegar al error handler en lugar de manejar directamente
        this.errorHandler.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  // Método para realizar solicitudes GET
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Método para realizar solicitudes POST
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Método para realizar solicitudes PUT
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Método para realizar solicitudes DELETE
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  // Método específico para agregar headers dinámicamente (como X-Tenant-ID)
  setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  // Método específico para eliminar headers dinámicamente
  removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }
}

// Instancia singleton del cliente HTTP - ahora con inyección de dependencias
export const createHttpClient = (
  config: HttpClientConfig,
  errorHandler?: HttpErrorHandler,
  getAuthToken?: () => string | null
) => {
  return new HttpClient(config, errorHandler, getAuthToken);
};

// Cliente por defecto para mantener compatibilidad
export const httpClient = new HttpClient({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
});