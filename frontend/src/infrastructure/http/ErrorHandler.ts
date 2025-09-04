// Interface para manejo de errores HTTP
// Permite inyección de dependencias y cumple OCP

export interface HttpErrorHandler {
  handleError(error: any): void;
}


// Implementación del manejador de errores para autenticación
// SRP: Solo maneja errores de autenticación
export class AuthErrorHandler implements HttpErrorHandler {
  constructor(
    private onUnauthorized?: () => void,
    private onTokenExpired?: () => void
  ) {}

  handleError(error: any): void {
    if (error.response?.status === 401) {
      if (this.onTokenExpired) {
        this.onTokenExpired();
      }
    } else if (error.response?.status === 403) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
    }
  }
}

export class NoOpErrorHandler implements HttpErrorHandler {
  handleError(error: any): void {
    // No hacer nada, solo registrar en consola
    console.warn('HTTP Error:', error.message);
  }
}
