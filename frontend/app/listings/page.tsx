"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { api, Listing, ListingFilters } from "@/lib/api";
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

  // Filters
  const [filterCondition, setFilterCondition] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const fetchListings = useCallback(() => {
    setLoading(true);
    const filters: ListingFilters = {};
    if (search) filters.search = search;
    if (filterCondition) filters.condition = filterCondition;
    if (filterGenre) filters.genre = filterGenre;
    if (priceMin) filters.price_min = parseFloat(priceMin);
    if (priceMax) filters.price_max = parseFloat(priceMax);
    api.listings.list(filters).then(setListings).finally(() => setLoading(false));
  }, [search, filterCondition, filterGenre, priceMin, priceMax]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Derive genre list from loaded listings for the filter dropdown
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => { if (l.genre) set.add(l.genre); });
    return Array.from(set).sort();
  }, [listings]);

  const sorted = useMemo(() => {
    const copy = [...listings];
    if (sort === "price_asc") copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    else if (sort === "price_desc") copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return copy;
  }, [listings, sort]);

  const hasActiveFilters = filterCondition || filterGenre || priceMin || priceMax;

  function clearFilters() {
    setFilterCondition("");
    setFilterGenre("");
    setPriceMin("");
    setPriceMax("");
  }

  return (
    <div className="page-container" style={{ paddingTop: "calc(60px + 2rem)" }}>
      <div className="search-bar" style={{ marginBottom: "1rem" }}>
        <input
          className="search-input"
          type="text"
          placeholder={t.listings.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="search-btn">{t.listings.search}</button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <select
          className="filter-select"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
        >
          <option value="">{t.detail.condition}: All</option>
          {(["new", "like_new", "good", "fair", "poor"] as const).map((c) => (
            <option key={c} value={c}>{t.conditions[c]}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">Genre: All</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <input
          className="filter-input"
          type="number"
          min="0"
          placeholder="Min KGS"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <input
          className="filter-input"
          type="number"
          min="0"
          placeholder="Max KGS"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />

        {hasActiveFilters && (
          <button className="filter-clear" onClick={clearFilters}>
            Clear filters
          </button>
        )}
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
            <Link href="/listings/new" className="btn btn-primary btn-sm">
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
          {!search && !hasActiveFilters && (
            <Link href="/listings/new" className="btn btn-primary">{t.listings.sellBook}</Link>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary" style={{ marginTop: "0.5rem" }}>
              Clear filters
            </button>
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
