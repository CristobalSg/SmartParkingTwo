import React, { useState, useEffect } from "react";
import { AUTH_CONFIG } from "../../../shared/constants/config";
import { httpClient } from "../../../infrastructure/http/HttpClient";
import { AdminApiAdapter } from "../../../infrastructure/api/AdminApiAdapter";
import { LocalStorageTokenStorage } from "../../../infrastructure/storage/TokenStorage";
import { tenantDetectionService } from "../../../shared/services/TenantDetectionService";
import { ApiAdminRepository } from "../../../infrastructure/repositories/ApiAdminRepository";

import PasswordInput from "../ui/PasswordInput";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Typography from "../ui/Typography";
import DarkModeToggle from "../ui/DarkModeToggle";

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
    console.log("Current Auth Status:", status);
  };

  // Cargar estado inicial
  useEffect(() => {
    updateAuthStatus();
  }, []);

  // Auto-detectar tenant cuando cambia el email
  useEffect(() => {
    if (email && email.includes("@")) {
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
        throw new Error(
          `No se pudo determinar el tenant para el email: ${email}. Verifica el dominio del email.`
        );
      }

      console.log(
        `🚀 Attempting login with tenant: ${tenantId} for email: ${email}`
      );

      const result = await adminRepo.login({ email, password }, tenantId);

      console.log("Login successful with auto-detected tenant:", result);
      setLoginSuccess(true);
      updateAuthStatus();
    } catch (err: any) {
      setError(err.message || "Login failed");
      console.error("Login error:", err);
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
      console.error("Logout error:", err);
    }
  };

  // Vista de éxito de login
  if (loginSuccess && authStatus?.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-700">
        <Card>
          <div className="text-center mb-8">
            <Typography variant="h2">
              ✅ Login Successful
            </Typography>

            <Typography variant="p">
              Multi-Tenant System
            </Typography>
          </div>

          <Button
            onClick={handleLogout}
            variant="secondary">
            🚪 Logout
          </Button>
        </Card>
      </div>
    );
  }

  // Vista principal del login
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 
      bg-gradient-to-br from-primary-light to-primary-dark 
      dark:from-secondary-dark dark:to-black
    ">
      {/* Button for dark mode*/}
      <header className="p-4 flex justify-end">
        <DarkModeToggle />
      </header>

      <Card>
        {/* Aquí va tu LoginForm */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full gap-6"
        >
          {/* Header */}
          <div className="text-center mb-8">      
            <Typography variant="h2">
              ¡Bienvenido de nuevo!
            </Typography>

            <Typography variant="p">
              Inicia sesión en tu cuenta
            </Typography>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@universidad.edu"
              required
            />
            
            <div className="relative">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="special"
            loading={loading}
            disabled={loading || !detectedTenant}
          >
            Iniciar sesión
          </Button>

          {/* Footer */}
          <p className="mt-6 text-center text-white/80 text-sm">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-cyan-400 hover:underline font-medium">
              Regístrate
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;