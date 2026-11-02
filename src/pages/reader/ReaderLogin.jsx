
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReaderAuth } from "../../context/ReaderAuthContext";

export default function ReaderLogin() {
  const { login } = useReaderAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/saved-articles", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      maxWidth: 430,
      margin: "70px auto",
      padding: 24
    }}>
      <h1>Welcome back.</h1>
      <p>Sign in to your ScrollTheory account.</p>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="reader-email">Email address</label>
          <input
            id="reader-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 8,
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label htmlFor="reader-password">Password</label>
          <input
            id="reader-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 8,
              boxSizing: "border-box"
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "12px 22px", cursor: "pointer" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p>
        Don't have an account?{" "}
        <Link to="/register">Create account</Link>
      </p>

      <Link to="/">← Back to home</Link>
    </main>
  );
}
