"use client";
import { useLang } from "@/lib/lang-context";

export function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="site-footer">
      <div className="footer-logo">Second Book<span>.</span></div>
      <span>&copy; 2025 Second Book — {f.tagline}</span>
    </footer>
  );
}
