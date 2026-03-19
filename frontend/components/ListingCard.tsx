"use client";
import Link from "next/link";
import { Listing } from "@/lib/api";
import { useLang } from "@/lib/lang-context";

const COVER_COLORS = ["#2d4a3e", "#1e3a5f", "#c9502a", "#4a3728", "#3a3028", "#283848", "#5a4e38", "#4a2828"];

function getCoverColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatPrice(price: number | null): { text: string; isFree: boolean } {
  if (price === null || price === undefined || price === 0) return { text: "", isFree: true };
  return { text: `${price} KGS`, isFree: false };
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { t } = useLang();
  const price = formatPrice(listing.price);
  const coverColor = getCoverColor(listing.title);

  return (
    <Link href={`/listings/${listing.id}`} className="book-card">
      <div className="book-card-cover" style={{ background: coverColor }}>
        {listing.title}
      </div>
      <div className="book-card-info">
        <div className="book-card-title">{listing.title}</div>
        {listing.author && (
          <div className="book-card-author">{listing.author}</div>
        )}
        <div className="book-card-bottom">
          <span className={`book-card-price ${price.isFree ? "free" : ""}`}>
            {price.isFree ? t.listings.free : price.text}
          </span>
          <div className="book-card-meta">
            {listing.condition && listing.condition !== "good" && (
              <span className="book-card-badge badge-condition">
                {t.conditions[listing.condition] || listing.condition}
              </span>
            )}
            {listing.is_sold && (
              <span className="book-card-badge badge-sold">{t.detail.sold}</span>
            )}
          </div>
        </div>
      </div>
      <div className="book-card-seller">{listing.seller_name}</div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="card-skeleton-cover" />
      <div className="card-skeleton-info">
        <div className="skeleton" style={{ height: 14, width: "70%" }} />
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <div className="skeleton" style={{ height: 14, width: 60 }} />
          <div className="skeleton" style={{ height: 12, width: 40 }} />
        </div>
      </div>
    </div>
  );
}
