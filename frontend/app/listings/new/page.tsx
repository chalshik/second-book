"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { api } from "@/lib/api";

const CONDITIONS = ["new", "like_new", "good", "fair", "poor"] as const;

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

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
      });
      router.push(`/listings/${listing.id}`);
    } catch {
      setError(n.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <Link href="/listings" className="detail-back">&larr; {t.detail.back}</Link>

      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">{n.title}</h2>
          <p className="form-sub">{n.sub}</p>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label">{n.titleLabel}</label>
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

          <div className="form-row">
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">{n.priceLabel}</label>
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
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">{n.conditionLabel}</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{t.conditions[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">{n.descriptionLabel}</label>
            <textarea
              className="form-input form-textarea"
              placeholder={n.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="btn btn-primary btn-lg"
            >
              {submitting ? n.publishing : n.publish}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
