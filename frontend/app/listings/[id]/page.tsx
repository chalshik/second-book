"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Listing, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

function formatPrice(price: number | null): { text: string; isFree: boolean } {
  if (price === null || price === undefined || price === 0) return { text: "", isFree: true };
  return { text: `${price} KGS`, isFree: false };
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLang();
  const d = t.detail;
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerProfile, setSellerProfile] = useState<UserProfile | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings.get(id).then(setListing).catch(() => setListing(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.users.me().then((u) => {
      setSellerProfile(u);
      setBookmarked(u.bookmarks.includes(id));
    });
  }, [user, id]);

  async function handleDelete() {
    if (!confirm(d.deleteConfirm)) return;
    await api.listings.delete(id);
    router.push("/listings");
  }

  async function handleSold() {
    await api.listings.markSold(id);
    setListing((l) => (l ? { ...l, is_sold: true } : l));
  }

  async function toggleBookmark() {
    if (!user) { router.push("/auth/login"); return; }
    if (bookmarked) { await api.users.removeBookmark(id); setBookmarked(false); }
    else { await api.users.addBookmark(id); setBookmarked(true); }
  }

  if (loading) return (
    <div className="detail-page">
      <Link href="/listings" className="detail-back">&larr; {d.back}</Link>
      <div className="detail-layout">
        <div className="detail-card">
          <div className="skeleton" style={{ height: 28, width: "55%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: "25%", marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 16, width: "70%" }} />
        </div>
        <div className="detail-sidebar-card">
          <div className="skeleton" style={{ height: 32, width: "50%" }} />
          <div className="skeleton" style={{ height: 16, width: "70%" }} />
        </div>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="detail-page">
      <Link href="/listings" className="detail-back">&larr; {d.back}</Link>
      <div className="empty-state">
        <p className="empty-state-text">{d.notFound}</p>
        <Link href="/listings" className="btn btn-secondary">{d.back}</Link>
      </div>
    </div>
  );

  const isOwner = user?.uid === listing.seller_id;
  const price = formatPrice(listing.price);

  return (
    <div className="detail-page">
      <Link href="/listings" className="detail-back">&larr; {d.back}</Link>

      <div className="detail-layout">
        {/* Main content */}
        <div className="detail-card">
          <h1 className="detail-title">{listing.title}</h1>
          {listing.author && <p className="detail-author">{listing.author}</p>}
          <p className="detail-seller">{d.listedBy} {listing.seller_name}</p>

          {/* Badges */}
          <div className="detail-badges">
            {listing.condition && (
              <span className="book-card-badge badge-condition">
                {t.conditions[listing.condition] || listing.condition}
              </span>
            )}
            {listing.is_sold && (
              <span className="book-card-badge badge-sold">{d.sold}</span>
            )}
          </div>

          {/* Description */}
          <div className="detail-section">
            <div className="detail-section-label">{d.description}</div>
            <div className={`detail-section-value ${!listing.description ? "muted" : ""}`}>
              {listing.description || d.noDescription}
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            {!isOwner && (
              <button onClick={toggleBookmark} className={`btn ${bookmarked ? "btn-secondary" : "btn-primary"}`}>
                {bookmarked ? d.removeBookmark : d.bookmark}
              </button>
            )}
            {isOwner && (
              <>
                <Link href={`/listings/${id}/edit`} className="btn btn-primary">{d.edit}</Link>
                {!listing.is_sold && (
                  <button onClick={handleSold} className="btn btn-secondary">{d.markSold}</button>
                )}
                <button onClick={handleDelete} className="btn btn-danger">{d.delete}</button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar-card">
          <div>
            <div className={`detail-price-tag ${price.isFree ? "free" : ""}`}>
              {price.isFree ? d.free : price.text}
            </div>
          </div>

          <div className="detail-sidebar-section">
            <div className="detail-sidebar-label">{d.seller}</div>
            <div className="detail-seller-name">{listing.seller_name}</div>
          </div>

          <div className="detail-sidebar-section">
            <div className="detail-sidebar-label">{d.contactSeller}</div>
            {!isOwner ? (
              sellerProfile?.contact_info ? (
                <div className="detail-contact">{sellerProfile.contact_info}</div>
              ) : user ? (
                <div className="detail-contact" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>{d.noContact}</div>
              ) : (
                <div className="detail-contact">
                  <Link href="/auth/login" style={{ color: "var(--accent)" }}>{d.signIn}</Link>{" "}{d.signInToContact}
                </div>
              )
            ) : (
              <div className="detail-contact" style={{ color: "var(--text-muted)" }}>—</div>
            )}
          </div>

          {!isOwner && !user && (
            <Link href="/auth/login" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              {d.signIn}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
