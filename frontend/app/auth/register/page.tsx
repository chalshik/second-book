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
    <div className="form-page">
      <Link href="/listings" className="detail-back">&larr; {t.detail.back}</Link>

      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">{r.title}</h2>
          <p className="form-sub">
            {r.hasAccount}{" "}
            <Link href="/auth/login">{r.signIn}</Link>
          </p>
        </div>

        <form onSubmit={handleRegister} className="form-stack">
          <div className="form-field">
            <label className="form-label">{r.nameLabel}</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="form-field">
            <label className="form-label">{r.emailLabel}</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label className="form-label">{r.passwordLabel}</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              {loading ? r.submitting : r.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
