"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { api, Listing, UserProfile } from "@/lib/api";
import { ListingCard, ListingCardSkeleton } from "@/components/ListingCard";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const p = t.profile;
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [bookmarks, setBookmarks] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "bookmarks">("listings");
  const [displayName, setDisplayName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    api.users.me().then((u) => { setProfile(u); setDisplayName(u.display_name); setContactInfo(u.contact_info || ""); });
    Promise.all([api.listings.list(), api.users.bookmarks()]).then(([all, bm]) => {
      setMyListings(all.filter((l) => l.seller_id === user.uid));
      setBookmarks(bm);
      setListingsLoading(false);
    });
  }, [user, authLoading, router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updated = await api.users.update({ display_name: displayName, contact_info: contactInfo });
    setProfile(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (authLoading || !profile) return (
    <div className="profile-page">
      <div className="profile-top">
        <div>
          <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: 150 }} />
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          <div className="skeleton" style={{ height: 40, width: 50 }} />
          <div className="skeleton" style={{ height: 40, width: 50 }} />
        </div>
      </div>
    </div>
  );

  const currentItems = tab === "listings" ? myListings : bookmarks;

  return (
    <div className="profile-page">
      <div className="profile-top">
        <div>
          <h2 className="profile-name">{displayName || profile.display_name}</h2>
          {profile.contact_info && (
            <p className="profile-contact">{profile.contact_info}</p>
          )}
        </div>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-num">{myListings.length}</span>
            <span className="profile-stat-label">{p.myListings}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-num">{bookmarks.length}</span>
            <span className="profile-stat-label">{p.bookmarks}</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="profile-sidebar-title">{p.title}</div>
          <form onSubmit={saveProfile} className="form-stack">
            <div className="form-field">
              <label className="form-label">{p.nameLabel}</label>
              <input className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">{p.contactLabel}</label>
              <input className="form-input" placeholder={p.contactPlaceholder} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? p.saving : p.save}
              </button>
              {saved && <span style={{ fontSize: 13, color: "var(--accent)" }}>{p.saved}</span>}
            </div>
          </form>
        </div>

        <div className="profile-main">
          <div className="profile-tabs">
            <button
              onClick={() => setTab("listings")}
              className={`profile-tab ${tab === "listings" ? "active" : ""}`}
            >
              {p.myListings} ({myListings.length})
            </button>
            <button
              onClick={() => setTab("bookmarks")}
              className={`profile-tab ${tab === "bookmarks" ? "active" : ""}`}
            >
              {p.bookmarks} ({bookmarks.length})
            </button>
          </div>

          <div className="profile-listings">
            {listingsLoading ? (
              <div className="card-grid">
                {Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : currentItems.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">
                  {tab === "listings" ? p.noListings : p.noBookmarks}
                </p>
                {tab === "listings" && (
                  <Link href="/listings/new" className="btn btn-primary">{t.listings.sellBook}</Link>
                )}
                {tab === "bookmarks" && (
                  <Link href="/listings" className="btn btn-secondary">{t.nav.browse}</Link>
                )}
              </div>
            ) : (
              <div className="card-grid">
                {currentItems.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
