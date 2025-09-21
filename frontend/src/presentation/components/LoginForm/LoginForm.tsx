import React, { useState, useEffect } from "react";
import styles from "./LoginForm.module.css";
import { ApiAdminRepository } from "../../../infrastructure/repositories/ApiAdminRepository";
import { AdminApiAdapter } from "../../../infrastructure/api/AdminApiAdapter";
import { httpClient } from "../../../infrastructure/http/HttpClient";
import { LocalStorageTokenStorage } from "../../../infrastructure/storage/TokenStorage";
import { AUTH_CONFIG } from "../../../shared/constants/config";
import { tenantDetectionService } from "../../../shared/services/TenantDetectionService";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<string | null>(null);

  // Construir repositorio admin usando adaptador HTTP e storage
  const adminRepo = new ApiAdminRepository(
    new AdminApiAdapter(httpClient),
    new LocalStorageTokenStorage(AUTH_CONFIG.TOKEN_KEY),
    httpClient
  );

  // Actualizar estado de autenticación
  const updateAuthStatus = () => {
    const status = adminRepo.getAuthStatus();
    setAuthStatus(status);
    console.log('Current Auth Status:', status);
  };

  // Cargar estado inicial
  useEffect(() => {
    updateAuthStatus();
  }, []);

  // Auto-detectar tenant cuando cambia el email
  useEffect(() => {
    if (email && email.includes('@')) {
      const detected = tenantDetectionService.detectTenantFromEmail(email);
      setDetectedTenant(detected);
      
      if (detected) {
        console.log(`🎯 Tenant auto-detected: ${detected} for email: ${email}`);
      }
    } else {
      setDetectedTenant(null);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Detectar tenant basado en email
      const tenantId = tenantDetectionService.detectTenantFromEmail(email);
      
      if (!tenantId) {
        throw new Error(`No se pudo determinar el tenant para el email: ${email}. Verifica el dominio del email.`);
      }

      console.log(`🚀 Attempting login with tenant: ${tenantId} for email: ${email}`);
      
      const result = await adminRepo.login({ email, password }, tenantId);
      
      console.log("Login successful with auto-detected tenant:", result);
      setLoginSuccess(true);
      updateAuthStatus();
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminRepo.logout();
      setLoginSuccess(false);
      setAuthStatus(null);
      setEmail("");
      setPassword("");
      setDetectedTenant(null);
      console.log("Logout successful");
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  if (loginSuccess && authStatus?.isAuthenticated) {
    return (
      <div className={styles.loginCard}>
        <h2>✅ Login Successful - Multi-Tenant System</h2>
          <button 
            onClick={handleLogout} 
            style={{ margin: '5px', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
          >
            🚪 Logout
          </button>
        </div>
    );
}
  return (
    <form onSubmit={handleSubmit} className={styles.loginCard}>
      <h2>🏢 Admin Login - Multi-Tenant System</h2>

      {error && <div className={styles.error}>❌ {error}</div>}

      <div className={styles.inputGroup}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@universidad.edu"
          required
        />
      </div>    
      <div className={styles.inputGroup}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="admin123"
          required
        />
      </div>

      <button type="submit" disabled={loading || !detectedTenant} className={styles.loginBtn}>
        {loading ? "🔄 Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;