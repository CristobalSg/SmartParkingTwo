import React, { useState } from "react";
import styles from "./LoginForm.module.css";
import { LoginUser } from "../../../application/use-cases/loginUser";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginUseCase = new LoginUser(new AuthRepositoryImpl());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginUseCase.execute(email, password);
      console.log("Redirect to dashboard...");
    } catch (err: any) {
      setError(err.message);
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
