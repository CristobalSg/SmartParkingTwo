// Tipos basados en el backend AdminInterfaces.ts
export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminOutput {
  id: string;
  tenantUuid: string;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Nueva interfaz para TokenResponse  
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  expires_at: string;
  scope: string;
}

// Nueva interfaz para información de sesión
export interface SessionInfo {
  session_id: string;
  login_time: string;
  ip_address?: string;
}

// Respuesta completa del login (coincide con AdminAuthOutput del backend)
export interface AdminLoginOutput {
  admin: AdminOutput;
  authentication: TokenResponse;
  session?: SessionInfo;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Interface para el adaptador de Admin API
 * Implementa ISP: Interface segregada solo para operaciones de admin
 */
export interface AdminApiAdapter {
  login(credentials: AdminLoginInput, tenantId: string): Promise<AdminLoginOutput>;
  logout(): Promise<void>;
  validateToken(): Promise<AdminOutput>;
  getProfile(): Promise<AdminOutput>;
  // Nueva función para refresh de tokens
  refreshToken(refreshToken: string): Promise<TokenResponse>;
}
