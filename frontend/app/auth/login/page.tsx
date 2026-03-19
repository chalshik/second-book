"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLang } from "@/lib/lang-context";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const l = t.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/listings");
    } catch {
      setError(l.error);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/listings");
    } catch {
      setError(l.googleError);
    }
  }

  return (
    <div className="auth-split">
      {/* Left decorative panel */}
      <div className="auth-panel-left">
        <Link href="/" className="navbar-logo" style={{ color: "var(--paper)", position: "relative", zIndex: 1 }}>
          Second Book<span className="navbar-logo-dot">.</span>
        </Link>
        <div className="auth-panel-quote">
          <blockquote>&ldquo;A reader lives a thousand lives before he dies.&rdquo;</blockquote>
          <cite>— George R.R. Martin</cite>
        </div>
        <div className="auth-bg-books">
          <div className="auth-bg-book" style={{ width: 30, height: 100, background: "#2d4a3e" }} />
          <div className="auth-bg-book" style={{ width: 30, height: 140, background: "var(--accent)" }} />
          <div className="auth-bg-book" style={{ width: 30, height: 80, background: "#4a3728" }} />
          <div className="auth-bg-book" style={{ width: 30, height: 120, background: "#1e3a5f" }} />
        </div>
        <div className="auth-panel-bottom">&copy; 2025 Second Book</div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-box">
          <div className="auth-tabs">
            <button className="auth-tab active">Sign in</button>
            <Link href="/auth/register" className="auth-tab">Create account</Link>
          </div>

          <div className="form-title" style={{ marginBottom: "0.5rem" }}>Welcome back.</div>
          <div className="form-sub" style={{ marginBottom: "1.5rem" }}>Sign in to your account.</div>

          <form onSubmit={handleLogin} className="form-stack">
            <div className="form-field">
              <label className="form-label">{l.emailLabel}</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label">{l.passwordLabel}</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
              {loading ? l.submitting : l.submit}
            </button>

            <div className="auth-divider">or</div>

            <button type="button" onClick={handleGoogle} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
              {l.google}
            </button>

            <div className="form-footer">
              {l.noAccount}{" "}
              <Link href="/auth/register">{l.register}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
