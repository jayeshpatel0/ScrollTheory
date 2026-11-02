
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReaderAuth } from "../../context/ReaderAuthContext";
import "./ReaderAuth.css";

export default function ReaderRegister() {
  const { register } = useReaderAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("Password is too long.");
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate("/saved-articles", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reader-auth-page">
      <section className="reader-auth-card">
        <div className="reader-auth-brand">
          <span className="reader-auth-mark">S.</span>
          <span>SCROLLTHEORY</span>
        </div>

        <div className="reader-auth-heading">
          <span className="reader-auth-eyebrow">
            JOIN THE READING SPACE
          </span>

          <h1>Create<br />your account.</h1>

          <p>
            Save meaningful stories and build your
            own collection of ideas.
          </p>
        </div>

        {error && (
          <div className="reader-auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="reader-auth-field">
            <label htmlFor="reader-name">Full name</label>
            <input
              id="reader-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="reader-auth-field">
            <label htmlFor="reader-email">Email address</label>
            <input
              id="reader-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="reader-auth-field">
            <label htmlFor="reader-password">Password</label>

            <div className="reader-auth-password">
              <input
                id="reader-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="reader-auth-toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="reader-auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <span aria-hidden="true"> ↗</span>}
          </button>
        </form>

        <div className="reader-auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </div>

        <Link to="/" className="reader-auth-back">
          ← Back to ScrollTheory
        </Link>
      </section>

      <aside className="reader-auth-aside">
        <div className="reader-auth-aside-content">
          <span className="reader-auth-aside-label">
            A SPACE FOR CURIOUS MINDS
          </span>

          <h2>
            Read beyond<br />
            the <em>scroll.</em>
          </h2>

          <p>
            Discover thoughtful stories.
            Keep the ones worth remembering.
            Return whenever inspiration calls.
          </p>
        </div>

        <span className="reader-auth-aside-bottom">
          SCROLLTHEORY — STORIES WITH SUBSTANCE
        </span>
      </aside>
    </main>
  );
}
