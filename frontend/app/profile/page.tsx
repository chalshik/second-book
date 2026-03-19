"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, Listing, UserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCard } from "@/components/ListingCard";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [bookmarks, setBookmarks] = useState<Listing[]>([]);
  const [tab, setTab] = useState<"listings" | "bookmarks">("listings");
  const [displayName, setDisplayName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    api.users.me().then((u) => {
      setProfile(u);
      setDisplayName(u.display_name);
      setContactInfo(u.contact_info || "");
    });
    api.listings
      .list()
      .then((all) => setMyListings(all.filter((l) => l.seller_id === user.uid)));
    api.users.bookmarks().then(setBookmarks);
  }, [user, authLoading, router]);

  if (authLoading || !profile)
    return <div className="text-center py-12 text-slate-500">Loading...</div>;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updated = await api.users.update({
      display_name: displayName,
      contact_info: contactInfo,
    });
    setProfile(updated);
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="flex flex-col gap-4 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact">Contact Info (shown to buyers)</Label>
              <Input
                id="contact"
                placeholder="Phone or email"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saving} className="w-fit">
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === "listings" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("listings")}
          >
            My Listings ({myListings.length})
          </Button>
          <Button
            variant={tab === "bookmarks" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("bookmarks")}
          >
            Bookmarks ({bookmarks.length})
          </Button>
        </div>

        {tab === "listings" &&
          (myListings.length === 0 ? (
            <p className="text-slate-500 text-sm">No listings yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {myListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ))}

        {tab === "bookmarks" &&
          (bookmarks.length === 0 ? (
            <p className="text-slate-500 text-sm">No bookmarks yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {bookmarks.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
