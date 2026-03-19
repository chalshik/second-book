"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { api, Listing } from "@/lib/api";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";

export default function HomePage() {
  const { t } = useLang();
  const h = t.home;
  const [recent, setRecent] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings.list({}).then((listings) => {
      setRecent(listings.filter((l) => !l.is_sold).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <span className="hero-tag">{h.statFreeDesc || "The book marketplace"}</span>
          <h1 className="hero-title">
            Every book<br />finds its <em>next</em><br />reader.
          </h1>
          <p className="hero-body">{h.sub}</p>
          <div className="hero-cta">
            <Link href="/listings" className="btn btn-primary btn-lg">{h.browseCta}</Link>
            <Link href="/auth/register" className="btn-ghost">{h.startCta} →</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="book-stack">
            <div className="book-spine-item" style={{ width: 60, height: 160, background: "#2d4a3e" }}>
              <span className="book-spine-label">FICTION</span>
            </div>
            <div className="book-spine-item" style={{ width: 60, height: 200, background: "var(--accent)" }}>
              <span className="book-spine-label">CLASSIC</span>
            </div>
            <div className="book-spine-item" style={{ width: 60, height: 140, background: "#4a3728" }}>
              <span className="book-spine-label">HISTORY</span>
            </div>
            <div className="book-spine-item" style={{ width: 60, height: 180, background: "#1e3a5f" }}>
              <span className="book-spine-label">SCIENCE</span>
            </div>
            <div className="book-spine-item" style={{ width: 60, height: 120, background: "#5a4e38" }}>
              <span className="book-spine-label">ART</span>
            </div>
          </div>
          <div className="hero-bg-text">READ</div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">{h.statFree}</div>
          <div className="stat-label">{h.statFreeDesc}</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{h.statDirect}</div>
          <div className="stat-label">{h.statDirectDesc}</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">{h.statLocal}</div>
          <div className="stat-label">{h.statLocalDesc}</div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="section-label">{h.howTitle}</div>
        <h2 className="section-title">Simple, honest, book-to-book.</h2>
        <div className="how-grid">
          {[
            { num: "01", title: h.step1Title, desc: h.step1Desc },
            { num: "02", title: h.step2Title, desc: h.step2Desc },
            { num: "03", title: h.step3Title, desc: h.step3Desc },
          ].map((s) => (
            <div key={s.num} className="how-card">
              <div className="how-number">{s.num}</div>
              <div className="how-title">{s.title}</div>
              <div className="how-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured / Recent Listings */}
      {(loading || recent.length > 0) && (
        <section className="featured-section">
          <div className="section-label">{t.listings.title}</div>
          <h2 className="section-title">Fresh arrivals.</h2>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)
            ) : (
              recent.map((l) => <ListingCard key={l.id} listing={l} />)
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="cta-section">
        <div className="section-label">{h.ctaTitle || "Join today"}</div>
        <h2 className="section-title">{h.ctaTitle}</h2>
        <div className="cta-btns">
          <Link href="/auth/register" className="btn btn-primary btn-lg">{h.startCta}</Link>
          <Link href="/listings" className="btn-ghost">{h.ctaBrowse} →</Link>
        </div>
      </section>
    </>
  );
}
