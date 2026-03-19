"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

const CONDITIONS = ["new", "like_new", "good", "fair", "poor"] as const;

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

  return (
    <div className="form-page">
      <Link href={`/listings/${id}`} className="detail-back">&larr; {t.detail.back}</Link>

      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">{e.title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label className="form-label">{e.titleLabel}</label>
            <input className="form-input" value={title} onChange={(ev) => setTitle(ev.target.value)} required autoFocus />
          </div>

          <div className="form-field">
            <label className="form-label">{e.authorLabel}</label>
            <input className="form-input" value={author} onChange={(ev) => setAuthor(ev.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">{e.priceLabel}</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
              />
            </div>
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">{e.conditionLabel}</label>
              <select
                className="form-select"
                value={condition}
                onChange={(ev) => setCondition(ev.target.value)}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{t.conditions[c]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">{e.descriptionLabel}</label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={4}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? e.saving : e.save}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              {e.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
