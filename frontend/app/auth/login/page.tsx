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
    <div className="form-page">
      <Link href="/listings" className="detail-back">&larr; {t.detail.back}</Link>

      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">{l.title}</h2>
          <p className="form-sub">
            {l.noAccount}{" "}
            <Link href="/auth/register">{l.register}</Link>
          </p>
        </div>

        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-field">
            <label className="form-label">{l.emailLabel}</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-field">
            <label className="form-label">{l.passwordLabel}</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              {loading ? l.submitting : l.submit}
            </button>
          </div>
          <div style={{ position: "relative", textAlign: "center", margin: "0.25rem 0" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg)", padding: "0 0.5rem", position: "relative", zIndex: 1 }}>or</span>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid var(--border-light)" }} />
          </div>
          <button type="button" onClick={handleGoogle} className="btn btn-secondary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
            {l.google}
          </button>
        </form>
      </div>
    </div>
  );
}
