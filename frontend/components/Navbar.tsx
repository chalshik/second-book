"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { lang, setLang, t } = useLang();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          Second Book<span className="navbar-logo-dot">.</span>
        </Link>

        <div className="navbar-right">
          <Link href="/listings" className="navbar-text-btn">Browse</Link>

          {!loading && user && (
            <Link href="/listings/new" className="navbar-sell">
              + {t.nav.sell}
            </Link>
          )}

          <button
            onClick={() => setLang(lang === "en" ? "ru" : "en")}
            className="navbar-text-btn"
          >
            {lang === "en" ? "RU" : "EN"}
          </button>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/profile" className="navbar-text-btn">{t.nav.profile}</Link>
                  <button onClick={logout} className="navbar-text-btn">{t.nav.signOut}</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="navbar-text-btn">{t.nav.signIn}</Link>
                  <Link href="/auth/register" className="btn-nav">{t.nav.register}</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
