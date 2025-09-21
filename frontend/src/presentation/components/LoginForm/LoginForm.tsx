import React, { useState, useEffect } from "react";
import { AUTH_CONFIG } from "../../../shared/constants/config";
import { httpClient } from "../../../infrastructure/http/HttpClient";
import { AdminApiAdapter } from "../../../infrastructure/api/AdminApiAdapter";
import { LocalStorageTokenStorage } from "../../../infrastructure/storage/TokenStorage";
import { tenantDetectionService } from "../../../shared/services/TenantDetectionService";
import { ApiAdminRepository } from "../../../infrastructure/repositories/ApiAdminRepository";

import PasswordInput from "../ui-cs/PasswordInput";

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
        console.log(`Tenant auto-detected: ${detected} for email: ${email}`);
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
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl text-center">
      <h2 className="text-xl font-semibold text-green-600 mb-4">
        ✅ Login Successful - Multi-Tenant System
      </h2>
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        🚪 Logout
      </button>
    </div>
    );
}
  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-700">
      {/* Tailwind: Breakpoints______
      w-full max-w-md → en móviles ocupa 100% hasta un máximo de md (aprox 28rem).
      sm:max-w-lg → en pantallas ≥ 640px el máximo ancho será lg (32rem).
      md:max-w-xl → en pantallas ≥ 768px el máximo será xl (36rem).
      p-6 y rounded-2xl → padding y borde redondeado que también se ve bien en cualquier pantalla.

      Y ademas en Tailwind, los inputs y botones ya son flexibles si usas: className="w-full ..."
      */}
      <div className="w-full max-w-md p-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl relative">
      {/* Aquí va tu LoginForm */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full gap-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-white/80 text-base font-normal">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@universidad.edu"
              className="w-full px-4 pt-5 pb-2 text-white bg-white/10 border border-white/20 rounded-xl outline-none backdrop-blur-md focus:bg-white/20 focus:border-cyan-400 transition"
            />
            <label className="absolute left-4 top-2 text-white/70 text-sm transition-all duration-300 pointer-events-none">
              Email
            </label>
          </div>

          <div className="relative">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading || !detectedTenant}
          className={`relative w-full py-3 rounded-xl font-semibold overflow-hidden bg-gradient-to-r from-indigo-500 to-cyan-400 text-white transition ${
            loading || !detectedTenant ? "opacity-50 cursor-not-allowed" : "hover:translate-y-[-2px] hover:shadow-lg"
          }`}
        >
          {loading ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-white/80 text-sm">
          ¿No tienes una cuenta?{" "}
          <a href="/signup" className="text-cyan-400 hover:underline font-medium">
            Regístrate
          </a>
        </p>
      </form>

      </div>
    </div>

  );
};

export default LoginForm;