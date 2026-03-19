"use client";
import { useLang } from "@/lib/lang-context";

export function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="site-footer">
      <span>&copy; 2024 {f.copy}</span>
      <span>{f.tagline}</span>
    </footer>
  );
}
