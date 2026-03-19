"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLang } from "@/lib/lang-context";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const r = t.register;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      router.push("/listings");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("email-already-in-use") ? r.errorInUse : r.error);
      setLoading(false);
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
          <blockquote>&ldquo;A room without books is like a body without a soul.&rdquo;</blockquote>
          <cite>— Marcus Tullius Cicero</cite>
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
            <Link href="/auth/login" className="auth-tab">Sign in</Link>
            <button className="auth-tab active">Create account</button>
          </div>

          <div className="form-title" style={{ marginBottom: "0.5rem" }}>Join Second Book.</div>
          <div className="form-sub" style={{ marginBottom: "1.5rem" }}>Create your free account today.</div>

          <form onSubmit={handleRegister} className="form-stack">
            <div className="form-field">
              <label className="form-label">{r.nameLabel}</label>
              <input
                className="form-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label">{r.emailLabel}</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">{r.passwordLabel}</label>
              <input
                className="form-input"
                type="password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
              {loading ? r.submitting : r.submit}
            </button>

            <div className="form-footer">
              {r.hasAccount}{" "}
              <Link href="/auth/login">{r.signIn}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
