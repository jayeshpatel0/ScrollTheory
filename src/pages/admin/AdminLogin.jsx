
import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { login, admin, loading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <main className="admin-login"><p>Loading...</p></main>;
  }

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <Link to="/" className="admin-brand">
          ScrollTheory<span>.</span>
        </Link>

        <p className="admin-eyebrow">ADMINISTRATION</p>

        <h1>Welcome back.</h1>

        <p className="admin-login-subtitle">
          Sign in to manage your publication.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>

          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in to Admin ↗"}
          </button>
        </form>

        <Link to="/" className="admin-back-link">
          ← Back to ScrollTheory
        </Link>
      </div>
    </main>
  );
}
