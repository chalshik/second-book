"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

const CONDITIONS = [
  { value: "like_new", label: "Like New", desc: "No marks" },
  { value: "good", label: "Good", desc: "Minor wear" },
  { value: "fair", label: "Fair", desc: "Visible wear" },
  { value: "poor", label: "Poor", desc: "Heavy wear" },
] as const;

const COVER_COLORS = ["#2d4a3e", "#1e3a5f", "#c9502a", "#4a3728", "#3a3028", "#283848", "#5a4e38"];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const e = t.editListing;
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);

  useEffect(() => {
    api.listings.get(id).then((l) => {
      setTitle(l.title);
      setAuthor(l.author || "");
      setPrice(l.price ? String(l.price) : "");
      setCondition(l.condition || "good");
      setDescription(l.description || "");
      setPageLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (title) {
      let hash = 0;
      for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
      setCoverColor(COVER_COLORS[Math.abs(hash) % COVER_COLORS.length]);
    }
  }, [title]);

  if (authLoading || pageLoading || !user) return null;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.listings.update(id, {
        title: title.trim(),
        author: author.trim(),
        price: price ? parseFloat(price) : null,
        condition,
        description: description.trim(),
      });
      router.push(`/listings/${id}`);
    } catch {
      setError(e.error);
      setSubmitting(false);
    }
  }

  const previewPrice = price ? `${parseFloat(price)} KGS` : "Free";

  return (
    <div className="listing-form-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">Home</Link> › <Link href="/listings">Books</Link> › <Link href={`/listings/${id}`}>{title}</Link> › Edit
        </div>
        <div className="page-title">{e.title}</div>
      </div>

      {/* Content */}
      <div className="listing-form-content">
        <div>
          <form onSubmit={handleSubmit}>
            {/* Book Information */}
            <div className="form-section">
              <div className="section-header-form">
                <div className="section-title-sm">Book information</div>
              </div>
              <div className="form-grid">
                <div className="form-field field-span2">
                  <label className="form-label">{e.titleLabel} <span className="label-req">*</span></label>
                  <input className="form-input" value={title} onChange={(ev) => setTitle(ev.target.value)} required autoFocus />
                </div>
                <div className="form-field">
                  <label className="form-label">{e.authorLabel}</label>
                  <input className="form-input" value={author} onChange={(ev) => setAuthor(ev.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-label">{e.priceLabel} (KGS)</label>
                  <input className="form-input" type="number" min="0" step="1" value={price} onChange={(ev) => setPrice(ev.target.value)} />
                </div>
                <div className="form-field field-span2">
                  <label className="form-label">{e.descriptionLabel}</label>
                  <textarea className="form-input form-textarea" value={description} onChange={(ev) => setDescription(ev.target.value)} rows={4} />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="form-section">
              <div className="section-header-form">
                <div className="section-title-sm">{e.conditionLabel}</div>
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

            {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? e.saving : e.save}
              </button>
              <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                {e.cancel}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Preview */}
        <div>
          <div className="sidebar-preview">
            <div className="preview-label">Live preview</div>
            <div className="preview-cover" style={{ background: coverColor }}>
              {title || "Your book title"}
            </div>
            <div className="preview-body">
              <div className="preview-title">{title || "Untitled book"}</div>
              <div className="preview-author">{author || "Author name"}</div>
              <div className="preview-row">
                <span className="preview-price">{previewPrice}</span>
                <span className="preview-badge">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
