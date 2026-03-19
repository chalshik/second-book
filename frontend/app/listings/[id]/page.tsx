"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Listing, UserProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { getDiscountedPrice } from "@/components/ListingCard";

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

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLang();
  const d = t.detail;
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"desc" | "details">("desc");

  useEffect(() => {
    api.listings.get(id).then(setListing).catch(() => setListing(null)).finally(() => setLoading(false));
  }, [id]);

  // Fetch current user's profile for bookmark state
  useEffect(() => {
    if (!user) return;
    api.users.me().then((u) => {
      setMyProfile(u);
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
      <div className="breadcrumb-bar">
        <Link href="/">Home</Link> › <Link href="/listings">Books</Link> › ...
      </div>
      <div className="detail-layout">
        <div className="book-visual">
          <div className="skeleton" style={{ height: 300, width: "100%", borderRadius: 4 }} />
        </div>
        <div className="detail-sidebar">
          <div className="skeleton" style={{ height: 24, width: "40%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 80, width: "100%" }} />
        </div>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="detail-page">
      <div className="breadcrumb-bar">
        <Link href="/">Home</Link> › <Link href="/listings">Books</Link>
      </div>
      <div className="empty-state">
        <p className="empty-state-text">{d.notFound}</p>
        <Link href="/listings" className="btn btn-secondary">{d.back}</Link>
      </div>
    </div>
  );

  const isOwner = user?.uid === listing.seller_id;
  const coverColor = getCoverColor(listing.title);
  const sellerInitial = listing.seller_name ? listing.seller_name.charAt(0).toUpperCase() : "?";
  const discount = listing.discount_percent || 0;
  const hasPaid = listing.price !== null && listing.price !== undefined && listing.price > 0;
  const finalPrice = getDiscountedPrice(listing.price, discount);
  const hasDiscount = hasPaid && discount > 0;

  // The seller's contact_info is stored on the listing seller's user doc.
  // myProfile is the current logged-in user. If the current user IS the seller,
  // we can show their own contact info. For other sellers, the contact info
  // would need a separate API call; for now we show it only if the user is viewing
  // their own listing, or show what's available.
  // Note: the current API design doesn't expose other users' contact info via a separate
  // endpoint, but the seller_name is on the listing. The contact_info shown was always
  // the current user's own info (a bug). We fix this by not showing contact info
  // we don't have. The seller would need to have their contact info in the listing description
  // or via a future API.
  const showContactInfo = isOwner && myProfile?.contact_info;

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <Link href="/">Home</Link> › <Link href="/listings">Books</Link>{listing.genre ? <> › {listing.genre}</> : null} › {listing.title}
      </div>

      <div className="detail-layout">
        {/* Left: Book Visual + Tabs */}
        <div className="book-visual">
          <div className="main-cover" style={{ background: coverColor, position: "relative" }}>
            {listing.title}
            {hasDiscount && (
              <span className="discount-badge" style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.9rem", padding: "0.25rem 0.6rem" }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <button
              className={`detail-tab ${activeTab === "desc" ? "active" : ""}`}
              onClick={() => setActiveTab("desc")}
            >
              {d.description}
            </button>
            <button
              className={`detail-tab ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Book details
            </button>
          </div>

          {activeTab === "desc" && (
            <div className="detail-panel">
              <p>{listing.description || d.noDescription}</p>
            </div>
          )}

          {activeTab === "details" && (
            <div className="detail-panel">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {listing.author && (
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem", color: "var(--muted)", width: "40%" }}>Author</td>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem" }}>{listing.author}</td>
                    </tr>
                  )}
                  {listing.genre && (
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem", color: "var(--muted)", width: "40%" }}>Genre</td>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem" }}>{listing.genre}</td>
                    </tr>
                  )}
                  {listing.condition && (
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem", color: "var(--muted)", width: "40%" }}>Condition</td>
                      <td style={{ padding: "0.625rem 0", fontSize: "0.875rem" }}>{t.conditions[listing.condition] || listing.condition}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="detail-actions">
              <Link href={`/listings/${id}/edit`} className="btn btn-primary btn-sm">{d.edit}</Link>
              {!listing.is_sold && (
                <button onClick={handleSold} className="btn btn-secondary btn-sm">{d.markSold}</button>
              )}
              <button onClick={handleDelete} className="btn btn-danger btn-sm">{d.delete}</button>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="detail-sidebar">
          {/* Status */}
          <div className="detail-status-row">
            <span className={`status-pill ${listing.is_sold ? "sold" : ""}`}>
              {listing.is_sold ? d.sold : "Available"}
            </span>
            {listing.created_at && (
              <span className="detail-listed-date">Listed {relativeTime(listing.created_at)}</span>
            )}
          </div>

          {/* Title & Author */}
          <h1 className="detail-title-main">{listing.title}</h1>
          {listing.author && <div className="detail-author-main">{listing.author}</div>}
          {listing.genre && (
            <span className="detail-category-badge">{listing.genre}</span>
          )}

          {/* Price Block */}
          <div className="price-block">
            {!hasPaid ? (
              <div className="price-main free">{d.free}</div>
            ) : hasDiscount ? (
              <>
                <div className="price-main">
                  {finalPrice} KGS
                </div>
                <div className="price-hint">
                  <span className="price-original">{listing.price} KGS</span> — {discount}% off
                </div>
              </>
            ) : (
              <div className="price-main">{listing.price} KGS</div>
            )}
            {listing.condition && (
              <div className="cond-row">
                <span className="cond-label">Condition:</span>
                <span className="cond-value">{t.conditions[listing.condition] || listing.condition}</span>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="seller-card">
            <div className="seller-card-title">{d.seller}</div>
            <div className="seller-info">
              <div className="seller-avatar">{sellerInitial}</div>
              <div>
                <div className="seller-name">{listing.seller_name}</div>
                {isOwner && <div className="seller-meta">This is your listing</div>}
              </div>
            </div>
          </div>

          {/* Contact */}
          {!isOwner && (
            <div className="contact-block">
              <div className="contact-title">{d.contactSeller}</div>
              {user ? (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>
                  {d.noContact}
                </p>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  <Link href="/auth/login" style={{ color: "var(--accent)" }}>{d.signIn}</Link>{" "}{d.signInToContact}
                </p>
              )}
            </div>
          )}

          {isOwner && showContactInfo && (
            <div className="contact-block">
              <div className="contact-title">Your contact info (visible to buyers)</div>
              <div className="contact-row" style={{ cursor: "default" }}>
                <span style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}>📱</span>
                <div>
                  <div className="contact-method">Contact</div>
                  <div className="contact-value">{myProfile.contact_info}</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="detail-cta-buttons">
            {!isOwner && user && (
              <button onClick={toggleBookmark} className={bookmarked ? "btn-save-listing" : "btn-interested"}>
                {bookmarked ? d.removeBookmark : d.bookmark}
              </button>
            )}
            {!isOwner && !user && (
              <Link href="/auth/login" className="btn-interested" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                {d.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
