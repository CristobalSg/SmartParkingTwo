// Interceptor para agregar token de autenticación a las peticiones
export const authInterceptor = {
  // Agrega el token a las headers de la petición
  addAuthHeader: (config: RequestInit): RequestInit => {
    const token = localStorage.getItem('token');
    
    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      };
    }
    
    return config;
  },

  // Maneja errores de autenticación
  handleAuthError: (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return response;
  }
};

// Ejemplo de uso en fetch:
// const config = authInterceptor.addAuthHeader({
//   method: 'GET',
//   headers: { 'Content-Type': 'application/json' }
// });