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

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [detectedTenant, setDetectedTenant] = useState<string | null>(null);

  // Construir repositorio admin usando adaptador HTTP e storage
  const adminRepo = new ApiAdminRepository(
    new AdminApiAdapter(httpClient),
    new LocalStorageTokenStorage(AUTH_CONFIG.TOKEN_KEY),
    httpClient
  );

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
        `🚀 Attempting registration with tenant: ${tenantId} for email: ${email}`
      );

      const result = await adminRepo.register({
        tenantUuid: tenantId,
        email,
        password,
        name,
      });

      console.log("Registration successful:", result);
      setRegisterSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5 bg-gradient-to-br from-indigo-500 to-purple-700">
        <div className="w-full max-w-md p-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl relative text-center">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 mb-4">
            ✅ ¡Registro Exitoso!
          </h2>
          <p className="text-white/80 text-base font-normal mb-6">
            Tu cuenta de administrador ha sido creada correctamente.
          </p>
          <p className="text-white/70 text-sm mb-6">
            Ya puedes iniciar sesión con tus credenciales.
          </p>
          <Button
            onClick={() => {
              setRegisterSuccess(false);
              setEmail("");
              setPassword("");
              setName("");
              setDetectedTenant(null);
            }}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:translate-y-[-2px] hover:shadow-lg transition"
          >
            Registrar Otro Admin
          </Button>
          <p className="mt-6 text-center text-white/80 text-sm">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-cyan-400 hover:underline font-medium"
            >
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-5 
      bg-gradient-to-br from-primary-light to-primary-dark 
      dark:from-secondary-dark dark:to-black
    "
    >
      {/* Button for dark mode*/}
      <header className="p-4 flex justify-end">
        <DarkModeToggle />
      </header>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
          {/* Header */}
          <div className="text-center mb-8">
            <Typography variant="h2">Crear Cuenta</Typography>
            <Typography variant="p">Regístrate como administrador</Typography>
          </div>

          {error && (
            <div className="mb-3 text-sm text-red-400 font-medium bg-red-500/20 p-3 rounded-xl border border-red-500/30">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Juan Pérez"
                label="Nombre Completo"
              />
            </div>

            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@universidad.edu"
                label="Email"
              />
              {detectedTenant && (
                <p className="text-xs text-cyan-400 mt-1 ml-1">
                  ✓ Tenant detectado: {detectedTenant}
                </p>
              )}
            </div>

            <div className="relative">
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>
          </div>

          {/* Botón */}
          <Button
            type="submit"
            disabled={loading || !detectedTenant}
            className={`relative w-full py-3 rounded-xl font-semibold overflow-hidden bg-gradient-to-r from-indigo-500 to-cyan-400 text-white transition ${
              loading || !detectedTenant
                ? "opacity-50 cursor-not-allowed"
                : "hover:translate-y-[-2px] hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </span>
            ) : (
              "Crear Cuenta"
            )}
          </Button>

          {/* Footer */}
          <p className="mt-6 text-center text-white/80 text-sm">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-cyan-400 hover:underline font-medium"
            >
              Inicia sesión
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
