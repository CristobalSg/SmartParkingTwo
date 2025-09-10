import React, { useState } from "react";
import styles from "./LoginForm.module.css";
import { ApiAdminRepository } from "../../../infrastructure/repositories/ApiAdminRepository";
import { AdminApiAdapter } from "../../../infrastructure/api/AdminApiAdapter";
import { httpClient } from "../../../infrastructure/http/HttpClient";
import { LocalStorageTokenStorage } from "../../../infrastructure/storage/TokenStorage";
import { API_CONFIG, AUTH_CONFIG } from "../../../shared/constants/config";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Construir repositorio admin usando adaptador HTTP e storage
  const adminRepo = new ApiAdminRepository(
    new AdminApiAdapter(httpClient),
    new LocalStorageTokenStorage(AUTH_CONFIG.TOKEN_KEY)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usar tenant por defecto desde la configuración
      const tenantId = API_CONFIG.DEFAULT_TENANT;
      await adminRepo.login({ email, password }, tenantId);
      console.log("Login successful — redirect to dashboard...");
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginCard}>
      <h2>Login</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className={styles.loginBtn}>
        {loading ? "Loading..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
