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
    api.listings.list().then((listings) => {
      setRecent(listings.filter((l) => !l.is_sold).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <h1 className="hero-headline">{h.headline}</h1>
            <p className="hero-sub">{h.sub}</p>
            <div className="hero-actions">
              <Link href="/listings" className="btn btn-primary btn-lg">{h.browseCta}</Link>
              <Link href="/auth/register" className="btn btn-secondary btn-lg">{h.startCta}</Link>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{h.statFree}</span>
              <span className="hero-stat-label">{h.statFreeDesc}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{h.statDirect}</span>
              <span className="hero-stat-label">{h.statDirectDesc}</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{h.statLocal}</span>
              <span className="hero-stat-label">{h.statLocalDesc}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Recent listings */}
        {(loading || recent.length > 0) && (
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="section-header">
              <h2 className="section-title">{t.listings.title}</h2>
              <Link href="/listings" className="section-link">{h.browseCta} &rarr;</Link>
            </div>
            <div className="card-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
              ) : (
                recent.map((l) => <ListingCard key={l.id} listing={l} />)
              )}
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="section-header">
            <h2 className="section-title">{h.howTitle}</h2>
          </div>
          <div className="how-grid">
            {[
              { n: 1, title: h.step1Title, desc: h.step1Desc },
              { n: 2, title: h.step2Title, desc: h.step2Desc },
              { n: 3, title: h.step3Title, desc: h.step3Desc },
            ].map((s) => (
              <div key={s.n} className="how-card">
                <div className="how-number">{s.n}</div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="cta-banner">
          <div className="cta-title">{h.ctaTitle}</div>
          <div className="cta-actions">
            <Link href="/listings" className="btn btn-primary btn-lg">{h.ctaBrowse}</Link>
            <Link href="/listings/new" className="btn btn-secondary btn-lg">{h.ctaSell}</Link>
          </div>
        </div>
      </div>
    </>
  );
}
