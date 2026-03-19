"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { api } from "@/lib/api";

const CONDITIONS = [
  { value: "like_new", label: "Like New", desc: "No marks" },
  { value: "good", label: "Good", desc: "Minor wear" },
  { value: "fair", label: "Fair", desc: "Visible wear" },
  { value: "poor", label: "Poor", desc: "Heavy wear" },
] as const;

const GENRES = [
  "Fiction", "Non-Fiction", "Science", "History", "Arts",
  "Self-Help", "Children", "Classic", "Fantasy", "Biography", "Other",
];

const COVER_COLORS = ["#2d4a3e", "#1e3a5f", "#c9502a", "#4a3728", "#3a3028", "#283848", "#5a4e38"];

export default function NewListingPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const n = t.newListing;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [discount, setDiscount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (title) {
      let hash = 0;
      for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
      setCoverColor(COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]);
    }
  }, [title]);

  if (loading || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const listing = await api.listings.create({
        title: title.trim(),
        author: author.trim() || undefined,
        price: price ? parseFloat(price) : null,
        condition,
        description: description.trim() || undefined,
        genre: genre || undefined,
        discount_percent: discount ? parseInt(discount) : undefined,
      });
      router.push(`/listings/${listing.id}`);
    } catch {
      setError(n.error);
      setSubmitting(false);
    }
  }

  const numPrice = price ? parseFloat(price) : 0;
  const numDiscount = discount ? parseInt(discount) : 0;
  const discountedPrice = numPrice && numDiscount > 0
    ? Math.round(numPrice * (1 - numDiscount / 100))
    : numPrice;
  const previewPrice = numPrice
    ? (numDiscount > 0 ? `${discountedPrice} KGS` : `${numPrice} KGS`)
    : "Free";

  return (
    <div className="listing-form-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> › <Link href="/listings">Books</Link> › List a book
        </div>
        <div className="page-title">{n.title}</div>
        <div className="page-subtitle">{n.sub}</div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="step-item active"><div className="step-dot">1</div> Book details</div>
        <div className="step-line" />
        <div className="step-item"><div className="step-dot">2</div> Photos &amp; condition</div>
        <div className="step-line" />
        <div className="step-item"><div className="step-dot">3</div> Pricing</div>
        <div className="step-line" />
        <div className="step-item"><div className="step-dot">4</div> Review &amp; publish</div>
      </div>

      {/* Content */}
      <div className="listing-form-content">
        <div>
          <form onSubmit={handleSubmit}>
            {/* Book Information */}
            <div className="form-section">
              <div className="section-header-form">
                <div className="section-title-sm">Book information</div>
                <div className="section-desc">Basic details about the book you&apos;re selling.</div>
              </div>
              <div className="form-grid">
                <div className="form-field field-span2">
                  <label className="form-label">{n.titleLabel} <span className="label-req">*</span></label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder={n.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">{n.authorLabel}</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder={n.authorPlaceholder}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Genre</label>
                  <select
                    className="form-select"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    <option value="">Select genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field field-span2">
                  <label className="form-label">{n.descriptionLabel}</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder={n.descriptionPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="form-section">
              <div className="section-header-form">
                <div className="section-title-sm">{n.conditionLabel}</div>
                <div className="section-desc">Be honest — buyers appreciate accurate descriptions.</div>
              </div>
              <div className="condition-grid">
                {CONDITIONS.map((c) => (
                  <div
                    key={c.value}
                    className={`cond-option ${condition === c.value ? "selected" : ""}`}
                    onClick={() => setCondition(c.value)}
                  >
                    <div className="cond-name">{c.label}</div>
                    <div className="cond-desc">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="form-section">
              <div className="section-header-form">
                <div className="section-title-sm">Pricing</div>
                <div className="section-desc">Set a fair price to attract buyers quickly.</div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">{n.priceLabel} (KGS)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder={n.pricePlaceholder}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Discount (%)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="99"
                    step="1"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="btn btn-primary"
              >
                {submitting ? n.publishing : n.publish}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Preview */}
        <div>
          <div className="sidebar-preview">
            <div className="preview-label">Live preview</div>
            <div className="preview-cover" style={{ background: coverColor, position: "relative" }}>
              {title || "Your book title"}
              {numDiscount > 0 && numPrice > 0 && (
                <span className="discount-badge" style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
                  -{numDiscount}%
                </span>
              )}
            </div>
            <div className="preview-body">
              <div className="preview-title">{title || "Untitled book"}</div>
              <div className="preview-author">{author || "Author name"}</div>
              {genre && <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{genre}</div>}
              <div className="preview-row">
                <span className="preview-price">
                  {numPrice > 0 && numDiscount > 0 ? (
                    <><span className="price-original">{numPrice} KGS</span> {discountedPrice} KGS</>
                  ) : (
                    previewPrice
                  )}
                </span>
                <span className="preview-badge">Available</span>
              </div>
              <div className="preview-hint">This is how buyers will see your listing in search results.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
