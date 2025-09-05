// Configuración centralizada de la aplicación
// SRP: Solo maneja configuración

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  MODELS_API_URL: process.env.REACT_APP_MODELS_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 15000,
  DEFAULT_TENANT: 'universidad-nacional',
} as const;

export const AUTH_CONFIG = {
  TOKEN_KEY: 'adminToken',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
} as const;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
} as const;
