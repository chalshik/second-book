"use client";
import { useEffect, useState, useMemo } from "react";
import { api, Listing } from "@/lib/api";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";
import { useLang } from "@/lib/lang-context";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type SortMode = "newest" | "price_asc" | "price_desc";

export default function ListingsPage() {
  const { t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("newest");

  useEffect(() => {
    setLoading(true);
    api.listings.list(search).then(setListings).finally(() => setLoading(false));
  }, [search]);

  const sorted = useMemo(() => {
    const copy = [...listings];
    if (sort === "price_asc") copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === "price_desc") copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return copy;
  }, [listings, sort]);

  return (
    <div className="page-container">
      <div className="search-bar" style={{ marginBottom: "1.5rem" }}>
        <input
          className="search-input"
          type="text"
          placeholder={t.listings.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="search-btn">{t.listings.search}</button>
      </div>

      <div className="listings-toolbar">
        <span className="listings-count">
          {loading ? "..." : t.listings.count(listings.length)}
        </span>
        <div className="listings-controls">
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
          >
            <option value="newest">{t.listings.sortNewest}</option>
            <option value="price_asc">{t.listings.sortPriceLow}</option>
            <option value="price_desc">{t.listings.sortPriceHigh}</option>
          </select>
          {!authLoading && user && (
            <Link href="/listings/new" className="btn btn-primary">
              + {t.listings.sellBook}
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card-grid">
          {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">
            {search ? (
              <>
                {t.listings.noResults(search)}{" "}
                <button onClick={() => setSearch("")} className="link-button">
                  {t.listings.clear}
                </button>
              </>
            ) : t.listings.noListings}
          </p>
          {!search && (
            <Link href="/listings/new" className="btn btn-primary">{t.listings.sellBook}</Link>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {sorted.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
